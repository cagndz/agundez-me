import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@/components/icons/arrow-left'
import { PostToc } from '@/components/post-toc'
import { formatDate, getHeadings, getPost, getSlugs } from '@/lib/writing'

export const dynamicParams = false

export async function generateStaticParams() {
	return (await getSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
	params,
}: PageProps<'/writing/[slug]'>): Promise<Metadata> {
	const { slug } = await params
	const { meta } = await getPost(slug)
	return { title: meta.title, description: meta.summary }
}

export default async function Post({ params }: PageProps<'/writing/[slug]'>) {
	const { slug } = await params
	const { default: Content, meta } = await getPost(slug)
	const headings = await getHeadings(slug)

	return (
		<>
			<div className='lg:fixed lg:top-24 lg:left-8'>
				<div className='flex flex-col gap-10'>
					<Link
						href='/'
						className='group inline-flex items-center gap-1.5 self-start whitespace-nowrap text-muted transition-colors duration-150 ease-out-strong hover:text-foreground'
					>
						<ArrowLeft className='size-3.5 transition-transform duration-150 ease-out-strong motion-safe:group-hover:-translate-x-0.5' />
						Home
					</Link>
					{headings.length >= 3 && <PostToc headings={headings} />}
				</div>
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
