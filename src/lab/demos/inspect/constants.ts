import type { Box } from './types'

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
