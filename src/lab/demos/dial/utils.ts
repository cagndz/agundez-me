import {
	DEGREES_PER_UNIT,
	MAX,
	MIN,
	PAGE_STEP,
	PX_PER_UNIT,
	RELEASE_POWER,
	RUBBER_RANGE,
	RUBBER_STIFFNESS,
	SIGMA,
	TRAVEL,
} from './constants'
import type { TickType } from './types'

export function pixelToPosition(pixel: number): number {
	return MIN - pixel / PX_PER_UNIT
}

export function pixelToUnit(pixel: number): number {
	return Math.round(Math.max(MIN, Math.min(MAX, pixelToPosition(pixel))))
}

// The inverse of pixelToPosition: the offset that puts a unit under the marker.
export function unitToPixel(unit: number): number {
	return (MIN - unit) * PX_PER_UNIT
}

// Where a key sends the dial from `from`, or null if it isn't a slider key.
// Same keys as a native range input (WAI-ARIA slider pattern).
export function getKeyTarget(key: string, from: number): number | null {
	const clamp = (unit: number) => Math.max(MIN, Math.min(MAX, unit))

	switch (key) {
		case 'ArrowRight':
		case 'ArrowUp':
			return clamp(from + 1)
		case 'ArrowLeft':
		case 'ArrowDown':
			return clamp(from - 1)
		case 'PageUp':
			return clamp(from + PAGE_STEP)
		case 'PageDown':
			return clamp(from - PAGE_STEP)
		case 'Home':
			return MIN
		case 'End':
			return MAX
		default:
			return null
	}
}

export function snapToTick(pixel: number): number {
	return Math.round(pixel / PX_PER_UNIT) * PX_PER_UNIT
}

export function pixelToDegrees(pixel: number): number {
	return (pixel / PX_PER_UNIT) * DEGREES_PER_UNIT
}

export function getTickType(unit: number): TickType {
	if (unit % 10 === 0) {
		return 'major'
	} else if (unit % 5 === 0) {
		return 'mid'
	} else {
		return 'minor'
	}
}

// Beyond 4 sigmas the bell is below 0.0004: under a hundredth of a pixel of
// growth. Returning exactly 0 there leaves far ticks' motion values unchanged,
// so Motion skips their scale and opacity instead of rewriting ~170 styles a frame.
const PROXIMITY_CUTOFF = 4 * SIGMA

export function getProximity(distance: number): number {
	if (Math.abs(distance) > PROXIMITY_CUTOFF) return 0
	return Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA))
}

export function getDigits(value: number): [number, number, number] {
	return [
		Math.floor(value / 100) % 10,
		Math.floor(value / 10) % 10,
		Math.floor(value / 1) % 10,
	]
}

export function getReleaseTarget(pixel: number, velocity: number): number {
	const thrown = pixel + velocity * RELEASE_POWER
	return Math.max(-TRAVEL, Math.min(0, snapToTick(thrown)))
}

// How far the dial really moves for a given overshoot beyond an end.
function rubberBand(overshoot: number): number {
	return (
		(1 - 1 / ((overshoot * RUBBER_STIFFNESS) / RUBBER_RANGE + 1)) * RUBBER_RANGE
	)
}

// Free finger offset in, displayed offset out: unchanged inside [-TRAVEL, 0],
// compressed progressively outside it.
export function applyRubberBand(pixel: number): number {
	if (pixel > 0) return rubberBand(pixel)
	if (pixel < -TRAVEL) return -TRAVEL - rubberBand(-TRAVEL - pixel)
	return pixel
}

// The finger overshoot that rubberBand turns into `shown`. Capped just under
// RUBBER_RANGE, which no finger offset reaches.
function unRubberBand(shown: number): number {
	const capped = Math.min(shown, RUBBER_RANGE * 0.999)
	return ((capped / (RUBBER_RANGE - capped)) * RUBBER_RANGE) / RUBBER_STIFFNESS
}

// The inverse of applyRubberBand: displayed offset in, free finger offset out.
export function removeRubberBand(shown: number): number {
	if (shown > 0) return unRubberBand(shown)
	if (shown < -TRAVEL) return -TRAVEL - unRubberBand(-TRAVEL - shown)
	return shown
}

// How many displayed pixels one finger pixel moves at `pixel`: 1 inside the
// range, falling toward 0 the further past an end. Converts finger velocity.
export function getRubberBandSlope(pixel: number): number {
	const overshoot = pixel > 0 ? pixel : pixel < -TRAVEL ? -TRAVEL - pixel : 0
	if (overshoot === 0) return 1
	return (
		RUBBER_STIFFNESS / ((overshoot * RUBBER_STIFFNESS) / RUBBER_RANGE + 1) ** 2
	)
}
