'use client'

import { useEffect, useRef, useState } from 'react'
import { Figure } from './figure'

type PostVideoProps = {
	// Listed in order of preference. WebM first: Chromium builds without
	// proprietary codecs can't play MP4, and Safari picks the MP4.
	sources: { src: string; type: string }[]
	poster: string
	width: number
	height: number
	label: string
	// Short labels over each half of a side-by-side clip.
	columns?: string[]
	caption?: string
}

// Plays muted and looped while it is on screen, and stops when it leaves.
// With reduced motion it never starts on its own: the native controls are
// shown instead, so playing it is the reader's choice.
export function PostVideo({
	sources,
	poster,
	width,
	height,
	label,
	columns,
	caption,
}: PostVideoProps) {
	const ref = useRef<HTMLVideoElement>(null)
	const [reduceMotion, setReduceMotion] = useState(false)

	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)')
		const update = () => setReduceMotion(query.matches)
		update()
		query.addEventListener('change', update)
		return () => query.removeEventListener('change', update)
	}, [])

	useEffect(() => {
		const video = ref.current
		if (!video || reduceMotion) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					// Autoplay can still be refused (data saver, low power mode).
					video.play().catch(() => {})
				} else {
					video.pause()
				}
			},
			{ threshold: 0.5 },
		)
		observer.observe(video)
		return () => observer.disconnect()
	}, [reduceMotion])

	return (
		<Figure caption={caption}>
			{columns && (
				<div
					className='grid border-b border-border font-mono text-[11px] tracking-widest text-muted uppercase'
					style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
				>
					{columns.map((column) => (
						<span key={column} className='px-3 py-2 text-center'>
							{column}
						</span>
					))}
				</div>
			)}
			<video
				ref={ref}
				poster={poster}
				width={width}
				height={height}
				aria-label={label}
				muted
				loop
				playsInline
				preload='metadata'
				controls={reduceMotion}
				className='block h-auto w-full'
			>
				{sources.map((source) => (
					<source key={source.src} src={source.src} type={source.type} />
				))}
			</video>
		</Figure>
	)
}
