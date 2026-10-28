'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import type { PointerEvent } from 'react'
import { Blueprint } from './blueprint'
import { LENS_RADIUS, SIZE } from './constants'
import { Form } from './form'

export function Inspect() {
	const centerX = SIZE.width / 2
	const centerY = SIZE.height / 2

	const x = useMotionValue(centerX)
	const y = useMotionValue(centerY)
	const radius = useMotionValue(0)

	const clipPath = useMotionTemplate`circle(${radius}px at ${x}px ${y}px)`

	function moveLens(e: PointerEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect()

		x.set((e.clientX - rect.left) * (SIZE.width / rect.width))
		y.set((e.clientY - rect.top) * (SIZE.height / rect.height))
	}

	return (
		<div
			className='relative rounded-2xl bg-white p-4 font-sans normal-case inset-ring inset-ring-foreground/10'
			style={{ width: SIZE.width, height: SIZE.height }}
			onPointerMove={moveLens}
			onPointerEnter={(e) => {
				moveLens(e)
				radius.set(LENS_RADIUS)
			}}
			onPointerLeave={() => radius.set(0)}
		>
			<Form />

			<motion.div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 rounded-[inherit]'
				style={{
					clipPath,
				}}
			>
				<Blueprint />
			</motion.div>
		</div>
	)
}
