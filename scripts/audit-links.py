"""Audit built HTML and optionally check public HTTP links without submitting forms."""
import argparse
import concurrent.futures
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen


class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.links, self.assets, self.ids, self.issues = [], [], set(), []
        self.h1s = 0
        self.feed(html)

    def handle_starttag(self, tag, values):
        attrs = dict(values)
        if attrs.get("id"):
            if attrs["id"] in self.ids:
                self.issues.append("duplicate id: " + attrs["id"])
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.h1s += 1
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag in {"img", "script", "source", "audio", "video"} and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "link" and attrs.get("href"):
            if attrs.get("rel") in {"stylesheet", "icon", "preload", "modulepreload"}:
                self.assets.append(attrs["href"])
        if attrs.get("srcset"):
            self.assets.extend(item.strip().split()[0] for item in attrs["srcset"].split(","))
        if tag == "iframe" and not attrs.get("title", "").strip():
            self.issues.append("iframe has no title: " + attrs.get("src", ""))
        if tag == "img" and "alt" not in attrs:
            self.issues.append("image has no alt: " + attrs.get("src", ""))


def request(url, method="HEAD"):
    try:
        with urlopen(Request(url, method=method, headers={"User-Agent": "JakeBaxendaleSiteAudit/1.0"}), timeout=20) as response:
            return {"url": url, "status": response.status, "final_url": response.url,
                    "headers": dict(response.headers),
                    "body": response.read().decode("utf-8", errors="replace") if method == "GET" else ""}
    except HTTPError as error:
        if error.code == 405 and method == "HEAD":
            return request(url, "GET")
        return {"url": url, "status": error.code, "error": str(error)}
    except Exception as error:
        return {"url": url, "status": None, "error": str(error)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", help="Public site URL; omit to audit local build only")
    parser.add_argument("--external", action="store_true")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    root = Path("dist")
    files = sorted(root.rglob("*.html"))
    routes = {"/" + str(path.relative_to(root)).removesuffix("index.html"): path for path in files}
    base = args.base or "https://jakebaxendale.com/"
    documents, pages = {}, []
    if args.base:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda route: request(urljoin(base, route), "GET"), routes))
        for route, result in zip(routes, results):
            html = result.pop("body", "")
            documents[route] = Document(html)
            pages.append(result)
    else:
        documents = {route: Document(path.read_text()) for route, path in routes.items()}
    issues, internal, external = [], set(), set()
    for route, document in documents.items():
        issues.extend({"route": route, "issue": issue} for issue in document.issues)
        if document.h1s != 1:
            issues.append({"route": route, "issue": f"Expected one h1, found {document.h1s}"})
        for value in document.links + document.assets:
            url = urlsplit(urljoin(base, value))
            if url.scheme not in {"http", "https"}:
                continue
            if url.hostname != urlsplit(base).hostname:
                external.add(url.geturl())
                continue
            path = unquote(url.path)
            internal.add(url._replace(fragment="").geturl())
            target = root / path.lstrip("/")
            if target.is_dir():
                target /= "index.html"
            elif not target.exists() and (target / "index.html").exists():
                target /= "index.html"
            if not target.is_file():
                if not args.base:
                    issues.append({"route": route, "issue": "Missing local target", "target": path})
                continue
            if url.fragment and target.suffix == ".html":
                target_route = "/" + str(target.relative_to(root)).removesuffix("index.html")
                target_doc = documents.get(target_route) or Document(target.read_text())
                if unquote(url.fragment) not in target_doc.ids:
                    issues.append({"route": route, "issue": "Missing fragment", "target": url.geturl()})
    checks = set()
    if args.base:
        checks.update(internal)
    if args.external:
        checks.update(external)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        http = list(pool.map(request, sorted(checks)))
    http = [{key: value for key, value in result.items() if key not in {"body", "headers"}} for result in http]
    # Assets, external bot blocks, and page content are separated for honest interpretation.
    report = {"base": args.base or "local dist", "pages": len(documents),
              "internal_targets": len(internal), "external_targets": len(external),
              "issues": issues, "page_responses": pages, "http_responses": http,
              "public_files": sum(p.is_file() for p in Path("public").rglob("*")),
              "public_bytes": sum(p.stat().st_size for p in Path("public").rglob("*") if p.is_file())}
    Path(args.output).write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"pages": report["pages"], "issues": len(issues), "checked_urls": len(http),
                      "unsuccessful_http": sum(r["status"] is None or r["status"] >= 400 for r in http)}))


if __name__ == "__main__":
    main()
