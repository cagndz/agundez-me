'use client'

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'
import { useMotionValue } from 'motion/react'
import { SPAN } from './constants'
import { NOTES, type Note } from './notes'

// The queue: pending voice notes played on a clock, one after another.
// A note that ends counts as heard and the next pending one starts.
// `direction` is where the new note sits in the row from the last one
// (1: to the right), so a change can come in from that side.
//
// The clock is not React state. It's a motion value, `position`: the time
// in the current note plus index × SPAN, set every frame without a single
// re-render. React state only holds what changes now and then: who's
// playing, whether it plays, who's been heard. Note and time change in the
// same write, so nothing ever sees one note's time with another's index.

type State = {
	index: number
	playing: boolean
	heard: string[]
	rate: number
	direction: 1 | -1
}

const INITIAL: State = {
	index: 0,
	playing: false,
	heard: [],
	rate: 1,
	direction: 1,
}

function nextPending(notes: Note[], heard: string[], from: number) {
	for (let k = 1; k <= notes.length; k++) {
		const i = (from + k) % notes.length
		if (!heard.includes(notes[i].id)) return i
	}
	return -1
}

const towards = (from: number, to: number) => (to < from ? -1 : 1)

/** This note is done: it counts as heard and the next pending one is up. */
function finish(s: State, notes: Note[]): [State, number] {
	const note = notes[s.index]
	const heard = s.heard.includes(note.id) ? s.heard : [...s.heard, note.id]
	const next = nextPending(notes, heard, s.index)
	if (next === -1) return [{ ...s, heard, playing: false }, note.duration]
	return [{ ...s, heard, index: next, direction: towards(s.index, next) }, 0]
}

export function useQueue(notes: Note[] = NOTES) {
	const [s, setS] = useState<State>(INITIAL)
	// The state as of the last write, for the clock and the handlers to read
	// without waiting for a render
	const live = useRef(s)
	const position = useMotionValue(0)

	const timeNow = useCallback(
		() => position.get() - live.current.index * SPAN,
		[position],
	)

	const commit = useCallback(
		(next: State, time: number) => {
			live.current = next
			setS(next)
			position.set(next.index * SPAN + time)
		},
		[position],
	)

	useEffect(() => {
		if (!s.playing) return
		let raf = 0
		let last = performance.now()
		const loop = (now: number) => {
			const dt = Math.min(0.1, (now - last) / 1000)
			last = now
			const st = live.current
			const time = timeNow() + dt * st.rate
			if (time < notes[st.index].duration) {
				position.set(st.index * SPAN + time)
			} else {
				const [next, at] = finish(st, notes)
				commit(next, at)
				if (!next.playing) return
			}
			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)
		return () => cancelAnimationFrame(raf)
	}, [s.playing, notes, position, timeNow, commit])

	const play = useCallback(() => {
		const st = live.current
		if (st.heard.length === notes.length)
			commit({ ...INITIAL, rate: st.rate, playing: true }, 0)
		else commit({ ...st, playing: true }, timeNow())
	}, [notes, commit, timeNow])

	/** Play this one, from where it was if it's already up, else from the start. */
	const playAt = useCallback(
		(index: number) => {
			const st = live.current
			const same = index === st.index
			const time = same && timeNow() < notes[index].duration ? timeNow() : 0
			commit(
				{
					...st,
					index,
					playing: true,
					heard: st.heard.filter((id) => id !== notes[index].id),
					direction: same ? st.direction : towards(st.index, index),
				},
				time,
			)
		},
		[notes, commit, timeNow],
	)

	const pause = useCallback(
		() => commit({ ...live.current, playing: false }, timeNow()),
		[commit, timeNow],
	)

	const seek = useCallback(
		(time: number) => {
			const st = live.current
			const at = Math.max(0, Math.min(time, notes[st.index].duration - 0.01))
			position.set(st.index * SPAN + at)
		},
		[notes, position],
	)

	const setRate = useCallback(
		(rate: number) => commit({ ...live.current, rate }, timeNow()),
		[commit, timeNow],
	)

	const reset = useCallback(
		() => commit({ ...INITIAL, rate: live.current.rate }, 0),
		[commit],
	)

	const current = notes[s.index]
	const pending = notes.filter((n) => !s.heard.includes(n.id))

	return {
		current,
		index: s.index,
		position,
		playing: s.playing,
		rate: s.rate,
		direction: s.direction,
		heard: s.heard,
		pending,
		done: pending.length === 0,
		notes,
		timeNow,
		play,
		playAt,
		pause,
		seek,
		setRate,
		reset,
	}
}

export type Queue = ReturnType<typeof useQueue>

/** A coarse pointer (touch) is in use: no hover to fan the stack with. */
export function useCoarsePointer() {
	return useSyncExternalStore(
		(onChange) => {
			const query = window.matchMedia('(pointer: coarse)')
			query.addEventListener('change', onChange)
			return () => query.removeEventListener('change', onChange)
		},
		() => window.matchMedia('(pointer: coarse)').matches,
		() => false,
	)
}

/** Pointer down outside the island, or Escape: back to idle. */
export function useDismiss(
	open: boolean,
	ref: React.RefObject<HTMLElement | null>,
	onDismiss: () => void,
) {
	const onDismissRef = useRef(onDismiss)
	useEffect(() => {
		onDismissRef.current = onDismiss
	})

	useEffect(() => {
		if (!open) return
		const onPointerDown = (e: PointerEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node))
				onDismissRef.current()
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return
			// Behind something modal: the Escape is that one's
			if (ref.current?.closest('[inert], [aria-hidden="true"]')) return
			// Ahead of everything else, so a dialog the demo sits in doesn't
			// close on the same key: the first Escape folds, the next closes
			e.stopPropagation()
			onDismissRef.current()
		}
		document.addEventListener('pointerdown', onPointerDown)
		window.addEventListener('keydown', onKeyDown, true)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			window.removeEventListener('keydown', onKeyDown, true)
		}
	}, [open, ref])
}
