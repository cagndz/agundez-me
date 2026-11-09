'use client'

import { motion, type Transition } from 'motion/react'
import { INK_WIDTH, RETRACE } from './constants'
import type { Stroke } from './types'
import { smoothPath, strokeLength } from './utils'

/** The signature as drawn. Non-scaling, so the miniature keeps a real line. */
export function InkPaths({
	strokes,
	width,
	transition,
}: {
	strokes: Stroke[]
	width: number
	transition: Transition
}) {
	return (
		<g
			fill='none'
			stroke='var(--foreground)'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			{strokes.map((stroke, i) => (
				<motion.path
					key={i}
					d={smoothPath(stroke)}
					vectorEffect='non-scaling-stroke'
					initial={false}
					animate={{ strokeWidth: width }}
					transition={transition}
				/>
			))}
		</g>
	)
}

/** Your own hand again, in accent: every stroke in the order drawn, at pen speed. */
export function Retrace({ strokes }: { strokes: Stroke[] }) {
	const lengths = strokes.map(strokeLength)
	const total = lengths.reduce((a, b) => a + b, 0) || 1
	const starts = lengths.map(
		(_, i) =>
			(RETRACE.duration * lengths.slice(0, i).reduce((a, b) => a + b, 0)) /
			total,
	)
	return (
		<g
			fill='none'
			stroke='var(--accent)'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={INK_WIDTH + 0.5}
		>
			{strokes.map((stroke, i) => (
				<motion.path
					key={i}
					d={smoothPath(stroke)}
					vectorEffect='non-scaling-stroke'
					initial={{ pathLength: 0, opacity: 0 }}
					animate={{ pathLength: 1, opacity: 1 }}
					transition={{
						pathLength: {
							...RETRACE,
							duration: (RETRACE.duration * lengths[i]) / total,
							delay: starts[i],
						},
						opacity: { duration: 0, delay: starts[i] },
					}}
				/>
			))}
		</g>
	)
}
