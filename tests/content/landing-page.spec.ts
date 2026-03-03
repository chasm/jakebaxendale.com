import { test, expect } from "@playwright/test";

test.describe("Landing page — Waypeople album announcement", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("page heading includes album and tour", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "New Album + New Zealand Tour", level: 1 }),
		).toBeVisible();
	});

	test("album announcement text is present", async ({ page }) => {
		await expect(page.locator("text=My new album")).toBeVisible();
		await expect(page.locator("em", { hasText: "Waypeople" }).first()).toBeVisible();
		await expect(page.locator("text=out from March 13th")).toBeVisible();
	});

	test("Bandcamp link points to Waypeople album", async ({ page }) => {
		const bandcampLink = page.locator(
			'a[href="https://jakebaxendale.bandcamp.com/album/waypeople"]',
		);
		await expect(bandcampLink).toBeVisible();
		await expect(bandcampLink).toHaveText("stream and order it on Bandcamp");
	});

	test("Bandcamp embed uses Waypeople album ID", async ({ page }) => {
		const iframe = page.locator("iframe[src*='bandcamp.com/EmbeddedPlayer']");
		await expect(iframe).toHaveAttribute(
			"src",
			/album=1683910850/,
		);
	});

	test("Bandcamp iframe fallback link has correct text and href", async ({ page }) => {
		const iframe = page.locator("iframe[src*='bandcamp.com/EmbeddedPlayer']");
		const html = await iframe.innerHTML();
		expect(html).toContain("Waypeople by Jake Baxendale");
		expect(html).toContain("https://jakebaxendale.bandcamp.com/album/waypeople");
	});

	test("tour intro text mentions touring Aotearoa", async ({ page }) => {
		await expect(
			page.locator("text=touring nearly the length and breadth of Aotearoa"),
		).toBeVisible();
	});
});

test.describe("Landing page — tour dates table", () => {
	const tourDates = [
		{
			date: "Friday April 3rd",
			location: "Tauranga",
			ticketUrl: "https://www.eventfinda.co.nz/2026/waypeople/tauranga",
		},
		{
			date: "Wednesday April 8th",
			location: "Auckland",
			ticketUrl: null,
		},
		{
			date: "Thursday April 9th",
			location: "Hamilton",
			ticketUrl: "https://events.humanitix.com/waypeople-album-release-tour-hamilton/tickets",
		},
		{
			date: "Friday April 10th",
			location: "Napier",
			ticketUrl: "https://events.humanitix.com/waypeople-album-release-tour-napier/tickets",
		},
		{
			date: "Saturday April 11th",
			location: "Wellington",
			ticketUrl: "https://events.humanitix.com/waypeople-album-release-tour-wellington",
		},
		{
			date: "Sunday April 12th",
			location: "Palmerston North",
			ticketUrl: "https://nz.patronbase.com/_GlobeTheatre/Productions/WAYP/Performances",
		},
		{
			date: "Friday April 24th",
			location: "Oamaru",
			ticketUrl: "https://events.humanitix.com/waypeople-album-release-tour-oamaru",
		},
		{
			date: "Saturday April 25th",
			location: "Dunedin",
			ticketUrl: null,
		},
		{
			date: "Sunday April 26th",
			location: "Christchurch",
			ticketUrl: "https://events.humanitix.com/waypeople-album-release-tour-christchurch/tickets",
		},
	];

	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("tour section heading is present", async ({ page }) => {
		await expect(
			page.locator("h2", { hasText: "New Zealand Tour" }),
		).toBeVisible();
	});

	test("table has Date, Location, and Tickets columns", async ({ page }) => {
		const headers = page.locator("table.tour-dates thead th");
		await expect(headers).toHaveCount(3);
		await expect(headers.nth(0)).toHaveText("Date");
		await expect(headers.nth(1)).toHaveText("Location");
		await expect(headers.nth(2)).toHaveText("Tickets");
	});

	test("every tour date row has correct date, location, and ticket info", async ({ page }) => {
		const rows = page.locator("table.tour-dates tbody tr");
		await expect(rows).toHaveCount(tourDates.length);

		for (let i = 0; i < tourDates.length; i++) {
			const row = rows.nth(i);
			const cells = row.locator("td");
			const { date, location, ticketUrl } = tourDates[i];

			await expect(cells.nth(0)).toHaveText(date);
			await expect(cells.nth(1)).toHaveText(location);

			if (ticketUrl) {
				const link = cells.nth(2).locator("a");
				await expect(link).toHaveAttribute("href", ticketUrl);
				await expect(link).toHaveText("Buy tickets");
			} else {
				await expect(cells.nth(2)).toHaveText("Coming soon");
			}
		}
	});
});

test.describe("Landing page — other sections preserved", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test('"In other media" section is still present', async ({ page }) => {
		await expect(
			page.locator("h2", { hasText: "In other media" }),
		).toBeVisible();
	});

	test("social links are still present", async ({ page }) => {
		await expect(page.locator(".social")).toBeVisible();
		await expect(
			page.locator('a[href*="facebook.com/jakebaxendalemusic"]'),
		).toBeVisible();
		await expect(
			page.locator('a[href*="instagram.com/jakesaxendale"]'),
		).toBeVisible();
	});
});
