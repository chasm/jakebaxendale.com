import type { VercelRequest, VercelResponse } from "@vercel/node"

import invalidEmail from "../_utilities/invalidEmail/index.js"
import missingEmail from "../_utilities/missingEmail/index.js"
import missingMessage from "../_utilities/missingMessage/index.js"
import sendEmail from "../_utilities/sendEmail/index.js"
import testHoneypot from "../_utilities/testHoneypot/index.js"

export default async function handler(
	{ body, headers }: VercelRequest,
	response: VercelResponse,
) {
	const referer = headers?.referer
		? `${headers.referer}/`
		: "https://jakebaxendale.com/contact/"

	if (!referer.includes("contact")) {
		response
			.setHeader("Location", "https://jakebaxendale.com/contact/failure")
			.status(303)
			.end()
	}

	// Honeypot fail or blacklisted
	if (testHoneypot(referer, body, response)) {
		return
	}

	// Invalid EMAIL
	if (invalidEmail(referer, body.emailAddress, response)) {
		return
	}

	// Missing EMAIL
	if (missingEmail(referer, body.emailAddress, response)) {
		return
	}

	// Missing MESSAGE
	if (missingMessage(referer, body.message, response)) {
		return
	}

	// Send email
	const resp = (await sendEmail(body)) as Response

	resp.ok
		? response.setHeader("Location", `${referer}success`).status(303).end()
		: response.setHeader("Location", `${referer}failure`).status(303).end()

	return
}
