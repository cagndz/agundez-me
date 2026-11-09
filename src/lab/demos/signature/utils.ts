import type { Point, Stroke } from './types'

const round = (n: number) => Math.round(n * 10) / 10

export function distance(a: Point, b: Point) {
	return Math.hypot(b.x - a.x, b.y - a.y)
}

export function strokeLength(stroke: Stroke) {
	let length = 0
	for (let i = 1; i < stroke.length; i++)
		length += distance(stroke[i - 1], stroke[i])
	return length
}

export function totalLength(strokes: Stroke[]) {
	return strokes.reduce((sum, stroke) => sum + strokeLength(stroke), 0)
}

/** A smooth path through the points: quadratic curves between midpoints. */
export function smoothPath(stroke: Stroke) {
	if (stroke.length === 0) return ''
	const [first] = stroke
	// A tap: a zero-length segment, which round caps draw as a dot
	if (stroke.length === 1) return `M${round(first.x)} ${round(first.y)}h0.01`
	let d = `M${round(first.x)} ${round(first.y)}`
	for (let i = 1; i < stroke.length - 1; i++) {
		const p = stroke[i]
		const next = stroke[i + 1]
		d += `Q${round(p.x)} ${round(p.y)} ${round((p.x + next.x) / 2)} ${round((p.y + next.y) / 2)}`
	}
	const last = stroke[stroke.length - 1]
	return d + `L${round(last.x)} ${round(last.y)}`
}

function bounds(strokes: Stroke[]) {
	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity
	for (const stroke of strokes)
		for (const p of stroke) {
			minX = Math.min(minX, p.x)
			minY = Math.min(minY, p.y)
			maxX = Math.max(maxX, p.x)
			maxY = Math.max(maxY, p.y)
		}
	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/** The transform (origin top-left) that centres the strokes inside a box. */
export function fitInto(
	strokes: Stroke[],
	box: { x: number; y: number; width: number; height: number },
) {
	const b = bounds(strokes)
	const scale = Math.min(
		box.width / Math.max(b.width, 1),
		box.height / Math.max(b.height, 1),
	)
	return {
		scale,
		x: box.x + (box.width - b.width * scale) / 2 - b.x * scale,
		y: box.y + (box.height - b.height * scale) / 2 - b.y * scale,
	}
}

export function inset(
	top: number,
	right: number,
	bottom: number,
	left: number,
	radius: number,
) {
	return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`
}

export function formatSignedAt(date = new Date()) {
	return date.toLocaleString('en-GB', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}
