export default function SiteLayout({ children }: LayoutProps<'/'>) {
	return (
		<div className='mx-auto w-full max-w-xl px-6 py-24'>
			<main id='main' className='relative'>
				{children}
			</main>
		</div>
	)
}
