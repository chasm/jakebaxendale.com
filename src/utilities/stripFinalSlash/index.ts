export default function stripFinalSlash(path: string): string {
	const p = path ? path : "/"

	return p.length > 1 ? p.replace(/\/$/, "") : p
}
