'use client'

import { useState } from 'react'
import {
	motion,
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
} from './constants'
import { pixelToDegrees, pixelToUnit, snapToTick } from './utils'

export function Dial() {
	const x = useMotionValue(INITIAL_OFFSET_PX)
	const rotateDial = useTransform(x, pixelToDegrees)
	const [value, setValue] = useState(INITIAL)

	useMotionValueEvent(x, 'change', (latest) => {
		setValue(pixelToUnit(latest))
	})

	return (
		<div className='flex flex-col items-center gap-7'>
			<span>{value}</span>

			<div className='relative h-23 w-80 overflow-hidden border border-border'>
				<motion.div
					className='absolute left-1/2 -translate-x-1/2 rounded-full border border-border'
					style={{
						width: RADIUS * 2,
						height: RADIUS * 2,
						top: WHEEL_TOP,
						rotate: rotateDial,
					}}
				>
					{UNITS.map((unit) => (
						<div
							key={unit}
							className='absolute top-0 left-1/2 h-8.5 w-px -translate-x-1/2 bg-foreground'
							style={{
								transformOrigin: `50% ${RADIUS}px`,
								rotate: `${(unit - MIN) * DEGREES_PER_UNIT}deg`,
							}}
						/>
					))}
				</motion.div>
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
				/>
				<div className='pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent' />
			</div>
		</div>
	)
}
