'use client'

import { type Ref, useEffect, useRef, useState } from 'react'
import { Figure } from '../figure'

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
		<div className='relative grid place-items-center'>
			{/* The shadow stays put while the card turns. */}
			<div
				aria-hidden='true'
				className='absolute top-full mt-3 h-2 w-14 rounded-full bg-foreground/15 blur-[6px]'
			/>
			<div
				ref={ref}
				className='relative h-[72px] w-12 rounded-[6px] bg-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'
				style={{ willChange: 'transform' }}
			>
				<div className='absolute inset-x-2 top-2.5 h-[3px] rounded-full bg-background/25' />
			</div>
		</div>
	)
}

function PlayIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<path
				d='M3 1.8v8.4a.6.6 0 0 0 .9.5l6.6-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z'
				fill='currentColor'
			/>
		</svg>
	)
}

function PauseIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<rect
				x='2.5'
				y='1.5'
				width='2.5'
				height='9'
				rx='0.6'
				fill='currentColor'
			/>
			<rect x='7' y='1.5' width='2.5' height='9' rx='0.6' fill='currentColor' />
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

	const status = busy
		? 'Main thread busy for 1 s.'
		: skipped !== null
			? `JavaScript skipped ${skipped} frames. The browser never stopped.`
			: playing
				? 'Block the main thread while they turn.'
				: 'Paused.'

	return (
		<Figure caption='The same 1.6 s turn twice: a Web Animation on the left, requestAnimationFrame on the right. Only one of them needs the main thread.'>
			<div
				ref={root}
				className='relative bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[12px_12px]'
			>
				<div className='absolute top-3 left-3 flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-2.5 pl-2 font-mono text-[11px] tracking-widest uppercase'>
					<span
						aria-hidden='true'
						className={`size-1.5 rounded-full transition-colors duration-150 ${busy ? 'bg-accent shadow-[0_0_6px_var(--color-accent)]' : 'bg-foreground/20'}`}
					/>
					<span className='text-muted'>Main thread</span>
					<span>{busy ? 'Busy' : 'Idle'}</span>
				</div>

				<div className='grid grid-cols-2 divide-x divide-border pt-12'>
					{[
						{
							ref: browserCard,
							name: 'Browser',
							thread: 'WAAPI · compositor thread',
						},
						{
							ref: scriptCard,
							name: 'JavaScript',
							thread: 'rAF · main thread',
						},
					].map((lane) => (
						<div
							key={lane.name}
							className='flex flex-col items-center gap-10 pt-10 pb-5'
						>
							<Card ref={lane.ref} />
							<div className='text-center'>
								<p className='font-mono text-[11px] tracking-widest uppercase'>
									{lane.name}
								</p>
								<p className='text-xs text-muted'>{lane.thread}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border px-3 py-3'>
				<button
					type='button'
					aria-label={playing ? 'Pause' : 'Play'}
					onClick={() => setWantsToPlay(!playing)}
					disabled={busy}
					className='grid size-8 place-items-center rounded-xs border border-border transition-[background-color,scale] duration-150 ease-out-quart hover:bg-foreground/5 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50'
				>
					{playing ? <PauseIcon /> : <PlayIcon />}
				</button>
				<button
					type='button'
					onClick={handleBlock}
					disabled={busy}
					className='inline-flex h-8 items-center gap-2 rounded-xs bg-foreground px-3 font-mono text-[11px] tracking-widest text-background uppercase transition-[opacity,scale] duration-150 ease-out-quart hover:opacity-85 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'
				>
					Block main thread
					<span className='rounded-[3px] bg-background/15 px-1.5 py-0.5'>
						1 s
					</span>
				</button>
				<p
					aria-live='polite'
					className='basis-full text-xs text-muted sm:ml-auto sm:basis-auto'
				>
					{status}
				</p>
			</div>
		</Figure>
	)
}
