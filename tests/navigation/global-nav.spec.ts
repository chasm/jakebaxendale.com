import { test, expect } from "@playwright/test";

const navLinks = [
	{ href: "/bio", label: "Bio" },
	{ href: "/community", label: "Community" },
	{ href: "/discography", label: "Discography" },
	{ href: "/lessons", label: "Lessons" },
	{ href: "/projects", label: "Projects" },
	{ href: "/prose", label: "Prose" },
	{ href: "/venues", label: "Venues" },
	{ href: "/contact", label: "Contact" },
];

test.describe("Global navigation", () => {
	test("all expected nav links are present and clickable", async ({
		page,
	}) => {
		await page.goto("/");
		const nav = page.locator('nav[aria-label="Global navigation"]');
		await expect(nav).toBeVisible();

		for (const { href, label } of navLinks) {
			const link = nav.locator(`a[href="${href}"]`, { hasText: label });
			await expect(link).toBeVisible();
		}
	});

	test("current page shown as span.this-page, not a link", async ({
		page,
	}) => {
		await page.goto("/bio/");
		const topNav = page.locator(".top-nav");
		const currentPage = topNav.locator("span.this-page", { hasText: "Bio" });
		await expect(currentPage).toBeVisible();

		const bioLink = topNav.locator('a[href="/bio"]');
		await expect(bioLink).toHaveCount(0);
	});
});

test.describe("Skip links", () => {
	test("skip-to-content link targets #main and is focusable", async ({
		page,
	}) => {
		await page.goto("/");
		const skipLink = page.locator('a.skip-link[href="#main"]');
		await expect(skipLink).toHaveCount(1);
		await expect(skipLink).toHaveText("Skip to content");

		await skipLink.focus();
		await expect(skipLink).toBeFocused();
	});

	test("skip-to-footer link targets #footer", async ({ page }) => {
		await page.goto("/");
		const skipLink = page.locator('a.skip-link[href="#footer"]');
		await expect(skipLink).toHaveCount(1);
		await expect(skipLink).toHaveText("Skip to footer");
	});
});

test.describe("Breadcrumb trail", () => {
	test("renders breadcrumbs on sub-pages", async ({ page }) => {
		await page.goto("/projects/waypeople/");
		const trail = page.locator('section[aria-labelledby="trail-h2"]');
		await expect(trail).toBeVisible();

		const list = trail.locator("ul");
		await expect(list).toBeVisible();

		const homeLink = trail.locator('a[href="/"]', { hasText: "Home" });
		await expect(homeLink).toBeVisible();

		const projectsLink = trail.locator('a[href="/projects"]', {
			hasText: "Projects",
		});
		await expect(projectsLink).toBeVisible();

		const currentPage = trail.locator("span.this-page", {
			hasText: "Waypeople",
		});
		await expect(currentPage).toBeVisible();
	});

	test("no breadcrumb list on home page", async ({ page }) => {
		await page.goto("/");
		const trail = page.locator('section[aria-labelledby="trail-h2"]');
		const list = trail.locator("ul");
		await expect(list).toHaveCount(0);
	});
});

test.describe("Menu toggle", () => {
	test("checkbox toggles on label click", async ({ browser }) => {
		const context = await browser.newContext({
			viewport: { width: 375, height: 667 },
		});
		const page = await context.newPage();
		await page.goto("/");

		const checkbox = page.locator("#menu-toggle");
		const label = page.locator("label.menu-toggle");

		await expect(checkbox).not.toBeChecked();
		await label.click();
		await expect(checkbox).toBeChecked();
		await label.click();
		await expect(checkbox).not.toBeChecked();

		await context.close();
	});
});
