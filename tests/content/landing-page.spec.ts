import { test, expect } from "@playwright/test"

test.describe("Landing page — Waypeople album announcement", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/")
	})

	test("page heading promotes the new album", async ({ page }) => {
		await expect(
			page.getByRole("heading", {
				name: "New Album",
				level: 1,
			}),
		).toBeVisible()
	})

	test("album announcement text is present", async ({ page }) => {
		await expect(page.locator("text=My new album")).toBeVisible()
		await expect(
			page.locator("em", { hasText: "Waypeople" }).first(),
		).toBeVisible()
		await expect(page.locator("text=is out now")).toBeVisible()
	})

	test("Bandcamp link points to Waypeople album", async ({ page }) => {
		const bandcampLink = page.locator(
			'a[href="https://jakebaxendale.bandcamp.com/album/waypeople"]',
		)
		await expect(bandcampLink).toBeVisible()
		await expect(bandcampLink).toHaveText("stream and order it on Bandcamp")
	})

	test("Bandcamp embed uses Waypeople album ID", async ({ page }) => {
		const iframe = page.locator("iframe[src*='bandcamp.com/EmbeddedPlayer']")
		await expect(iframe).toHaveAttribute("src", /album=1683910850/)
	})

	test("Bandcamp iframe fallback link has correct text and href", async ({
		page,
	}) => {
		const iframe = page.locator("iframe[src*='bandcamp.com/EmbeddedPlayer']")
		const html = (await iframe.innerHTML()).replace(/\s+/g, " ")
		expect(html).toContain("Waypeople by Jake Baxendale")
		expect(html).toContain("https://jakebaxendale.bandcamp.com/album/waypeople")
	})

	test("past tour information has been removed", async ({ page }) => {
		await expect(page.locator("main")).not.toContainText(
			/New Zealand Tour|NZ tour|Buy tickets|touring nearly/,
		)
		await expect(page.locator("table.tour-dates")).toHaveCount(0)
		await expect(page).toHaveTitle(/^New Album ::/)
	})
})

test.describe("Landing page — other sections preserved", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/")
	})

	test('"In other media" section is still present', async ({ page }) => {
		await expect(
			page.locator("h2", { hasText: "In other media" }),
		).toBeVisible()
	})

	test("social links are still present", async ({ page }) => {
		await expect(page.locator(".social")).toBeVisible()
		await expect(
			page.locator('a[href*="facebook.com/jakebaxendalemusic"]'),
		).toBeVisible()
		await expect(
			page.locator('a[href*="instagram.com/jakesaxendale"]'),
		).toBeVisible()
	})
})
