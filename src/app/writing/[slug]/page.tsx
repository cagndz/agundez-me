import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, getPost, getSlugs } from '@/lib/writing'

export const dynamicParams = false

export async function generateStaticParams() {
	return (await getSlugs()).map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const { meta } = await getPost(slug)
	return { title: meta.title, description: meta.summary }
}

export default async function Post({ params }: Props) {
	const { slug } = await params
	const { default: Content, meta } = await getPost(slug)

	return (
		<>
			<div className='lg:absolute lg:inset-y-0 lg:right-full lg:mr-12 lg:w-max'>
				<Link
					href='/'
					className='group inline-flex items-center gap-1.5 whitespace-nowrap text-muted transition-colors duration-150 ease-out-strong hover:text-foreground lg:sticky lg:top-24'
				>
					<span
						aria-hidden
						className='transition-transform duration-150 ease-out-strong motion-safe:group-hover:-translate-x-0.5'
					>
						←
					</span>
					Home
				</Link>
			</div>
			<header className='mt-10 lg:mt-0'>
				<h1 className='font-medium tracking-tight'>{meta.title}</h1>
				<time dateTime={meta.date} className='text-muted'>
					{formatDate(meta.date)}
				</time>
			</header>
			<article className='mt-10'>
				<Content />
			</article>
		</>
	)
}
