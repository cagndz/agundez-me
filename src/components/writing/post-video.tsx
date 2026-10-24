'use client'

import { useEffect, useRef, useState } from 'react'
import { Figure } from '@/components/writing/figure'

type Clip = {
	label: string
	description: string
	poster: string
	width: number
	height: number
	// In order of preference. WebM first: Chromium builds without proprietary
	// codecs can't play MP4, and Safari picks the MP4.
	sources: { src: string; type: string }[]
}

function useReducedMotion() {
	const [reduce, setReduce] = useState(false)
	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)')
		const update = () => setReduce(query.matches)
		update()
		query.addEventListener('change', update)
		return () => query.removeEventListener('change', update)
	}, [])
	return reduce
}

function ClipVideo({
	clip,
	reduceMotion,
}: {
	clip: Clip
	reduceMotion: boolean
}) {
	const ref = useRef<HTMLVideoElement>(null)

	// Plays muted and looped only while on screen. With reduced motion it
	// never starts on its own: native controls let the reader decide.
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
		<div className='flex flex-col gap-3'>
			<video
				ref={ref}
				poster={clip.poster}
				width={clip.width}
				height={clip.height}
				aria-label={clip.description}
				muted
				loop
				playsInline
				preload='metadata'
				controls={reduceMotion}
				className='block h-auto w-full rounded-lg'
			>
				{clip.sources.map((source) => (
					<source key={source.src} src={source.src} type={source.type} />
				))}
			</video>
			<p className='text-center text-[13px] text-muted'>{clip.label}</p>
		</div>
	)
}

export function PostVideo({
	clips,
	caption,
}: {
	clips: Clip[]
	caption?: string
}) {
	const reduceMotion = useReducedMotion()

	return (
		<Figure caption={caption} className='p-3 sm:p-4'>
			<div
				className='grid gap-3 sm:gap-4'
				style={{
					gridTemplateColumns: `repeat(${clips.length}, minmax(0, 1fr))`,
				}}
			>
				{clips.map((clip) => (
					<ClipVideo key={clip.label} clip={clip} reduceMotion={reduceMotion} />
				))}
			</div>
		</Figure>
	)
}
