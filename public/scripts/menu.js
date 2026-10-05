const toggle = document.querySelector("#menu-toggle")
const menu = document.querySelector("#site-menu")

if (toggle && menu) {
	const background = [
		document.querySelector("main"),
		document.querySelector("footer"),
		...Array.from(document.querySelector("body > header").children).filter(
			(element) => !element.contains(toggle),
		),
	].filter(Boolean)
	const sync = () => background.forEach((element) => {
		element.inert = toggle.checked
	})
	toggle.addEventListener("change", sync)
	toggle.addEventListener("keydown", (event) => {
		if (event.key !== "Enter") return
		event.preventDefault()
		toggle.checked = !toggle.checked
		sync()
	})
	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape" || !toggle.checked) return
		toggle.checked = false
		sync()
		toggle.focus()
	})
	window.matchMedia("(width > 1240px)").addEventListener("change", (event) => {
		if (!event.matches) return
		toggle.checked = false
		sync()
	})
	sync()
}
