import { test, expect } from "@playwright/test";

test.describe("Carousel", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/projects/waypeople/");
		await page.waitForSelector(".carousel-controls");
	});

	test("controls nav has correct aria-label", async ({ page }) => {
		const controls = page.locator(".carousel-controls");
		await expect(controls).toHaveAttribute(
			"aria-label",
			"Gallery navigation",
		);
	});

	test("navigation buttons have correct labels", async ({ page }) => {
		await expect(
			page.locator('button[aria-label="Previous image"]'),
		).toBeVisible();
		await expect(
			page.locator('button[aria-label="Next image"]'),
		).toBeVisible();
		await expect(
			page.locator('button[aria-label="Pause slideshow"]'),
		).toBeVisible();
	});

	test("prev button is disabled on first slide", async ({ page }) => {
		const prev = page.locator('button[aria-label="Previous image"]');
		await expect(prev).toBeDisabled();
	});

	test("next button advances counter", async ({ page }) => {
		const counter = page.locator(".carousel-counter");
		await expect(counter).toContainText("Image 1 of");

		const next = page.locator('button[aria-label="Next image"]');
		await next.click();
		await expect(counter).toContainText("Image 2 of");
	});

	test("prev button goes back after advancing", async ({ page }) => {
		const counter = page.locator(".carousel-counter");
		const next = page.locator('button[aria-label="Next image"]');
		const prev = page.locator('button[aria-label="Previous image"]');

		await next.click();
		await expect(counter).toContainText("Image 2 of");

		await prev.click();
		await expect(counter).toContainText("Image 1 of");
	});

	test("keyboard ArrowRight and ArrowLeft navigate slides", async ({
		page,
	}) => {
		const counter = page.locator(".carousel-counter");

		// Pause autoplay first to prevent race conditions
		await page.locator('button[aria-label="Pause slideshow"]').click();
		await expect(counter).toContainText("Image 1 of");

		// Focus a control button for keyboard events
		await page
			.locator('button[aria-label="Next image"]')
			.focus();

		await page.keyboard.press("ArrowRight");
		await expect(counter).toContainText("Image 2 of");

		await page.keyboard.press("ArrowLeft");
		await expect(counter).toContainText("Image 1 of");
	});

	test("play/pause toggles autoplay", async ({ page }) => {
		const playPause = page.locator(
			'button[aria-label="Pause slideshow"], button[aria-label="Play slideshow"]',
		);

		// Initially playing — button says "Pause slideshow"
		await expect(playPause).toHaveAttribute("aria-label", "Pause slideshow");

		await playPause.click();
		await expect(playPause).toHaveAttribute("aria-label", "Play slideshow");

		await playPause.click();
		await expect(playPause).toHaveAttribute("aria-label", "Pause slideshow");
	});

	test("counter has aria-live polite", async ({ page }) => {
		const counter = page.locator(".carousel-counter");
		await expect(counter).toHaveAttribute("aria-live", "polite");
	});

	test("all carousel images have non-empty alt", async ({ page }) => {
		const images = page.locator(".carousel-slide img");
		const count = await images.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const alt = await images.nth(i).getAttribute("alt");
			expect(alt).toBeTruthy();
		}
	});
});
