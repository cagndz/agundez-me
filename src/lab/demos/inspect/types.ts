export type Box = {
	name: string
	x: number
	y: number
	width: number
	height: number
	radius: number
}

// A measured distance. A horizontal line always has its number above it, a
// vertical one to its left or right, so only those pairs are allowed: a typo like
// a vertical line with its number 'above' is a type error.
export type Dimension = {
	name: string
	x: number
	y: number
	length: number
} & (
	| { direction: 'horizontal'; side: 'above' }
	| { direction: 'vertical'; side: 'left' | 'right' }
)

// Where a dimension's number sits.
export type Side = Dimension['side']

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

// A point inside the card, in the card's own px (0..368, 0..186).
export type CardPoint = {
	x: number
	y: number
}
