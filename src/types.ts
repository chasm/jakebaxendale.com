import type { AstroInstance } from "astro"

export type Card = {
	blurb?: string | undefined
	epilogue?: string | undefined
	href?: string | undefined
	image?: Image | undefined
	prologue?: string | undefined
	subtitle?: string | undefined
	title: string
	year?: number | undefined
}

export type Image = {
	alt?: string | undefined
	class?: string | undefined
	filename: string
	height: number
	loading?: "eager" | "lazy" | undefined
	src: string
	srcsets?: Array<SrcSet>
	types: Array<MediaType>
	width: number
}

export type Link = {
	href: string
	label: string
	rel?: "external" | undefined
	title?: string | undefined
}

export type MediaType = "image/avif" | "image/jpeg" | "image/png" | "image/webp"

export type PageMeta = {
	blurb?: string | undefined
	image?: Image | undefined
	label?: string | undefined
	subtitle?: string | undefined
	title: string
}

export type Page = AstroInstance & { metadata: PageMeta }

export type SrcSet = {
	media?: string | undefined
	sizes: Array<number>
}
