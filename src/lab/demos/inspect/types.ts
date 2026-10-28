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
