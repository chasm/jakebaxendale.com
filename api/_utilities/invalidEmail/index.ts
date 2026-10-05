import type { ApiResponse } from "../types.ts"

const emailMatcher = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

export default function invalidEmail(
	redirect: string,
	emailAddress = "",
	response: ApiResponse,
): boolean {
	if (emailAddress && !emailMatcher.test(emailAddress?.trim())) {
		response.setHeader("Location", `${redirect}invalid-email`).status(303).end()

		return true
	}

	return false
}
