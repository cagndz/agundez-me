'use client'
import {
	motion,
	useMotionValue,
	animate,
	MotionValue,
	useTransform,
	type MotionStyle,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
	COLS,
	ROWS,
	TOTAL,
	SOFTNESS,
	ORDER,
	INK_IDLE,
	INK_CONFIRMED,
} from './pattern'

// Each dot is CELL px wide with GAP px between dots (px, not fractions: dots must stay round).
const CELL = 4
const GAP = 1

// Durations in seconds
const HOLD_DURATION = 1.2
const RELEASE_DURATION = 0.25
const PRESS_DURATION = 0.2
// How long "DONE" stays on screen before the button resets (ms)
const CONFIRMED_DURATION = 1500

// ease-out-strong, same curve as --ease-out-strong in globals.css
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

// One dot = one element. Its color is a mix between "off" and accent,
// driven by the CSS variable --t (0 = off, 1 = lit).
// One element (not two stacked layers) so round edges don't leave a grey halo.
const DOT_BACKGROUND =
	'color-mix(in srgb, var(--accent) calc(var(--t) * 100%), color-mix(in srgb, var(--foreground) 15%, var(--background)))'

function Cell({
	index,
	progress,
	ink,
}: {
	index: number
	progress: MotionValue<number>
	ink: boolean
}) {
	// When this dot lights up, from 0 (first) to 1 (last)
	const position = ORDER[index]
	// Squeeze starts into the first (1 - SOFTNESS) so the last dot still ends at 1
	const start = position * (1 - SOFTNESS)
	const end = start + SOFTNESS
	const t = useTransform(progress, [start, end], [0, 1])
	// Letter dots stay dark: the fill never paints over them
	if (ink) return <span className='rounded-full bg-foreground' />
	return (
		<motion.span
			className='rounded-full'
			style={{ '--t': t, background: DOT_BACKGROUND } as MotionStyle}
		/>
	)
}

export default function HoldToConfirm() {
	const progress = useMotionValue(0)
	const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [status, setStatus] = useState<'idle' | 'confirmed'>('idle')

	// Clear the pending reset if the component unmounts (e.g. the modal closes)
	useEffect(() => {
		return () => {
			if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
		}
	}, [])

	const confirm = () => {
		setStatus('confirmed')
		resetTimerRef.current = setTimeout(() => {
			controlsRef.current = animate(progress, 0, {
				duration: RELEASE_DURATION,
				ease: EASE_OUT,
			})
			setStatus('idle')
		}, CONFIRMED_DURATION)
	}

	const start = () => {
		if (status === 'confirmed') return
		controlsRef.current?.stop()
		controlsRef.current = animate(progress, 1, {
			duration: HOLD_DURATION * (1 - progress.get()),
			ease: 'linear',
			// Only runs if the animation reaches the end (stop() does not trigger it)
			onComplete: confirm,
		})
	}

	const release = () => {
		if (status === 'confirmed') return
		controlsRef.current?.stop()
		controlsRef.current = animate(progress, 0, {
			duration: RELEASE_DURATION,
			ease: EASE_OUT,
		})
	}

	const ink = status === 'confirmed' ? INK_CONFIRMED : INK_IDLE

	return (
		<motion.button
			type='button'
			aria-label={status === 'confirmed' ? 'Confirmed' : 'Hold to confirm'}
			onTapStart={() => start()}
			onTap={() => release()}
			onTapCancel={() => release()}
			whileTap={{
				scale: 0.97,
				transition: { duration: PRESS_DURATION, ease: EASE_OUT },
			}}
			transition={{ duration: RELEASE_DURATION, ease: EASE_OUT }}
			className='bg-background rounded-xs border border-border p-0.75'
		>
			<div
				aria-hidden
				className='grid grid-flow-col'
				style={{
					gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
					gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
					gap: GAP,
				}}
			>
				{Array.from({ length: TOTAL }, (_, i) => (
					<Cell key={i} index={i} progress={progress} ink={ink[i]} />
				))}
			</div>
		</motion.button>
	)
}
