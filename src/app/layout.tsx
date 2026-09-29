import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: { default: 'Carlos Agúndez', template: '%s · Carlos Agúndez' },
	description: 'Design engineer.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className='min-h-full'>
				<div className='mx-auto w-full max-w-xl px-6 py-24'>
					<main id='main' className='relative'>
						{children}
					</main>
				</div>
			</body>
		</html>
	)
}
