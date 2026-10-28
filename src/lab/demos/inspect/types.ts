export type Box = {
	name: string
	x: number
	y: number
	width: number
	height: number
	radius: number
}

type Direction = 'horizontal' | 'vertical'

export type Dimension = {
	name: string
	direction: Direction
	x: number
	y: number
	length: number
}

// A box placed with CSS: the keys are the CSS property names, so a Rect can be
// passed straight to `style`.
export type Rect = {
	left: number
	top: number
	width: number
	height: number
}

// The three rectangles that draw one dimension.
export type DimensionParts = {
	line: Rect
	startTick: Rect
	endTick: Rect
}
