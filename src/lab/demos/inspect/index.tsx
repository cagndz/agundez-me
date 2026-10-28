'use client'

import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useSpring,
} from 'motion/react'
import { Blueprint } from './blueprint'
import { LENS_OPEN_SPRING, LENS_RADIUS, SIZE } from './constants'
import { Form } from './form'
import { getCardPoint } from './utils'

export function Inspect() {
	const centerX = SIZE.width / 2
	const centerY = SIZE.height / 2

	const x = useSpring(centerX, LENS_OPEN_SPRING)
	const y = useSpring(centerY, LENS_OPEN_SPRING)
	const radius = useMotionValue(0)

	const clipPath = useMotionTemplate`circle(${radius}px at ${x}px ${y}px)`

	return (
		<div
			className='relative rounded-2xl bg-white p-4 font-sans normal-case inset-ring inset-ring-foreground/10'
			style={{ width: SIZE.width, height: SIZE.height }}
			onPointerMove={(e) => {
				const point = getCardPoint(e)
				x.set(point.x)
				y.set(point.y)
			}}
			onPointerEnter={(e) => {
				const point = getCardPoint(e)
				x.jump(point.x)
				y.jump(point.y)
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
