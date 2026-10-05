import { test, expect } from "@playwright/test"
import type { ApiRequest, ApiResponse } from "../../api/_utilities/types"
import contact from "../../api/contact/index"
import feedback from "../../api/feedback/index"

test.describe("Form API with MailerSend mocked", () => {
	test.describe.configure({ mode: "serial" })
	const originalFetch = globalThis.fetch
	const originalKey = process.env.MAILERSEND_API_KEY
	const originalBlacklist = process.env.EMAIL_BLACKLIST
	let messages: Record<string, unknown>[]
	let providerStatus: number
	let networkFailure: boolean

	test.beforeEach(() => {
		process.env.MAILERSEND_API_KEY = "test-key-never-transmitted"
		process.env.EMAIL_BLACKLIST = "blocked@example.com"
		messages = []
		providerStatus = 202
		networkFailure = false
		globalThis.fetch = async (_input, options) => {
			messages.push(JSON.parse(String(options?.body)))
			if (networkFailure) throw new Error("Offline")
			return new Response(null, { status: providerStatus })
		}
	})
	test.afterEach(() => {
		globalThis.fetch = originalFetch
		if (originalKey === undefined) delete process.env.MAILERSEND_API_KEY
		else process.env.MAILERSEND_API_KEY = originalKey
		if (originalBlacklist === undefined) delete process.env.EMAIL_BLACKLIST
		else process.env.EMAIL_BLACKLIST = originalBlacklist
	})

	async function submit(
		handler: typeof contact,
		body: unknown,
		method = "POST",
	) {
		const headers: Record<string, string | number | readonly string[]> = {}
		let status = 200
		const response = {
			setHeader(key: string, value: string) {
				headers[key] = value
				return response
			},
			status(value: number) {
				status = value
				return response
			},
			end() {
				return response
			},
		} as unknown as ApiResponse
		await handler({ body, method } as ApiRequest, response)
		return { status, headers }
	}

	test("valid contact sets a single Reply-To and escapes user HTML", async () => {
		const result = await submit(contact, {
			emailAddress: " visitor@example.com ",
			name: "<b>Visitor</b>",
			message: '<img src="https://example.com/pixel">\nHello & goodbye',
			feedback: "must not override contact",
		})
		expect(result.status).toBe(303)
		expect(result.headers.Location).toBe("/contact/success")
		expect(result.headers["Cache-Control"]).toBe("no-store")
		expect(messages).toHaveLength(1)
		expect(messages[0]?.reply_to).toEqual({
			name: "<b>Visitor</b>",
			email: "visitor@example.com",
		})
		expect(messages[0]?.html).toContain("&lt;img")
		expect(messages[0]?.html).not.toContain("<img")
		expect(messages[0]?.html).toContain("Hello &amp; goodbye")
		expect(messages[0]?.html).not.toContain("must not override")
	})
	test("anonymous feedback can be sent without a Reply-To", async () => {
		const result = await submit(feedback, { feedback: "Useful site" })
		expect(result.headers.Location).toBe("/feedback/success")
		expect(messages[0]).not.toHaveProperty("reply_to")
	})
	test("missing required values and invalid emails redirect without sending", async () => {
		for (const [body, reason] of [
			[{ message: "Hi" }, "missing-email"],
			[{ emailAddress: "a@example.com", message: "  " }, "missing-message"],
			[{ emailAddress: "a@b\nInjected", message: "Hi" }, "invalid-email"],
		] as const) {
			expect((await submit(contact, body)).headers.Location).toBe(
				`/contact/${reason}`,
			)
		}
		expect((await submit(feedback, {})).headers.Location).toBe(
			"/feedback/missing-feedback",
		)
		expect(messages).toHaveLength(0)
	})
	test("malformed, duplicate and oversized fields cannot crash or send", async () => {
		for (const body of [
			null,
			[],
			"text",
			{ emailAddress: ["a@example.com"] },
			{ message: 123 },
			{ message: null },
		]) {
			expect((await submit(contact, body)).status).toBe(400)
		}
		expect((await submit(contact, { message: "x".repeat(10001) })).status).toBe(
			413,
		)
		expect(messages).toHaveLength(0)
	})
	test("GET is rejected and honeypots and blacklist do not send", async () => {
		const get = await submit(contact, {}, "GET")
		expect(get.status).toBe(405)
		expect(get.headers.Allow).toBe("POST")
		for (const extra of [
			{ password: "bot" },
			{ confirmation: "bot" },
			{ emailAddress: "b.l.o.c.k.e.d@example.com" },
		]) {
			const result = await submit(contact, {
				emailAddress: "a@example.com",
				message: "Hi",
				...extra,
			})
			expect(result.headers.Location).toBe("/contact/")
		}
		expect(messages).toHaveLength(0)
	})
	test("provider rejection, network failure and missing secret reach failure page", async () => {
		const body = { emailAddress: "a@example.com", message: "Hi" }
		providerStatus = 422
		expect((await submit(contact, body)).headers.Location).toBe(
			"/contact/failure",
		)
		networkFailure = true
		expect((await submit(contact, body)).headers.Location).toBe(
			"/contact/failure",
		)
		delete process.env.MAILERSEND_API_KEY
		expect((await submit(contact, body)).headers.Location).toBe(
			"/contact/failure",
		)
		expect(messages).toHaveLength(2)
	})
})
