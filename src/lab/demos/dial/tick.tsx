import { RADIUS, TICK_HEIGHTS, DEGREES_PER_UNIT, MIN } from './constants'

import { getTickType } from './utils'

type TickProps = {
	unit: number
	isActive: boolean
}

export function Tick({ unit, isActive }: TickProps) {
	const tickType = getTickType(unit)
	const height = TICK_HEIGHTS[tickType]

	return (
		<div
			className={`absolute bottom-full left-1/2 w-px -translate-x-1/2 ${isActive ? 'bg-accent' : 'bg-foreground'}`}
			style={{
				transformOrigin: `50% ${RADIUS + height}px`,
				rotate: `${(unit - MIN) * DEGREES_PER_UNIT}deg`,
				height,
			}}
		/>
	)
}
