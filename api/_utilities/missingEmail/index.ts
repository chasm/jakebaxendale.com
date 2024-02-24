import type { VercelResponse } from "@vercel/node"

export default function missingEmail(
	redirect: string,
	emailAddress = "",
	response: VercelResponse,
): boolean {
	if (emailAddress.trim()) {
		return false
	}

	response.setHeader("Location", `${redirect}missing-email`).status(303).end()

	return true
}
