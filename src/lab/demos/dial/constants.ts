import type { TickType } from './types'

// One knob for the whole size of the component. Every pixel measure below
// is written at scale 1 (the prototype) and multiplied by SCALE.
export const SCALE = 1.2

// Layout measures are rounded so edges land on whole pixels (no blurry lines).
const scaled = (px: number) => Math.round(px * SCALE)

export const MIN = 0
export const MAX = 100
export const INITIAL = 50
export const DEGREES_PER_UNIT = 2.4
export const RADIUS = 300 * SCALE
export const WHEEL_TOP = scaled(40)
// Arc length of one unit on the circle: radius * angle in radians.
export const PX_PER_UNIT = (RADIUS * DEGREES_PER_UNIT * Math.PI) / 180
export const TRAVEL = (MAX - MIN) * PX_PER_UNIT
export const BAND_WIDTH = TRAVEL + 1
export const INITIAL_OFFSET_PX = (-INITIAL + MIN) * PX_PER_UNIT
export const UNITS = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)
export const TICK_HEIGHTS: Record<TickType, number> = {
	major: 22 * SCALE,
	mid: 15 * SCALE,
	minor: 9 * SCALE,
}
export const TICK_BOX_HEIGHT = 34 * SCALE
export const TICK_WIDTHS: Record<TickType, number> = {
	major: 2,
	mid: 1,
	minor: 1,
}
export const SIGMA = 2
export const TICK_GROW: Record<TickType, number> = {
	major: 10 * SCALE,
	mid: 17 * SCALE,
	minor: 17 * SCALE,
}
export const DIGIT_HEIGHT = scaled(44)
export const DIGIT_WIDTH = scaled(26)
export const DIGIT_FONT_SIZE = scaled(38)
export const UNIT_FONT_SIZE = scaled(14)
export const UNIT_GAP = scaled(8)
export const UNIT_LIFT = scaled(7)
export const WINDOW_WIDTH = scaled(320)
export const WINDOW_HEIGHT = scaled(92)
export const READOUT_GAP = scaled(28)
export const MARKER_TOP = scaled(47)
export const MARKER_WIDTH = scaled(12)
export const MARKER_HEIGHT = scaled(9)
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
// Rubber band past the ends: the dial gives easily at first and ever harder later,
// approaching RUBBER_RANGE px without ever reaching it (Apple's overscroll curve).
export const RUBBER_STIFFNESS = 0.55
export const RUBBER_RANGE = scaled(200)
// Coming back from past an end must not overshoot into the range: critically
// damped (ratio 1), so damping = 2 * sqrt(stiffness).
export const RETURN_STIFFNESS = 170
export const RETURN_SPRING = {
	type: 'spring',
	stiffness: RETURN_STIFFNESS,
	damping: 2 * Math.sqrt(RETURN_STIFFNESS),
} as const
