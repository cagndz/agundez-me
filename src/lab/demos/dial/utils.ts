import { DEGREES_PER_UNIT, MAX, MIN, PX_PER_UNIT } from './constants'

export function pixelToUnit(pixel: number): number {
	return Math.round(Math.max(MIN, Math.min(MAX, MIN - pixel / PX_PER_UNIT)))
}

export function snapToTick(pixel: number): number {
	return Math.round(pixel / PX_PER_UNIT) * PX_PER_UNIT
}

export function pixelToDegrees(pixel: number): number {
	return (pixel / PX_PER_UNIT) * DEGREES_PER_UNIT
}
