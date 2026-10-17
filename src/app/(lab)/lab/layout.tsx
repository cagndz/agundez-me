import { notFound } from 'next/navigation'

export default function LabLayout({ children }: LayoutProps<'/lab'>) {
	if (process.env.VERCEL_ENV === 'production') {
		notFound()
	}

	return (
		<div
			data-theme='lab'
			className='min-h-screen bg-background px-6 py-12 text-foreground md:px-12'
		>
			<main id='main'>{children}</main>
		</div>
	)
}
