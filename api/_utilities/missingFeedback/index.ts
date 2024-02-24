import type { VercelResponse } from "@vercel/node"

export default function missingFeedback(
	redirect: string,
	feedback = "",
	response: VercelResponse,
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
