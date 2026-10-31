'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
	animate,
	useMotionValue,
	useReducedMotion,
	type AnimationPlaybackControls,
} from 'motion/react'
import { TURN } from './constants'
import { PRODUCTS, type Product } from './data'
import { DOT, SHADOWS, ditherInk, drawProduct, floorShadow } from './dither'

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
const RADIUS = 80
const CAMERA = 2.4
const HORIZON = 80
// Dragging: CSS px per product, and how far a flick carries on, in seconds
const DRAG_STEP = 140
const COAST = 0.18
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

const wrap = (i: number) => ((i % N) + N) % N

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
	const reduce = useReducedMotion()
	const drag = useRef({
		active: false,
		moved: false,
		startX: 0,
		start: 0,
		lastX: 0,
		lastT: 0,
		// Products per second
		velocity: 0,
	})
	const turning = useRef<AnimationPlaybackControls | null>(null)
	const placed = useRef<Placed[]>([])
	const product = PRODUCTS[index]

	useEffect(
		() =>
			rotation.on('change', (r) => {
				const next = wrap(Math.round(r))
				setIndex((i) => (i === next ? i : next))
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
				const scene = PRODUCTS[p.index].id
				bctx.clearRect(0, 0, BOX, BOX)
				bctx.save()
				bctx.translate(BOX / 2 - 50 * k, BOX - 14 - FEET * k)
				bctx.scale(k, k)
				const shadow = SHADOWS[scene]
				if (shadow) floorShadow(bctx, ...shadow)
				// The lean pivots on the feet, so the shadow stays put
				bctx.translate(50, FEET)
				bctx.rotate(lean)
				bctx.translate(-50, -FEET)
				drawProduct(bctx, scene)
				bctx.restore()
				ctx.save()
				// Away from the front, only the shape is printed, lighter the
				// further back it stands
				if (p.depth < FRONT) {
					ctx.filter = 'brightness(0)'
					ctx.globalAlpha = 0.5 - 0.15 * (1 - p.depth)
				}
				ctx.drawImage(box, p.x - BOX / 2, p.y - (BOX - 14))
				ctx.restore()
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
			}
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
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
			start: rotation.get(),
			lastX: e.clientX,
			lastT: e.timeStamp,
			velocity: 0,
		}
	}
	const onPointerMove = (e: React.PointerEvent) => {
		const d = drag.current
		if (!d.active) return
		const dx = e.clientX - d.startX
		if (Math.abs(dx) > 4) d.moved = true
		if (!d.moved) return
		const dt = Math.max(e.timeStamp - d.lastT, 1) / 1000
		d.velocity = -(e.clientX - d.lastX) / DRAG_STEP / dt
		d.lastX = e.clientX
		d.lastT = e.timeStamp
		rotation.set(d.start - dx / DRAG_STEP)
	}
	const onPointerUp = (e: React.PointerEvent) => {
		const d = drag.current
		if (!d.active) return
		d.active = false
		if (d.moved) {
			// Where the flick would carry it, to the nearest product, keeping
			// the speed it was let go at
			const coast = rotation.get() + d.velocity * COAST
			turnTo(Math.round(coast), d.velocity)
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
			className='absolute inset-0 flex flex-col items-center justify-center gap-5'
			inert={covered}
		>
			<canvas
				ref={canvasRef}
				tabIndex={0}
				role='listbox'
				aria-label={`Products. ${product.name}, €${product.price}. Arrows to turn, Enter to print.`}
				onKeyDown={onKeyDown}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={() => {
					const d = drag.current
					if (!d.active) return
					d.active = false
					if (d.moved) turnTo(Math.round(rotation.get()))
				}}
				className='cursor-grab touch-none outline-offset-4 active:cursor-grabbing'
				style={{ width: WIDTH, height: HEIGHT, imageRendering: 'pixelated' }}
			/>
			<div
				className='flex items-baseline justify-between text-[13px] leading-none uppercase'
				style={{ width: WIDTH - 40 }}
			>
				<span className='font-bold'>{product.name}</span>
				<span className='tabular-nums'>€{product.price}</span>
			</div>
		</div>
	)
}
