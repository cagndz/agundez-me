function getCellRect(slug: string): DOMRect | null {
	const cell = document.querySelector(`[data-lab-cell="${slug}"]`)
	if (!cell) return null
	return cell.getBoundingClientRect()
}

// Travel duration (ms): a base plus a little more for every px of distance.
// A nearby cell is crossed in ~300 ms, a far one in ~450 ms.
const DURATION_BASE = 280
const DURATION_PER_PX = 0.35
const DURATION_MAX = 520

/**
 * Writes on the popup the CSS variables for the stage's "away" state: the
 * frame moved and stretched until it covers the origin card, the demo moved
 * onto the card's own demo, plus the travel duration.
 * The variables are inherited, so .lab-stage reads them (see lab-modal.css).
 * Without a cell, it falls back to a generic effect from the center.
 */
export function applyOrigin(popup: HTMLElement, slug: string | undefined) {
	const stage = popup.querySelector<HTMLElement>('[data-lab-stage]')
	const rect = slug ? getCellRect(slug) : null

	if (!rect || !stage) {
		popup.style.setProperty('--origin-x', '0px')
		popup.style.setProperty('--origin-y', '0px')
		popup.style.setProperty('--origin-sx', '0.95')
		popup.style.setProperty('--origin-sy', '0.95')
		popup.style.setProperty('--origin-duration', '300ms')
		return
	}

	// The popup has no transform, so its rect is its resting one.
	// The stage's offsetLeft/offsetTop/offsetWidth don't include its transform either.
	const popupRect = popup.getBoundingClientRect()
	const stageCenterX = popupRect.left + stage.offsetLeft + stage.offsetWidth / 2
	const stageCenterY = popupRect.top + stage.offsetTop + stage.offsetHeight / 2

	const dx = rect.left + rect.width / 2 - stageCenterX
	const dy = rect.top + rect.height / 2 - stageCenterY
	// Width and height apart: cells grow taller than wide when their demo
	// needs it, and the stage's frame is only a box, so it can stretch.
	const sx = rect.width / stage.offsetWidth
	const sy = rect.height / stage.offsetHeight

	const distance = Math.hypot(dx, dy)
	const duration = Math.min(
		DURATION_MAX,
		DURATION_BASE + distance * DURATION_PER_PX,
	)

	popup.style.setProperty('--origin-x', `${dx}px`)
	popup.style.setProperty('--origin-y', `${dy}px`)
	popup.style.setProperty('--origin-sx', `${sx}`)
	popup.style.setProperty('--origin-sy', `${sy}`)
	popup.style.setProperty('--origin-duration', `${Math.round(duration)}ms`)
}

/**
 * Same as applyOrigin, but the browser doesn't animate the change.
 * Used on open: reading layout forces the browser to compute styles, and if
 * that happens before the variables exist, it animates from "none" to the
 * starting state (backwards). With transitions off (data-no-transition, see
 * lab-modal.css) the starting state is set without animating, and the real
 * transition starts from it.
 */
export function applyOriginWithoutTransition(
	popup: HTMLElement,
	slug: string | undefined,
) {
	popup.setAttribute('data-no-transition', '')
	applyOrigin(popup, slug)
	void popup.offsetWidth // force style calculation with the variables already set
	popup.removeAttribute('data-no-transition')
}
