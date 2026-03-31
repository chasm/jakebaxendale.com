import { test, expect } from "../fixtures/axe"

const routes = [
	"/",
	"/bio/",
	"/community/",
	"/contact/",
	"/contact/failure/",
	"/contact/invalid-email/",
	"/contact/missing-email/",
	"/contact/missing-message/",
	"/contact/success/",
	"/cookie-policy/",
	"/discography/",
	"/feedback/",
	"/feedback/failure/",
	"/feedback/invalid-email/",
	"/feedback/missing-feedback/",
	"/feedback/success/",
	"/lessons/",
	"/portfolio/",
	"/privacy-policy/",
	"/projects/",
	"/projects/antipodes/",
	"/projects/bazurka/",
	"/projects/gardening-music/",
	"/projects/jb3/",
	"/projects/richter-city-rebels/",
	"/projects/sanctuary/",
	"/projects/striking-moments/",
	"/projects/the-jac/",
	"/projects/waypeople/",
	"/prose/",
	"/terms-of-use/",
	"/venues/",
]

test.describe("Accessibility — WCAG 2.1 AA audit", () => {
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
