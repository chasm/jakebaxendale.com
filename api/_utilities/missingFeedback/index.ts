import type { ApiResponse } from "../types.ts"

export default function missingFeedback(
	redirect: string,
	feedback = "",
	response: ApiResponse,
): boolean {
	if (feedback.trim()) {
		return false
	}

	response
		.setHeader("Location", `${redirect}missing-feedback`)
		.status(303)
		.end()

	return true
}
