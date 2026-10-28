import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Lab: a small studio for playing with interface ideas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The lab's own colors (lab.css). Repeated here because the image is drawn on
// the server, outside the page, where CSS variables don't exist.
const BACKGROUND = '#ececea'
const FOREGROUND = '#111111'
const MUTED = '#5f5f5d'
const ACCENT = '#ff6000'

const PAD = 80

// The lab's dot grid. The image is drawn by Satori, which doesn't paint
// repeating gradients, so every dot is its own element. Like on the page, the
// dots fade in below the text, and here they also fade out above the scale.
// The grid starts at 0 so a column lands on the middle (600), where the
// scale's orange tick is.
const PITCH = 24
const DOT_SIZE = 3
const DOT_OPACITY = 0.16

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function dotOpacity(top: number) {
	const fadeIn = clamp01((top - 260) / 240)
	const fadeOut = clamp01((size.height - 60 - top) / 120)
	return DOT_OPACITY * fadeIn * fadeOut
}

const dots = Array.from({ length: Math.floor(size.height / PITCH) }, (_, row) =>
	Array.from({ length: Math.floor(size.width / PITCH) - 1 }, (_, column) => ({
		left: (column + 1) * PITCH,
		top: (row + 1) * PITCH,
		opacity: dotOpacity((row + 1) * PITCH),
	})),
)
	.flat()
	.filter((dot) => dot.opacity > 0)

// The dial's scale, unrolled along the bottom edge: a tick every 12 px, taller
// every 5 and every 10, and growing near the middle, where the reading is.
// Same rule as the dial: a bell curve on the distance to the center.
const TICK_GAP = 12
const TICK_COUNT = Math.floor(size.width / TICK_GAP) + 1
const CENTER = Math.floor(TICK_COUNT / 2)
const SIGMA = 3

const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
	const step = i - CENTER
	const type = step % 10 === 0 ? 'major' : step % 5 === 0 ? 'mid' : 'minor'
	const near = Math.exp(-(step * step) / (2 * SIGMA * SIGMA))
	const base = { major: 34, mid: 22, minor: 14 }[type]
	return {
		left: i * TICK_GAP,
		width: type === 'major' ? 2 : 1,
		height: Math.round(base + 26 * near),
		opacity: type === 'major' ? 1 : 0.45 + 0.55 * near,
		isActive: step === 0,
	}
})

export default async function Image() {
	// Passing any font replaces the default one, so both are loaded.
	const [sans, mono] = await Promise.all([
		readFile(join(process.cwd(), 'src/assets/fonts/Geist-Regular.ttf')),
		readFile(join(process.cwd(), 'src/assets/fonts/GeistMono-Regular.ttf')),
	])

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				padding: PAD,
				background: BACKGROUND,
				color: FOREGROUND,
				fontFamily: 'Geist',
				position: 'relative',
			}}
		>
			{dots.map((dot) => (
				<div
					key={`${dot.left}-${dot.top}`}
					style={{
						position: 'absolute',
						left: dot.left - DOT_SIZE / 2,
						top: dot.top - DOT_SIZE / 2,
						width: DOT_SIZE,
						height: DOT_SIZE,
						borderRadius: DOT_SIZE / 2,
						background: FOREGROUND,
						opacity: dot.opacity,
					}}
				/>
			))}

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontFamily: 'Geist Mono',
					fontSize: 22,
					letterSpacing: '0.16em',
					textTransform: 'uppercase',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
					<div
						style={{
							width: 14,
							height: 14,
							borderRadius: 7,
							background: ACCENT,
						}}
					/>
					Lab
				</div>
				<div
					style={{
						color: MUTED,
						letterSpacing: '0.04em',
						textTransform: 'none',
					}}
				>
					agundez.me/lab
				</div>
			</div>

			<div
				style={{
					marginTop: 28,
					maxWidth: 800,
					fontSize: 68,
					lineHeight: 1.08,
					letterSpacing: '-0.035em',
				}}
			>
				A small studio for playing with interface ideas
			</div>

			{ticks.map((tick) => (
				<div
					key={tick.left}
					style={{
						position: 'absolute',
						bottom: 0,
						left: tick.left - tick.width / 2,
						width: tick.width,
						height: tick.height,
						background: tick.isActive ? ACCENT : FOREGROUND,
						opacity: tick.isActive ? 1 : tick.opacity,
					}}
				/>
			))}
		</div>,
		{
			...size,
			fonts: [
				{ name: 'Geist', data: sans, style: 'normal', weight: 400 },
				{ name: 'Geist Mono', data: mono, style: 'normal', weight: 400 },
			],
		},
	)
}
