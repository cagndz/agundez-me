'use client'
import {
	motion,
	useMotionValue,
	useMotionValueEvent,
	animate,
	useTransform,
	useReducedMotion,
} from 'motion/react'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { WIDTH, HEIGHT, createPalette, drawDots, type Palette } from './draw'

// Durations in seconds
const HOLD_DURATION = 1.2
const RELEASE_DURATION = 0.25
const PRESS_DURATION = 0.2
// How long the filled button stays before it falls (ms)
const CONFIRMED_DURATION = 250

// How long the fall at the end lasts (the details of each dot's fall are in draw.ts)
const FALL_DURATION = 0.7
// The button's border/background fade out between these two points of the fall (0 to 1)
const CHROME_FADE_START = 0
const CHROME_FADE_END = 0.7
// Fade back in after the reset, so the idle dots don't pop in
const FADE_IN_DURATION = 0.3

// ease-out-strong, same curve as --ease-out-strong in globals.css
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function HoldToConfirm() {
	const progress = useMotionValue(0)
	const fall = useMotionValue(0)
	const baseOpacity = useMotionValue(1)
	// Border and background fade out during the fall. On reset the whole button fades back in (baseOpacity)
	const chromeOpacity = useTransform(
		fall,
		[CHROME_FADE_START, CHROME_FADE_END],
		[1, 0],
	)
	const reducedMotion = useReducedMotion()
	const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [status, setStatus] = useState<'idle' | 'confirmed'>('idle')

	const canvasRef = useRef<HTMLCanvasElement>(null)
	const paletteRef = useRef<Palette | null>(null)

	// Paints the current frame. Only reads refs and MotionValues, so it never changes.
	const render = useCallback(() => {
		const canvas = canvasRef.current
		const palette = paletteRef.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !palette || !ctx) return
		const scale = canvas.width / WIDTH
		ctx.setTransform(scale, 0, 0, scale, 0, 0)
		drawDots(ctx, progress.get(), fall.get(), palette)
	}, [progress, fall])

	// Whenever the fill or the fall moves, paint again
	useMotionValueEvent(progress, 'change', render)
	useMotionValueEvent(fall, 'change', render)

	// Size the canvas for the screen (max 2x) and read the theme colors, before first paint
	useLayoutEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const dpr = Math.min(2, window.devicePixelRatio || 1)
		canvas.width = Math.round(WIDTH * dpr)
		canvas.height = Math.round(HEIGHT * dpr)
		paletteRef.current = createPalette(canvas)
		render()
	}, [render])

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
				style={{ opacity: baseOpacity }}
				className='relative cursor-pointer touch-none rounded-xs p-0.75 select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] aria-disabled:cursor-default'
			>
				{/* Border and background as their own layer, so they fade without touching the dots */}
				<motion.span
					aria-hidden
					style={{ opacity: chromeOpacity }}
					className='absolute inset-0 rounded-xs border border-border bg-background'
				/>
				<canvas
					ref={canvasRef}
					aria-hidden
					className='relative block'
					style={{ width: WIDTH, height: HEIGHT }}
				/>
			</motion.button>
			{/* Screen readers: announces the result. The button's own label never changes. */}
			<span role='status' className='sr-only'>
				{status === 'confirmed' ? 'Confirmed' : ''}
			</span>
		</>
	)
}
