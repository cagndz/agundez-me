'use client'

import { useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent } from 'motion/react'
import {
	INITIAL,
	INITIAL_OFFSET_PX,
	PX_PER_UNIT,
	TRAVEL,
	BAND_WIDTH,
} from './constants'
import { pixelToUnit, snapToTick } from './utils'

export default function Dial() {
	const x = useMotionValue(INITIAL_OFFSET_PX)
	const [value, setValue] = useState(INITIAL)

	useMotionValueEvent(x, 'change', (latest) => {
		setValue(pixelToUnit(latest))
	})

	return (
		<div className='flex flex-col items-center gap-7'>
			<span>{value}</span>

			<div className='relative h-16 w-80 overflow-hidden border border-border'>
				<motion.div
					className='absolute inset-y-0 left-1/2 font-mono'
					style={{
						x,
						width: BAND_WIDTH,
						backgroundImage: `repeating-linear-gradient(90deg, var(--color-foreground) 0 1px, transparent 1px ${PX_PER_UNIT}px)`,
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
