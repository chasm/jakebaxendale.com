import type { VercelResponse } from "@vercel/node"

import type { Body } from "../types"

const HONEYPOT_PASSWORD = process.env.HONEYPOT_PASSWORD || ""
const HONEYPOT_CONFIRMATION = process.env.HONEYPOT_CONFIRMATION || ""
const EMAIL_BLACKLIST = process.env.EMAIL_BLACKLIST || ""

export default function testHoneypot(
	redirect: string,
	body: Partial<Body>,
	response: VercelResponse,
): boolean {
	const [account, domain] =
		body.emailAddress?.trim().toLocaleLowerCase().split("@") || []
	const flatEmail = `${account?.replace(/\./g, "")}@${domain}`

	if (
		body.password !== HONEYPOT_PASSWORD ||
		body.confirmation !== HONEYPOT_CONFIRMATION ||
		EMAIL_BLACKLIST.split(/, */).includes(flatEmail)
	) {
		response.setHeader("Location", redirect).status(303).end()

		return true
	}

	return false
}
