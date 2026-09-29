import Link from 'next/link'
import { formatShortDate, type PostMeta } from '@/lib/writing'

type Item = { slug: string; meta: PostMeta }

export function PostList({ posts }: { posts: Item[] }) {
	if (posts.length === 0) {
		return (
			<p className='text-muted'>Nothing here yet. First notes coming soon.</p>
		)
	}

	// Integer-like keys ("2026") are enumerated in ascending order,
	// so sort explicitly to get newest year first.
	const years = Object.entries(
		Object.groupBy(posts, ({ meta }) => meta.date.slice(0, 4)),
	).sort(([a], [b]) => b.localeCompare(a))

	return (
		<section aria-labelledby='writing-heading'>
			<h2 id='writing-heading' className='mb-3 text-muted'>
				Writing
			</h2>
			<div className='group/list'>
				{years.map(([year, items = []]) => (
					<div
						key={year}
						className='grid grid-cols-[5rem_1fr] border-t border-border'
					>
						<h3 className='py-3 font-normal text-muted tabular-nums'>{year}</h3>
						<ul className='divide-y divide-border'>
							{items.map(({ slug, meta }) => (
								<li key={slug}>
									<Link
										href={`/writing/${slug}`}
										className='flex items-baseline justify-between gap-6 py-3 transition-opacity duration-150 ease-out-strong group-hover/list:opacity-40 hover:opacity-100!'
									>
										<span>{meta.title}</span>
										<time
											dateTime={meta.date}
											className='shrink-0 text-muted tabular-nums'
										>
											{formatShortDate(meta.date)}
										</time>
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	)
}
