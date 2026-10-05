import process from "node:process"
import type { ApiResponse } from "../types.ts"

import type { Body } from "../types.ts"

export default function testHoneypot(
	redirect: string,
	body: Partial<Body>,
	response: ApiResponse,
): boolean {
	const EMAIL_BLACKLIST = process.env.EMAIL_BLACKLIST || ""
	const [account, domain] =
		body.emailAddress?.trim().toLocaleLowerCase().split("@") || []
	const flatEmail = `${account?.replace(/\./g, "")}@${domain}`

	if (
		body.password ||
		body.confirmation ||
		EMAIL_BLACKLIST.split(/, */).includes(flatEmail)
	) {
		response.setHeader("Location", redirect).status(303).end()

		return true
	}

	return false
}
