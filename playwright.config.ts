import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	...(process.env.CI ? { workers: 1 } : {}),
	reporter: "html",
	use: {
		baseURL: "http://localhost:14321",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "pnpm build && deno task serve",
		env: {
			PORT: "14321",
			SITE_MODE: "staging",
			MAILERSEND_API_KEY: "",
			MAILERSEND_TEST_RECIPIENT: "",
		},
		url: "http://localhost:14321",
		reuseExistingServer: false,
	},
})
