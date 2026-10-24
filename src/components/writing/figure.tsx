import type { ReactNode } from 'react'

// The frame for the images, videos and demos in posts, with the caption
// underneath: a soft, borderless surface tinted from the text color, so it
// follows the theme. Media that bring their own background go without it.
export function Figure({
	caption,
	children,
	surface = true,
	className = '',
}: {
	caption?: ReactNode
	children: ReactNode
	surface?: boolean
	className?: string
}) {
	return (
		<figure className='mt-8'>
			<div
				className={`${surface ? 'rounded-xl bg-foreground/[0.04]' : ''} ${className}`}
			>
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
