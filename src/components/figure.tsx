import type { ReactNode } from 'react'

// A soft, borderless surface for the images, videos and demos in posts, with
// the caption underneath. The tint comes from the text color, so it follows
// the theme.
export function Figure({
	caption,
	children,
	className = '',
}: {
	caption?: ReactNode
	children: ReactNode
	className?: string
}) {
	return (
		<figure className='mt-8'>
			<div className={`rounded-xl bg-foreground/[0.04] ${className}`}>
				{children}
			</div>
			{caption && (
				<figcaption className='mt-3 text-[13px] leading-5 text-muted'>
					{caption}
				</figcaption>
			)}
		</figure>
	)
}
