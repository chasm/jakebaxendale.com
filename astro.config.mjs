import mdx from "@astrojs/mdx"
import { defineConfig } from "astro/config"

import sitemap from "@astrojs/sitemap"

const ignore = [
	"https://jakebaxendale.com/contact/failure/",
	"https://jakebaxendale.com/contact/invalid-email/",
	"https://jakebaxendale.com/contact/missing-email/",
	"https://jakebaxendale.com/contact/missing-message/",
	"https://jakebaxendale.com/contact/success/",
	"https://jakebaxendale.com/cookie-policy/",
	"https://jakebaxendale.com/feedback/failure/",
	"https://jakebaxendale.com/feedback/invalid-email/",
	"https://jakebaxendale.com/feedback/missing-feedback/",
	"https://jakebaxendale.com/feedback/success/",
	"https://jakebaxendale.com/portfolio/",
	"https://jakebaxendale.com/privacy-policy",
	"https://jakebaxendale.com/terms-of-use/",
]

// https://astro.build/config
export default defineConfig({
	site: "https://jakebaxendale.com/",
	integrations: [
		mdx(),
		sitemap({
			canonicalURL: "https://jakebaxendale.com/",
			filter: (page) => !ignore.includes(page),
			lastmod: new Date(),
		}),
	],
})
