import { memo } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import {
	RADIUS,
	TICK_GROW,
	TICK_HEIGHTS,
	TICK_WIDTHS,
	DEGREES_PER_UNIT,
	MIN,
	TICK_BOX_HEIGHT,
} from './constants'
import { getProximity, getTickType } from './utils'

type TickProps = {
	unit: number
	isActive: boolean
	position: MotionValue<number>
}

// memo: the dial re-renders every time the value changes, but only the tick
// that gains or loses isActive needs to. The rest move through motion values.
export const Tick = memo(function Tick({
	unit,
	isActive,
	position,
}: TickProps) {
	const tickType = getTickType(unit)
	const baseHeight = TICK_HEIGHTS[tickType]
	const growth = TICK_GROW[tickType]

	const proximity = useTransform(position, (latest) =>
		getProximity(unit - latest),
	)

	const scaleY = useTransform(proximity, (near) => {
		const height = baseHeight + growth * near
		return height / TICK_BOX_HEIGHT
	})

	const opacity = useTransform(proximity, (near) =>
		tickType === 'major' ? 1 : 0.5 + 0.5 * near,
	)

	return (
		<div
			className='absolute bottom-full left-1/2 -translate-x-1/2'
			style={{
				transformOrigin: `50% ${RADIUS + TICK_BOX_HEIGHT}px`,
				rotate: `${(unit - MIN) * DEGREES_PER_UNIT}deg`,
				height: TICK_BOX_HEIGHT,
				width: TICK_WIDTHS[tickType],
			}}
		>
			<motion.div
				className={`h-full w-full origin-bottom ${isActive ? 'bg-accent' : 'bg-foreground'}`}
				style={{ scaleY, opacity }}
			/>
		</div>
	)
})
