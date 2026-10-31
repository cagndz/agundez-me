import type { Product } from './data'

// The products are isometric solids in three flat tones, light on top, mid on
// the left, dark on the front, with a fine edge. No gradients, so each face
// dithers to one clean pattern. Detail sits on a face, drawn in that face's
// own plane.

type Ctx = CanvasRenderingContext2D
type Tones = [string, string, string]

const TOP = '#d2d2d2'
const LEFT = '#808080'
const RIGHT = '#2a2a2a'
// Parts standing on a body: a step lighter, so they read against it
const PART: Tones = ['#f4f4f4', '#9a9a9a', '#3a3a3a']
const INK = '#111'
const C30 = Math.cos(Math.PI / 6)

/** Isometric drawing for one product: a footprint `w` by `d`, centred on
 * x = 50, with its nearest corner on y = 86. x and y are measured from the
 * centre of the footprint, z up from the floor. */
function iso(ctx: Ctx, w: number, d: number) {
	const p = (x: number, y: number, z: number): [number, number] => [
		50 + (x - y) * C30,
		86 - (x + y + (w + d) / 2) / 2 - z,
	]
	const poly = (pts: [number, number][], fill: string) => {
		ctx.beginPath()
		pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
		ctx.closePath()
		ctx.fillStyle = fill
		ctx.fill()
		// A fine edge, so faces of one tone still read apart
		ctx.strokeStyle = INK
		ctx.lineWidth = 0.7
		ctx.lineJoin = 'round'
		ctx.stroke()
	}

	/** A box, centred on x, y, standing on z. */
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

	/** A cylinder standing on z: its body split light and dark, its top lit. */
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
		// A circle on the floor plane, seen in isometric
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
		ctx.strokeStyle = INK
		ctx.lineWidth = 0.7
		ctx.stroke()
		ctx.fillStyle = top
		ctx.beginPath()
		ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.stroke()
	}

	// Draw in a face's own plane: u runs along it, v up it (or back, on top).
	// The origin is the face's nearest bottom corner.
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
	/** The front face of a box (the dark one), u along x and v up. */
	const front = (x0: number, y0: number, z0: number, draw: () => void) =>
		face([C30, -0.5, 0, -1], p(x0, y0, z0), draw)
	/** The top of a box, u along x and v back along y. */
	const top = (x0: number, y0: number, z: number, draw: () => void) =>
		face([C30, -0.5, -C30, -0.5], p(x0, y0, z), draw)

	return { p, box, cylinder, front, top }
}

function circle(ctx: Ctx, x: number, y: number, r: number, fill: string) {
	ctx.fillStyle = fill
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2)
	ctx.fill()
}

function rect(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	fill: string,
) {
	ctx.fillStyle = fill
	ctx.fillRect(x, y, w, h)
}

// Around the ring in this order: the keyboard and the drum machine both
// carry a grid on top, so they stand opposite each other, never side by side.
export const PRODUCTS: Product[] = [
	{
		id: 'kbd',
		name: 'Keyboard',
		spec: '75% · Hot-swap',
		price: 169,
		shadow: [50, 82, 40],
		draw(ctx) {
			const { box } = iso(ctx, 60, 22)
			box(0, 0, 0, 60, 22, 7)
			const keys: [number, number][] = []
			for (let row = 0; row < 3; row++)
				for (let col = 0; col < 9; col++)
					keys.push([-25 + col * 6.2, 6 - row * 6])
			keys.sort((a, b) => b[0] + b[1] - (a[0] + a[1]))
			for (const [x, y] of keys) box(x, y, 7, 4.6, 4.6, 2.6, PART)
		},
	},
	{
		id: 'spk',
		name: 'Speaker',
		spec: 'Bookshelf · 2-way',
		price: 349,
		shadow: [50, 86, 26],
		draw(ctx) {
			const { box, front } = iso(ctx, 26, 24)
			box(0, 0, 0, 26, 24, 52)
			front(-13, -12, 0, () => {
				circle(ctx, 13, 18, 9.5, TOP)
				circle(ctx, 13, 18, 7, LEFT)
				circle(ctx, 13, 18, 2.6, TOP)
				circle(ctx, 13, 39, 5, TOP)
				circle(ctx, 13, 39, 2.2, LEFT)
				rect(ctx, 11, 4, 4, 2, TOP)
			})
		},
	},
	{
		id: 'drm',
		name: 'Drum machine',
		spec: '16 pads · 64 steps',
		price: 299,
		shadow: [50, 84, 38],
		draw(ctx) {
			const { box, cylinder, front } = iso(ctx, 44, 40)
			box(0, 0, 0, 44, 40, 10)
			const parts: [number, number, () => void][] = []
			for (let i = 0; i < 4; i++)
				for (let j = 0; j < 4; j++) {
					const x = -17 + i * 8
					const y = -14 + j * 8
					parts.push([x, y, () => box(x, y, 10, 6.4, 6.4, 1.8, PART)])
				}
			for (const y of [-13, 0, 13])
				parts.push([16, y, () => cylinder(16, y, 10, 3, 3.6, PART)])
			parts.sort((a, b) => b[0] + b[1] - (a[0] + a[1]))
			for (const [, , draw] of parts) draw()
			front(-22, -20, 0, () => {
				rect(ctx, 4, 3, 18, 4.5, TOP)
				rect(ctx, 30, 4.2, 2.2, 2.2, TOP)
				rect(ctx, 36, 4.2, 2.2, 2.2, TOP)
			})
		},
	},
	{
		id: 'trn',
		name: 'Turntable',
		spec: '33/45 · Belt drive',
		price: 459,
		shadow: [50, 82, 40],
		draw(ctx) {
			const { box, cylinder, top, p } = iso(ctx, 46, 40)
			box(0, 0, 0, 46, 40, 9)
			cylinder(15, 13, 9, 2.8, 5, PART)
			cylinder(-5, 0, 9, 16, 2, ['#3a3a3a', '#1a1a1a', '#0a0a0a'])
			top(-21, -16, 11, () => {
				// The record's grooves and its label
				ctx.strokeStyle = '#4a4a4a'
				ctx.lineWidth = 0.5
				for (const r of [8, 11, 14]) {
					ctx.beginPath()
					ctx.arc(16, 16, r, 0, Math.PI * 2)
					ctx.stroke()
				}
				circle(ctx, 16, 16, 4.5, TOP)
			})
			const [ax, ay] = p(15, 13, 14)
			const [hx, hy] = p(-2, -10, 12)
			ctx.strokeStyle = INK
			ctx.lineWidth = 1.6
			ctx.lineCap = 'round'
			ctx.beginPath()
			ctx.moveTo(ax, ay)
			ctx.lineTo(hx, hy)
			ctx.stroke()
			box(17, -15, 9, 4, 4, 1.6, PART)
		},
	},
]
