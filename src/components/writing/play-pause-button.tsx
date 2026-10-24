// The quiet round button in the top right corner of animated figures.
// Anything that moves on its own for more than a few seconds must be pausable.
export function PlayPauseButton({
	playing,
	onToggle,
	label,
	disabled = false,
}: {
	playing: boolean
	onToggle: () => void
	// What is being played, for screen readers: "animation", "videos".
	label: string
	disabled?: boolean
}) {
	return (
		<button
			type='button'
			aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}
			onClick={onToggle}
			disabled={disabled}
			className='absolute top-3 right-3 grid size-8 place-items-center rounded-full text-muted transition-colors duration-150 ease-out-quart hover:bg-foreground/5 hover:text-foreground disabled:opacity-50'
		>
			<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
				{playing ? (
					<>
						<rect
							x='2.5'
							y='2'
							width='2.4'
							height='8'
							rx='0.6'
							fill='currentColor'
						/>
						<rect
							x='7.1'
							y='2'
							width='2.4'
							height='8'
							rx='0.6'
							fill='currentColor'
						/>
					</>
				) : (
					<path
						d='M3.5 2.3v7.4a.6.6 0 0 0 .9.5l5.8-3.7a.6.6 0 0 0 0-1L4.4 1.8a.6.6 0 0 0-.9.5Z'
						fill='currentColor'
					/>
				)}
			</svg>
		</button>
	)
}
