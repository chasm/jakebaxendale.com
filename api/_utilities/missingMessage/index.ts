import type { ApiResponse } from "../types.ts"

export default function missingMessage(
	redirect: string,
	message = "",
	response: ApiResponse,
): boolean {
	if (message.trim()) {
		return false
	}

	response.setHeader("Location", `${redirect}missing-message`).status(303).end()

	return true
}
