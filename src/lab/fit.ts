/**
 * Shrinks a demo (never enlarges it) so it fits its box, by writing the scale
 * as a CSS variable (--fit) on the box. The demo reads it (see demo-fit.tsx).
 *
 * Shared by DemoFit (React, on mount and on resize) and DemoFitScript (inline,
 * before the first paint). The script inlines this function as text, so it
 * must not use anything from outside its own body.
 *
 * offsetWidth/offsetHeight ignore transforms, so the demo's natural size is
 * read correctly even while it is scaled.
 */
export function applyFit(box: HTMLElement, demo: HTMLElement) {
	const width = demo.offsetWidth
	const height = demo.offsetHeight
	if (!width || !height) return
	const scale = Math.min(1, box.clientWidth / width, box.clientHeight / height)
	box.style.setProperty('--fit', String(scale))
}
