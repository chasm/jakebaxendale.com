import type { ApiResponse } from "../types.ts"

export default function missingEmail(
	redirect: string,
	emailAddress = "",
	response: ApiResponse,
): boolean {
	if (emailAddress.trim()) {
		return false
	}

	response.setHeader("Location", `${redirect}missing-email`).status(303).end()

	return true
}
