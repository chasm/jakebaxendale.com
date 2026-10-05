import { serveDir } from "@std/http/file-server"
import hosting from "../vercel.json" with { type: "json" }
import { handleForm } from "./forms.ts"

const PRODUCTION_HOSTS = new Set(["jakebaxendale.com", "www.jakebaxendale.com"])

export function createHandler(
	root = "dist",
	env: (key: string) => string | undefined = (key) => Deno.env.get(key),
) {
	return async (request: Request): Promise<Response> => {
		const url = new URL(request.url)
		const production =
			env("SITE_MODE") === "production" && PRODUCTION_HOSTS.has(url.hostname)
		const finish = async (response: Response) => {
			const headers = new Headers(response.headers)
			for (const header of hosting.headers[0]!.headers) {
				headers.set(header.key, header.value)
			}
			if (!production) headers.set("X-Robots-Tag", "noindex, nofollow")
			if (request.method === "HEAD") await response.body?.cancel()
			return new Response(request.method === "HEAD" ? null : response.body, {
				status: response.status,
				headers,
			})
		}
		const empty = (status: number, headers?: HeadersInit) =>
			finish(new Response(null, { status, headers }))
		if (
			production &&
			(url.hostname === "www.jakebaxendale.com" || url.protocol !== "https:")
		) {
			url.hostname = "jakebaxendale.com"
			url.protocol = "https:"
			url.port = ""
			return empty(308, { Location: url.href })
		}
		const api = /^\/api\/(contact|feedback)\/?$/.exec(url.pathname)
		if (api) {
			// Even a key inherited from organization settings cannot send real mail on staging.
			const recipient = env("MAILERSEND_TEST_RECIPIENT")?.trim()
			const delivery = production ? undefined : recipient ? { recipient } : null
			return finish(
				await handleForm(request, api[1] as "contact" | "feedback", delivery),
			)
		}
		if (url.pathname.startsWith("/api/"))
			return empty(404, { "Cache-Control": "no-store" })
		if (!["GET", "HEAD"].includes(request.method))
			return empty(405, { "Allow": "GET, HEAD", "Cache-Control": "no-store" })
		try {
			if (
				decodeURIComponent(url.pathname)
					.split("/")
					.some((part) => part.startsWith("."))
			)
				return empty(404)
		} catch {
			return empty(400)
		}
		// HTML contains host-specific Twitch parameters. Avoid conditional/range responses for it.
		const possibleHtml =
			!url.pathname.split("/").pop()!.includes(".") ||
			url.pathname.endsWith(".html")
		const staticHeaders = new Headers(request.headers)
		if (possibleHtml) {
			for (const key of ["range", "if-none-match", "if-modified-since"])
				staticHeaders.delete(key)
		}
		const staticRequest = new Request(url, {
			method: possibleHtml ? "GET" : request.method,
			headers: staticHeaders,
		})
		let response = await serveDir(staticRequest, {
			fsRoot: root,
			showDirListing: false,
			showIndex: true,
			quiet: true,
		})
		const headers = new Headers(response.headers)
		if (
			headers.get("content-type")?.startsWith("text/html") &&
			response.status === 200
		) {
			const html = (await response.text()).replaceAll(
				"parent=jakebaxendale.com",
				`parent=${encodeURIComponent(url.hostname)}`,
			)
			for (const key of ["content-length", "etag", "last-modified"])
				headers.delete(key)
			headers.set(
				"Cache-Control",
				production ? "public, max-age=0, s-maxage=300" : "no-store",
			)
			response = new Response(html, { status: response.status, headers })
		} else {
			headers.set(
				"Cache-Control",
				response.status >= 400
					? "no-store"
					: url.pathname.startsWith("/_astro/")
						? "public, max-age=31536000, immutable"
						: "public, max-age=172800, must-revalidate",
			)
			response = new Response(response.body, {
				status: response.status,
				headers,
			})
		}
		return finish(response)
	}
}

if (import.meta.main) {
	Deno.serve({ port: Number(Deno.env.get("PORT") || 8000) }, createHandler())
}
