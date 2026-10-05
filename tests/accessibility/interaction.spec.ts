import { test, expect } from "../fixtures/axe"
import { routes } from "../routes"

test("mobile menu works by keyboard, hides closed links and closes with Escape", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 667 })
	await page.goto("/")
	const toggle = page.getByRole("checkbox", { name: "Navigation menu" })
	const menu = page.locator("#site-menu")
	await expect(menu).toBeHidden()
	await toggle.focus()
	await page.keyboard.press("Space")
	await expect(menu).toBeVisible()
	await expect(toggle).toBeChecked()
	await page.keyboard.press("Tab")
	await expect(
		menu.getByRole("link", { name: "Bio", exact: true }),
	).toBeFocused()
	await page.keyboard.press("Escape")
	await expect(menu).toBeHidden()
	await expect(toggle).toBeFocused()
	await expect(toggle).not.toBeChecked()
})

test("menu has a usable toggle at the old breakpoint gap", async ({ page }) => {
	await page.setViewportSize({ width: 1220, height: 800 })
	await page.goto("/")
	await page.locator("label.menu-toggle").click()
	await expect(page.locator("#site-menu")).toBeVisible()
})

test("skip link moves keyboard focus to main", async ({ page }) => {
	await page.goto("/")
	await page.locator('a[href="#main"]').focus()
	await page.keyboard.press("Enter")
	await expect(page.locator("main")).toBeFocused()
})

test("gallery respects reduced motion and keeps full-size images keyboard accessible", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" })
	await page.goto("/projects/waypeople/")
	await expect(
		page.getByRole("button", { name: "Play slideshow" }),
	).toBeVisible()
	await expect(
		page.locator(".carousel-slide").first().locator("a"),
	).toHaveAttribute("tabindex", "0")
	await page.locator(".carousel-track").focus()
	await page.keyboard.press("ArrowRight")
	await expect(page.locator(".carousel-counter")).toHaveText(/Image 2 of/)
	await expect(
		page.locator(".carousel-slide").nth(1).locator("a"),
	).toHaveAttribute("tabindex", "0")
})

test("gallery dots select images with Enter instead of navigating away", async ({
	page,
}) => {
	await page.goto("/projects/waypeople/")
	await page.locator(".carousel-dot").nth(2).focus()
	await page.keyboard.press("Enter")
	await expect(page).toHaveURL(/\/projects\/waypeople\//)
	await expect(page.locator(".carousel-counter")).toHaveText(/Image 3 of/)
})

for (const route of routes) {
	test(`${route} reflows and passes axe on a narrow screen`, async ({
		page,
		makeAxeBuilder,
	}) => {
		await page.setViewportSize({ width: 320, height: 800 })
		await page.goto(route)
		await expect(page.locator("h1")).toBeVisible()
		const dimensions = await page.evaluate(() => ({
			width: window.innerWidth,
			scrollWidth: document.documentElement.scrollWidth,
			overflowing: Array.from(document.querySelectorAll("body *"))
				.filter((element) => {
					const box = element.getBoundingClientRect()
					return box.right > window.innerWidth && box.top >= 0
				})
				.slice(0, 15)
				.map((element) => ({
					tag: element.tagName,
					class: element.className,
					width: element.getBoundingClientRect().width,
				})),
		}))
		if (
			[
				"/",
				"/contact/",
				"/feedback/",
				"/projects/waypeople/",
				"/discography/",
			].includes(route)
		)
			await page.screenshot({
				path: `audit/evidence/${route.replaceAll("/", "-") || "home"}mobile.png`,
				fullPage: true,
			})
		expect(
			dimensions.scrollWidth,
			JSON.stringify(dimensions),
		).toBeLessThanOrEqual(dimensions.width)
		expect((await makeAxeBuilder().analyze()).violations).toEqual([])
	})
}

test("menu and gallery remain usable without JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 375, height: 667 },
	})
	const page = await context.newPage()
	await page.goto("http://localhost:14321/projects/waypeople/")
	await page.getByRole("checkbox", { name: "Navigation menu" }).focus()
	await page.keyboard.press("Space")
	await expect(page.locator("#site-menu")).toBeVisible()
	await page.keyboard.press("Space")
	await expect(
		page.locator(".carousel-slide").first().locator("a"),
	).toBeVisible()
	await context.close()
})
