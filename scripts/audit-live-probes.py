"""Read-only public DNS and HTTP checks; deliberately never sends a valid form."""
import concurrent.futures
import json
import subprocess
import runpy
from pathlib import Path
from urllib.request import Request, urlopen

request = runpy.run_path("scripts/audit-links.py")["request"]
urls = [
    "http://jakebaxendale.com/", "https://www.jakebaxendale.com/",
    "https://jakebaxendale.com/robots.txt", "https://jakebaxendale.com/sitemap-index.xml",
    "https://jakebaxendale.com/sitemap-0.xml", "https://jakebaxendale.com/audit-missing-page-20261005",
    "https://jakebaxendale.com/api/contact", "https://jakebaxendale.com/api/feedback",
    "https://jakebaxendale.com/images/.DS_Store",
    "https://jakebaxendale.com/images/optimized/1152/jake-by-sam-pietras-square.jpeg",
    "https://ratastudios.co.nz/?p=2691",
    "https://www.rogueandvagabond.co.nz/",
    "https://blackstringband.bandcamp.com/",
    "https://events.humanitix.com/waypeople-album-release-tour-christchurch",
    "https://events.humanitix.com/waypeople-album-release-tour-hamilton",
    "https://events.humanitix.com/waypeople-album-release-tour-napier",
    "https://cavecircles.bandcamp.com/album/tuone-found-in-translation",
    "https://sori.nyc/blackstring",
    "https://www.rogueandvagabond.co.nz/beats/",
]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    responses = list(pool.map(lambda url: request(url, "GET"), urls))
for response in responses:
    response.pop("body", None)
    response["headers"] = {key: value for key, value in response.get("headers", {}).items()
                           if key.lower() in {"content-type", "content-security-policy", "strict-transport-security", "location"}}

dns = {}
for host, record in [
    ("jakebaxendale.com", "NS"), ("jakebaxendale.com", "A"), ("jakebaxendale.com", "AAAA"),
    ("www.jakebaxendale.com", "A"), ("www.jakebaxendale.com", "AAAA"),
    ("jakebaxendale.com", "MX"), ("jakebaxendale.com", "TXT"),
    ("_dmarc.jakebaxendale.com", "TXT"), ("jakebaxendale.com", "CAA"),
]:
    dns[f"{host} {record}"] = subprocess.run(["dig", "+noall", "+answer", host, record], capture_output=True, text=True, check=True).stdout.strip()

ranges = []
for path in ["/scores/against-war-full-score.pdf", "/streams/against-war-live-at-meow.mp3"]:
    url = "https://jakebaxendale.com" + path
    try:
        with urlopen(Request(url, headers={"Range": "bytes=0-99"}), timeout=20) as response:
            ranges.append({"url": url, "status": response.status,
                           "content_range": response.headers.get("Content-Range"),
                           "content_type": response.headers.get("Content-Type"),
                           "bytes_read": len(response.read(100))})
    except Exception as error:
        ranges.append({"url": url, "error": str(error)})

Path("audit/evidence/live-probes.json").write_text(json.dumps({"responses": responses, "dns": dns, "ranges": ranges}, indent=2) + "\n")
print(json.dumps({"responses": [(r["url"], r["status"]) for r in responses], "ranges": ranges}))
