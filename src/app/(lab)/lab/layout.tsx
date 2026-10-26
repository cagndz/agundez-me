import { notFound } from 'next/navigation'
import './lab.css'

export default function LabLayout({ children }: LayoutProps<'/lab'>) {
	if (process.env.VERCEL_ENV === 'production') {
		notFound()
	}

	// @container: the board's columns and the dots follow the page's width
	// (lab.css). isolate: the dots sit behind the content but above the
	// page's own background.
	return (
		<div
			data-theme='lab'
			className='@container relative isolate min-h-screen bg-background px-(--page-pad) py-12 text-foreground [--page-pad:1.5rem] md:[--page-pad:3rem]'
		>
			<main className='lab-page'>
				<div
					aria-hidden='true'
					className='lab-dots pointer-events-none absolute inset-0 -z-10'
				/>
				{children}
			</main>
		</div>
	)
}
