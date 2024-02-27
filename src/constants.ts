import type { Link } from "~types"

import collapseWhitespace from "~utilities/collapseWhitespace"

export const GLOBAL_NAV: Array<Link> = [
	{ href: "/bio", label: "Bio" },
	{ href: "/community", label: "Community" },
	{ href: "/discography", label: "Discography" },
	{ href: "/lessons", label: "Lessons" },
	// { href: "/portfolio", label: "Portfolio" },
	{ href: "/projects", label: "Projects" },
	{ href: "/prose", label: "Prose" },
	{ href: "/venues", label: "Venues" },
	{ href: "/contact", label: "Contact" },
]

export const PROJECTS: Array<Link> = [
	{
		href: "/projects/waypeople",
		label: "Waypeople",
	},
	{
		href: "/projects/gardening-music",
		label: "Gardening Music",
	},
	{
		href: "/projects/striking-moments",
		label: "Striking Moments",
	},
	{
		href: "/projects/sanctuary",
		label: "Sanctuary",
	},
	{
		href: "/projects/jb3",
		label: "JB3",
	},
	{
		href: "/projects/the-jac",
		label: "The Jac",
	},
	{
		href: "/projects/antipodes",
		label: "Antipodes",
	},
	{
		href: "/projects/bazurka",
		label: "Bazurka",
	},
	{
		href: "/projects/richter-city-rebels",
		label: "Richter City Rebels",
	},
]

export const SITE_AUTHOR = "Jake Baxendale"
export const SITE_CANONICAL_URL = "https://jakebaxendale.com"
export const SITE_DESCRIPTION = collapseWhitespace(`
	Jake Baxendale is a jazz musician, composer, and bandleader.
	He plays saxophone. Jake’s crib is in Wellington, New Zealand.
`)
export const SITE_KEYWORDS = [
	"alto saxophone",
	"Aotearoa",
	"bandleader",
	"composer",
	"Jake Baxendale",
	"jazz musician",
	"jazz",
	"musician",
	"New Zealand",
	"saxophone",
	"Tao",
	"Wellington",
]
export const SITE_PUBLISHER = "Jake Baxendale"
export const SITE_TITLE = "Jake Baxendale: musician, teacher"

export const SUPPLEMENTAL_NAV: Array<Link> = [
	{ href: "/cookie-policy", label: "Cookie policy" },
	{ href: "/feedback", label: "Feedback" },
	{ href: "/privacy-policy", label: "Privacy policy" },
	{ href: "/terms-of-use", label: "Terms of use" },
]
