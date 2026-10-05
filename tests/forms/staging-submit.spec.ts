import { test, expect } from "@playwright/test"

for (const kind of ["contact", "feedback"] as const) {
	test(`${kind} submission is processed on staging without sending email`, async ({
		page,
	}) => {
		await page.goto(`/${kind}/`)
		const origin = new URL(page.url()).origin
		await page
			.locator(`#${kind === "contact" ? "message" : "feedback"}`)
			.fill("Local automated transport check")
		if (kind === "contact")
			await page.locator("#email").fill("test@example.com")
		await page.locator(`#${kind}-form button[type="submit"]`).click()
		await expect(page).toHaveURL(`${origin}/${kind}/failure/`)
	})
}
