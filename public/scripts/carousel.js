/**
 * Carousel progressive enhancement
 * Adds navigation controls and enhanced functionality to carousels
 */

class CarouselEnhancer {
	constructor(container) {
		this.container = container
		this.track = container.querySelector(".carousel-track")
		this.slides = Array.from(container.querySelectorAll(".carousel-slide"))
		this.counter = container.querySelector(".carousel-counter")
		this.currentIndex = 0
		this.isScrolling = false

		if (!this.track || this.slides.length === 0) return

		this.init()
	}

	init() {
		this.hideScrollbar()
		this.createControls()
		this.bindEvents()
		this.updateCounter()
		this.updateButtons()
		this.updateDots()
		this.preloadNearbyImages()
	}

	hideScrollbar() {
		// Hide scrollbar when JavaScript is enabled
		this.track.classList.add("js-enabled")
	}

	createControls() {
		// Create navigation controls
		const controls = document.createElement("nav")
		controls.className = "carousel-controls"
		controls.setAttribute("aria-label", "Gallery navigation")

		// Previous button
		this.prevButton = document.createElement("button")
		this.prevButton.type = "button"
		this.prevButton.className = "carousel-nav-button"
		this.prevButton.setAttribute("aria-label", "Previous image")
		this.prevButton.textContent = "Prev"

		// Next button
		this.nextButton = document.createElement("button")
		this.nextButton.type = "button"
		this.nextButton.className = "carousel-nav-button"
		this.nextButton.setAttribute("aria-label", "Next image")
		this.nextButton.textContent = "Next"

		// Dot indicators
		const dotsContainer = document.createElement("ol")
		dotsContainer.className = "carousel-dots"
		dotsContainer.setAttribute("aria-label", "Go to image")

		this.dots = this.slides.map((_, index) => {
			const dot = document.createElement("button")
			dot.type = "button"
			dot.className = "carousel-dot"
			dot.setAttribute("aria-label", `Go to image ${index + 1}`)
			dot.dataset.index = index
			dotsContainer.appendChild(dot)
			return dot
		})

		// Assemble controls
		controls.appendChild(this.prevButton)
		controls.appendChild(dotsContainer)
		controls.appendChild(this.nextButton)

		// Insert after carousel
		this.container.appendChild(controls)

		// Show counter and hide scroll hint when JS is enabled
		if (this.counter) {
			this.counter.classList.remove("sr-only")
		}

		const scrollHint = this.container.querySelector(".carousel-scroll-hint")
		if (scrollHint) {
			scrollHint.style.display = "none"
		}
	}

	bindEvents() {
		// Button navigation
		this.prevButton.addEventListener("click", () => this.goToPrevious())
		this.nextButton.addEventListener("click", () => this.goToNext())

		// Dot navigation
		this.dots.forEach((dot, index) => {
			dot.addEventListener("click", () => this.goToSlide(index))
		})

		// Keyboard navigation
		this.container.addEventListener("keydown", (e) => {
			if (e.target.closest(".carousel-controls")) {
				switch (e.key) {
					case "ArrowLeft":
						e.preventDefault()
						this.goToPrevious()
						break
					case "ArrowRight":
						e.preventDefault()
						this.goToNext()
						break
					case "Home":
						e.preventDefault()
						this.goToSlide(0)
						break
					case "End":
						e.preventDefault()
						this.goToSlide(this.slides.length - 1)
						break
				}
			}
		})

		// Track scroll for sync
		this.track.addEventListener("scroll", () => this.handleScroll())

		// Touch/swipe support
		this.addTouchSupport()
	}

	addTouchSupport() {
		let startX = 0
		let scrollLeft = 0

		this.track.addEventListener("touchstart", (e) => {
			startX = e.touches[0].pageX
			scrollLeft = this.track.scrollLeft
		})

		this.track.addEventListener("touchmove", (e) => {
			e.preventDefault()
			const x = e.touches[0].pageX
			const walk = (x - startX) * 2
			this.track.scrollLeft = scrollLeft - walk
		})

		this.track.addEventListener("touchend", () => {
			// Snap to nearest slide
			this.snapToNearestSlide()
		})
	}

	handleScroll() {
		if (this.isScrolling) return

		// Debounce scroll updates
		clearTimeout(this.scrollTimeout)
		this.scrollTimeout = setTimeout(() => {
			this.updateCurrentIndex()
			this.updateCounter()
			this.updateButtons()
			this.updateDots()
			this.preloadNearbyImages()
		}, 100)
	}

	updateCurrentIndex() {
		const slideWidth = this.slides[0].offsetWidth + 16 // Include gap
		this.currentIndex = Math.round(this.track.scrollLeft / slideWidth)
		this.currentIndex = Math.max(
			0,
			Math.min(this.currentIndex, this.slides.length - 1),
		)
	}

	snapToNearestSlide() {
		this.updateCurrentIndex()
		this.goToSlide(this.currentIndex)
	}

	goToSlide(index) {
		if (index < 0 || index >= this.slides.length) return

		this.isScrolling = true
		this.currentIndex = index

		const slideWidth = this.slides[0].offsetWidth + 16 // Include gap
		this.track.scrollTo({
			left: index * slideWidth,
			behavior: "smooth",
		})

		setTimeout(() => {
			this.isScrolling = false
			this.updateCounter()
			this.updateButtons()
			this.updateDots()
			this.preloadNearbyImages()
		}, 300)
	}

	goToPrevious() {
		this.goToSlide(this.currentIndex - 1)
	}

	goToNext() {
		this.goToSlide(this.currentIndex + 1)
	}

	updateCounter() {
		if (this.counter) {
			this.counter.textContent = `Image ${this.currentIndex + 1} of ${this.slides.length}`
		}
	}

	updateButtons() {
		this.prevButton.disabled = this.currentIndex === 0
		this.nextButton.disabled = this.currentIndex === this.slides.length - 1
	}

	updateDots() {
		this.dots.forEach((dot, index) => {
			dot.classList.toggle("active", index === this.currentIndex)
		})
	}

	preloadNearbyImages() {
		// Preload images 2 slides ahead and behind current
		const start = Math.max(0, this.currentIndex - 2)
		const end = Math.min(this.slides.length - 1, this.currentIndex + 4)

		for (let i = start; i <= end; i++) {
			const img = this.slides[i]?.querySelector("img")
			if (img && img.loading === "lazy") {
				img.loading = "eager"
			}
		}
	}
}

// Initialize all carousels when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	const carousels = document.querySelectorAll(".carousel-container")
	carousels.forEach((carousel) => new CarouselEnhancer(carousel))
})
