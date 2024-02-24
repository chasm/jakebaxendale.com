import type { VercelRequest, VercelResponse } from "@vercel/node"

import invalidEmail from "../_utilities/invalidEmail/index.js"
import missingEmail from "../_utilities/missingEmail/index.js"
import missingMessage from "../_utilities/missingMessage/index.js"
import sendEmail from "../_utilities/sendEmail/index.js"
import testHoneypot from "../_utilities/testHoneypot/index.js"

export default async function handler(
	{ body }: VercelRequest,
	response: VercelResponse,
) {
	const redirect = "https://jakebaxendale.com/contact/"

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
	if (missingMessage(redirect, body.message, response)) {
		return
	}

	// Send email
	const resp = (await sendEmail(body)) as Response

	resp.ok
		? response.setHeader("Location", `${redirect}success`).status(303).end()
		: response.setHeader("Location", `${redirect}failure`).status(303).end()

	return
}
