import type { ApiRequest, ApiResponse } from "../types.ts"
import type { Body } from "../types.ts"

const limits = {
	emailAddress: 254,
	name: 200,
	message: 10000,
	feedback: 10000,
	password: 200,
	confirmation: 200,
} as const

export default function validateBody(
	request: ApiRequest,
	response: ApiResponse,
): Body | null {
	response.setHeader("Cache-Control", "no-store")
	if (request.method !== "POST") {
		response.setHeader("Allow", "POST").status(405).end()
		return null
	}
	const input: unknown = request.body
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		response.status(400).end()
		return null
	}
	const body: Body = { emailAddress: "", name: "" }
	for (const [key, limit] of Object.entries(limits)) {
		const value = (input as Record<string, unknown>)[key]
		if (value === undefined) continue
		if (typeof value !== "string") {
			response.status(400).end()
			return null
		}
		if (value.length > limit) {
			response.status(413).end()
			return null
		}
		body[key as keyof typeof limits] = value.trim()
	}
	return body
}
