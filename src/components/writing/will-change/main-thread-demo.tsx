'use client'

import { type Ref, useEffect, useRef, useState } from 'react'
import { Figure } from '@/components/writing/figure'

// Both cards run the same turn: 0° to -90° and back, same duration, same curve.
const TURN_MS = 1600
const TURN_ANGLE = -90
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)'
const BLOCK_MS = 1000
const FRAME_MS = 1000 / 60

// The same curve as EASING, for the JavaScript card. Solves x(t) for t with
// Newton's method, then returns y(t): what the browser does with cubic-bezier().
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const cx = 3 * x1
	const bx = 3 * (x2 - x1) - cx
	const ax = 1 - cx - bx
	const cy = 3 * y1
	const by = 3 * (y2 - y1) - cy
	const ay = 1 - cy - by
	const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
	const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
	const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

	return (x: number) => {
		let t = x
		for (let i = 0; i < 8; i++) {
			const error = sampleX(t) - x
			const slope = slopeX(t)
			if (Math.abs(error) < 1e-6 || slope === 0) break
			t -= error / slope
		}
		return sampleY(Math.min(1, Math.max(0, t)))
	}
}

const ease = cubicBezier(0.65, 0, 0.35, 1)

// Angle after `elapsed` ms of an infinite, alternating turn.
function angleAt(elapsed: number) {
	const cycle = elapsed % (TURN_MS * 2)
	const progress = cycle < TURN_MS ? cycle / TURN_MS : 2 - cycle / TURN_MS
	return TURN_ANGLE * ease(progress)
}

// Keeps the main thread busy, the way a long task would.
function blockMainThread(ms: number) {
	const end = performance.now() + ms
	while (performance.now() < end) {
		// Busy on purpose.
	}
}

function Card({ ref }: { ref: Ref<HTMLDivElement> }) {
	return (
		<div
			ref={ref}
			className='h-[68px] w-11 rounded-[6px] bg-foreground'
			style={{ willChange: 'transform' }}
		/>
	)
}

function PauseIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<rect x='2.5' y='2' width='2.4' height='8' rx='0.6' fill='currentColor' />
			<rect x='7.1' y='2' width='2.4' height='8' rx='0.6' fill='currentColor' />
		</svg>
	)
}

function PlayIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<path
				d='M3.5 2.3v7.4a.6.6 0 0 0 .9.5l5.8-3.7a.6.6 0 0 0 0-1L4.4 1.8a.6.6 0 0 0-.9.5Z'
				fill='currentColor'
			/>
		</svg>
	)
}

export function MainThreadDemo() {
	const root = useRef<HTMLDivElement>(null)
	const browserCard = useRef<HTMLDivElement>(null)
	const scriptCard = useRef<HTMLDivElement>(null)
	const animation = useRef<Animation | null>(null)
	const elapsed = useRef(0)

	// null until the reader decides; then their choice wins over autoplay.
	const [wantsToPlay, setWantsToPlay] = useState<boolean | null>(null)
	const [reduceMotion, setReduceMotion] = useState(true)
	const [inView, setInView] = useState(false)
	const [busy, setBusy] = useState(false)
	const [skipped, setSkipped] = useState<number | null>(null)

	const playing = (wantsToPlay ?? !reduceMotion) && inView

	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)')
		const update = () => setReduceMotion(query.matches)
		update()
		query.addEventListener('change', update)
		return () => query.removeEventListener('change', update)
	}, [])

	useEffect(() => {
		const element = root.current
		if (!element) return
		const observer = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ threshold: 0.4 },
		)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	// The browser card: one Web Animation, created paused. From here on the
	// browser runs it, on the compositor thread.
	useEffect(() => {
		const card = browserCard.current
		if (!card) return
		const turn = card.animate(
			[
				{ transform: 'rotate(0deg)' },
				{ transform: `rotate(${TURN_ANGLE}deg)` },
			],
			{
				duration: TURN_MS,
				easing: EASING,
				iterations: Infinity,
				direction: 'alternate',
			},
		)
		turn.pause()
		animation.current = turn
		return () => turn.cancel()
	}, [])

	// The script card: a new rotation written on every frame from JavaScript.
	useEffect(() => {
		const turn = animation.current
		if (!playing) {
			turn?.pause()
			return
		}
		// Start both from the same point, so any drift you see is the main thread.
		if (turn) {
			turn.currentTime = elapsed.current
			turn.play()
		}
		let frame = 0
		let last = performance.now()
		const tick = (now: number) => {
			const delta = now - last
			last = now
			elapsed.current += delta
			if (delta > FRAME_MS * 6) {
				setSkipped(Math.round(delta / FRAME_MS) - 1)
			}
			if (scriptCard.current) {
				scriptCard.current.style.transform = `rotate(${angleAt(elapsed.current)}deg)`
			}
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [playing])

	useEffect(() => {
		if (skipped === null) return
		const timeout = setTimeout(() => setSkipped(null), 2600)
		return () => clearTimeout(timeout)
	}, [skipped])

	const handleBlock = () => {
		setWantsToPlay(true)
		setSkipped(null)
		setBusy(true)
		// Wait two frames so the busy state is on screen, then stop the thread.
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				blockMainThread(BLOCK_MS)
				setBusy(false)
			}),
		)
	}

	return (
		<Figure
			caption='The same 1.6 s turn twice: a Web Animation on the left, requestAnimationFrame on the right.'
			className='relative'
		>
			<div
				ref={root}
				className='flex flex-col items-center gap-9 px-4 pt-14 pb-8'
			>
				<div className='grid w-full max-w-sm grid-cols-2'>
					{[
						{ ref: browserCard, name: 'Browser' },
						{ ref: scriptCard, name: 'JavaScript' },
					].map((lane) => (
						<div key={lane.name} className='flex flex-col items-center gap-9'>
							<div className='grid h-20 place-items-center'>
								<Card ref={lane.ref} />
							</div>
							<p className='text-[13px] text-muted'>{lane.name}</p>
						</div>
					))}
				</div>
				<button
					type='button'
					onClick={handleBlock}
					disabled={busy}
					className='h-8 rounded-full bg-background px-3.5 text-[13px] shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_1px_2px_rgb(26_25_23/0.06)] transition-[scale,opacity] duration-150 ease-out-quart hover:shadow-[0_0_0_1px_rgb(26_25_23/0.1),0_1px_2px_rgb(26_25_23/0.08)] active:scale-[0.97] disabled:opacity-60'
				>
					{busy ? 'Main thread busy…' : 'Block main thread'}
				</button>
			</div>
			<p
				aria-live='polite'
				className={`absolute inset-x-0 bottom-2 text-center text-xs text-muted transition-opacity duration-200 ${skipped === null ? 'opacity-0' : 'opacity-100'}`}
			>
				{skipped !== null &&
					`JavaScript skipped ${skipped} frames. The browser never stopped.`}
			</p>
			<button
				type='button'
				aria-label={playing ? 'Pause animation' : 'Play animation'}
				onClick={() => setWantsToPlay(!playing)}
				disabled={busy}
				className='absolute top-3 right-3 grid size-8 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground'
			>
				{playing ? <PauseIcon /> : <PlayIcon />}
			</button>
		</Figure>
	)
}
