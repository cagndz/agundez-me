'use client'
import {
	motion,
	useMotionValue,
	animate,
	MotionValue,
	useTransform,
	cubicBezier,
	useReducedMotion,
	type MotionStyle,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
	COLS,
	ROWS,
	TOTAL,
	SOFTNESS,
	ORDER,
	FALL_ORDER,
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
const CONFIRMED_DURATION = 700

// Fall at the end. Each dot falls for FALL_WINDOW of FALL_DURATION, starting at a random moment.
const FALL_DURATION = 0.7
const FALL_WINDOW = 0.45
// Further than the button is tall, so every dot leaves through the bottom edge.
const FALL_DISTANCE = 90
// Gravity: starts slow, ends fast. The one place where ease-in is the right curve (it's leaving).
const EASE_IN_GRAVITY = cubicBezier(0.7, 0, 1, 0.5)
// The button's own border/background start fading at this point of the fall (0 to 1)
const CHROME_FADE_START = 0.2
// Fade back in after the reset, so the idle dots don't pop in
const FADE_IN_DURATION = 0.3

// ease-out-strong, same curve as --ease-out-strong in globals.css
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

// Color of a lit dot. Slightly darker than --accent (#ff6000) so the fill
// reaches 3:1 against the lab background, and still 5:1 against the dark letters.
const LIT_COLOR = '#e8590c'

// One dot = one element. Its color is a mix between "off" and accent,
// driven by the CSS variable --t (0 = off, 1 = lit).
// One element (not two stacked layers) so round edges don't leave a grey halo.
const DOT_BACKGROUND = `color-mix(in srgb, ${LIT_COLOR} calc(var(--t) * 100%), color-mix(in srgb, var(--foreground) 15%, var(--background)))`

function Cell({
	index,
	progress,
	fall,
	ink,
}: {
	index: number
	progress: MotionValue<number>
	fall: MotionValue<number>
	ink: boolean
}) {
	// When this dot lights up, from 0 (first) to 1 (last)
	const position = ORDER[index]
	// Squeeze starts into the first (1 - SOFTNESS) so the last dot still ends at 1
	const start = position * (1 - SOFTNESS)
	const end = start + SOFTNESS
	const t = useTransform(progress, [start, end], [0, 1])

	// Same idea for the fall, with its own random order
	const fallStart = FALL_ORDER[index] * (1 - FALL_WINDOW)
	const fallEnd = fallStart + FALL_WINDOW
	const y = useTransform(fall, [fallStart, fallEnd], [0, FALL_DISTANCE], {
		ease: EASE_IN_GRAVITY,
	})
	const opacity = useTransform(fall, [fallStart, fallEnd], [1, 0])

	// Letter dots stay dark: the fill never paints over them
	if (ink) {
		return (
			<motion.span
				className='rounded-full bg-foreground'
				style={{ y, opacity }}
			/>
		)
	}
	return (
		<motion.span
			className='rounded-full'
			style={
				{ '--t': t, background: DOT_BACKGROUND, y, opacity } as MotionStyle
			}
		/>
	)
}

export default function HoldToConfirm() {
	const progress = useMotionValue(0)
	const fall = useMotionValue(0)
	const baseOpacity = useMotionValue(1)
	// The border and background fade out together with the last dots, and fade back in on reset
	const buttonOpacity = useTransform(() => {
		const fadeOut = (fall.get() - CHROME_FADE_START) / (1 - CHROME_FADE_START)
		return baseOpacity.get() * (1 - Math.min(1, Math.max(0, fadeOut)))
	})
	const reducedMotion = useReducedMotion()
	const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [status, setStatus] = useState<'idle' | 'confirmed'>('idle')

	// Clear the pending reset if the component unmounts (e.g. the modal closes)
	useEffect(() => {
		return () => {
			if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
			controlsRef.current?.stop()
		}
	}, [])

	// Back to the starting state, hidden behind baseOpacity 0, then fade in
	const reset = () => {
		baseOpacity.set(0)
		fall.set(0)
		progress.set(0)
		setStatus('idle')
		controlsRef.current = animate(baseOpacity, 1, {
			duration: FADE_IN_DURATION,
			ease: EASE_OUT,
		})
	}

	const confirm = () => {
		setStatus('confirmed')
		resetTimerRef.current = setTimeout(() => {
			// With reduced motion: a plain fade instead of the fall
			controlsRef.current = reducedMotion
				? animate(baseOpacity, 0, {
						duration: 0.2,
						ease: EASE_OUT,
						onComplete: reset,
					})
				: animate(fall, 1, {
						duration: FALL_DURATION,
						ease: 'linear',
						onComplete: reset,
					})
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
		<>
			<motion.button
				type='button'
				aria-label='Hold to confirm'
				aria-disabled={status === 'confirmed'}
				// Long-press on touch devices opens the context menu: block it
				onContextMenu={(event) => event.preventDefault()}
				onTapStart={() => start()}
				onTap={() => release()}
				onTapCancel={() => release()}
				whileTap={
					// No scale while confirmed (nothing to press) or with reduced motion
					status === 'confirmed' || reducedMotion
						? undefined
						: {
								scale: 0.97,
								transition: { duration: PRESS_DURATION, ease: EASE_OUT },
							}
				}
				transition={{ duration: RELEASE_DURATION, ease: EASE_OUT }}
				style={{ opacity: buttonOpacity }}
				className='bg-background rounded-xs border border-border p-0.75 touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]'
			>
				<motion.div
					aria-hidden
					className='grid grid-flow-col overflow-hidden'
					style={{
						gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
						gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
						gap: GAP,
					}}
				>
					{Array.from({ length: TOTAL }, (_, i) => (
						<Cell
							key={i}
							index={i}
							progress={progress}
							fall={fall}
							ink={ink[i]}
						/>
					))}
				</motion.div>
			</motion.button>
			{/* Screen readers: announces the result. The button's own label never changes. */}
			<span role='status' className='sr-only'>
				{status === 'confirmed' ? 'Confirmed' : ''}
			</span>
		</>
	)
}
