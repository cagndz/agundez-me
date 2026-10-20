import { TickType } from './types'

export const MIN = 0
export const MAX = 100
export const INITIAL = 50
export const PX_PER_UNIT = 12.5
export const TRAVEL = (MAX - MIN) * PX_PER_UNIT
export const BAND_WIDTH = TRAVEL + 1
export const INITIAL_OFFSET_PX = (-INITIAL + MIN) * PX_PER_UNIT
export const RADIUS = 300
export const WHEEL_TOP = 40
export const DEGREES_PER_UNIT = 2.4
export const UNITS = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)
export const TICK_HEIGHTS: Record<TickType, number> = {
	major: 22,
	mid: 15,
	minor: 9,
}
export const TICK_BOX_HEIGHT = 34
export const TICK_WIDTHS: Record<TickType, number> = {
	major: 2,
	mid: 1,
	minor: 1,
}
export const SIGMA = 2
export const TICK_GROW: Record<TickType, number> = {
	major: 10,
	mid: 17,
	minor: 17,
}
export const DIGIT_HEIGHT = 44
export const DIGITS = Array.from({ length: 10 }, (_, i) => i)
export const ROLL_STAGGER = 0.035
export const ROLL_TWEEN = {
	duration: 0.4,
	ease: [0.23, 1, 0.32, 1],
} as const
export const ROLL_FADE = 1.3
// Release feel: where the dial lands = release point + velocity * RELEASE_POWER (seconds),
// then a soft spring (k=120, damping ratio ~0.72) carries it there with a hint of overshoot.
export const RELEASE_POWER = 0.15
export const RELEASE_SPRING = {
	type: 'spring',
	stiffness: 120,
	damping: 15.8,
} as const
