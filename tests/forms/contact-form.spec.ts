import { test, expect } from "@playwright/test"

test.describe("Contact form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/contact/")
	})

	test("form is present with correct action and method", async ({ page }) => {
		const form = page.locator("#contact-form")
		await expect(form).toHaveAttribute("action", "/api/contact")
		await expect(form).toHaveAttribute("method", "post")
	})

	test("all labels are present", async ({ page }) => {
		await expect(page.locator('label[for="message"]')).toHaveText(
			"Your message*",
		)
		await expect(page.locator('label[for="email"]')).toHaveText(
			"Your email address*",
		)
		await expect(page.locator('label[for="name"]')).toHaveText(
			"Your name (optional)",
		)
	})

	test("message and email are required", async ({ page }) => {
		await expect(page.locator("#message")).toHaveAttribute("required", "")
		await expect(page.locator("#email")).toHaveAttribute("required", "")
	})

	test("browser validation blocks empty submission", async ({ page }) => {
		await page.locator('#contact-form button[type="submit"]').click()
		await expect(page).toHaveURL(/\/contact\//)
	})

	test("browser validation rejects invalid email", async ({ page }) => {
		await page.locator("#message").fill("Hello")
		await page.locator("#email").fill("not-an-email")
		await page.locator('#contact-form button[type="submit"]').click()
		await expect(page).toHaveURL(/\/contact\//)
	})

	test("honeypot fieldset has aria-hidden and tabindex=-1 inputs", async ({
		page,
	}) => {
		const honeypot = page.locator("fieldset.funnypot")
		await expect(honeypot).toHaveAttribute("aria-hidden", "true")

		const inputs = honeypot.locator("input")
		for (const input of await inputs.all()) {
			await expect(input).toHaveAttribute("tabindex", "-1")
		}
	})
})
