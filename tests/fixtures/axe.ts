import AxeBuilder from "@axe-core/playwright"
import { test as base } from "@playwright/test"

type AxeFixture = {
	makeAxeBuilder: () => AxeBuilder
}

export const test = base.extend<AxeFixture>({
	makeAxeBuilder: async ({ page }, use) => {
		await use(() =>
			new AxeBuilder({ page })
				// Check the host document and iframe titles; vendor frame content is audited separately.
				.setLegacyMode(true)
				.options({ iframes: false })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.exclude(".funnypot"),
		)
	},
})

export { expect } from "@playwright/test"
