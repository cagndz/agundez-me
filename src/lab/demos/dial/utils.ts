import { DEGREES_PER_UNIT, MAX, MIN, PX_PER_UNIT } from './constants'
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
