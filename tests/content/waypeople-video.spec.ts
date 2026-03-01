import { test, expect } from "@playwright/test";

test.describe("Waypeople project page — video embed", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/projects/waypeople/");
	});

	test("YouTube iframe uses the new video ID", async ({ page }) => {
		const iframe = page.locator("iframe[src*='youtube.com/embed']");
		await expect(iframe).toHaveAttribute("src", /4iQK4Ia6Jd8/);
	});

	test("old trailer video ID is not present", async ({ page }) => {
		const iframe = page.locator("iframe[src*='youtube.com/embed']");
		const src = await iframe.getAttribute("src");
		expect(src).not.toContain("aJe9q-4yt3E");
	});

	test("YouTube iframe has a title attribute", async ({ page }) => {
		const iframe = page.locator("iframe[src*='youtube.com/embed']");
		await expect(iframe).toHaveAttribute("title", /Waypeople/);
	});

	test("YouTube iframe src includes playlist parameter", async ({ page }) => {
		const iframe = page.locator("iframe[src*='youtube.com/embed']");
		await expect(iframe).toHaveAttribute(
			"src",
			/list=PL_hgf9zjGMI9hjLbKh-JYXUkpjXmItSw4/,
		);
	});
});

test.describe("Waypeople project page — content", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/projects/waypeople/");
	});

	test("page description mentions sonic and visual journey", async ({ page }) => {
		await expect(
			page.locator("text=sonic and visual journey"),
		).toBeVisible();
	});

	test("credits list Music by Jake Baxendale", async ({ page }) => {
		await expect(
			page.locator("li", { hasText: "Music by Jake Baxendale" }),
		).toBeVisible();
	});

	test("credits list Visual art by Nikita Tu-Bryant", async ({ page }) => {
		await expect(
			page.locator("li", { hasText: /Visual art by.*Nikita.*Tu-Bryant/ }),
		).toBeVisible();
	});

	test("credits list Theatrical direction by Joel Baxendale", async ({ page }) => {
		await expect(
			page.locator("li", { hasText: /Theatrical direction and design by.*Joel Baxendale/ }),
		).toBeVisible();
	});

	test("featured musicians are listed", async ({ page }) => {
		const musicians = [
			{ name: "Chelsea Prastiti", instrument: "vocals" },
			{ name: "Jessie Ling", instrument: "guzheng" },
			{ name: "Daniel Hayles", instrument: "piano" },
			{ name: "Callum Passells", instrument: "saxophones" },
			{ name: "Cory Champion", instrument: "drums" },
			{ name: "Johnny Lawrence", instrument: "double bass" },
		];

		const featuringList = page.locator("ul ul li");
		for (const { name, instrument } of musicians) {
			await expect(
				featuringList.filter({ hasText: new RegExp(`${name}.*${instrument}`) }),
			).toBeVisible();
		}
	});

	test("carousel component is present with images", async ({ page }) => {
		const carousel = page.locator(".carousel");
		await expect(carousel).toBeVisible();
		const images = carousel.locator("img");
		const count = await images.count();
		expect(count).toBeGreaterThan(0);
	});

	test("Creative New Zealand funding acknowledgement is present", async ({ page }) => {
		await expect(
			page.locator("text=supported by funding from Creative New Zealand"),
		).toBeVisible();
	});

	test("link to performance description document", async ({ page }) => {
		const link = page.locator(
			'a[href="https://docs.google.com/document/d/1qzpa4Q7wbKWtzhju5vsaT9Yy9iT_bY2JCd_M4Ihk6HU/edit?usp=sharing"]',
		);
		await expect(link).toBeVisible();
		await expect(link).toHaveText(/performance description/);
	});
});
