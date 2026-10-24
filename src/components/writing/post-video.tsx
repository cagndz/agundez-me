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

function PauseIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<rect x='2.5' y='2' width='2.4' height='8' rx='0.6' fill='currentColor' />
			<rect x='7.1' y='2' width='2.4' height='8' rx='0.6' fill='currentColor' />
		</svg>
	)
}

function PlayIcon() {
	return (
		<svg viewBox='0 0 12 12' className='size-3' aria-hidden='true'>
			<path
				d='M3.5 2.3v7.4a.6.6 0 0 0 .9.5l5.8-3.7a.6.6 0 0 0 0-1L4.4 1.8a.6.6 0 0 0-.9.5Z'
				fill='currentColor'
			/>
		</svg>
	)
}

// Muted, looping clips that play together, side by side. All clips must have
// the same length: they start at the same time and loop in step.
// They play only while on screen, and never on their own with reduced motion.
export function PostVideo({
	clips,
	caption,
}: {
	clips: Clip[]
	caption?: string
}) {
	const root = useRef<HTMLDivElement>(null)
	const videos = useRef<(HTMLVideoElement | null)[]>([])
	// null until the reader decides; then their choice wins over autoplay.
	const [wantsToPlay, setWantsToPlay] = useState<boolean | null>(null)
	const [reduceMotion, setReduceMotion] = useState(true)
	const [inView, setInView] = useState(false)

	const playing = (wantsToPlay ?? !reduceMotion) && inView

	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)')
		const update = () => setReduceMotion(query.matches)
		update()
		query.addEventListener('change', update)
		return () => query.removeEventListener('change', update)
	}, [])

	useEffect(() => {
		const element = root.current
		if (!element) return
		const observer = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ threshold: 0.5 },
		)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		const all = videos.current.filter((video) => video !== null)
		if (!playing) {
			all.forEach((video) => video.pause())
			return
		}
		// Line them up on the first clip's time before playing, so the
		// clicks in both recordings happen at the same moment.
		const time = all[0]?.currentTime ?? 0
		all.forEach((video) => {
			video.currentTime = time
			// Autoplay can still be refused (data saver, low power mode).
			video.play().catch(() => setWantsToPlay(false))
		})
	}, [playing])

	return (
		<Figure caption={caption} className='relative p-3 sm:p-4'>
			<div
				ref={root}
				className='grid gap-3 sm:gap-4'
				style={{
					gridTemplateColumns: `repeat(${clips.length}, minmax(0, 1fr))`,
				}}
			>
				{clips.map((clip, index) => (
					<div key={clip.label} className='flex flex-col gap-3'>
						<video
							ref={(video) => {
								videos.current[index] = video
							}}
							poster={clip.poster}
							width={clip.width}
							height={clip.height}
							aria-label={clip.description}
							muted
							loop
							playsInline
							preload='metadata'
							className='block h-auto w-full rounded-lg'
						>
							{clip.sources.map((source) => (
								<source key={source.src} src={source.src} type={source.type} />
							))}
						</video>
						<p className='text-center text-[13px] text-muted'>{clip.label}</p>
					</div>
				))}
			</div>
			<button
				type='button'
				aria-label={playing ? 'Pause videos' : 'Play videos'}
				onClick={() => setWantsToPlay(!playing)}
				className='absolute top-5 right-5 grid size-8 place-items-center rounded-full bg-background/90 text-foreground shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_1px_2px_rgb(26_25_23/0.08)] transition-[scale,background-color] duration-150 ease-out-quart hover:bg-background active:scale-[0.96] sm:top-6 sm:right-6'
			>
				{playing ? <PauseIcon /> : <PlayIcon />}
			</button>
		</Figure>
	)
}
