export function XMark({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden='true'
			viewBox='0 0 16 16'
			className={className}
			fill='none'
			stroke='currentColor'
			strokeWidth='1.5'
			strokeLinecap='square'
		>
			<path d='M3 3 L13 13 M13 3 L3 13' />
		</svg>
	)
}
