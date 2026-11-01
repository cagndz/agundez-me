import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'Carlos Agúndez, design engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The site's share card (the lab has its own): the homepage's ink block on
// its own, set like a poster. The name sits low and large, a small mono line
// up top. Colours repeated from the page, since the image is drawn on the
// server, where CSS variables don't exist.
const INK = '#1f36d1'
const PAPER = '#faf9f7'

const PAD = 64

export default async function Image() {
	const fonts = join(process.cwd(), 'src/assets/fonts')
	const [semibold, mono] = await Promise.all([
		readFile(join(fonts, 'Geist-SemiBold.ttf')),
		readFile(join(fonts, 'GeistMono-Regular.ttf')),
	])

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: PAD,
				background: INK,
				color: PAPER,
			}}
		>
			<div
				style={{
					display: 'flex',
					fontFamily: 'Geist Mono',
					fontSize: 24,
					opacity: 0.8,
				}}
			>
				<span>design engineer</span>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					// The big type's side bearing, pulled back to the margin
					marginLeft: -10,
					// The descender of the "g" hangs into the bottom margin
					marginBottom: -24,
					fontFamily: 'Geist',
					fontWeight: 600,
					fontSize: 188,
					lineHeight: 0.86,
					letterSpacing: '-0.06em',
				}}
			>
				<span>carlos</span>
				<span>agúndez</span>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ name: 'Geist', data: semibold, weight: 600, style: 'normal' },
				{ name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
			],
		},
	)
}
