export default function Home() {
	return (
		<main className='mx-auto w-full max-w-xl px-6 py-24'>
			<h1 className='font-medium tracking-tight'>Carlos Agúndez</h1>
			<p className='text-muted'>Design engineer.</p>
			<p className='mt-8'>
				I’m learning to build interfaces that feel right.{' '}
				<a
					href='mailto:carlos@agundez.me'
					className='underline decoration-border underline-offset-4 transition-colors duration-150 ease-out-strong hover:decoration-accent'
				>
					Get in touch
				</a>
				.
			</p>
		</main>
	)
}
