'use client'

import { type RefObject, useEffect, useRef } from 'react'

// Each thing on the page as an object, drawn the way the Lab's receipt draws
// its products: isometric solids in three flat tones (light top, mid left,
// dark front) with a fine edge. Then printed as a 1-bit dither in one ink,
// anchored to the bottom left and cut by the edges.

export type Shape =
	| 'tubes'
	| 'cassette'
	| 'laptop'
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

// The places to find me, as objects like the rest: a key, the mark printed
// on its top
function tile(ctx: Ctx, kind: keyof typeof MARKS) {
	const { box, top } = iso(ctx, 40, 40)
	box(0, 0, 0, 40, 40, 22, ['#e6e6e6', '#9a9a9a', '#5a5a5a'])
	top(-20, -20, 22, () => {
		// The top face turns whatever is drawn on it by 45°. Laying the mark
		// along the face's diagonals keeps it upright on screen, foreshortened
		// like a legend seen on a key from above.
		const [size, d] = MARKS[kind]
		const k = 13.5 / size
		ctx.save()
		ctx.translate(20, 20)
		ctx.transform(k, -k, -k, -k, 0, 0)
		ctx.translate(-size / 2, -size / 2)
		ctx.fillStyle = '#262626'
		ctx.fill(new Path2D(d))
		ctx.restore()
	})
}

const ART: Record<Shape, (ctx: Ctx) => void> = {
	x: (ctx) => tile(ctx, 'x'),
	github: (ctx) => tile(ctx, 'github'),
	linkedin: (ctx) => tile(ctx, 'linkedin'),
	none: () => {},
	// Lab: a rack of test tubes, each filled to a different level
	tubes(ctx) {
		const { box, cylinder } = iso(ctx, 52, 16)
		const GLASS: Tones = ['#c8c8c8', '#ececec', '#d2d2d2']
		const LIQUID: Tones = ['#5a5a5a', '#3a3a3a', '#1c1c1c']
		// Back to front, so the nearer tube covers the one behind it
		for (const [x, level] of [
			[16, 12],
			[0, 24],
			[-16, 6],
		]) {
			cylinder(x, 0, 6, 5.2, 36, GLASS)
			cylinder(x, 0, 6, 5, level, LIQUID)
		}
		box(0, 0, 0, 52, 16, 8, ['#b4b4b4', '#6a6a6a', '#8e8e8e'])
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
	// Silex: a laptop with a dark theme on it, one line in colour
	laptop(ctx) {
		const { box, front, top } = iso(ctx, 56, 40)
		box(0, 19, 3, 56, 2.5, 34, ['#bdbdbd', '#6e6e6e', '#1c1c1c'])
		front(-28, 17.75, 3, () => {
			;[18, 30, 14, 34, 24, 20, 28].forEach((l, i) =>
				rect(
					ctx,
					5 + (i % 3 === 1 ? 4 : 0),
					28 - i * 3.6,
					l,
					1.6,
					i === 3 ? '#f4f4f4' : '#5e5e5e',
				),
			)
		})
		box(0, 0, 0, 56, 40, 3, ['#d6d6d6', '#8a8a8a', '#4a4a4a'])
		top(-28, -20, 3, () => {
			for (let r = 0; r < 4; r++)
				for (let c = 0; c < 12; c++)
					rect(ctx, 5 + c * 3.9, 20 + r * 3.9, 3, 3, '#9a9a9a')
			rect(ctx, 20, 4, 16, 10, '#c4c4c4')
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
	// Email: an envelope standing, a letter pulled half out of it
	envelope(ctx) {
		const { box, front } = iso(ctx, 52, 6)
		box(0, 1, 6, 44, 1.5, 26, ['#f6f6f6', '#d0d0d0', '#f4f4f4'])
		front(-22, 0.25, 6, () => {
			;[30, 22, 34, 18].forEach((l, i) =>
				rect(ctx, 5, 22 - i * 3.4, l, 1.3, '#3a3a3a'),
			)
		})
		box(0, -2, 0, 52, 3, 20, ['#9a9a9a', '#5a5a5a', '#a4a4a4'])
		front(-26, -3.5, 0, () => {
			line(
				ctx,
				[
					[0.5, 19.5],
					[26, 7],
					[51.5, 19.5],
				],
				'#f0f0f0',
				1.4,
			)
			rect(ctx, 42, 3, 6, 6.5, '#e8e8e8')
			rect(ctx, 43.2, 4.2, 3.6, 4.1, '#2a2a2a')
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

// Every object fits the same square box, scaled by its longer side, so all
// of them read at one size; nearly square drawings keep width and height
// close too. Each is cut by the block's edges by the same share of itself.
const BOX = 0.42
const CUT_X = 0.14
const CUT_Y = 0.2

function place(ctx: Ctx, w: number, h: number, shape: Shape) {
	const b = bounds(shape)
	const bw = b.x1 - b.x0
	const bh = b.y1 - b.y0
	const k = (Math.min(w, h) * BOX) / Math.max(bw, bh)
	ctx.translate(-bw * k * CUT_X - b.x0 * k, h + bh * k * CUT_Y - b.y1 * k)
	ctx.scale(k, k)
	// What stays on screen once the edges have cut it
	return Math.min(w, bw * k * (1 - CUT_X)) * Math.min(h, bh * k * (1 - CUT_Y))
}

// ── Sampling ─────────────────────────────────────────────────────────

const tone = (lum: number) =>
	Math.min(1, Math.max(0, (lum - 0.5) * 1.35 + 0.52))

function sample(shape: Shape, w: number, h: number, sx: number, sy: number) {
	const c = document.createElement('canvas')
	c.width = Math.max(1, Math.round(w))
	c.height = Math.max(1, Math.round(h))
	const ctx = c.getContext('2d', { willReadFrequently: true })!
	const visible = place(ctx, w, h, shape)
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
	// The same amount of ink for every object: its tones are scaled until
	// the lit dots cover INK of its visible box. Relative tones are kept, so
	// the faces still read apart.
	const target = (INK * visible) / (sx * sy)
	let gain = 1
	for (let n = 0; n < 6; n++) {
		let sum = 0
		for (const v of out) sum += Math.min(1, v * gain)
		if (!sum) break
		gain = Math.min(4, Math.max(0.4, gain * (target / sum)))
	}
	return out.map((v) => Math.min(1, v * gain))
}

const INK = 0.3

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

// The loupe, as a share of the block's shorter side
const RADIUS = 0.12
// Each dot sits on a spring to where the loupe pushes it: one small
// overshoot, at rest in ~400ms, no wobble once the pointer has gone
const K = 180
const C = 20

/** An object printed as a 1-bit ordered dither in one ink. A new object
 * takes over fast: the old one leaves in ~120ms while the new one arrives
 * right behind it.
 *
 * Over the block, the pointer is a loupe: a field of dots rises from the
 * paper around it and it pushes a crater into them, harder the faster it
 * moves. Near the type in `text`, the type is printed too, in dots the
 * crater pushes like the rest: solid at the loupe's rim, where they take
 * over from the real type (`onLens` says where, to mask it out), thinning
 * toward the centre. */
export function Print({
	shape,
	color,
	text,
	onLens,
	className = '',
}: {
	shape: Shape
	color: string
	text?: RefObject<HTMLElement | null>
	onLens?: (x: number, y: number, r: number) => void
	className?: string
}) {
	const canvas = useRef<HTMLCanvasElement>(null)
	const api = useRef<{ set: (s: Shape) => void }>({ set: () => {} })
	const lensCb = useRef(onLens)
	useEffect(() => {
		lensCb.current = onLens
	})

	useEffect(() => {
		const c = canvas.current
		const ctx = c?.getContext('2d')
		if (!c || !ctx) return
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
		let w = 0
		let h = 0
		let cols = 0
		let rows = 0
		let cache = new Map<Shape, number[]>()
		let from: number[] = []
		let to: number[] = []
		let current: Shape = shape
		let t = 1
		// Per dot: offset and velocity
		let ox = new Float32Array(0)
		let oy = new Float32Array(0)
		let vx = new Float32Array(0)
		let vy = new Float32Array(0)
		// Raw pointer, where the field is centred, its speed, its presence
		let px = 0
		let py = 0
		let sx = 0
		let sy = 0
		let lastPx = 0
		let lastPy = 0
		let speed = 0
		let pa = 0
		let inside = false
		let raf = 0
		let last = 0
		// The type as dot coverage per cell, and its box
		let glyph = new Float32Array(0)
		let tb = { x0: 0, y0: 0, x1: 0, y1: 0 }
		let glyphDirty = true

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
			cols = 0
			for (let x = DOT / 2; x < w; x += DOT) cols++
			rows = 0
			for (let y = DOT / 2; y < h; y += DOT) rows++
			const n = cols * rows
			ox = new Float32Array(n)
			oy = new Float32Array(n)
			vx = new Float32Array(n)
			vy = new Float32Array(n)
			cache = new Map()
			to = from = w && h ? get(current) : []
			t = 1
			glyphDirty = true
		}

		// The type rasterised to the dot grid. Each character is drawn where
		// the layout put it (a Range per character), so kerning is kept and
		// the DOM never has to be split into letters.
		const buildGlyph = () => {
			glyphDirty = false
			glyph = new Float32Array(cols * rows)
			tb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
			const root = text?.current
			if (!root || !w || !h) return
			const off = document.createElement('canvas')
			off.width = w
			off.height = h
			const g = off.getContext('2d', { willReadFrequently: true })!
			g.fillStyle = '#fff'
			const base = c.getBoundingClientRect()
			const range = document.createRange()
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
			for (let n = walker.nextNode(); n; n = walker.nextNode()) {
				const el = n.parentElement
				if (!el || el.closest('.sr-only')) continue
				const cs = getComputedStyle(el)
				if (cs.visibility === 'hidden' || cs.display === 'none') continue
				g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
				const s = n.textContent ?? ''
				for (let k = 0; k < s.length; k++) {
					if (!s[k].trim()) continue
					range.setStart(n, k)
					range.setEnd(n, k + 1)
					const r = range.getBoundingClientRect()
					if (!r.width) continue
					// A character's box is the font's content area: its top sits
					// one ascent above the baseline
					const asc = g.measureText(s[k]).fontBoundingBoxAscent
					const x = r.left - base.left
					const y = r.top - base.top
					tb.x0 = Math.min(tb.x0, x)
					tb.y0 = Math.min(tb.y0, y)
					tb.x1 = Math.max(tb.x1, x + r.width)
					tb.y1 = Math.max(tb.y1, y + r.height)
					g.fillText(s[k], x, y + asc)
				}
			}
			const a = g.getImageData(0, 0, w, h).data
			for (let r = 0; r < rows; r++)
				for (let col = 0; col < cols; col++) {
					let sum = 0
					let n = 0
					for (let yy = r * DOT; yy < Math.min(h, r * DOT + DOT); yy++)
						for (let xx = col * DOT; xx < Math.min(w, col * DOT + DOT); xx++) {
							sum += a[(yy * w + xx) * 4 + 3]
							n++
						}
					glyph[r * cols + col] = n ? sum / n / 255 : 0
				}
		}

		const draw = () => {
			ctx.clearRect(0, 0, w, h)
			if (!to.length) return
			const R = Math.min(w, h) * RADIUS
			const wide = R * 0.7 * 1.5
			const lens = pa > 0.01
			// The type turns to dots inside Rm, wider than the crater so a ring
			// of dotted letters stays readable around it
			const Rm = R * 1.8 * pa
			const ink = lens && !!text
			if (ink && glyphDirty) buildGlyph()
			lensCb.current?.(sx, sy, ink ? Rm : 0)
			// Over the type the ambient field steps back, so it doesn't drown
			// the letters in noise
			let quiet = 1
			if (ink && tb.x1 > tb.x0) {
				const dx = Math.max(tb.x0 - sx, 0, sx - tb.x1)
				const dy = Math.max(tb.y0 - sy, 0, sy - tb.y1)
				quiet = 1 - 0.8 * Math.max(0, 1 - Math.hypot(dx, dy) / R)
			}
			ctx.fillStyle = color
			ctx.beginPath()
			for (let r = 0; r < rows; r++) {
				const y = r * DOT + DOT / 2
				for (let col = 0; col < cols; col++) {
					const x = col * DOT + DOT / 2
					const i = r * cols + col
					let v = mix(from[i], to[i])
					// Dots of the type get half the crater's push, so the letters
					// keep their shape
					let push = 1
					if (lens) {
						const dx = x - sx
						const dy = y - sy
						const d2 = dx * dx + dy * dy
						v +=
							0.42 * pa * quiet * Math.exp(-d2 / (2 * wide * wide)) * (0.3 + v)
						if (ink && d2 < Rm * Rm) {
							const tt = 1 - Math.sqrt(d2) / Rm
							const m = tt * tt * (3 - 2 * tt)
							// Solid at the rim, like the type they replace
							const g = glyph[i] * (1 - 0.6 * m)
							if (g > v) {
								v = g
								push = 0.5
							}
						}
					}
					if (Math.min(1, v) > BAYER[r % 8][col % 8])
						ctx.rect(
							x + ox[i] * push - DOT / 2,
							y + oy[i] * push - DOT / 2,
							DOT,
							DOT,
						)
				}
			}
			ctx.fill()
		}

		// Each dot springs toward where the field wants it; faster pointers
		// push further
		const step = (dt: number) => {
			const R = Math.min(w, h) * RADIUS
			const sigma = R * 0.7
			const reach = sigma * 3
			const boost = 1 + Math.min(1.5, speed / 1200)
			let moving = false
			for (let r = 0; r < rows; r++) {
				const y = r * DOT + DOT / 2
				for (let col = 0; col < cols; col++) {
					const i = r * cols + col
					const x = col * DOT + DOT / 2
					const dx = x - sx
					const dy = y - sy
					let tx = 0
					let ty = 0
					if (pa > 0.01 && Math.abs(dx) < reach && Math.abs(dy) < reach) {
						const d2 = dx * dx + dy * dy
						const d = Math.sqrt(d2) || 1
						const f =
							pa * R * 0.22 * boost * Math.exp(-d2 / (2 * sigma * sigma))
						tx = (dx / d) * f
						ty = (dy / d) * f
					} else if (!ox[i] && !oy[i] && !vx[i] && !vy[i]) continue
					vx[i] += (K * (tx - ox[i]) - C * vx[i]) * dt
					vy[i] += (K * (ty - oy[i]) - C * vy[i]) * dt
					ox[i] += vx[i] * dt
					oy[i] += vy[i] * dt
					if (
						Math.abs(vx[i]) + Math.abs(vy[i]) < 0.3 &&
						Math.abs(ox[i] - tx) + Math.abs(oy[i] - ty) < 0.05
					) {
						ox[i] = tx
						oy[i] = ty
						vx[i] = vy[i] = 0
					} else moving = true
				}
			}
			return moving
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
			pa += (target - pa) * Math.min(1, dt * 12)
			if (Math.abs(target - pa) > 0.005) busy = true
			else pa = target

			speed +=
				(Math.hypot(px - lastPx, py - lastPy) / dt - speed) *
				Math.min(1, dt * 10)
			lastPx = px
			lastPy = py
			if (speed > 5) busy = true

			const k = 1 - Math.exp(-dt * 40)
			sx += (px - sx) * k
			sy += (py - sy) * k
			if (Math.abs(px - sx) + Math.abs(py - sy) > 0.3) busy = true

			if (!reduce && step(dt)) busy = true
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

		// Only while the pointer is over the print is there anything to do
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return
			const r = c.getBoundingClientRect()
			px = e.clientX - r.left
			py = e.clientY - r.top
			const now = px >= 0 && py >= 0 && px <= r.width && py <= r.height
			// Entering: the field starts where the pointer is, at rest
			if (now && !inside && pa < 0.02) {
				sx = lastPx = px
				sy = lastPy = py
				speed = 0
			}
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
		// The type changes (another row on show) or its font arrives
		const mo = new MutationObserver(() => (glyphDirty = true))
		if (text?.current)
			mo.observe(text.current, {
				childList: true,
				subtree: true,
				characterData: true,
			})
		document.fonts?.ready.then(() => (glyphDirty = true))
		window.addEventListener('pointermove', onMove, { passive: true })
		return () => {
			mo.disconnect()
			ro.disconnect()
			window.removeEventListener('pointermove', onMove)
			cancelAnimationFrame(raf)
		}
		// Shape changes go through api.set; this effect owns the canvas.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [color, text])

	useEffect(() => {
		api.current.set(shape)
	}, [shape])

	return (
		<canvas ref={canvas} aria-hidden='true' className={`block ${className}`} />
	)
}
