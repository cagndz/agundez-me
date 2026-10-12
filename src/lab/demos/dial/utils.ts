import { MAX, MIN, PX_PER_UNIT } from './constants'

export function pixelToUnit(pixel: number): number {
	return Math.round(Math.max(MIN, Math.min(MAX, MIN - pixel / PX_PER_UNIT)))
}

export function snapToTick(target: number): number {
	return Math.round(target / PX_PER_UNIT) * PX_PER_UNIT
}
