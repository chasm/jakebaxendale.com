export type PageMeta = {
	blurb?: string | undefined
	label?: string | undefined
	title: string
}

export type Card = {
	blurb?: string | undefined
	href?: string
	src?: string
	subtitle?: string
	title: string
	year?: number
}

export type Link = {
	href: string
	label: string
}
