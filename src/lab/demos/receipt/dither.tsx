'use client'

import { useEffect, useRef } from 'react'

// A product shot, drawn in greys on a small canvas and then ordered-dithered
// to 1-bit: the look of a thermal print, without shipping an image.

type Draw = (ctx: CanvasRenderingContext2D) => void

// One printed dot, in CSS px
export const DOT = 2

// 8×8 Bayer matrix, thresholds in 0–1
const BAYER = (() => {
	const m = [[0]]
	let size = 1
	let out = m
	while (size < 8) {
		const next: number[][] = []
		for (let y = 0; y < size * 2; y++) {
			next[y] = []
			for (let x = 0; x < size * 2; x++) {
				const base = out[y % size][x % size] * 4
				const q = (y < size ? 0 : 2) + (x < size ? 0 : 1)
				next[y][x] = base + [0, 2, 3, 1][q]
			}
		}
		out = next
		size *= 2
	}
	return out.map((row) => row.map((v) => (v + 0.5) / 64))
})()

function radial(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
	stops: [number, string][],
	hx = -0.35,
	hy = -0.35,
) {
	const g = ctx.createRadialGradient(x + r * hx, y + r * hy, 0, x, y, r)
	for (const [at, color] of stops) g.addColorStop(at, color)
	return g
}

export function linear(
	ctx: CanvasRenderingContext2D,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	stops: [number, string][],
) {
	const g = ctx.createLinearGradient(x0, y0, x1, y1)
	for (const [at, color] of stops) g.addColorStop(at, color)
	return g
}

export function floorShadow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
) {
	ctx.save()
	ctx.filter = 'blur(6px)'
	ctx.fillStyle = 'rgba(0,0,0,0.55)'
	ctx.beginPath()
	ctx.ellipse(x, y, w, w * 0.18, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.restore()
}

// Every scene is drawn on a 100×100 board, centred. The shadow on the floor
// is kept apart, so it stays put while the object leans above it.
export const SHADOWS: Record<string, [number, number, number]> = {
	ear: [50, 84, 34],
	phn: [52, 88, 30],
	wch: [50, 90, 26],
	spk: [50, 86, 38],
}

const SCENES: Record<string, Draw> = {
	ear(ctx) {
		const bud = (x: number, y: number, angle: number) => {
			ctx.save()
			ctx.translate(x, y)
			ctx.rotate(angle)
			ctx.fillStyle = linear(ctx, -5, 0, 5, 0, [
				[0, '#3a3a3a'],
				[0.4, '#cfcfcf'],
				[1, '#202020'],
			])
			ctx.beginPath()
			ctx.roundRect(-5, 4, 10, 34, 5)
			ctx.fill()
			ctx.fillStyle = radial(ctx, 0, 0, 14, [
				[0, '#f4f4f4'],
				[0.45, '#7a7a7a'],
				[1, '#0a0a0a'],
			])
			ctx.beginPath()
			ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2)
			ctx.fill()
			ctx.fillStyle = '#050505'
			ctx.beginPath()
			ctx.ellipse(3, 2, 4.5, 5.5, 0, 0, Math.PI * 2)
			ctx.fill()
			ctx.restore()
		}
		bud(34, 36, -0.28)
		bud(66, 40, 0.22)
	},
	phn(ctx) {
		ctx.save()
		ctx.translate(50, 50)
		ctx.rotate(-0.22)
		ctx.fillStyle = linear(ctx, -22, -40, 22, 40, [
			[0, '#5a5a5a'],
			[0.35, '#1a1a1a'],
			[1, '#0a0a0a'],
		])
		ctx.beginPath()
		ctx.roundRect(-22, -40, 44, 80, 8)
		ctx.fill()
		// Edge highlight
		ctx.strokeStyle = 'rgba(255,255,255,0.55)'
		ctx.lineWidth = 1.5
		ctx.stroke()
		ctx.fillStyle = '#2b2b2b'
		ctx.beginPath()
		ctx.roundRect(-16, -34, 16, 26, 5)
		ctx.fill()
		for (const cy of [-28, -15]) {
			ctx.fillStyle = radial(ctx, -8, cy, 5, [
				[0, '#ffffff'],
				[0.5, '#8a8a8a'],
				[1, '#111111'],
			])
			ctx.beginPath()
			ctx.arc(-8, cy, 5, 0, Math.PI * 2)
			ctx.fill()
		}
		ctx.restore()
	},
	wch(ctx) {
		ctx.fillStyle = linear(ctx, 37, 0, 63, 0, [
			[0, '#2a2a2a'],
			[0.5, '#8c8c8c'],
			[1, '#1a1a1a'],
		])
		ctx.beginPath()
		ctx.roundRect(38, 0, 24, 100, 6)
		ctx.fill()
		ctx.fillStyle = radial(ctx, 50, 50, 27, [
			[0, '#e8e8e8'],
			[0.6, '#4a4a4a'],
			[1, '#0a0a0a'],
		])
		ctx.beginPath()
		ctx.arc(50, 50, 26, 0, Math.PI * 2)
		ctx.fill()
		ctx.fillStyle = radial(ctx, 50, 50, 20, [
			[0, '#3a3a3a'],
			[1, '#000000'],
		])
		ctx.beginPath()
		ctx.arc(50, 50, 20, 0, Math.PI * 2)
		ctx.fill()
		ctx.strokeStyle = '#f0f0f0'
		ctx.lineWidth = 2
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.moveTo(50, 50)
		ctx.lineTo(50, 37)
		ctx.moveTo(50, 50)
		ctx.lineTo(59, 54)
		ctx.stroke()
		ctx.fillStyle = '#bdbdbd'
		ctx.fillRect(75, 46, 5, 8)
	},
	spk(ctx) {
		ctx.fillStyle = linear(ctx, 14, 18, 86, 82, [
			[0, '#6a6a6a'],
			[0.5, '#262626'],
			[1, '#0d0d0d'],
		])
		ctx.beginPath()
		ctx.roundRect(14, 18, 72, 64, 10)
		ctx.fill()
		ctx.fillStyle = radial(
			ctx,
			50,
			50,
			24,
			[
				[0, '#fafafa'],
				[0.35, '#a0a0a0'],
				[0.8, '#2a2a2a'],
				[1, '#0a0a0a'],
			],
			-0.15,
			-0.2,
		)
		ctx.beginPath()
		ctx.arc(50, 50, 24, 0, Math.PI * 2)
		ctx.fill()
		ctx.fillStyle = '#060606'
		ctx.beginPath()
		ctx.arc(50, 50, 6, 0, Math.PI * 2)
		ctx.fill()
	},
}

/** A product, facing you, on its 100×100 board. */
export function drawProduct(ctx: CanvasRenderingContext2D, scene: string) {
	SCENES[scene]?.(ctx)
}

// Push the mids apart, so the subject reads against what's behind it
function tone(r: number, g: number, b: number, alpha = 1) {
	const lum = 1 - alpha * (1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255)
	return Math.min(1, Math.max(0, (lum - 0.5) * 1.35 + 0.52))
}

/** Ordered dither to ink: dark dots in the foreground colour, the rest left
 * clear, so the print sits straight on whatever is behind it. Transparent
 * pixels count as white paper. */
export function ditherInk(image: ImageData) {
	const { data, width: w, height: h } = image
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const i = (y * w + x) * 4
			const ink =
				tone(data[i], data[i + 1], data[i + 2], data[i + 3] / 255) <=
				BAYER[y % 8][x % 8]
			data[i] = data[i + 1] = data[i + 2] = 17
			data[i + 3] = ink ? 255 : 0
		}
	}
}

/** The product shot on the receipt: the object on a lit wall, dithered. */
export function Print({
	scene,
	width,
	height,
	className,
}: {
	scene: string
	width: number
	height: number
	className?: string
}) {
	const ref = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = ref.current
		const ctx = canvas?.getContext('2d', { willReadFrequently: true })
		if (!canvas || !ctx) return
		const w = Math.round(width / DOT)
		const h = Math.round(height / DOT)
		canvas.width = w
		canvas.height = h

		// Backdrop: a lit wall falling into shadow, so the dither has texture
		ctx.fillStyle = linear(ctx, 0, 0, w * 0.3, h, [
			[0, '#e2e2e2'],
			[1, '#a6a6a6'],
		])
		ctx.fillRect(0, 0, w, h)

		const side = Math.min(w, h)
		ctx.save()
		ctx.translate((w - side) / 2, (h - side) / 2)
		ctx.scale(side / 100, side / 100)
		const shadow = SHADOWS[scene]
		if (shadow) floorShadow(ctx, ...shadow)
		drawProduct(ctx, scene)
		ctx.restore()

		const image = ctx.getImageData(0, 0, w, h)
		const data = image.data
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = (y * w + x) * 4
				const v = tone(data[i], data[i + 1], data[i + 2]) > BAYER[y % 8][x % 8]
				data[i] = data[i + 1] = data[i + 2] = v ? 255 : 0
				data[i + 3] = 255
			}
		}
		ctx.putImageData(image, 0, 0)
	}, [scene, width, height])

	return (
		<canvas
			ref={ref}
			aria-hidden='true'
			className={className}
			style={{ width, height, imageRendering: 'pixelated' }}
		/>
	)
}
