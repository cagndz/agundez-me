'use client'

import { useEffect, useRef } from 'react'

// Each thing on the page as an object, drawn the way the Lab's receipt draws
// its products: isometric solids in three flat tones (light top, mid left,
// dark front) with a fine edge. Then printed as a 1-bit dither in one ink,
// anchored to the bottom left and cut by the edges.

export type Shape =
	| 'mat'
	| 'cassette'
	| 'swatches'
	| 'layers'
	| 'openbox'
	| 'envelope'
	| 'x'
	| 'github'
	| 'linkedin'
	| 'none'

type Ctx = CanvasRenderingContext2D
type Tones = [string, string, string]

const TOP = '#d6d6d6'
const LEFT = '#8a8a8a'
const RIGHT = '#2e2e2e'
const PART: Tones = ['#f2f2f2', '#a0a0a0', '#444']
const C30 = Math.cos(Math.PI / 6)

const EDGE = '#111'

function iso(ctx: Ctx, w: number, d: number) {
	const p = (x: number, y: number, z: number): [number, number] => [
		50 + (x - y) * C30,
		86 - (x + y + (w + d) / 2) / 2 - z,
	]
	const stroke = () => {
		ctx.strokeStyle = EDGE
		ctx.lineWidth = 0.6
		ctx.lineJoin = 'round'
		ctx.stroke()
	}
	const poly = (pts: [number, number][], fill: string) => {
		ctx.beginPath()
		pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
		ctx.closePath()
		ctx.fillStyle = fill
		ctx.fill()
		stroke()
	}
	const box = (
		x: number,
		y: number,
		z: number,
		bw: number,
		bd: number,
		h: number,
		[top, left, right]: Tones = [TOP, LEFT, RIGHT],
	) => {
		const x0 = x - bw / 2
		const y0 = y - bd / 2
		const x1 = x0 + bw
		const y1 = y0 + bd
		poly([p(x0, y0, z), p(x0, y1, z), p(x0, y1, z + h), p(x0, y0, z + h)], left)
		poly(
			[p(x0, y0, z), p(x1, y0, z), p(x1, y0, z + h), p(x0, y0, z + h)],
			right,
		)
		poly(
			[p(x0, y0, z + h), p(x1, y0, z + h), p(x1, y1, z + h), p(x0, y1, z + h)],
			top,
		)
	}
	const cylinder = (
		x: number,
		y: number,
		z: number,
		r: number,
		h: number,
		[top, left, right]: Tones = [TOP, LEFT, RIGHT],
	) => {
		const [bx, by] = p(x, y, z)
		const [tx, ty] = p(x, y, z + h)
		const rx = r * Math.SQRT2 * C30
		const ry = r * Math.SQRT1_2
		const g = ctx.createLinearGradient(bx - rx, 0, bx + rx, 0)
		g.addColorStop(0, left)
		g.addColorStop(0.5, left)
		g.addColorStop(0.5, right)
		g.addColorStop(1, right)
		ctx.fillStyle = g
		ctx.beginPath()
		ctx.moveTo(tx - rx, ty)
		ctx.lineTo(bx - rx, by)
		ctx.ellipse(bx, by, rx, ry, 0, Math.PI, 0, true)
		ctx.lineTo(tx + rx, ty)
		ctx.closePath()
		ctx.fill()
		stroke()
		ctx.fillStyle = top
		ctx.beginPath()
		ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2)
		ctx.fill()
		stroke()
		return { tx, ty, rx, ry }
	}
	const face = (
		axes: [number, number, number, number],
		origin: [number, number],
		draw: () => void,
	) => {
		ctx.save()
		ctx.transform(...axes, ...origin)
		draw()
		ctx.restore()
	}
	/** Front face: u along x, v up. */
	const front = (x0: number, y0: number, z0: number, draw: () => void) =>
		face([C30, -0.5, 0, -1], p(x0, y0, z0), draw)
	/** Top face: u along x, v back along y. */
	const top = (x0: number, y0: number, z: number, draw: () => void) =>
		face([C30, -0.5, -C30, -0.5], p(x0, y0, z), draw)
	return { p, box, cylinder, front, top }
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, f: string) {
	ctx.fillStyle = f
	ctx.fillRect(x, y, w, h)
}

function line(ctx: Ctx, pts: [number, number][], color: string, width = 0.9) {
	ctx.strokeStyle = color
	ctx.lineWidth = width
	ctx.beginPath()
	pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
	ctx.stroke()
}

function ring(ctx: Ctx, x: number, y: number, r: number, f: string) {
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2)
	ctx.fillStyle = f
	ctx.fill()
}

// Marks for the places to find me: flat, filled with a soft gradient so the
// dither has something to work with.
const MARKS: Record<'x' | 'github' | 'linkedin', [number, string]> = {
	x: [
		24,
		'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
	],
	github: [
		16,
		'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z',
	],
	linkedin: [
		24,
		'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.91v6.329zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
	],
}

function mark(ctx: Ctx, kind: keyof typeof MARKS) {
	const [box, d] = MARKS[kind]
	const size = 56
	ctx.save()
	ctx.translate(50 - size / 2, 58 - size / 2)
	ctx.scale(size / box, size / box)
	const path = new Path2D(d)
	const g = ctx.createLinearGradient(0, 0, box, box)
	g.addColorStop(0, '#9a9a9a')
	g.addColorStop(1, '#4a4a4a')
	ctx.fillStyle = g
	ctx.fill(path)
	ctx.restore()
}

const ART: Record<Shape, (ctx: Ctx) => void> = {
	x: (ctx) => mark(ctx, 'x'),
	github: (ctx) => mark(ctx, 'github'),
	linkedin: (ctx) => mark(ctx, 'linkedin'),
	none: () => {},
	// A cutting mat with a bézier on it, handles out, and a pen across
	mat(ctx) {
		const { box, top } = iso(ctx, 64, 46)
		box(0, 0, 0, 64, 46, 2)
		top(-32, -23, 2, () => {
			for (let i = 1; i < 8; i++)
				line(
					ctx,
					[
						[i * 8, 2],
						[i * 8, 44],
					],
					'#bcbcbc',
					0.35,
				)
			for (let i = 1; i < 6; i++)
				line(
					ctx,
					[
						[2, i * 8],
						[62, i * 8],
					],
					'#bcbcbc',
					0.35,
				)
			ctx.strokeStyle = RIGHT
			ctx.lineWidth = 1.4
			ctx.beginPath()
			ctx.moveTo(8, 34)
			ctx.bezierCurveTo(14, 4, 46, 44, 56, 12)
			ctx.stroke()
			line(
				ctx,
				[
					[8, 34],
					[14, 4],
				],
				LEFT,
				0.6,
			)
			line(
				ctx,
				[
					[56, 12],
					[46, 44],
				],
				LEFT,
				0.6,
			)
			for (const [x, y] of [
				[8, 34],
				[56, 12],
			])
				rect(ctx, x - 1.6, y - 1.6, 3.2, 3.2, RIGHT)
			for (const [x, y] of [
				[14, 4],
				[46, 44],
			])
				ring(ctx, x, y, 1.4, LEFT)
		})
		// The pen, lying across the mat: a body, a ferrule, a tip
		box(4, 12, 2, 34, 3.2, 3.2, PART)
		box(-15, 12, 2, 4, 3.2, 3.2)
		box(-19, 12, 2, 4, 2, 2, ['#555', '#333', '#111'])
	},
	// A cassette, standing: a label, a window, two reels
	cassette(ctx) {
		const { box, front } = iso(ctx, 56, 9)
		box(0, 0, 0, 56, 9, 36)
		front(-28, -4.5, 0, () => {
			rect(ctx, 4, 20, 48, 13, TOP)
			for (let i = 0; i < 3; i++)
				rect(ctx, 8, 30 - i * 3, 22 + i * 6, 0.8, LEFT)
			rect(ctx, 14, 6, 28, 11, '#4a4a4a')
			for (const x of [20, 36]) {
				ring(ctx, x, 11.5, 4.2, TOP)
				ring(ctx, x, 11.5, 1.8, RIGHT)
			}
			rect(ctx, 24, 2, 8, 2, LEFT)
		})
	},
	// Swatches stacked; the top one a page of code with one line inked
	swatches(ctx) {
		const { box, top } = iso(ctx, 48, 34)
		box(4, 4, 0, 48, 34, 2.4, ['#bdbdbd', '#6e6e6e', '#222'])
		box(2, 2, 7, 48, 34, 2.4, ['#c9c9c9', '#7a7a7a', '#2a2a2a'])
		box(0, 0, 14, 48, 34, 2.4)
		top(-24, -17, 16.4, () => {
			;[30, 18, 36, 22, 28, 14, 32].forEach((l, i) =>
				rect(ctx, 5, 4 + i * 4, l, 1.5, i === 2 ? RIGHT : LEFT),
			)
		})
	},
	// Compositor layers: three panes floating apart, one element promoted
	layers(ctx) {
		const { box, top } = iso(ctx, 46, 34)
		const panes: [number, Tones][] = [
			[0, ['#b8b8b8', '#6a6a6a', '#202020']],
			[13, ['#cfcfcf', '#7e7e7e', '#2a2a2a']],
			[26, ['#e6e6e6', '#949494', '#3a3a3a']],
		]
		panes.forEach(([z, t], i) => {
			box(0, 0, z, 46, 34, 1.4, t)
			top(-23, -17, z + 1.4, () => {
				if (i === 1) rect(ctx, 14, 9, 16, 16, RIGHT)
				if (i === 2) {
					rect(ctx, 4, 4, 22, 2, LEFT)
					rect(ctx, 4, 8, 14, 2, LEFT)
				}
			})
		})
	},
	// A box that mounts open: the lid already up
	openbox(ctx) {
		const { box, top } = iso(ctx, 40, 40)
		box(0, 20, 22, 40, 2, 20, PART)
		box(0, 0, 0, 40, 40, 22)
		top(-20, -20, 22, () => {
			rect(ctx, 2.5, 2.5, 35, 35, '#3a3a3a')
			rect(ctx, 2.5, 30, 35, 7.5, '#6a6a6a')
		})
	},
	// An envelope, flap and stamp
	envelope(ctx) {
		const { box, top } = iso(ctx, 58, 38)
		box(0, 0, 0, 58, 38, 3)
		top(-29, -19, 3, () => {
			line(
				ctx,
				[
					[1, 37],
					[29, 16],
					[57, 37],
				],
				LEFT,
				0.9,
			)
			line(
				ctx,
				[
					[1, 1],
					[24, 18],
				],
				'#b0b0b0',
				0.6,
			)
			line(
				ctx,
				[
					[57, 1],
					[34, 18],
				],
				'#b0b0b0',
				0.6,
			)
			rect(ctx, 46, 4, 8, 9, RIGHT)
			rect(ctx, 47.5, 5.5, 5, 6, LEFT)
		})
	},
}

// ── Placement ────────────────────────────────────────────────────────

// Large, anchored to the bottom left, so the edges cut it.
// Every object prints at the same size and is cut the same way: its drawn
// bounds are measured once, scaled to one size, and set so the block's left
// and bottom edges cut into it.
const BOUNDS = new Map<
	Shape,
	{ x0: number; y0: number; x1: number; y1: number; area: number }
>()

function bounds(shape: Shape) {
	let b = BOUNDS.get(shape)
	if (b) return b
	const R = 4 // px per board unit while measuring
	const c = document.createElement('canvas')
	c.width = c.height = 100 * R
	const ctx = c.getContext('2d', { willReadFrequently: true })!
	ctx.scale(R, R)
	ART[shape](ctx)
	const data = ctx.getImageData(0, 0, c.width, c.height).data
	let x0 = c.width
	let y0 = c.height
	let x1 = 0
	let y1 = 0
	let count = 0
	for (let y = 0; y < c.height; y++)
		for (let x = 0; x < c.width; x++)
			if (data[(y * c.width + x) * 4 + 3] > 8) {
				count++
				if (x < x0) x0 = x
				if (x > x1) x1 = x
				if (y < y0) y0 = y
				if (y > y1) y1 = y
			}
	b =
		x1 > x0
			? {
					x0: x0 / R,
					y0: y0 / R,
					x1: x1 / R,
					y1: y1 / R,
					area: count / (R * R),
				}
			: { x0: 0, y0: 0, x1: 1, y1: 1, area: 1 }
	BOUNDS.set(shape, b)
	return b
}

function place(ctx: Ctx, w: number, h: number, shape: Shape) {
	const b = bounds(shape)
	// Two limits, whichever is tighter: the same ink area for all, and never
	// wider or taller than a fixed box. Small, so it stays in the background.
	const m = Math.min(w, h)
	const k = Math.min(
		(m * 0.3) / Math.sqrt(b.area),
		(m * 0.46) / Math.max(b.x1 - b.x0, b.y1 - b.y0),
	)
	const size = Math.max(b.x1 - b.x0, b.y1 - b.y0) * k
	// The left edge cuts 14% of it off, the bottom edge 20%
	ctx.translate(-size * 0.14 - b.x0 * k, h + size * 0.2 - b.y1 * k)
	ctx.scale(k, k)
}

// ── Sampling ─────────────────────────────────────────────────────────

const tone = (lum: number) =>
	Math.min(1, Math.max(0, (lum - 0.5) * 1.35 + 0.52))

function sample(shape: Shape, w: number, h: number, sx: number, sy: number) {
	const c = document.createElement('canvas')
	c.width = Math.max(1, Math.round(w))
	c.height = Math.max(1, Math.round(h))
	const ctx = c.getContext('2d', { willReadFrequently: true })!
	place(ctx, w, h, shape)
	ART[shape](ctx)
	const data = ctx.getImageData(0, 0, c.width, c.height).data
	const out: number[] = []
	for (let y = sy / 2; y < h; y += sy) {
		for (let x = sx / 2; x < w; x += sx) {
			const i = (Math.floor(y) * c.width + Math.floor(x)) * 4
			const a = data[i + 3] / 255
			const lum =
				(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
			out.push(a === 0 ? 0 : a * (1 - tone(lum)))
		}
	}
	return out
}

// 8×8 Bayer thresholds, 0–1
const BAYER = (() => {
	let m = [[0]]
	while (m.length < 8) {
		const n = m.length
		const next: number[][] = []
		for (let y = 0; y < n * 2; y++) {
			next[y] = []
			for (let x = 0; x < n * 2; x++)
				next[y][x] =
					m[y % n][x % n] * 4 + [0, 2, 3, 1][(y < n ? 0 : 2) + (x < n ? 0 : 1)]
		}
		m = next
	}
	return m.map((r) => r.map((v) => (v + 0.5) / 64))
})()

// One printed pixel, in CSS px
const DOT = 3

// ── The print ────────────────────────────────────────────────────────

/** An object printed as a 1-bit ordered dither in one ink. A new object
 * takes over fast: the old one leaves in ~120ms while the new one arrives
 * right behind it. Pixels swell under the pointer, like a loupe. */
export function Print({
	shape,
	color,
	className = '',
}: {
	shape: Shape
	color: string
	className?: string
}) {
	const canvas = useRef<HTMLCanvasElement>(null)
	const api = useRef<{ set: (s: Shape) => void }>({ set: () => {} })

	useEffect(() => {
		const c = canvas.current
		const ctx = c?.getContext('2d')
		if (!c || !ctx) return
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
		let w = 0
		let h = 0
		let cache = new Map<Shape, number[]>()
		let from: number[] = []
		let to: number[] = []
		let current: Shape = shape
		let t = 1
		let px = 0
		let py = 0
		let pa = 0
		let inside = false
		let raf = 0
		let last = 0

		const get = (s: Shape) => {
			let v = cache.get(s)
			if (!v) {
				v = sample(s, w, h, DOT, DOT)
				cache.set(s, v)
			}
			return v
		}

		// What's on screen at this point of a change
		const mix = (a: number, b: number) => {
			if (t >= 1) return b
			const out = Math.max(0, 1 - t / 0.35)
			const inn = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - 0.1) / 0.9)), 3)
			return Math.max(a * out * out, b * inn)
		}

		const size = () => {
			const dpr = window.devicePixelRatio || 1
			w = c.clientWidth
			h = c.clientHeight
			c.width = w * dpr
			c.height = h * dpr
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			cache = new Map()
			to = from = w && h ? get(current) : []
			t = 1
		}

		const draw = () => {
			ctx.clearRect(0, 0, w, h)
			if (!to.length) return
			ctx.fillStyle = color
			ctx.beginPath()
			const sigma = Math.min(w, h) * 0.12
			let i = 0
			for (let y = DOT / 2; y < h; y += DOT) {
				for (let x = DOT / 2; x < w; x += DOT, i++) {
					let v = mix(from[i], to[i])
					if (pa > 0.01) {
						const d2 = (x - px) ** 2 + (y - py) ** 2
						// The loupe only darkens ink that's there; empty paper stays empty.
						v += 0.6 * pa * Math.exp(-d2 / (2 * sigma * sigma)) * v
					}
					const bx = Math.floor(x / DOT) % 8
					const by = Math.floor(y / DOT) % 8
					if (Math.min(1, v) > BAYER[by][bx])
						ctx.rect(x - DOT / 2, y - DOT / 2, DOT, DOT)
				}
			}
			ctx.fill()
		}

		const tick = (now: number) => {
			const dt = Math.min((now - (last || now)) / 1000, 1 / 30) || 1 / 60
			last = now
			let busy = false
			if (t < 1) {
				t = reduce ? 1 : Math.min(1, t + dt / 0.36)
				busy = true
			}
			const target = inside && !reduce ? 1 : 0
			pa += (target - pa) * Math.min(1, dt * 10)
			if (Math.abs(target - pa) > 0.005) busy = true
			draw()
			raf = busy ? requestAnimationFrame(tick) : 0
			if (!busy) last = 0
		}
		const kick = () => {
			if (!raf) raf = requestAnimationFrame(tick)
		}

		api.current.set = (s: Shape) => {
			if (s === current || !w) {
				current = s
				return
			}
			from = to.map((b, i) => mix(from[i], b))
			current = s
			to = get(s)
			t = 0
			kick()
		}

		// Only while the pointer is over the print is there anything to do.
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return
			const r = c.getBoundingClientRect()
			px = e.clientX - r.left
			py = e.clientY - r.top
			const now = px >= 0 && py >= 0 && px <= r.width && py <= r.height
			if (now || inside) {
				inside = now
				kick()
			}
		}

		size()
		draw()
		const ro = new ResizeObserver(() => {
			size()
			draw()
		})
		ro.observe(c)
		window.addEventListener('pointermove', onMove, { passive: true })
		return () => {
			ro.disconnect()
			window.removeEventListener('pointermove', onMove)
			cancelAnimationFrame(raf)
		}
		// Shape changes go through api.set; this effect owns the canvas.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [color])

	useEffect(() => {
		api.current.set(shape)
	}, [shape])

	return (
		<canvas ref={canvas} aria-hidden='true' className={`block ${className}`} />
	)
}
