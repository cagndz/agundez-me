'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import {
	animate,
	useMotionValue,
	useReducedMotion,
	type AnimationPlaybackControls,
} from 'motion/react'
import { TURN } from './constants'
import type { Product } from './data'
import { DOT, ditherInk, floorShadow } from './dither'
import { PRODUCTS } from './products'

// The products stand on a ring at eye level, one at the front in full detail
// and the rest around and behind it as silhouettes, printed straight onto the
// card in ink dots. Turn the ring to bring another to the front; tap the front
// one to print. Nothing moves until you move it, and then it moves like a
// thing with weight: the ring carries on from a flick and settles, and the
// products lean into the turn and come back upright.

const N = PRODUCTS.length
// Canvas in CSS px, and in dots
const WIDTH = 360
const HEIGHT = 340
const W = WIDTH / DOT
const H = HEIGHT / DOT
// The front product's size and where its feet are, in dots
const SIZE = 128
const FLOOR = 156
// The ring: how wide it reads, how strong the perspective is, and where the
// horizon sits above the front product's feet
// From high up, so the products further round stand higher in the picture
// and show above the one at the front instead of hiding behind it. The ring
// is as wide as the card allows without cutting the side ones off.
const RADIUS = 104
const CAMERA = 2.4
const HORIZON = 140
// Dragging: CSS px per product, and how far a flick carries on, in seconds
const DRAG_STEP = 160
const COAST = 0.18
// A flick is read over the last moments of the drag, not the last event, and
// it has a top speed, in products per second: however hard you throw it, the
// ring lands on the product next to the one the drag started from
const SAMPLE = 0.1
const MAX_VELOCITY = 5
// Products lean against the turn, as if their feet were dragged along, and
// come back upright once it stops, without rocking
const LEAN = 0.06
const LEAN_MAX = 0.12
const LEAN_STIFFNESS = 90
const LEAN_DAMPING = 20
// Where a product's feet are on its 100×100 board, and room around it
const FEET = 86
const BOX = 180
// Anything this close to the front counts as the front one
const FRONT = 0.98
// Coming round to the front, a product goes from silhouette to full detail
// over the last stretch of the way, instead of switching on arrival
const DETAIL_FROM = 0.5

// Each product is a detent: near it the ring resists the drag, past halfway
// it gives and falls toward the next one. 0 is no resistance; 1 doesn't move
// at all on leaving a product.
const DETENT = 0.4

const wrap = (i: number) => ((i % N) + N) % N

/** Where the ring is, for where the drag has taken it. */
function detent(raw: number) {
	const n = Math.round(raw)
	const a = Math.abs(raw - n)
	// Flat leaving the product, steep at the halfway point; both meet at 0.5
	return n + Math.sign(raw - n) * ((1 - DETENT) * a + 2 * DETENT * a * a)
}

/** How fast the ring moves for the drag, at a point of the drag. */
function detentSlope(raw: number) {
	return 1 - DETENT + 4 * DETENT * Math.abs(raw - Math.round(raw))
}

/** The drag that would have the ring where it is: detent, undone. */
function undetent(rotation: number) {
	const n = Math.round(rotation)
	const e = Math.abs(rotation - n)
	const b = 1 - DETENT
	const a = (Math.sqrt(b * b + 8 * DETENT * e) - b) / (4 * DETENT)
	return n + Math.sign(rotation - n) * a
}

/** The ring's speed at release, in products per second. A pointer held still
 * before letting go throws nothing. */
function flick(samples: { x: number; t: number }[], now: number) {
	const first = samples[0]
	const last = samples[samples.length - 1]
	if (!first || now - last.t > SAMPLE * 1000) return 0
	const dt = Math.max(last.t - first.t, 16) / 1000
	const velocity = -(last.x - first.x) / DRAG_STEP / dt
	return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity))
}

type Placed = {
	index: number
	depth: number
	scale: number
	x: number
	y: number
}

/** Where each product stands for a turn of the ring, back to front. */
function place(rotation: number): Placed[] {
	return PRODUCTS.map((_, index) => {
		const angle = ((index - rotation) / N) * Math.PI * 2
		// 1 at the front, -1 at the back
		const depth = Math.cos(angle)
		const scale = (CAMERA - 1) / (CAMERA - depth)
		return {
			index,
			depth,
			scale,
			x: W / 2 + Math.sin(angle) * RADIUS * scale,
			y: FLOOR - HORIZON + HORIZON * scale,
		}
	}).sort((a, b) => a.depth - b.depth)
}

export function Showroom({
	covered,
	pick,
}: {
	// A receipt is over it: it's out of reach
	covered: boolean
	pick: (product: Product) => void
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const rotation = useMotionValue(0)
	const [index, setIndex] = useState(0)
	// Announce the product at the front only once the ring has been turned,
	// not on load
	const [turned, setTurned] = useState(false)
	const hintId = useId()
	const reduce = useReducedMotion()
	const drag = useRef({
		active: false,
		moved: false,
		startX: 0,
		start: 0,
		// Recent pointer positions, to read the flick from
		samples: [] as { x: number; t: number }[],
		// Where the drag has taken the ring, before the detent
		raw: 0,
	})
	const turning = useRef<AnimationPlaybackControls | null>(null)
	const placed = useRef<Placed[]>([])
	const product = PRODUCTS[index]

	useEffect(
		() =>
			rotation.on('change', (r) => {
				const next = wrap(Math.round(r))
				setIndex((i) => (i === next ? i : next))
				setTurned(true)
			}),
		[rotation],
	)

	const turnTo = (target: number, velocity = rotation.getVelocity()) => {
		turning.current?.stop()
		turning.current = animate(
			rotation,
			target,
			reduce ? { duration: 0 } : { ...TURN, velocity },
		)
	}
	// The shortest way round to a product
	const bring = (i: number) => {
		const r = rotation.get()
		const delta = ((((i - r) % N) + N + N / 2) % N) - N / 2
		turnTo(Math.round(r + delta))
	}

	// The product under a point on the canvas, nearest first
	const hit = (clientX: number, clientY: number) => {
		const canvas = canvasRef.current
		if (!canvas) return null
		const rect = canvas.getBoundingClientRect()
		// The lab may show the demo scaled down
		const x = ((clientX - rect.left) / rect.width) * W
		const y = ((clientY - rect.top) / rect.height) * H
		for (const p of [...placed.current].reverse()) {
			const k = (SIZE * p.scale) / 100
			if (
				x > p.x - 42 * k &&
				x < p.x + 42 * k &&
				y > p.y - (FEET - 6) * k &&
				y < p.y + 4 * k
			)
				return p
		}
		return null
	}

	// One loop draws the ring wherever the rotation has it, with the products
	// leaning as it turns. It only redraws when something has moved.
	useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas?.getContext('2d', { willReadFrequently: true })
		if (!canvas || !ctx) return
		canvas.width = W
		canvas.height = H
		const box = document.createElement('canvas')
		box.width = BOX
		box.height = BOX
		const bctx = box.getContext('2d')
		if (!bctx) return

		let frame = 0
		let last = 0
		let previous = rotation.get()
		let lean = 0
		let leanVelocity = 0
		let drawn = ''

		const render = (r: number) => {
			ctx.clearRect(0, 0, W, H)
			const items = place(r)
			placed.current = items
			for (const p of items) {
				const k = (SIZE * p.scale) / 100
				const item = PRODUCTS[p.index]
				bctx.clearRect(0, 0, BOX, BOX)
				bctx.save()
				bctx.translate(BOX / 2 - 50 * k, BOX - 14 - FEET * k)
				bctx.scale(k, k)
				floorShadow(bctx, ...item.shadow)
				// The lean pivots on the feet, so the shadow stays put
				bctx.translate(50, FEET)
				bctx.rotate(lean)
				bctx.translate(-50, -FEET)
				item.draw(bctx)
				bctx.restore()
				const x = p.x - BOX / 2
				const y = p.y - (BOX - 14)
				const t = Math.min(
					1,
					Math.max(0, (p.depth - DETAIL_FROM) / (1 - DETAIL_FROM)),
				)
				const detail = t * t * (3 - 2 * t)
				// Away from the front, only the shape is printed, lighter the
				// further back it stands; nearing it, the detail fades in on top
				if (detail < 1) {
					ctx.save()
					ctx.filter = 'brightness(0)'
					ctx.globalAlpha = (0.4 - 0.04 * (1 - p.depth)) * (1 - detail)
					ctx.drawImage(box, x, y)
					ctx.restore()
				}
				if (detail > 0) {
					ctx.save()
					ctx.globalAlpha = detail
					ctx.drawImage(box, x, y)
					ctx.restore()
				}
			}
			const image = ctx.getImageData(0, 0, W, H)
			ditherInk(image)
			ctx.putImageData(image, 0, 0)
		}

		const tick = (now: number) => {
			const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
			last = now
			const r = rotation.get()
			if (dt > 0 && !reduce) {
				// Lean against the turn, then spring back upright
				const speed = (r - previous) / dt
				const target = Math.max(-LEAN_MAX, Math.min(LEAN_MAX, -speed * LEAN))
				leanVelocity +=
					((target - lean) * LEAN_STIFFNESS - leanVelocity * LEAN_DAMPING) * dt
				lean += leanVelocity * dt
				if (Math.abs(lean) < 0.0005 && Math.abs(leanVelocity) < 0.001) {
					lean = 0
					leanVelocity = 0
				}
			}
			previous = r
			const key = `${r.toFixed(4)}:${lean.toFixed(4)}`
			if (key !== drawn) {
				render(r)
				drawn = key
				frame = requestAnimationFrame(tick)
				return
			}
			// Nothing moved and nothing is leaning: sleep until the ring turns
			if (lean === 0 && leanVelocity === 0) {
				frame = 0
				last = 0
				return
			}
			frame = requestAnimationFrame(tick)
		}
		const wake = () => {
			if (!frame) frame = requestAnimationFrame(tick)
		}
		wake()
		const unsubscribe = rotation.on('change', wake)
		return () => {
			unsubscribe()
			cancelAnimationFrame(frame)
		}
	}, [reduce, rotation])

	const onPointerDown = (e: React.PointerEvent) => {
		// Keep the drag when the pointer leaves the canvas
		if (e.isTrusted) e.currentTarget.setPointerCapture(e.pointerId)
		turning.current?.stop()
		turning.current = null
		drag.current = {
			active: true,
			moved: false,
			startX: e.clientX,
			// Picked up mid-turn, the drag carries on from where the ring is
			start: undetent(rotation.get()),
			samples: [{ x: e.clientX, t: e.timeStamp }],
			raw: undetent(rotation.get()),
		}
	}
	// A drag that ends without a release we can read (let go outside the
	// window, capture lost, the browser took the gesture): settle on the
	// nearest product, or the ring is left between two and keeps following
	// the pointer
	const abandon = () => {
		const d = drag.current
		if (!d.active) return
		d.active = false
		if (d.moved) turnTo(Math.round(rotation.get()))
	}

	const onPointerMove = (e: React.PointerEvent) => {
		const d = drag.current
		if (!d.active) return
		// No button held: the release never reached us
		if (e.pointerType === 'mouse' && e.buttons === 0) return abandon()
		const dx = e.clientX - d.startX
		if (Math.abs(dx) > 4) d.moved = true
		if (!d.moved) return
		d.samples.push({ x: e.clientX, t: e.timeStamp })
		while (e.timeStamp - d.samples[0].t > SAMPLE * 1000) d.samples.shift()
		d.raw = d.start - dx / DRAG_STEP
		rotation.set(detent(d.raw))
	}
	const onPointerUp = (e: React.PointerEvent) => {
		const d = drag.current
		if (!d.active) return
		d.active = false
		if (d.moved) {
			// Where the flick would carry it, to the nearest product, keeping
			// the speed it was let go at
			const r = rotation.get()
			// The speed the ring itself had on screen, not the pointer's: the
			// detent had it slower near a product and faster past halfway
			const velocity = flick(d.samples, e.timeStamp) * detentSlope(d.raw)
			// Never past the product next to the one the drag started from,
			// unless the drag itself already went further
			const from = Math.round(d.start)
			const reach = Math.max(1, Math.abs(Math.round(r) - from))
			const target = Math.round(r + velocity * COAST)
			turnTo(Math.max(from - reach, Math.min(from + reach, target)), velocity)
			return
		}
		const target = hit(e.clientX, e.clientY)
		if (!target) return
		if (target.depth > FRONT) pick(PRODUCTS[target.index])
		else bring(target.index)
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			pick(product)
			return
		}
		const by = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
		if (!by) return
		// Keep the arrows from scrolling the page
		e.preventDefault()
		turnTo(Math.round(rotation.get()) + by)
	}

	return (
		<div
			className='absolute inset-0 flex items-center justify-center'
			inert={covered}
		>
			<canvas
				ref={canvasRef}
				tabIndex={0}
				// Enter prints the product at the front: that's what it does
				role='button'
				aria-roledescription='carousel'
				aria-label={`${product.name}, €${product.price}`}
				aria-describedby={hintId}
				onKeyDown={onKeyDown}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={abandon}
				onLostPointerCapture={abandon}
				className='cursor-grab touch-pan-y outline-offset-4 active:cursor-grabbing'
				style={{ width: WIDTH, height: HEIGHT, imageRendering: 'pixelated' }}
			/>
			<span id={hintId} className='sr-only'>
				Arrows to turn, Enter to print.
			</span>
			<span aria-live='polite' className='sr-only'>
				{turned ? `${product.name}, €${product.price}` : ''}
			</span>
		</div>
	)
}
