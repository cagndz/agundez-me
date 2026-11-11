'use client'

import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import {
	animate,
	motion,
	useMotionValueEvent,
	useReducedMotion,
	useTransform,
	type MotionValue,
} from 'motion/react'
import { INSTANT, LINE, LINES, SCROLL, SPAN } from './constants'
import { spokenAt, type Note, type Word as WordTiming } from './notes'

// The transcript, lit as it's said. Each word fills left to right over the
// time it takes to say it: a long word lights slowly, a short one quickly,
// and in a real pause the light waits. Only
// word timings are real (a transcript doesn't time letters), so the fill
// is a wipe across the word, not a letter-by-letter step. It follows the
// same smoothed playhead as the scrubber, so a seek sweeps the light across
// the words instead of snapping. The text scrolls to keep the line being
// said second from the top: one line of what was just said above it.
//
// Reduced motion: whole words light in turn, with a short fade.

const LIT = '#f4f4f2'
const DIM = 'rgb(244 244 242 / 0.28)'
// The wipe's soft leading edge, in px
const EDGE = 6

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
				{note.words.map((word, i) => {
					const ref = (el: HTMLSpanElement | null) => {
						words.current[i] = el
					}
					return (
						<Fragment key={i}>
							{reduceMotion ? (
								<span
									ref={ref}
									aria-hidden='true'
									className={`transition-colors duration-150 ease-out-strong ${
										i < spoken ? 'text-[#f4f4f2]' : 'text-[#f4f4f2]/28'
									}`}
								>
									{word.text}
								</span>
							) : (
								<Wipe ref={ref} word={word} shown={shown} offset={offset} />
							)}{' '}
						</Fragment>
					)
				})}
			</p>
		</div>
	)
}

/** One word, filled with light up to where the playhead is in it. */
function Wipe({
	ref,
	word,
	shown,
	offset,
}: {
	ref: (el: HTMLSpanElement | null) => void
	word: WordTiming
	shown: MotionValue<number>
	offset: number
}) {
	// The last fill seen while this note was playing, kept while it fades
	// out under the next one
	const last = useRef(0)
	const backgroundImage = useTransform(shown, (value) => {
		const at = value - offset
		if (at >= SPAN) last.current = 1
		else if (at >= 0)
			last.current = Math.max(
				0,
				Math.min(1, (at - word.start) / (word.end - word.start)),
			)
		// The edge travels EDGE px past the word, so at 0 nothing is lit and
		// at 1 all of it is
		const end = `calc(${last.current} * (100% + ${EDGE}px))`
		return `linear-gradient(90deg, ${LIT} calc(${end} - ${EDGE}px), ${DIM} ${end})`
	})
	return (
		<motion.span
			ref={ref}
			aria-hidden='true'
			className='bg-clip-text text-transparent'
			style={{ backgroundImage, WebkitBackgroundClip: 'text' }}
		>
			{word.text}
		</motion.span>
	)
}
