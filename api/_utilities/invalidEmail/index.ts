import type { VercelResponse } from "@vercel/node"

const emailMatcher = /^[^ @]+@[^ @]+$/

export default function invalidEmail(
	redirect: string,
	emailAddress = "",
	response: VercelResponse,
): boolean {
	if (emailAddress && !emailMatcher.test(emailAddress?.trim())) {
		response.setHeader("Location", `${redirect}invalid-email`).status(303).end()

		return true
	}

	return false
}
