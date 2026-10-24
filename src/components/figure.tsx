import type { ReactNode } from 'react'

// Frame and caption shared by the images, videos and demos in posts.
export function Figure({
	caption,
	children,
}: {
	caption?: ReactNode
	children: ReactNode
}) {
	return (
		<figure className='mt-8'>
			<div className='overflow-hidden rounded-xs border border-border'>
				{children}
			</div>
			{caption && (
				<figcaption className='mt-3 text-sm leading-6 text-muted'>
					{caption}
				</figcaption>
			)}
		</figure>
	)
}
