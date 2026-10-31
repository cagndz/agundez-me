'use client'

import { useEffect, useRef } from 'react'
import type { Product } from './data'

// A product shot, drawn in greys on a small canvas and then ordered-dithered
// to 1-bit: the look of a thermal print, without shipping an image.

export type Draw = (ctx: CanvasRenderingContext2D) => void

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
	product,
	width,
	height,
	className,
}: {
	product: Product
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
		product.draw(ctx)
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
	}, [product, width, height])

	return (
		<canvas
			ref={ref}
			aria-hidden='true'
			className={className}
			style={{ width, height, imageRendering: 'pixelated' }}
		/>
	)
}
