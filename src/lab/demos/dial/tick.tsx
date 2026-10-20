import { motion, type MotionValue } from 'motion/react'
import {
	RADIUS,
	TICK_HEIGHTS,
	DEGREES_PER_UNIT,
	MIN,
	TICK_BOX_HEIGHT,
} from './constants'
import { getTickType } from './utils'

type TickProps = {
	unit: number
	isActive: boolean
	position: MotionValue<number>
}

export function Tick({ unit, isActive }: TickProps) {
	const tickType = getTickType(unit)
	const height = TICK_HEIGHTS[tickType]

	return (
		<div
			className='absolute bottom-full left-1/2 w-px -translate-x-1/2'
			style={{
				transformOrigin: `50% ${RADIUS + TICK_BOX_HEIGHT}px`,
				rotate: `${(unit - MIN) * DEGREES_PER_UNIT}deg`,
				height: TICK_BOX_HEIGHT,
			}}
		>
			<motion.div
				className={`h-full w-full origin-bottom ${isActive ? 'bg-accent' : 'bg-foreground'}`}
				style={{ scaleY: height / TICK_BOX_HEIGHT }}
			/>
		</div>
	)
}
