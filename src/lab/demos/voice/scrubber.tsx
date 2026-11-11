'use client'

import { useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { BARS, KEY_STEP, SPAN } from './constants'
import { formatTime, resample, type Note } from './notes'

// The note's waveform, to scrub. The played part is a second copy of the
// bars clipped to the playhead, so it moves smoothly between bars and a
// tap glides there on the playhead's spring. A drag follows the finger
// with no spring at all: `draggingRef` tells the island to jump instead.

const HEIGHT = 24
// Past this many pixels a press becomes a drag
const SLOP = 3

export function Scrubber({
	note,
	time,
	shown,
	offset,
	draggingRef,
	onSeek,
}: {
	note: Note
	time: number
	shown: MotionValue<number>
	offset: number
	draggingRef: React.RefObject<boolean>
	onSeek: (time: number) => void
}) {
	const bars = resample(note.bars, BARS)
	const press = useRef<number | null>(null)
	const clipPath = useTransform(shown, (value) => {
		const at = value - offset
		// Past this note (it ended or was skipped): all played
		const played = at >= SPAN ? 1 : Math.max(0, Math.min(1, at / note.duration))
		return `inset(0 ${100 - played * 100}% 0 0)`
	})

	function seekTo(e: React.PointerEvent<HTMLDivElement>) {
		const r = e.currentTarget.getBoundingClientRect()
		const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
		onSeek(f * note.duration)
	}

	const row = (className: string) => (
		<span className='flex h-full items-center justify-between'>
			{bars.map((b, i) => (
				<span
					key={i}
					className={`w-0.5 rounded-full ${className}`}
					style={{ height: Math.max(2, Math.round(b * HEIGHT)) }}
				/>
			))}
		</span>
	)

	return (
		<div
			role='slider'
			tabIndex={0}
			aria-label={`Position in ${note.name}’s voice note`}
			aria-valuemin={0}
			aria-valuemax={Math.round(note.duration)}
			aria-valuenow={Math.round(time)}
			aria-valuetext={`${formatTime(time)} of ${formatTime(note.duration)}`}
			onPointerDown={(e) => {
				e.currentTarget.setPointerCapture(e.pointerId)
				press.current = e.clientX
				seekTo(e)
			}}
			onPointerMove={(e) => {
				if (press.current === null) return
				if (Math.abs(e.clientX - press.current) > SLOP)
					draggingRef.current = true
				if (draggingRef.current) seekTo(e)
			}}
			onPointerUp={() => {
				press.current = null
				draggingRef.current = false
			}}
			onPointerCancel={() => {
				press.current = null
				draggingRef.current = false
			}}
			onKeyDown={(e) => {
				if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
				e.preventDefault()
				onSeek(time + (e.key === 'ArrowRight' ? KEY_STEP : -KEY_STEP))
			}}
			className='group relative h-8 flex-1 cursor-pointer touch-none rounded-sm py-1 select-none'
		>
			<span className='relative block' style={{ height: HEIGHT }}>
				{row(
					'bg-[#f4f4f2]/22 transition-colors duration-150 ease-out-strong group-hover:bg-[#f4f4f2]/32',
				)}
				<motion.span className='absolute inset-0' style={{ clipPath }}>
					{row('bg-[#f4f4f2]')}
				</motion.span>
			</span>
		</div>
	)
}
