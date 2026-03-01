import type { VercelResponse } from "@vercel/node"

import type { Body } from "../types"

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
		body.password ||
		body.confirmation ||
		EMAIL_BLACKLIST.split(/, */).includes(flatEmail)
	) {
		response.setHeader("Location", redirect).status(303).end()

		return true
	}

	return false
}
