import { DIMENSION_THICKNESS, TICK_LENGTH } from './constants'
import type { Dimension, DimensionParts } from './types'

// How far a tick sticks out on each side of the line, so it stays centered on it.
const TICK_OVERHANG = (TICK_LENGTH - DIMENSION_THICKNESS) / 2

// Turns one dimension into the three rectangles that draw it: the line and a
// tick at each end. The end tick sits on the line's last pixel, so the whole
// dimension spans exactly `length` px.
export function getDimensionParts({
	direction,
	x,
	y,
	length,
}: Dimension): DimensionParts {
	const last = length - DIMENSION_THICKNESS

	if (direction === 'horizontal') {
		return {
			line: { left: x, top: y, width: length, height: DIMENSION_THICKNESS },
			startTick: {
				left: x,
				top: y - TICK_OVERHANG,
				width: DIMENSION_THICKNESS,
				height: TICK_LENGTH,
			},
			endTick: {
				left: x + last,
				top: y - TICK_OVERHANG,
				width: DIMENSION_THICKNESS,
				height: TICK_LENGTH,
			},
		}
	}

	return {
		line: { left: x, top: y, width: DIMENSION_THICKNESS, height: length },
		startTick: {
			left: x - TICK_OVERHANG,
			top: y,
			width: TICK_LENGTH,
			height: DIMENSION_THICKNESS,
		},
		endTick: {
			left: x - TICK_OVERHANG,
			top: y + last,
			width: TICK_LENGTH,
			height: DIMENSION_THICKNESS,
		},
	}
}
