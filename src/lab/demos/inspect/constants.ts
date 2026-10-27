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
