'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { MIN_INK } from './constants'
import type { Phase, Point, Stroke } from './types'
import { distance, totalLength } from './utils'

/**
 * The pad's state: strokes drawn with a pointer, and a countdown that starts
 * when the pen lifts. Touching the pad while it runs cancels it and keeps
 * drawing; when it ends, onConfirm runs with the strokes as they are then.
 */
export function useSignature({
	delay,
	onConfirm,
}: {
	delay: number
	onConfirm: (strokes: Stroke[]) => void
}) {
	const [strokes, setStrokes] = useState<Stroke[]>([])
	const [phase, setPhase] = useState<Phase>('empty')
	const timer = useRef<number | undefined>(undefined)
	const drawing = useRef(false)
	// The timer fires with the strokes as they are then, not as they were
	// when the effect ran
	const latest = useRef(strokes)
	const confirm = useRef(onConfirm)
	useEffect(() => {
		latest.current = strokes
		confirm.current = onConfirm
	})

	useEffect(() => () => clearTimeout(timer.current), [])

	const locked = phase === 'confirming' || phase === 'signed'

	// Pad coordinates. offsetWidth over the on-screen width undoes any scale
	// the page puts on the demo (DemoFit shrinks it on phones).
	function locate(el: HTMLElement, e: { clientX: number; clientY: number }) {
		const rect = el.getBoundingClientRect()
		const scale = el.offsetWidth / rect.width || 1
		return {
			x: (e.clientX - rect.left) * scale,
			y: (e.clientY - rect.top) * scale,
		}
	}

	function onPointerDown(e: PointerEvent<HTMLElement>) {
		if (locked || e.button !== 0) return
		clearTimeout(timer.current)
		// Throws for a pointer that's already gone; drawing works without it
		try {
			e.currentTarget.setPointerCapture(e.pointerId)
		} catch {}
		drawing.current = true
		const point = locate(e.currentTarget, e)
		setStrokes((prev) => [...prev, [point]])
		setPhase('drawing')
	}

	function onPointerMove(e: PointerEvent<HTMLElement>) {
		if (!drawing.current) return
		const el = e.currentTarget
		// Coalesced events can come back empty (synthetic events, some browsers)
		const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? []
		const events = coalesced.length ? coalesced : [e.nativeEvent]
		const points: Point[] = events.map((event) => locate(el, event))
		setStrokes((prev) => {
			const stroke = [...prev[prev.length - 1]]
			for (const p of points)
				if (distance(stroke[stroke.length - 1], p) >= 1) stroke.push(p)
			return [...prev.slice(0, -1), stroke]
		})
	}

	function onPointerUp() {
		if (!drawing.current) return
		drawing.current = false
		if (totalLength(latest.current) < MIN_INK) return
		setPhase('pending')
		timer.current = window.setTimeout(() => {
			setPhase('confirming')
			confirm.current(latest.current)
		}, delay)
	}

	function reset() {
		clearTimeout(timer.current)
		setStrokes([])
		setPhase('empty')
	}

	return {
		strokes,
		phase,
		/** The variant finished its confirmation */
		complete: () => setPhase('signed'),
		/** Back to drawing, ink kept; the countdown restarts after the next stroke */
		edit: () => setPhase('drawing'),
		reset,
		padProps: {
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp,
		},
	}
}
