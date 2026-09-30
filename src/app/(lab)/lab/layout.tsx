export default function LabLayout({ children }: LayoutProps<'/lab'>) {
	return (
		<div
			data-theme='lab'
			className='min-h-screen bg-background px-6 py-12 text-foreground md:px-12'
		>
			<main id='main'>{children}</main>
		</div>
	)
}
