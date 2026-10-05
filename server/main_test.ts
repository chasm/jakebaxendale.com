import assert from "node:assert/strict"
import { createHandler } from "./main.ts"

const preview = "https://jakebaxendalecom--main.jbmusic.deno.net"
const handler = createHandler()

Deno.test(
	"staging pages have security headers, noindex, and same-host redirects",
	async () => {
		const response = await handler(new Request(preview + "/"))
		assert.equal(response.status, 200)
		assert.match(
			response.headers.get("content-security-policy")!,
			/form-action 'self'/,
		)
		assert.equal(response.headers.get("x-content-type-options"), "nosniff")
		assert.equal(response.headers.get("x-frame-options"), "DENY")
		assert.match(response.headers.get("x-robots-tag")!, /noindex/)
		assert.equal(response.headers.get("cache-control"), "no-store")
		assert.match(await response.text(), /Jake Baxendale/)
		const redirect = await handler(new Request(preview + "/contact?test=1"))
		assert.ok([301, 308].includes(redirect.status))
		assert.equal(
			new URL(redirect.headers.get("location")!, preview).href,
			preview + "/contact/?test=1",
		)
		await redirect.body?.cancel()
	},
)

Deno.test(
	"missing pages, hidden files and unsupported methods do not expose files",
	async () => {
		for (const path of [
			"/missing-audit-page",
			"/api/other",
			"/images/.DS_Store",
			"/%2eenv",
			"/images/",
		]) {
			const response = await handler(new Request(preview + path))
			assert.equal(response.status, 404, path)
			await response.body?.cancel()
		}
		const response = await handler(
			new Request(preview + "/", { method: "POST" }),
		)
		assert.equal(response.status, 405)
		assert.equal(response.headers.get("allow"), "GET, HEAD")
	},
)

Deno.test(
	"HEAD and PDF/audio byte ranges work without leaking file handles",
	async () => {
		const head = await handler(new Request(preview + "/", { method: "HEAD" }))
		assert.equal(head.status, 200)
		assert.equal(head.body, null)
		for (const [path, type] of [
			["/scores/against-war-full-score.pdf", "application/pdf"],
			["/streams/against-war-live-at-meow.mp3", "audio/mpeg"],
		]) {
			const response = await handler(
				new Request(preview + path, { headers: { Range: "bytes=0-99" } }),
			)
			assert.equal(response.status, 206)
			assert.match(response.headers.get("content-range")!, /^bytes 0-99\//)
			assert.match(response.headers.get("content-type")!, new RegExp(type))
			assert.equal((await response.arrayBuffer()).byteLength, 100)
		}
	},
)

Deno.test("Twitch parent follows the actual request hostname", async () => {
	const response = await handler(
		new Request(preview + "/projects/striking-moments/"),
	)
	const html = await response.text()
	assert.match(html, /parent=jakebaxendalecom--main\.jbmusic\.deno\.net/)
	assert.doesNotMatch(html, /parent=jakebaxendale\.com/)
})

Deno.test(
	"form transport rejects methods, duplicate fields and excessive bodies",
	async () => {
		for (const kind of ["contact", "feedback"]) {
			const response = await handler(new Request(preview + "/api/" + kind))
			assert.equal(response.status, 405)
			assert.equal(response.headers.get("allow"), "POST")
			assert.equal(response.headers.get("cache-control"), "no-store")
		}
		for (const [body, type, status] of [
			[
				"emailAddress=a&emailAddress=b",
				"application/x-www-form-urlencoded",
				400,
			],
			["{", "application/json", 400],
			["text", "text/plain", 415],
			["x".repeat(128 * 1024 + 1), "application/json", 413],
		] as const) {
			const response = await handler(
				new Request(preview + "/api/contact", {
					method: "POST",
					headers: { "Content-Type": type },
					body,
				}),
			)
			assert.equal(response.status, status)
		}
		const missing = await handler(
			new Request(preview + "/api/contact", {
				method: "POST",
				body: new URLSearchParams({ message: "Hello" }),
			}),
		)
		assert.equal(missing.status, 303)
		assert.equal(missing.headers.get("location"), "/contact/missing-email")
	},
)

Deno.test(
	"staging never sends real mail, and test delivery omits Jake and BCC",
	async () => {
		const previousFetch = globalThis.fetch
		const previousKey = Deno.env.get("MAILERSEND_API_KEY")
		Deno.env.set("MAILERSEND_API_KEY", "test-key-never-transmitted")
		const messages: Record<string, unknown>[] = []
		globalThis.fetch = (_input, init) => {
			messages.push(JSON.parse(String(init?.body)))
			return Promise.resolve(new Response(null, { status: 202 }))
		}
		const submit = (handle: ReturnType<typeof createHandler>, base = preview) =>
			handle(
				new Request(base + "/api/contact", {
					method: "POST",
					body: new URLSearchParams({
						emailAddress: "visitor@example.com",
						message: "Staging message",
					}),
				}),
			)
		try {
			// Explicit empty configuration also prevents organization-level environment settings interfering.
			const disabled = createHandler("dist", () => undefined)
			assert.equal(
				(await submit(disabled)).headers.get("location"),
				"/contact/failure",
			)
			assert.equal(messages.length, 0)
			const test = createHandler("dist", (key) =>
				key === "MAILERSEND_TEST_RECIPIENT" ? "tester@example.com" : undefined,
			)
			assert.equal(
				(await submit(test)).headers.get("location"),
				"/contact/success",
			)
			assert.deepEqual(messages[0]?.to, [{ email: "tester@example.com" }])
			assert.ok(!Object.hasOwn(messages[0]!, "bcc"))
			assert.match(String(messages[0]?.subject), /^\[TEST\]/)
			const configuredProduction = createHandler("dist", (key) =>
				key === "SITE_MODE" ? "production" : undefined,
			)
			assert.equal(
				(await submit(configuredProduction)).headers.get("location"),
				"/contact/failure",
			)
			assert.equal(
				messages.length,
				1,
				"a preview hostname cannot deliver production mail",
			)
			assert.equal(
				(
					await submit(configuredProduction, "https://jakebaxendale.com")
				).headers.get("location"),
				"/contact/success",
			)
			assert.deepEqual(messages[1]?.to, [
				{ name: "Jake Baxendale", email: "jake.baxendale@gmail.com" },
			])
			assert.ok(Object.hasOwn(messages[1]!, "bcc"))
		} finally {
			globalThis.fetch = previousFetch
			if (previousKey === undefined) Deno.env.delete("MAILERSEND_API_KEY")
			else Deno.env.set("MAILERSEND_API_KEY", previousKey)
		}
	},
)

Deno.test(
	"production requires an explicit setting and preserves canonical redirects",
	async () => {
		const production = createHandler("dist", (key) =>
			key === "SITE_MODE" ? "production" : undefined,
		)
		const redirect = await production(
			new Request("http://www.jakebaxendale.com/bio/?test=1"),
		)
		assert.equal(redirect.status, 308)
		assert.equal(
			redirect.headers.get("location"),
			"https://jakebaxendale.com/bio/?test=1",
		)
		const page = await production(new Request("https://jakebaxendale.com/"))
		assert.equal(page.headers.get("x-robots-tag"), null)
		assert.equal(
			page.headers.get("cache-control"),
			"public, max-age=0, s-maxage=300",
		)
		await page.body?.cancel()
	},
)
