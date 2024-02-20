export type PageMeta = {
	blurb?: string | undefined
	image?: Image | undefined
	label?: string | undefined
	subtitle?: string | undefined
	title: string
}

export type MediaType = "image/avif" | "image/jpeg" | "image/png" | "image/webp"

export type Image = {
	alt?: string | undefined
	class?: string | undefined
	filename: string
	height: number
	loading?: "eager" | "lazy" | undefined
	src: string
	types: Array<MediaType>
	width: number
}

export type Card = {
	blurb?: string | undefined
	href?: string | undefined
	image?: Image | undefined
	subtitle?: string | undefined
	title: string
	year?: number | undefined
}

export type Link = {
	href: string
	label: string
	rel?: "external" | undefined
	title?: string | undefined
}
