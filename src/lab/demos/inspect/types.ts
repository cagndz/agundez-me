export type Box = {
	name: string
	x: number
	y: number
	width: number
	height: number
	radius: number
}

type Direction = 'horizontal' | 'vertical'

// Where a dimension's number sits: above a horizontal line, or to the left or
// right of a vertical one.
export type Side = 'above' | 'left' | 'right'

export type Dimension = {
	name: string
	direction: Direction
	x: number
	y: number
	length: number
	side: Side
}

// A box placed with CSS: the keys are the CSS property names, so a Rect can be
// passed straight to `style`.
export type Rect = {
	left: number
	top: number
	width: number
	height: number
}

// A point placed with CSS, for things whose size is not known in advance (text).
export type Point = {
	left: number
	top: number
}

// Everything one dimension draws: its line, a tick at each end, and where its
// number is placed.
export type DimensionParts = {
	line: Rect
	startTick: Rect
	endTick: Rect
	label: Point
}

type NoteAlign = 'left' | 'right'

// A short technical note: what the blueprint says about an element of the form.
export type Note = {
	name: string
	x: number
	y: number
	text: string
	align: NoteAlign
}
