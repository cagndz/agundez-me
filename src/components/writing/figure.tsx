import type { ReactNode } from 'react'

// The frame for the images, videos and demos in posts, with the caption
// underneath: a soft, borderless surface tinted from the text color, so it
// follows the theme. Media with a background of their own pass that color as
// `surface`, so the figure shows one background, not two.
export function Figure({
	caption,
	children,
	surface = 'bg-foreground/[0.04]',
	className = '',
}: {
	caption?: ReactNode
	children: ReactNode
	surface?: string
	className?: string
}) {
	return (
		<figure className='mt-8'>
			<div className={`rounded-xl ${surface} ${className}`}>{children}</div>
			{caption && (
				<figcaption className='mt-3 text-[13px] leading-5 text-muted'>
					{caption}
				</figcaption>
			)}
		</figure>
	)
}
