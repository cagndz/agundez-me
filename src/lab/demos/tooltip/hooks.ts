import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Hover intent: opens at once, closes after a short grace so the pointer can
 * cross the gap between trigger and tooltip.
 */
export function useHoverIntent(closeDelay: number) {
	const [open, setOpen] = useState(false)
	const timer = useRef<number | undefined>(undefined)

	const show = () => {
		window.clearTimeout(timer.current)
		setOpen(true)
	}
	const hide = () => {
		window.clearTimeout(timer.current)
		timer.current = window.setTimeout(() => setOpen(false), closeDelay)
	}
	const close = () => {
		window.clearTimeout(timer.current)
		setOpen(false)
	}

	useEffect(() => () => window.clearTimeout(timer.current), [])

	return { open, show, hide, close }
}

const subscribe = () => () => {}

/**
 * Reduced motion, read only once hydrated. The server can't know the
 * preference, and the tooltip renders a different tree for it, so reading it
 * during hydration would make the two disagree.
 */
export function useHydratedReducedMotion() {
	const reduceMotion = useReducedMotion()
	const isHydrated = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	)
	return isHydrated && reduceMotion === true
}
