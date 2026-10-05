/**
 * Carousel progressive enhancement
 * Adds navigation controls and enhanced functionality to carousels
 * Pure functional programming approach
 */

// === PURE FUNCTIONS ===

// State creation and validation
const createCarouselState = (container) => ({
	container,
	track: container.querySelector(".carousel-track"),
	slides: Array.from(container.querySelectorAll(".carousel-slide")),
	counter: container.querySelector(".carousel-counter"),
	currentIndex: 0,
	isScrolling: false,
	autoplayInterval: 5000, // 5 seconds
	isPlaying: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	autoplayTimer: null,
	scrollTimeout: null,
	controls: null,
	prevButton: null,
	nextButton: null,
	playPauseButton: null,
	dots: [],
})

const isValidCarousel = (state) => state.track && state.slides.length > 0

// Element creation functions
const createElement = (tag, attributes = {}, textContent = "") => {
	const element = document.createElement(tag)
	Object.entries(attributes).forEach(([key, value]) => {
		if (key === "className") {
			element.className = value
		} else {
			element.setAttribute(key, value)
		}
	})
	if (textContent) element.textContent = textContent
	return element
}

const createNavButton = (className, ariaLabel, text) =>
	createElement(
		"button",
		{
			"type": "button",
			className,
			"aria-label": ariaLabel,
		},
		text,
	)

const createDot = (index, imageUrl) =>
	createElement("button", {
		"type": "button",
		"className": "carousel-dot",
		"aria-label": `Go to image ${index + 1}`,
		"title": `Show image ${index + 1}`,
		"data-index": index,
		"data-image-url": imageUrl,
	})

const createControls = (slideCount, slides) => {
	const controls = createElement("nav", {
		"className": "carousel-controls",
		"aria-label": "Gallery navigation",
	})

	const prevButton = createNavButton(
		"carousel-nav-button",
		"Previous image",
		"Prev",
	)
	const nextButton = createNavButton(
		"carousel-nav-button",
		"Next image",
		"Next",
	)
	const playPauseButton = createNavButton(
		"carousel-play-button",
		"Pause slideshow",
		"Pause",
	)

	const dotsContainer = createElement("ol", {
		"className": "carousel-dots",
		"aria-label": "Go to image",
	})

	const dots = Array.from({ length: slideCount }, (_, index) => {
		// Extract the full-size image URL from the slide's link
		const link = slides[index]?.querySelector("a")
		const imageUrl = link?.href || ""
		const dot = createDot(index, imageUrl)
		const li = createElement("li")
		li.appendChild(dot)
		dotsContainer.appendChild(li)
		return dot
	})

	controls.appendChild(prevButton)
	controls.appendChild(dotsContainer)
	controls.appendChild(nextButton)
	controls.appendChild(playPauseButton)

	return { controls, prevButton, nextButton, playPauseButton, dots }
}

// State update functions
const updateStateWithControls = (state) => {
	const { controls, prevButton, nextButton, playPauseButton, dots } =
		createControls(state.slides.length, state.slides)

	return {
		...state,
		controls,
		prevButton,
		nextButton,
		playPauseButton,
		dots,
	}
}

const updateCurrentIndex = (state) => {
	const gap = parseFloat(getComputedStyle(state.track).columnGap) || 0
	const slideWidth = state.slides[0].offsetWidth + gap
	const newIndex = Math.round(state.track.scrollLeft / slideWidth)
	const clampedIndex = Math.max(0, Math.min(newIndex, state.slides.length - 1))

	return { ...state, currentIndex: clampedIndex }
}

const updateScrollingState = (state, isScrolling) => ({
	...state,
	isScrolling,
})

const updateAutoplayState = (state, isPlaying, autoplayTimer = null) => ({
	...state,
	isPlaying,
	autoplayTimer,
})

// DOM manipulation functions (side effects)
const hideScrollbar = (track) => {
	track.classList.add("js-enabled")
}

const insertControls = (state) => {
	state.container.appendChild(state.controls)

	// Hide image links from tab order when JS is enabled
	state.slides.forEach((slide) => {
		const link = slide.querySelector("a")
		if (link) {
			link.setAttribute("tabindex", "-1")
		}
		// Also hide the slide itself from tab order
		slide.setAttribute("tabindex", "-1")
	})

	// Hide figure and track from tab order when JS is enabled
	const figure = state.container.querySelector(".carousel")
	if (figure) {
		figure.setAttribute("tabindex", "-1")
	}

	if (state.track) {
		state.track.setAttribute("tabindex", "0")
	}

	// Show counter and hide scroll hint
	if (state.counter) {
		state.counter.classList.remove("sr-only")
	}

	const scrollHint = state.container.querySelector(".carousel-scroll-hint")
	if (scrollHint) {
		scrollHint.style.display = "none"
	}
}

const updateCounter = (state) => {
	if (state.counter) {
		state.counter.textContent = `Image ${state.currentIndex + 1} of ${state.slides.length}`
	}
}

const updateButtons = (state) => {
	state.prevButton.disabled = state.currentIndex === 0
	state.nextButton.disabled = state.currentIndex === state.slides.length - 1
}

const updateDots = (state) => {
	state.slides.forEach((slide, index) => {
		const active = index === state.currentIndex
		slide.inert = !active
		const link = slide.querySelector("a")
		if (link) link.tabIndex = active ? 0 : -1
	})
	state.dots.forEach((dot, index) => {
		dot.classList.toggle("active", index === state.currentIndex)
		if (index === state.currentIndex) dot.setAttribute("aria-current", "true")
		else dot.removeAttribute("aria-current")
	})
}

const updatePlayPauseButton = (state) => {
	state.counter?.setAttribute("aria-live", state.isPlaying ? "off" : "polite")
	if (state.isPlaying) {
		state.playPauseButton.textContent = "Pause"
		state.playPauseButton.setAttribute("aria-label", "Pause slideshow")
	} else {
		state.playPauseButton.textContent = "Play"
		state.playPauseButton.setAttribute("aria-label", "Play slideshow")
	}
}

const preloadNearbyImages = (state) => {
	const start = Math.max(0, state.currentIndex - 2)
	const end = Math.min(state.slides.length - 1, state.currentIndex + 4)

	for (let i = start; i <= end; i++) {
		const img = state.slides[i]?.querySelector("img")
		if (img && img.loading === "lazy") {
			img.loading = "eager"
		}
	}
}

// Navigation functions
const goToSlide = (state, index) => {
	if (index < 0 || index >= state.slides.length) return state

	const newState = { ...state, isScrolling: true, currentIndex: index }
	const gap = parseFloat(getComputedStyle(state.track).columnGap) || 0
	const slideWidth = state.slides[0].offsetWidth + gap

	state.track.scrollTo({
		left: index * slideWidth,
		behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
	})

	setTimeout(() => {
		const finalState = updateScrollingState(carouselStates.get(state.container) ?? newState, false)
		updateCounter(finalState)
		updateButtons(finalState)
		updateDots(finalState)
		preloadNearbyImages(finalState)
		// Update the global state
		carouselStates.set(state.container, finalState)
	}, 300)

	return newState
}

const goToPrevious = (state) => goToSlide(state, state.currentIndex - 1)

const goToNext = (state, allowLoop = false) => {
	if (allowLoop) {
		// For autoplay - loop back to first image after last one
		const nextIndex =
			state.currentIndex + 1 >= state.slides.length ? 0 : state.currentIndex + 1
		return goToSlide(state, nextIndex)
	} else {
		// For manual navigation - don't loop
		return goToSlide(state, state.currentIndex + 1)
	}
}

// Autoplay functions
const startAutoplay = (state) => {
	if (state.slides.length <= 1) return state

	const timer = setInterval(() => {
		const currentState = carouselStates.get(state.container)
		if (currentState && currentState.isPlaying) {
			const newState = goToNext(currentState, true) // Allow looping for autoplay
			carouselStates.set(state.container, newState)
		}
	}, state.autoplayInterval)

	return updateAutoplayState(state, true, timer)
}

const pauseAutoplay = (state) => {
	if (state.autoplayTimer) {
		clearInterval(state.autoplayTimer)
	}
	return updateAutoplayState(state, false, null)
}

const resumeAutoplay = (state) => {
	if (state.slides.length > 1) {
		// Immediately advance to next slide when resuming (with looping)
		const nextState = goToNext(state, true)
		return startAutoplay(nextState)
	}
	return state
}

const toggleAutoplay = (state) => {
	if (state.isPlaying) {
		// User clicked pause
		return pauseAutoplay(state)
	} else {
		// User clicked play - resume from current position
		return resumeAutoplay(state)
	}
}

// Event handlers
const createScrollHandler = (container) => () => {
	const state = carouselStates.get(container)
	if (!state || state.isScrolling) return

	clearTimeout(state.scrollTimeout)
	const scrollTimeout = setTimeout(() => {
		const updatedState = updateCurrentIndex(state)
		updateCounter(updatedState)
		updateButtons(updatedState)
		updateDots(updatedState)
		preloadNearbyImages(updatedState)
		// Update the stored state with the new current index
		carouselStates.set(container, { ...updatedState, scrollTimeout: null })
	}, 100)

	carouselStates.set(container, { ...state, scrollTimeout })
}

const createKeyboardHandler = (container) => (e) => {
	if (!e.target.closest(".carousel-controls") && !e.target.matches(".carousel-track")) return

	const state = carouselStates.get(container)
	let newState = state

	switch (e.key) {
		case "ArrowLeft":
			e.preventDefault()
			const pausedStateLeft = pauseAutoplay(state)
			newState = goToPrevious(pausedStateLeft)
			updatePlayPauseButton(newState)
			break
		case "ArrowRight":
			e.preventDefault()
			const pausedStateRight = pauseAutoplay(state)
			newState = goToNext(pausedStateRight, true) // Allow looping for keyboard navigation
			updatePlayPauseButton(newState)
			break
		case "Home":
			e.preventDefault()
			const pausedStateHome = pauseAutoplay(state)
			newState = goToSlide(pausedStateHome, 0)
			updatePlayPauseButton(newState)
			break
		case "End":
			e.preventDefault()
			const pausedStateEnd = pauseAutoplay(state)
			newState = goToSlide(pausedStateEnd, state.slides.length - 1)
			updatePlayPauseButton(newState)
			break
		default:
			// No navigation happened, don't change anything
			return
	}

	carouselStates.set(container, newState)
}

// Event binding function
const bindEvents = (state) => {
	const container = state.container
	container.addEventListener("focusin", (event) => {
		// Let the play/pause button perform its requested action on click.
		if (event.target === state.playPauseButton) return
		const pausedState = pauseAutoplay(carouselStates.get(container))
		carouselStates.set(container, pausedState)
		updatePlayPauseButton(pausedState)
	})
	window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
		if (!event.matches) return
		const pausedState = pauseAutoplay(carouselStates.get(container))
		carouselStates.set(container, pausedState)
		updatePlayPauseButton(pausedState)
	})

	// Navigation buttons - pause autoplay when user manually navigates
	state.prevButton.addEventListener("click", () => {
		const currentState = carouselStates.get(container)
		const pausedState = pauseAutoplay(currentState)
		const newState = goToPrevious(pausedState)
		carouselStates.set(container, newState)
		updatePlayPauseButton(newState)
	})

	state.nextButton.addEventListener("click", () => {
		const currentState = carouselStates.get(container)
		const pausedState = pauseAutoplay(currentState)
		const newState = goToNext(pausedState)
		carouselStates.set(container, newState)
		updatePlayPauseButton(newState)
	})

	// Play/Pause button
	state.playPauseButton.addEventListener("click", (e) => {
		e.preventDefault()
		const currentState = carouselStates.get(container)
		const newState = toggleAutoplay(currentState)
		carouselStates.set(container, newState)
		updatePlayPauseButton(newState)
	})

	// Dot navigation - pause autoplay when user manually selects an image
	state.dots.forEach((dot, index) => {
		dot.addEventListener("click", () => {
			const currentState = carouselStates.get(container)
			const pausedState = pauseAutoplay(currentState)
			const newState = goToSlide(pausedState, index)
			carouselStates.set(container, newState)
			updatePlayPauseButton(newState)
		})

		// Sync image view when dot receives focus (also pause autoplay)
		dot.addEventListener("focus", () => {
			const currentState = carouselStates.get(container)
			const pausedState = pauseAutoplay(currentState)
			const newState = goToSlide(pausedState, index)
			carouselStates.set(container, newState)
			updatePlayPauseButton(newState)
		})


	})

	// Keyboard navigation
	container.addEventListener("keydown", createKeyboardHandler(container))

	// Scroll handling
	state.track.addEventListener("scroll", createScrollHandler(container))

	// Native touch scrolling keeps vertical page scrolling available.
	state.track.addEventListener("touchstart", () => {
		const pausedState = pauseAutoplay(carouselStates.get(container))
		carouselStates.set(container, pausedState)
		updatePlayPauseButton(pausedState)
	}, { passive: true })
}

// === MAIN INITIALIZATION ===

// Global state store for all carousels
const carouselStates = new Map()

const initializeCarousel = (container) => {
	const initialState = createCarouselState(container)

	if (!isValidCarousel(initialState)) return

	// Set up carousel
	hideScrollbar(initialState.track)
	const stateWithControls = updateStateWithControls(initialState)
	insertControls(stateWithControls)

	// Start autoplay first to get the correct initial state
	const stateWithAutoplay = stateWithControls.isPlaying ? startAutoplay(stateWithControls) : stateWithControls

	// Initialize UI state with the autoplay state
	updateCounter(stateWithAutoplay)
	updateButtons(stateWithAutoplay)
	updateDots(stateWithAutoplay)
	updatePlayPauseButton(stateWithAutoplay)
	preloadNearbyImages(stateWithAutoplay)

	// Bind events with the final state
	bindEvents(stateWithAutoplay)

	// Store final state
	carouselStates.set(container, stateWithAutoplay)
}

// Initialize all carousels when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	const carousels = document.querySelectorAll(".carousel-container")
	carousels.forEach(initializeCarousel)
})
