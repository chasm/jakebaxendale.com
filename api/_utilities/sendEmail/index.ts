import type { Body } from "../types"

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY

const CHAS = {
	name: "Charles F. Munat",
	email: "jake@munat.com",
}
const SITE = {
	name: "JakeBaxendale.com",
	email: "no-reply@jakebaxendale.com",
}
const JAKE = {
	name: "Jake Baxendale",
	email: "jake.baxendale@gmail.com",
}

function composeBody(body: Body, t = new Date()): string {
	const { feedback, message, name } = body
	const msg = feedback || message || "Empty message"
	const txt =
		"<p>" +
		msg
			.split(/\n[\W]*\n/g)
			.map((line: string) => line.replace(/\n/g, "<br>"))
			.join("</p><p>") +
		"</p>"

	return [
		`${txt}`,
		...(name ? [`<p>Name: ${name}</p>`] : []),
		`<p>Submitted at: ${t.toString()}</p>`,
	].join("\n")
}

function getMessageType({ feedback, message }: Body): string {
	if (feedback) {
		return "Feedback"
	}

	if (message) {
		return "Contact"
	}

	return "Unknown"
}

export default async function sendEmail(body: Body) {
	const { emailAddress, name } = body

	const reply_to = emailAddress
		? {
				reply_to: [
					{
						name,
						email: emailAddress,
					},
				],
			}
		: {}

	const html = composeBody(body)

	const email = {
		body: JSON.stringify({
			from: SITE,
			to: [JAKE],
			bcc: [CHAS],
			...reply_to,
			subject: `${getMessageType(body)} from JakeBaxendale.com!`,
			html,
		}),
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Authorization": `Bearer ${MAILERSEND_API_KEY}`,
		},
		method: "POST",
	}

	try {
		return await fetch("https://api.mailersend.com/v1/email", email)
	} catch (error) {
		return error
	}
}
