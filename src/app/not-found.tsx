import Link from 'next/link'

export const metadata = { title: 'Not found' }

export default function NotFound() {
	return (
		<main className='mx-auto w-full max-w-2xl px-6 py-24'>
			<h1 className='font-medium tracking-tight'>Page not found</h1>
			<p className='text-muted'>
				Nothing here, but the rest of the site is still around.
			</p>
			<p className='mt-8'>
				<Link href='/' className='link'>
					Back to home
				</Link>
			</p>
		</main>
	)
}
