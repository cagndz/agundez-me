export function ArrowLeft({ className }: { className?: string }) {
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
			<path d='M14 8 H3 M7 4 L3 8 L7 12' />
		</svg>
	)
}
