import contact from "../api/contact/index.ts"
import feedback from "../api/feedback/index.ts"
import type { ApiResponse, EmailDelivery } from "../api/_utilities/types.ts"

const MAX_BODY_BYTES = 128 * 1024

async function readBody(request: Request): Promise<unknown | Response> {
	const type = request.headers.get("content-type")?.split(";")[0]?.trim()
	if (
		type !== "application/x-www-form-urlencoded" &&
		type !== "application/json"
	) {
		return new Response(null, { status: 415 })
	}
	if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
		return new Response(null, { status: 413 })
	}
	const reader = request.body?.getReader()
	if (!reader) return null
	let bytes = 0
	const chunks: Uint8Array[] = []
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			bytes += value.byteLength
			if (bytes > MAX_BODY_BYTES) {
				await reader.cancel()
				return new Response(null, { status: 413 })
			}
			chunks.push(value)
		}
		const data = new Uint8Array(bytes)
		let offset = 0
		for (const chunk of chunks) {
			data.set(chunk, offset)
			offset += chunk.byteLength
		}
		const text = new TextDecoder("utf-8", { fatal: true }).decode(data)
		if (type === "application/json") return JSON.parse(text)
		const input: Record<string, string> = Object.create(null)
		for (const [key, value] of new URLSearchParams(text)) {
			if (Object.hasOwn(input, key)) return new Response(null, { status: 400 })
			input[key] = value
		}
		return input
	} catch {
		return new Response(null, { status: 400 })
	} finally {
		reader.releaseLock()
	}
}

export async function handleForm(
	request: Request,
	kind: "contact" | "feedback",
	delivery: EmailDelivery | null | undefined,
): Promise<Response> {
	const headers = new Headers({ "Cache-Control": "no-store" })
	let status = 200
	const response: ApiResponse = {
		setHeader(key, value) {
			headers.set(key, value)
			return response
		},
		status(code) {
			status = code
			return response
		},
		end() {},
	}
	// Let shared validation reject methods before consuming the request body.
	const body = request.method === "POST" ? await readBody(request) : null
	if (body instanceof Response) {
		return new Response(null, { status: body.status, headers })
	}
	await (kind === "contact" ? contact : feedback)(
		{ method: request.method, body, delivery },
		response,
	)
	return new Response(null, { status, headers })
}
