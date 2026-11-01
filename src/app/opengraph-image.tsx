import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { projects } from '@/content/projects'

export const alt = 'Carlos Agúndez, design engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The site's card, shared by the homepage and the posts (the lab has its
// own). The homepage as a card: the ink block with the name on the left, the
// projects on paper on the right. Colours repeated from the page, since the
// image is drawn on the server, where CSS variables don't exist.
const INK = '#1f36d1'
const PAPER = '#faf9f7'

const PAD = 56

const KIND: Record<string, string> = {
	Lab: 'experiments',
	'Menubar Player': 'macos app',
	Silex: 'theme',
}

export default async function Image() {
	const fonts = join(process.cwd(), 'src/assets/fonts')
	const [semibold, regular, mono] = await Promise.all([
		readFile(join(fonts, 'Geist-SemiBold.ttf')),
		readFile(join(fonts, 'Geist-Regular.ttf')),
		readFile(join(fonts, 'GeistMono-Regular.ttf')),
	])

	return new ImageResponse(
		<div style={{ width: '100%', height: '100%', display: 'flex' }}>
			<div
				style={{
					width: '50%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					padding: PAD,
					background: INK,
					color: PAPER,
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						marginLeft: -6,
						fontFamily: 'Geist',
						fontWeight: 600,
						fontSize: 112,
						lineHeight: 0.9,
						letterSpacing: '-0.055em',
					}}
				>
					<span>carlos</span>
					<span>agúndez</span>
				</div>
				<div
					style={{
						marginTop: 28,
						display: 'flex',
						flexDirection: 'column',
						gap: 6,
						fontFamily: 'Geist Mono',
						fontSize: 22,
						opacity: 0.8,
					}}
				>
					<span>design engineer</span>
					<span>based in spain</span>
				</div>
			</div>

			<div
				style={{
					width: '50%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					padding: PAD,
					background: PAPER,
					color: INK,
					fontFamily: 'Geist',
					fontSize: 30,
				}}
			>
				<div
					style={{
						fontWeight: 600,
						marginBottom: 18,
						paddingBottom: 18,
						borderBottom: `1.5px solid ${INK}33`,
					}}
				>
					projects
				</div>
				{projects.map(({ name }) => (
					<div
						key={name}
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'baseline',
							padding: '6px 0',
						}}
					>
						<span>{name.toLowerCase()}</span>
						<span style={{ opacity: 0.7, fontSize: 26 }}>
							{KIND[name] ?? ''}
						</span>
					</div>
				))}
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ name: 'Geist', data: semibold, weight: 600, style: 'normal' },
				{ name: 'Geist', data: regular, weight: 400, style: 'normal' },
				{ name: 'Geist Mono', data: mono, weight: 400, style: 'normal' },
			],
		},
	)
}
