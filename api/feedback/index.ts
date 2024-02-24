import type { VercelRequest, VercelResponse } from "@vercel/node"

import invalidEmail from "../_utilities/invalidEmail/index.js"
import missingFeedback from "../_utilities/missingFeedback/index.js"
import sendEmail from "../_utilities/sendEmail/index.js"
import testHoneypot from "../_utilities/testHoneypot/index.js"

export default async function handler(
	{ body }: VercelRequest,
	response: VercelResponse,
) {
	const redirect = "https://jakebaxendale.com/feedback/"

	// Honeypot fail or blacklisted
	if (testHoneypot(redirect, body, response)) {
		return
	}

	// Invalid EMAIL
	if (invalidEmail(redirect, body.emailAddress, response)) {
		return
	}

	// Missing FEEDBACK
	if (missingFeedback(redirect, body.feedback, response)) {
		return
	}

	// Send email
	const resp = (await sendEmail(body)) as Response

	resp.ok
		? response.setHeader("Location", `${redirect}success`).status(303).end()
		: response.setHeader("Location", `${redirect}failure`).status(303).end()

	return
}
