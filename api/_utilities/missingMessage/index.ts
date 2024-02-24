import type { VercelResponse } from "@vercel/node"

export default function missingMessage(
	redirect: string,
	message = "",
	response: VercelResponse,
): boolean {
	if (message.trim()) {
		return false
	}

	response.setHeader("Location", `${redirect}missing-message`).status(303).end()

	return true
}
