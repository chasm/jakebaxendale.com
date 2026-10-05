import { readFileSync } from "node:fs"

import { test, expect } from "@playwright/test"

import { routes } from "../routes"

// Compare the authored prose with browser-rendered text. Page loading and axe
// cannot detect words joined by a compiler's changed whitespace rules.
for (const route of routes) {
	test(`${route} preserves authored text spacing`, async ({ page }) => {
		const source = readFileSync(`src/pages${route}index.astro`, "utf8")
		const blocks: string[] = []
		const stack: Array<{ tag: string; start: number }> = []
		for (const match of source.matchAll(
			/<(\/?)(p|li|figcaption|h[1-6]|label|legend|button)\b[^>]*>/g,
		)) {
			if (!match[1]) stack.push({ tag: match[2]!, start: match.index })
			else {
				const start = stack.findLastIndex(({ tag }) => tag === match[2])
				if (start >= 0) {
					blocks.push(
						source.slice(stack[start]!.start, match.index + match[0].length),
					)
					stack.splice(start)
				}
			}
		}
		await page.goto(route)
		const result = await page.evaluate((blocks) => {
			const normalize = (text: string) => text.replace(/\s+/g, " ").trim()
			const key = (text: string) => text.replace(/\s/g, "")
			const selector =
				"p, li, figcaption, h1, h2, h3, h4, h5, h6, label, legend, button"
			const rendered = Array.from(
				document.querySelectorAll<HTMLElement>(selector),
			).map((element) => normalize(element.innerText))
			const issues: string[] = []
			let checked = 0
			for (const html of blocks) {
				const document = new DOMParser().parseFromString(
					html.replaceAll('{" "}', " "),
					"text/html",
				)
				// Player fallback documents and dynamic Astro expressions need their own checks.
				if (document.querySelector("iframe, audio, video, script")) continue
				const expected = normalize(document.body.textContent || "")
				if (!expected || /[{}]/.test(expected)) continue
				const actual = rendered.find((text) => key(text) === key(expected))
				if (actual === undefined) {
					issues.push(`Authored text missing: ${expected}`)
				} else {
					checked++
					if (actual !== expected)
						issues.push(`Expected: ${expected}\nRendered: ${actual}`)
				}
			}
			return { checked, issues }
		}, blocks)
		expect(result.issues).toEqual([])
		// Several pages consist only of components/cards or a dynamic title.
		if (!["/discography/", "/projects/"].includes(route)) {
			expect(result.checked).toBeGreaterThan(0)
		}
	})
}
