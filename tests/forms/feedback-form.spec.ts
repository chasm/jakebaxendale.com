import { test, expect } from "@playwright/test";

test.describe("Feedback form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/feedback/");
	});

	test("form is present with correct action and method", async ({ page }) => {
		const form = page.locator("#feedback-form");
		await expect(form).toHaveAttribute("action", "/api/feedback");
		await expect(form).toHaveAttribute("method", "post");
	});

	test("feedback textarea is required, email is not", async ({ page }) => {
		await expect(page.locator("#feedback")).toHaveAttribute("required", "");

		const email = page.locator("#email");
		await expect(email).not.toHaveAttribute("required", "");
	});

	test("browser validation blocks empty submission", async ({ page }) => {
		await page.locator('#feedback-form button[type="submit"]').click();
		await expect(page).toHaveURL(/\/feedback\//);
	});

	test("honeypot fieldset has aria-hidden and tabindex=-1 inputs", async ({
		page,
	}) => {
		const honeypot = page.locator("fieldset.funnypot");
		await expect(honeypot).toHaveAttribute("aria-hidden", "true");

		const inputs = honeypot.locator("input");
		for (const input of await inputs.all()) {
			await expect(input).toHaveAttribute("tabindex", "-1");
		}
	});
});
