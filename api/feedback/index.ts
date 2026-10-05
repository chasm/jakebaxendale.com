import type { ApiRequest, ApiResponse } from "../_utilities/types.ts"

import invalidEmail from "../_utilities/invalidEmail/index.ts"
import missingFeedback from "../_utilities/missingFeedback/index.ts"
import sendEmail from "../_utilities/sendEmail/index.ts"
import testHoneypot from "../_utilities/testHoneypot/index.ts"
import validateBody from "../_utilities/validateBody/index.ts"

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	const redirect = "/feedback/"
	const body = validateBody(request, response)
	if (!body) return

	// Honeypot fail or blacklisted
	if (testHoneypot(redirect, body, response)) {
		return
	}

	// Invalid EMAIL
	if (invalidEmail(redirect, body.emailAddress, response)) {
		return
	}

	// Missing FEEDBACK
	if (missingFeedback(redirect, body.feedback ?? "", response)) {
		return
	}

	// Send email
	const resp = await sendEmail({ ...body, message: null }, request.delivery)

	resp.ok
		? response.setHeader("Location", `${redirect}success`).status(303).end()
		: response.setHeader("Location", `${redirect}failure`).status(303).end()

	return
}
