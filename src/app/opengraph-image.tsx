import { ImageResponse } from 'next/og'

export const alt = 'Carlos Agúndez, design engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end',
				padding: '88px 96px',
				background: '#faf9f7',
			}}
		>
			<div
				style={{
					fontSize: 72,
					letterSpacing: '-0.035em',
					lineHeight: 1,
					color: '#1a1917',
				}}
			>
				Carlos Agúndez
			</div>
			<div
				style={{
					marginTop: 20,
					fontSize: 36,
					color: '#6b6862',
				}}
			>
				Design engineer
			</div>
		</div>,
		{ ...size },
	)
}
