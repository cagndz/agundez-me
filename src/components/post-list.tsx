import Link from 'next/link'
import type { PostMeta } from '@/lib/writing'

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
			<ul className='group/list divide-y divide-border border-t border-border'>
				{posts.map(({ slug, meta }) => (
					<li key={slug}>
						<Link
							href={`/writing/${slug}`}
							className='block py-3 transition-opacity duration-150 ease-out-strong group-hover/list:opacity-40 hover:opacity-100!'
						>
							{meta.title}
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
