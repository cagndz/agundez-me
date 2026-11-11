'use client'

import { useEffect } from 'react'
import {
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
	type MotionValue,
} from 'motion/react'
import {
	BADGE,
	BADGE_AT,
	BADGE_FROM,
	BADGE_SLIDE,
	INSTANT,
	LEVEL,
	REDUCED,
} from './constants'
import type { Note } from './notes'

// Who's talking, shown on their face: a small badge whose bars move with
// the voice. They read the note's own waveform at the playhead, so they
// move when the person speaks and rest in their pauses; paused, or with
// reduced motion, they settle into three dots.

const BARS_PER_SECOND = 10

function levelAt(note: Note, at: number) {
	const i = Math.floor(at * BARS_PER_SECOND)
	if (i < 0 || i >= note.bars.length) return 0
	// The waveform's floor is near-silence: below it, nothing
	return Math.max(0, (note.bars[i] - 0.1) / 0.9)
}

/** The voice's level right now, 0–1, smoothed; 0 while paused. */
function useLevel(
	note: Note,
	position: MotionValue<number>,
	offset: number,
	playing: boolean,
	lag = 0,
) {
	const reduceMotion = useReducedMotion()
	const active = useMotionValue(playing && !reduceMotion ? 1 : 0)
	useEffect(() => {
		active.set(playing && !reduceMotion ? 1 : 0)
	}, [active, playing, reduceMotion])
	const raw = useTransform(
		[position, active],
		([value, on]: number[]) => on * levelAt(note, value - offset + lag),
	)
	return useSpring(raw, LEVEL)
}

const transition = (reduceMotion: boolean | null) =>
	reduceMotion ? { layout: INSTANT, default: REDUCED } : BADGE_SLIDE

/** Three bars in a small disc at the face's lower right. */
export function VoiceBadge({
	note,
	position,
	offset,
	playing,
}: {
	note: Note
	position: MotionValue<number>
	offset: number
	playing: boolean
}) {
	const reduceMotion = useReducedMotion()
	// Each bar reads a slightly different moment, so they don't move as one
	const a = useLevel(note, position, offset, playing, -0.12)
	const b = useLevel(note, position, offset, playing, 0)
	const c = useLevel(note, position, offset, playing, 0.12)
	return (
		<motion.span
			layoutId='indicator'
			aria-hidden='true'
			initial={{ opacity: 0, scale: reduceMotion ? 1 : BADGE_FROM }}
			animate={{ opacity: 1, scale: 1 }}
			transition={transition(reduceMotion)}
			className='pointer-events-none absolute flex items-center justify-center gap-[1.5px] rounded-full bg-[#f4f4f2]'
			style={{
				width: BADGE,
				height: BADGE,
				left: BADGE_AT - BADGE / 2,
				top: BADGE_AT - BADGE / 2,
			}}
		>
			{[a, b, c].map((level, i) => (
				<Bar key={i} level={level} />
			))}
		</motion.span>
	)
}

function Bar({ level }: { level: MotionValue<number> }) {
	// A dot at rest, up to the full height on a loud syllable
	const scaleY = useTransform(level, (l) => 0.25 + 0.75 * l)
	return (
		<motion.span
			className='h-2 w-[2px] rounded-full bg-foreground'
			style={{ scaleY }}
		/>
	)
}
