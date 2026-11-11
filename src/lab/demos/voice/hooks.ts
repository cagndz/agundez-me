'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NOTES, type Note } from './notes'

// The queue: pending voice notes played on a clock, one after another.
// A note that ends counts as heard and the next pending one starts.
// `direction` is where the new note sits in the row from the last one
// (1: to the right), so a change can come in from that side.

type State = {
	index: number
	time: number
	playing: boolean
	heard: string[]
	rate: number
	direction: 1 | -1
}

const INITIAL: State = {
	index: 0,
	time: 0,
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

function finish(s: State, notes: Note[]): State {
	const note = notes[s.index]
	const heard = s.heard.includes(note.id) ? s.heard : [...s.heard, note.id]
	const next = nextPending(notes, heard, s.index)
	if (next === -1) return { ...s, heard, time: note.duration, playing: false }
	return {
		...s,
		heard,
		index: next,
		time: 0,
		direction: towards(s.index, next),
	}
}

const towards = (from: number, to: number) => (to < from ? -1 : 1)

export function useQueue(notes: Note[] = NOTES) {
	const [s, setS] = useState<State>(INITIAL)

	useEffect(() => {
		if (!s.playing) return
		let raf = 0
		let last = performance.now()
		const loop = (now: number) => {
			const dt = Math.min(0.1, (now - last) / 1000)
			last = now
			setS((prev) => {
				const time = prev.time + dt * prev.rate
				return time < notes[prev.index].duration
					? { ...prev, time }
					: finish(prev, notes)
			})
			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)
		return () => cancelAnimationFrame(raf)
	}, [s.playing, notes])

	const play = useCallback(() => {
		setS((prev) => {
			if (prev.heard.length === notes.length)
				return { ...INITIAL, rate: prev.rate, playing: true }
			return { ...prev, playing: true }
		})
	}, [notes])

	/** Play this one from the start, heard or not. */
	const playAt = useCallback(
		(index: number) =>
			setS((prev) => ({
				...prev,
				index,
				time:
					index === prev.index && prev.time < notes[index].duration
						? prev.time
						: 0,
				playing: true,
				heard: prev.heard.filter((id) => id !== notes[index].id),
				direction:
					index === prev.index ? prev.direction : towards(prev.index, index),
			})),
		[notes],
	)

	const pause = useCallback(
		() => setS((prev) => ({ ...prev, playing: false })),
		[],
	)

	const seek = useCallback(
		(time: number) =>
			setS((prev) => ({
				...prev,
				time: Math.max(0, Math.min(time, notes[prev.index].duration - 0.01)),
			})),
		[notes],
	)

	/** Done with this one: it counts as heard and the next one takes over. */
	const next = useCallback(() => setS((prev) => finish(prev, notes)), [notes])

	const setRate = useCallback(
		(rate: number) => setS((prev) => ({ ...prev, rate })),
		[],
	)

	const reset = useCallback(
		() => setS((prev) => ({ ...INITIAL, rate: prev.rate })),
		[],
	)

	const current = notes[s.index]
	const pending = notes.filter((n) => !s.heard.includes(n.id))
	const after = pending.filter((n) => n.id !== current.id)
	const remaining =
		pending.reduce((sum, n) => sum + n.duration, 0) -
		(s.heard.includes(current.id) ? 0 : s.time)

	return {
		current,
		index: s.index,
		time: s.time,
		playing: s.playing,
		rate: s.rate,
		direction: s.direction,
		heard: s.heard,
		pending,
		upNext: after[0] as Note | undefined,
		remaining,
		done: pending.length === 0,
		notes,
		play,
		playAt,
		pause,
		seek,
		next,
		setRate,
		reset,
	}
}

export type Queue = ReturnType<typeof useQueue>

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
