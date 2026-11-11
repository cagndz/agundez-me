import type { Note } from './notes'

// Faces are a soft two-stop gradient each, the way messaging apps tell
// people apart before a photo loads; the initial sits on top in white.
export function Avatar({
	note,
	size,
	className = '',
}: {
	note: Note
	size: number
	className?: string
}) {
	return (
		<span
			aria-hidden='true'
			className={`grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] ${className}`}
			style={{
				width: size,
				height: size,
				fontSize: Math.round(size * 0.4),
				backgroundImage: `linear-gradient(140deg, ${note.tint[0]}, ${note.tint[1]})`,
				textShadow: '0 1px 1px rgba(0,0,0,0.12)',
			}}
		>
			{note.initials}
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
