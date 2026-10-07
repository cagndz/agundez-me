import { cubicBezier } from 'motion/react'
import { COLS, ROWS, TOTAL, SOFTNESS, ORDER, FALL_ORDER, INK } from './pattern'

// Each dot is CELL px wide with GAP px between dots (logical px, the canvas scales them for retina).
const CELL = 4
const GAP = 1
const PITCH = CELL + GAP
const RADIUS = CELL / 2
const TAU = Math.PI * 2

// Size of the whole dot field
export const WIDTH = COLS * PITCH - GAP
export const HEIGHT = ROWS * PITCH - GAP

// Fall at the end. Each dot falls for FALL_WINDOW of the whole fall, starting at a random moment.
const FALL_WINDOW = 0.45
// Further than the button is tall, so every dot leaves through the bottom edge.
const FALL_DISTANCE = 90
// Gravity: starts slow, ends fast. The one place where ease-in is the right curve (it's leaving).
const EASE_IN_GRAVITY = cubicBezier(0.7, 0, 1, 0.5)

// ── Per-dot values, computed once ──────────────────────────────────────
// Dots fill column by column (see buildInk), so index = column * ROWS + row.
const CENTER_X = new Float32Array(TOTAL)
const CENTER_Y = new Float32Array(TOTAL)
// Progress at which each dot starts lighting up. Squeezed into the first (1 - SOFTNESS)
// so the last dot still ends exactly at 1.
const FILL_START = new Float32Array(TOTAL)
// Same idea for the fall, with its own random order.
const FALL_START = new Float32Array(TOTAL)

for (let i = 0; i < TOTAL; i++) {
	CENTER_X[i] = Math.floor(i / ROWS) * PITCH + RADIUS
	CENTER_Y[i] = (i % ROWS) * PITCH + RADIUS
	FILL_START[i] = ORDER[i] * (1 - SOFTNESS)
	FALL_START[i] = FALL_ORDER[i] * (1 - FALL_WINDOW)
}

// ── Colors ─────────────────────────────────────────────────────────────
type RGB = [number, number, number]

// '#e8590c' → [232, 89, 12]
function parseHex(hex: string): RGB {
	const clean = hex.trim().replace('#', '')
	const full =
		clean.length === 3 ? [...clean].map((char) => char + char).join('') : clean
	return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB
}

// t = 0 → a, t = 1 → b (linear interpolation, channel by channel)
function mix(a: RGB, b: RGB, t: number): RGB {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t,
	]
}

// 256 ready-made CSS colors from `off` (index 0) to `lit` (index 255).
// A dot's color per frame is a lookup, with no math and no new strings.
function buildRamp(off: RGB, lit: RGB): string[] {
	return Array.from({ length: 256 }, (_, i) => {
		const [r, g, b] = mix(off, lit, i / 255)
		return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
	})
}

export interface Palette {
	ramp: string[]
}

// Reads the theme colors (--foreground / --background) from the element once.
export function createPalette(element: Element): Palette {
	const style = getComputedStyle(element)
	const foreground = parseHex(style.getPropertyValue('--foreground'))
	const background = parseHex(style.getPropertyValue('--background'))
	// "Off" dot = 15% of the foreground over the background (same as the old CSS color-mix).
	// A filled dot ends in the foreground color, the same as the letters.
	const off = mix(background, foreground, 0.15)
	return { ramp: buildRamp(off, foreground) }
}

// ── Drawing ────────────────────────────────────────────────────────────
const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)

// Paints one frame. The caller sets the canvas scale; coordinates here are logical px.
export function drawDots(
	ctx: CanvasRenderingContext2D,
	progress: number,
	fall: number,
	palette: Palette,
) {
	ctx.clearRect(0, 0, WIDTH, HEIGHT)

	// Dots that share a color go into one path and are painted with a single fill().
	// Only the half-lit ones (a small fraction at any moment) are painted one by one.
	const off = new Path2D()
	const lit = new Path2D()

	for (let i = 0; i < TOTAL; i++) {
		const x = CENTER_X[i]
		const y = CENTER_Y[i]

		const fallT = clamp01((fall - FALL_START[i]) / FALL_WINDOW)
		// Already gone: nothing to draw
		if (fallT >= 1) continue

		// Letter dots are always fully dark: the fill ends in the same color, so it swallows them
		const fillT = INK[i] ? 1 : clamp01((progress - FILL_START[i]) / SOFTNESS)

		if (fallT > 0) {
			// Falling: own position and opacity, so one by one
			ctx.globalAlpha = 1 - fallT
			ctx.fillStyle = palette.ramp[Math.round(fillT * 255)]
			ctx.beginPath()
			ctx.arc(x, y + EASE_IN_GRAVITY(fallT) * FALL_DISTANCE, RADIUS, 0, TAU)
			ctx.fill()
			ctx.globalAlpha = 1
			continue
		}

		const batch = fillT === 0 ? off : fillT === 1 ? lit : null
		if (batch) {
			batch.moveTo(x + RADIUS, y)
			batch.arc(x, y, RADIUS, 0, TAU)
		} else {
			ctx.fillStyle = palette.ramp[Math.round(fillT * 255)]
			ctx.beginPath()
			ctx.arc(x, y, RADIUS, 0, TAU)
			ctx.fill()
		}
	}

	ctx.fillStyle = palette.ramp[0]
	ctx.fill(off)
	ctx.fillStyle = palette.ramp[255]
	ctx.fill(lit)
}
