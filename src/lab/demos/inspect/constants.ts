import type { Box, Dimension, Note } from './types'

// Fixed size on purpose: the dimension lines print real pixel values, and the
// lens math (distance to the farthest corner) needs the exact width and height.
// Height: 16 padding + 18 label + 8 + 44 field + 8 + 16 helper + 16 + 44 button + 16 padding.
export const SIZE = {
	width: 368,
	height: 186,
}

// The middle of the card: where the keyboard pins the lens from.
export const CENTER = { x: SIZE.width / 2, y: SIZE.height / 2 }

// The lens frames one field group (label 18 + 8 + field 44 + 8 + helper 16 = 94 px).
// Diameter 96 = 2 * 48, the nearest whole radius, leaving 1 px to spare per side.
export const LENS_RADIUS = 48

// Where each element of the form sits, in px from the card's top-left corner.
// Boxes and text lines are listed in reading order. The widths of the four text
// boxes (label, placeholder, helper, button-text) are the rendered width of the
// text in Geist at its size and weight, so they are not whole numbers. The button
// text is centered: 16 + (336 - 65.56) / 2.
export const BOX_MEASURES: Box[] = [
	{
		name: 'label',
		x: 16,
		y: 16,
		width: 33.42,
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
		width: 113.83,
		height: 20,
		radius: 0,
	},
	{
		name: 'helper',
		x: 16,
		y: 94,
		width: 225.58,
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
		x: 151.22,
		y: 138,
		width: 65.56,
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

// Every small text on the blueprint (dimension numbers and notes) is one line of
// mono text at 9/10. The line-height also centers a number on a vertical line:
// half of it above the middle, half below.
export const LABEL_LINE_HEIGHT = 10

// How far the number's box sits from a vertical line: 3 px of tick overhang,
// the 1 px line itself and 1 px of air.
export const LABEL_SIDE_OFFSET = 5

// What the blueprint says about the form: type size and weight, and corner radius.
// (x, y) is where the text starts; with `align: 'right'` it ends there instead.
// Each note sits 10 px after the end of the text it describes.
export const NOTE_MEASURES: Note[] = [
	{ name: 'card-radius', x: 362, y: 4, text: 'R 16', align: 'right' },
	{ name: 'label-type', x: 59, y: 20, text: '13 · MEDIUM', align: 'left' },
	{
		name: 'field-type',
		x: 152,
		y: 59,
		text: '14 · REGULAR · R 8',
		align: 'left',
	},
	{ name: 'helper-type', x: 252, y: 97, text: '12 · REGULAR', align: 'left' },
	{ name: 'button-radius', x: 24, y: 132, text: 'R 8', align: 'left' },
	{ name: 'button-type', x: 227, y: 143, text: '14 · MEDIUM', align: 'left' },
]

// A critically damped spring: it slides to its target with no bounce. For this
// kind of spring, the time to cover 95 % of the way is 4.74 / ω (ω, "omega", is
// how fast it is), so ω = 4.74 / settleTime. From ω: stiffness = ω², and the
// damping that stops it exactly at the target is 2 × √stiffness (= 2ω).
const SETTLE_RATIO = 4.74

function criticallyDampedSpring(settleTime: number) {
	const omega = SETTLE_RATIO / settleTime
	const stiffness = omega ** 2

	return {
		type: 'spring',
		stiffness,
		damping: 2 * Math.sqrt(stiffness),
	} as const
}

// Following the pointer and opening: 95 % of the way in 160 ms, fast enough to
// feel attached to the pointer. Retargeting it keeps the velocity, so it never
// stutters.
export const LENS_OPEN_SPRING = criticallyDampedSpring(0.16)

// Closing: 95 % in 300 ms. Slower than opening on purpose; leaving should feel
// like letting go, not like being cut off.
export const LENS_CLOSE_SPRING = criticallyDampedSpring(0.3)

// Read out when the blueprint is pinned, because everything on it is hidden from
// assistive technology. It says what the blueprint shows, in reading order.
export const SUMMARY =
	'Card 368 by 186, radius 16, padding 16. Label 13 medium, then 8 to the field. Field and button 336 by 44, radius 8. Helper text 12, 8 below the field, then 16 to the button.'
