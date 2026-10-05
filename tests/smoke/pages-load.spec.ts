import { test, expect } from "@playwright/test"

import { routes } from "../routes"

test.describe("Smoke tests — all pages load", () => {
	for (const route of routes) {
		test(`${route} returns 200 with no console errors`, async ({
			page,
			baseURL,
		}) => {
			const consoleErrors: string[] = []
			const origin = new URL(baseURL!).origin
			// Provider playback is reviewed separately; isolate the host from vendor failures.
			await page.route("**/*", (route) => {
				const request = route.request()
				if (
					request.resourceType() === "document" &&
					new URL(request.url()).origin !== origin
				) {
					return route.fulfill({
						contentType: "text/html",
						body: "<!doctype html><title>External player</title>",
					})
				}
				return route.continue()
			})
			page.on("response", (response) => {
				if (
					new URL(response.url()).origin === origin &&
					response.status() >= 400
				) {
					consoleErrors.push(`HTTP ${response.status()}: ${response.url()}`)
				}
			})

			page.on("console", (msg) => {
				if (msg.type() === "error") {
					const text = msg.text()
					consoleErrors.push(text)
				}
			})

			const response = await page.goto(route)

			expect(response?.status()).toBe(200)
			expect(consoleErrors).toEqual([])
		})
	}
})
