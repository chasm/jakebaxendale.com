import { test, expect } from "../fixtures/axe"

import { routes } from "../routes"

test.describe("Accessibility — WCAG 2.2 AA audit", () => {
	for (const route of routes) {
		test(`${route} has no accessibility violations`, async ({
			page,
			makeAxeBuilder,
		}) => {
			await page.goto(route)

			const results = await makeAxeBuilder().analyze()

			expect(results.violations).toEqual([])
		})
	}
})
