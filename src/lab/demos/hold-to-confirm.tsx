'use client'
import {
	motion,
	useMotionValue,
	animate,
} from 'motion/react'
import { useRef } from 'react'

const COLS = 32
const ROWS = 8

// Durations in seconds
const HOLD_DURATION = 1.2
const RELEASE_DURATION = 0.25
const PRESS_DURATION = 0.2

// ease-out-strong, same curve as --ease-out-strong in globals.css
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function HoldToConfirm() {
	const progress = useMotionValue(0)

	const controlsRef = useRef<ReturnType<typeof animate> | null>(null)

	const start = () => {
		controlsRef.current?.stop()
		controlsRef.current = animate(progress, 1, {
			duration: HOLD_DURATION * (1 - progress.get()),
			ease: 'linear',
		})
	}

	const release = () => {
		controlsRef.current?.stop()
		controlsRef.current = animate(progress, 0, {
			duration: RELEASE_DURATION,
			ease: EASE_OUT,
		})
	}

	return (
		<motion.button
			type='button'
			onTapStart={() => start()}
			onTap={() => release()}
			onTapCancel={() => release()}
			whileTap={{
				scale: 0.97,
				transition: { duration: PRESS_DURATION, ease: EASE_OUT },
			}}
			transition={{ duration: RELEASE_DURATION, ease: EASE_OUT }}
			className='w-62 h-16 bg-background rounded-xs border border-border relative flex items-center justify-center'
		>
			<div
				aria-hidden
				className='absolute inset-0.5 grid grid-flow-col gap-0.5'
				style={{
					gridTemplateRows: `repeat(${ROWS}, 1fr)`,
					gridTemplateColumns: `repeat(${COLS}, 1fr)`,
				}}
			>
				{Array.from({ length: COLS * ROWS }, (_, i) => (
					<span key={i} className='bg-foreground/15'></span>
				))}
			</div>
			<span className='font-mono tracking-widest uppercase text-sm text-foreground relative bg-background px-3 py-1'>
				Hold to confirm
			</span>
		</motion.button>
	)
}
