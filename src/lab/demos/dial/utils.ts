import {
	DEGREES_PER_UNIT,
	MAX,
	MIN,
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

export function getProximity(distance: number): number {
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
