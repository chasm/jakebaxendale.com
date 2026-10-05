import type { ApiRequest, ApiResponse } from "../_utilities/types.ts"

import invalidEmail from "../_utilities/invalidEmail/index.ts"
import missingEmail from "../_utilities/missingEmail/index.ts"
import missingMessage from "../_utilities/missingMessage/index.ts"
import sendEmail from "../_utilities/sendEmail/index.ts"
import testHoneypot from "../_utilities/testHoneypot/index.ts"
import validateBody from "../_utilities/validateBody/index.ts"

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	const redirect = "/contact/"
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

	// Missing EMAIL
	if (missingEmail(redirect, body.emailAddress, response)) {
		return
	}

	// Missing MESSAGE
	if (missingMessage(redirect, body.message ?? "", response)) {
		return
	}

	// Send email
	const resp = await sendEmail({ ...body, feedback: null }, request.delivery)

	resp.ok
		? response.setHeader("Location", `${redirect}success`).status(303).end()
		: response.setHeader("Location", `${redirect}failure`).status(303).end()

	return
}
