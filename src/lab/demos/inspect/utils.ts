import type { PointerEvent } from 'react'
import {
	DIMENSION_THICKNESS,
	LABEL_LINE_HEIGHT,
	LABEL_SIDE_OFFSET,
	SIZE,
	TICK_LENGTH,
} from './constants'
import type { Dimension, DimensionParts, Point } from './types'

// How far a tick sticks out on each side of the line, so it stays centered on it.
const TICK_OVERHANG = (TICK_LENGTH - DIMENSION_THICKNESS) / 2

// The point a dimension's number is placed at. The number is shifted from this
// point by a CSS translate (see dimension.tsx), because its width is not known here.
// - above: the point is the line's middle, just over the ticks (the number's
//   bottom edge meets the top of the ticks), and the number is centered on it.
// - left / right: the point is beside the ticks, level with the line's middle.
function getLabelPoint({ side, x, y, length }: Dimension): Point {
	const middle = length / 2

	if (side === 'above') {
		return { left: x + middle, top: y - TICK_OVERHANG - LABEL_LINE_HEIGHT }
	}

	return {
		left: side === 'right' ? x + LABEL_SIDE_OFFSET : x - LABEL_SIDE_OFFSET,
		top: y + middle - LABEL_LINE_HEIGHT / 2,
	}
}

// Turns one dimension into what draws it: the line, a tick at each end and the
// point for its number. The end tick sits on the line's last pixel, so the whole
// dimension spans exactly `length` px.
export function getDimensionParts(dimension: Dimension): DimensionParts {
	const { direction, x, y, length } = dimension
	const last = length - DIMENSION_THICKNESS
	const label = getLabelPoint(dimension)

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
			label,
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
		label,
	}
}

// Where the pointer is inside the card, in the card's own px (0..368, 0..186).
// clientX/clientY are measured from the window, so we subtract where the card is.
// DemoFit may shrink the card on small screens: then it measures less on screen
// than its real SIZE, and the ratio puts the point back in the card's own units.
export function getCardPoint(e: PointerEvent<HTMLElement>) {
	const rect = e.currentTarget.getBoundingClientRect()

	return {
		x: (e.clientX - rect.left) * (SIZE.width / rect.width),
		y: (e.clientY - rect.top) * (SIZE.height / rect.height),
	}
}
