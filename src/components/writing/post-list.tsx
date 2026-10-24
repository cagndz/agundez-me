import Link from 'next/link'
import type { PostMeta } from '@/lib/writing'
import { LinkArrow } from '@/components/link-arrow'

type Item = { slug: string; meta: PostMeta }

export function PostList({ posts }: { posts: Item[] }) {
	if (posts.length === 0) {
		return (
			<p className='text-muted'>Nothing here yet. First notes coming soon.</p>
		)
	}

	return (
		<section aria-labelledby='writing-heading'>
			<h2 id='writing-heading' className='mb-3 text-muted'>
				Writing
			</h2>
			<ul className='divide-y divide-border border-t border-border'>
				{posts.map(({ slug, meta }) => (
					<li key={slug}>
						<Link
							href={`/writing/${slug}`}
							className='group/link flex items-start gap-4 py-3'
						>
							{/* ISO date, so the first 4 characters are the year */}
							<time
								dateTime={meta.date}
								className='w-10 shrink-0 text-muted tabular-nums'
							>
								{meta.date.slice(0, 4)}
							</time>
							<span className='flex-1'>{meta.title}</span>
							<LinkArrow />
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
