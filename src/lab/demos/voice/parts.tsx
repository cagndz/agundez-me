import type { Note } from './notes'

// Grain for the faces: fractal noise, greyscale, tiled. Laid over the
// gradient in overlay, it lifts the lights and sinks the darks a little,
// like a print rather than a screen.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
	"<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='96' height='96' filter='url(%23n)'/></svg>",
).replace(/%2523/g, '%23')}")`

// Faces are soft, grainy gradients: three tones of one hue, so people tell
// apart by colour without the row turning into a sweet shop. No initials:
// in a stack half of each face is under the next, and a clipped letter
// reads as broken. The name is there the moment the island opens.
export function Avatar({
	note,
	size,
	className = '',
}: {
	note: Note
	size: number
	className?: string
}) {
	const { light, base, deep } = note.tint
	return (
		<span
			aria-hidden='true'
			className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}
			style={{
				width: size,
				height: size,
				backgroundColor: base,
				backgroundImage: `radial-gradient(circle at 28% 22%, ${light} 0%, transparent 62%), radial-gradient(circle at 80% 85%, ${deep} 0%, transparent 60%)`,
			}}
		>
			<span
				className='absolute inset-0 opacity-45 mix-blend-overlay'
				style={{ backgroundImage: GRAIN, backgroundSize: '96px 96px' }}
			/>
		</span>
	)
}

export function PlayIcon({ size = 12 }: { size?: number }) {
	return (
		<svg
			aria-hidden='true'
			width={size}
			height={size}
			viewBox='0 0 12 12'
			fill='currentColor'
		>
			<path d='M3.2 1.9v8.2a.6.6 0 0 0 .9.52l6.9-4.1a.6.6 0 0 0 0-1.04L4.1 1.38a.6.6 0 0 0-.9.52Z' />
		</svg>
	)
}

export function PauseIcon({ size = 12 }: { size?: number }) {
	return (
		<svg
			aria-hidden='true'
			width={size}
			height={size}
			viewBox='0 0 12 12'
			fill='currentColor'
		>
			<rect x='2.6' y='1.6' width='2.5' height='8.8' rx='.75' />
			<rect x='6.9' y='1.6' width='2.5' height='8.8' rx='.75' />
		</svg>
	)
}

export function NextIcon({ size = 12 }: { size?: number }) {
	return (
		<svg
			aria-hidden='true'
			width={size}
			height={size}
			viewBox='0 0 12 12'
			fill='currentColor'
		>
			<path d='M1.8 2.3v7.4a.5.5 0 0 0 .78.42l5.4-3.7a.5.5 0 0 0 0-.84l-5.4-3.7a.5.5 0 0 0-.78.42Z' />
			<rect x='8.6' y='1.8' width='1.7' height='8.4' rx='.6' />
		</svg>
	)
}

export function CheckIcon() {
	return (
		<svg
			aria-hidden='true'
			width='12'
			height='12'
			viewBox='0 0 12 12'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<path d='m2.5 6.3 2.3 2.2 4.7-5' />
		</svg>
	)
}
