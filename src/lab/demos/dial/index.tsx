'use client'

import { useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent } from 'motion/react'
import { INITIAL, INITIAL_OFFSET_PX, TRAVEL } from './constants'
import { pixelToUnit } from './utils'

export default function Dial() {
	const x = useMotionValue(INITIAL_OFFSET_PX)
	const [value, setValue] = useState(INITIAL)

	useMotionValueEvent(x, 'change', (latest) => {
		setValue(pixelToUnit(latest))
	})

	return (
		<div className='relative overflow-hidden w-80 h-16 border border-border'>
			<span>{value}</span>
			<motion.div
				className='absolute left-1/2 h-full font-mono bg-foreground'
				style={{ x, width: TRAVEL }}
				drag='x'
				dragConstraints={{ left: -TRAVEL, right: 0 }}
				dragElastic={0.25}
			/>
			<div className='left-1/2 -translate-x-1/2 absolute h-full w-0.5 bg-accent pointer-events-none' />
		</div>
	)
}
