import { test, expect } from "@playwright/test";

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
];

test.describe("Smoke tests — all pages load", () => {
	for (const route of routes) {
		test(`${route} returns 200 with no console errors`, async ({ page }) => {
			const consoleErrors: string[] = [];

			page.on("console", (msg) => {
				if (msg.type() === "error") {
					const text = msg.text();
					// CSP violations from third-party embeds are expected
					if (text.includes("Content Security Policy")) return;
					consoleErrors.push(text);
				}
			});

			const response = await page.goto(route);

			expect(response?.status()).toBe(200);
			expect(consoleErrors).toEqual([]);
		});
	}
});
