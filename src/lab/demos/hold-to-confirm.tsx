'use client'
import {
	motion,
	useMotionValue,
	animate,
	MotionValue,
	useTransform,
} from 'motion/react'
import { useRef } from 'react'

const COLS = 32
const ROWS = 8
const TOTAL = COLS * ROWS

// Width of the soft edge, as a fraction of the progress (0 to 1).
// Higher = more cells are half-lit at the same time.
const SOFTNESS = 0.2

// How scattered the lighting order is: 0 = left to right (a wave), 1 = pure random.
const NOISE = 0.3
// Same seed = same pattern on the server and in the browser.
const SEED = 7

// Durations in seconds
const HOLD_DURATION = 1.2
const RELEASE_DURATION = 0.25
const PRESS_DURATION = 0.2

// ease-out-strong, same curve as --ease-out-strong in globals.css
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

// Small seeded random number generator (mulberry32).
// Unlike Math.random(), it always returns the same sequence for the same seed.
function createRandom(seed: number) {
	let a = seed
	return () => {
		let t = (a += 0x6d2b79f5)
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// For every cell, when it lights up along the hold: 0 (first) to 1 (last).
function buildOrder() {
	const random = createRandom(SEED)
	// 1. Give each cell a score: left-to-right bias mixed with random noise
	const scored = Array.from({ length: TOTAL }, (_, i) => {
		const column = Math.floor(i / ROWS)
		const bias = column / (COLS - 1)
		return { i, score: (1 - NOISE) * bias + NOISE * random() }
	})
	// 2. Sort by score and turn the ranking into evenly spaced positions
	scored.sort((a, b) => a.score - b.score)
	const order = new Array<number>(TOTAL)
	scored.forEach(({ i }, rank) => {
		order[i] = rank / (TOTAL - 1)
	})
	return order
}

const ORDER = buildOrder()

function Cell({
	index,
	progress,
}: {
	index: number
	progress: MotionValue<number>
}) {
	// When this cell lights up, from 0 (first) to 1 (last)
	const position = ORDER[index]
	// Squeeze starts into the first (1 - SOFTNESS) so the last cell still ends at 1
	const start = position * (1 - SOFTNESS)
	const end = start + SOFTNESS
	const opacity = useTransform(progress, [start, end], [0, 1])
	return (
		<span className='relative bg-foreground/15'>
			<motion.span className='absolute inset-0 bg-accent' style={{ opacity }} />
		</span>
	)
}

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
				{Array.from({ length: TOTAL }, (_, i) => (
					<Cell key={i} index={i} progress={progress} />
				))}
			</div>
			<span className='font-mono tracking-widest uppercase text-sm text-foreground relative bg-background px-3 py-1'>
				Hold to confirm
			</span>
		</motion.button>
	)
}
