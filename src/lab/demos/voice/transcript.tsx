'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import {
	animate,
	useMotionValueEvent,
	useReducedMotion,
	type MotionValue,
} from 'motion/react'
import { INSTANT, LINE, LINES, SCROLL, SPAN } from './constants'
import { spokenAt, type Note } from './notes'

// The transcript, lit word by word as it's said. It follows the same
// smoothed playhead as the scrubber, so a seek sweeps the light across the
// words instead of snapping. The text scrolls to keep the line being said
// second from the top: one line of what was just said above it.

export function Transcript({
	note,
	shown,
	offset,
}: {
	note: Note
	shown: MotionValue<number>
	offset: number
}) {
	const reduceMotion = useReducedMotion()
	const [spoken, setSpoken] = useState(() =>
		spokenAt(note.words, shown.get() - offset),
	)
	const text = useRef<HTMLParagraphElement>(null)
	const words = useRef<(HTMLSpanElement | null)[]>([])

	useMotionValueEvent(shown, 'change', (value) => {
		const at = value - offset
		// Another note's time: this one is on its way out, leave it be
		if (at < 0 || at >= SPAN) return
		const n = spokenAt(note.words, at)
		setSpoken((prev) => (prev === n ? prev : n))
	})

	useLayoutEffect(() => {
		const el = text.current
		const word = words.current[Math.max(0, spoken - 1)]
		if (!el || !word) return
		const end = Math.max(0, el.scrollHeight - LINE * LINES)
		const y = -Math.min(end, Math.max(0, word.offsetTop - LINE))
		animate(el, { y }, reduceMotion ? INSTANT : SCROLL)
	}, [spoken, reduceMotion])

	return (
		<div className='overflow-hidden' style={{ height: LINE * LINES }}>
			<p
				ref={text}
				aria-label={note.words.map((w) => w.text).join(' ')}
				className='relative text-[15px] tracking-[-0.01em]'
				style={{ lineHeight: `${LINE}px` }}
			>
				{note.words.map((word, i) => (
					<Fragment key={i}>
						<span
							ref={(el) => {
								words.current[i] = el
							}}
							aria-hidden='true'
							className={`transition-colors duration-200 ease-out-strong ${
								i < spoken ? 'text-[#f4f4f2]' : 'text-[#f4f4f2]/28'
							}`}
						>
							{word.text}
						</span>{' '}
					</Fragment>
				))}
			</p>
		</div>
	)
}
