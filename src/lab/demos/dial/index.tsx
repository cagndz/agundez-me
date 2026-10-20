'use client'

import { useState } from 'react'
import {
	motion,
	useDragControls,
	useMotionValue,
	useMotionValueEvent,
	useTransform,
} from 'motion/react'
import {
	INITIAL,
	INITIAL_OFFSET_PX,
	TRAVEL,
	BAND_WIDTH,
	RADIUS,
	WHEEL_TOP,
	DEGREES_PER_UNIT,
	UNITS,
	MIN,
	TICK_HEIGHTS,
} from './constants'
import { getTickType, pixelToDegrees, pixelToUnit, snapToTick } from './utils'
import { HEIGHT } from '../hold-to-confirm/draw'

export function Dial() {
	const x = useMotionValue(INITIAL_OFFSET_PX)
	const rotateDial = useTransform(x, pixelToDegrees)
	const [value, setValue] = useState(INITIAL)
	const dragControls = useDragControls()

	useMotionValueEvent(x, 'change', (latest) => {
		setValue(pixelToUnit(latest))
	})

	return (
		<div className='flex flex-col items-center gap-7'>
			<span>{value}</span>

			<div className='relative h-23 w-80 overflow-hidden border border-border'>
				<div className='absolute inset-0 mask-[linear-gradient(90deg,transparent,#000_22%,#000_78%,transparent)]'>
					<motion.div
						className='absolute left-1/2 -translate-x-1/2 rounded-full'
						style={{
							width: RADIUS * 2,
							height: RADIUS * 2,
							top: WHEEL_TOP,
							rotate: rotateDial,
						}}
					>
						{UNITS.map((unit) => {
							const tickType = getTickType(unit)
							const height = TICK_HEIGHTS[tickType]
							const isActive = value === unit

							return (
								<div
									key={unit}
									className={`absolute bottom-full left-1/2 w-px -translate-x-1/2 ${isActive ? 'bg-accent' : 'bg-foreground'}`}
									style={{
										transformOrigin: `50% ${RADIUS + height}px`,
										rotate: `${(unit - MIN) * DEGREES_PER_UNIT}deg`,
										height,
									}}
								/>
							)
						})}
					</motion.div>
				</div>
				<motion.div
					className='absolute inset-y-0 left-1/2 font-mono'
					style={{
						x,
						width: BAND_WIDTH,
					}}
					drag='x'
					dragConstraints={{ left: -TRAVEL, right: 0 }}
					dragElastic={0.25}
					dragTransition={{
						modifyTarget: snapToTick,
						power: 0.2,
						timeConstant: 300,
					}}
					dragListener={false}
					dragControls={dragControls}
				/>
				<div
					onPointerDown={(e) => dragControls.start(e)}
					className='absolute inset-0 touch-pan-y'
				/>
				<div className='pointer-events-none absolute top-[47px] left-1/2 h-2.25 w-3 -translate-x-1/2 bg-accent [clip-path:polygon(50%_0%,0%_100%,100%_100%)]' />
			</div>
		</div>
	)
}
