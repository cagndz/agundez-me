import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SITE_URL } from '@/lib/site'

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
	description:
		'Design engineer based in Spain. Interfaces, prototypes and notes on the details.',
	metadataBase: new URL(SITE_URL),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang='en'
			data-scroll-behavior='smooth'
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className='min-h-full'>{children}</body>
		</html>
	)
}
