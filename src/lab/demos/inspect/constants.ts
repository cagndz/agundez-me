import type { Box, Dimension } from './types'

// Fixed size on purpose: the dimension lines print real pixel values, and the
// lens math (distance to the farthest corner) needs the exact width and height.
// Height: 16 padding + 18 label + 8 + 44 field + 8 + 16 helper + 16 + 44 button + 16 padding.
export const SIZE = {
	width: 368,
	height: 186,
}

// The lens frames one field group (label 18 + 8 + field 44 + 8 + helper 16 = 94 px).
// Diameter 96 = 2 * 48, the nearest whole radius, leaving 1 px to spare per side.
export const LENS_RADIUS = 48

// Where each element of the form sits, in px from the card's top-left corner.
// Boxes and text lines are listed in reading order. The widths of the four text
// boxes (label, placeholder, helper, button-text) depend on how the font renders,
// so they are measured in the browser.
export const BOX_MEASURES: Box[] = [
	{
		name: 'label',
		x: 16,
		y: 16,
		width: 36,
		height: 18,
		radius: 0,
	},
	{
		name: 'field',
		x: 16,
		y: 42,
		width: 336,
		height: 44,
		radius: 8,
	},
	{
		name: 'placeholder',
		x: 28,
		y: 54,
		width: 108,
		height: 20,
		radius: 0,
	},
	{
		name: 'helper',
		x: 16,
		y: 94,
		width: 236,
		height: 16,
		radius: 0,
	},
	{
		name: 'button',
		x: 16,
		y: 126,
		width: 336,
		height: 44,
		radius: 8,
	},
	{
		name: 'button-text',
		x: 152,
		y: 138,
		width: 64,
		height: 20,
		radius: 0,
	},
]

// The distances the card prints, in px from its top-left corner. (x, y) is where
// the line starts and it runs `length` px to the right or down. The printed number
// is the length itself, so a dimension never carries a label of its own. `side` is
// where that number sits: above a horizontal line, left or right of a vertical one.
export const DIMENSION_MEASURES: Dimension[] = [
	{
		name: 'padding-left',
		direction: 'horizontal',
		x: 0,
		y: 64,
		length: 16,
		side: 'above',
	},
	{
		name: 'padding-top',
		direction: 'vertical',
		x: 120,
		y: 0,
		length: 16,
		side: 'right',
	},
	{
		name: 'label-gap',
		direction: 'vertical',
		x: 120,
		y: 34,
		length: 8,
		side: 'right',
	},
	{
		name: 'field-height',
		direction: 'vertical',
		x: 330,
		y: 42,
		length: 44,
		side: 'left',
	},
	{
		name: 'helper-gap',
		direction: 'vertical',
		x: 280,
		y: 86,
		length: 8,
		side: 'right',
	},
	{
		name: 'button-gap',
		direction: 'vertical',
		x: 280,
		y: 110,
		length: 16,
		side: 'right',
	},
	{
		name: 'content-width',
		direction: 'horizontal',
		x: 16,
		y: 178,
		length: 336,
		side: 'above',
	},
	{
		name: 'padding-right',
		direction: 'horizontal',
		x: 352,
		y: 64,
		length: 16,
		side: 'above',
	},
]

// A dimension line is a thin rectangle: its short side is this thick. 1 px matches
// the outlines' stroke, so the whole blueprint shares one hairline.
export const DIMENSION_THICKNESS = 1

// Each end of a dimension is closed by a tick, a bar across the line.
// 7 px = the 1 px line plus 3 px on each side, so the tick is centered on it.
export const TICK_LENGTH = 7

// The number of a dimension is one line of mono text. Its line-height also centers
// it on a vertical line: half of it above the middle, half below.
export const LABEL_LINE_HEIGHT = 10

// How far the number's box sits from a vertical line: 3 px of tick overhang,
// the 1 px line itself and 1 px of air.
export const LABEL_SIDE_OFFSET = 5
