import Link from 'next/link'
import type { PostMeta } from '@/lib/writing'
import { LinkArrow } from './link-arrow'

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
							className='group/link flex items-start justify-between gap-4 py-3'
						>
							<span>{meta.title}</span>
							<LinkArrow />
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
