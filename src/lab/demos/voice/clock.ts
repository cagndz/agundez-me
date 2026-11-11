'use client'

import { useState } from 'react'
import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { SPAN } from './constants'

/**
 * The whole seconds into one note, read off the queue's clock. React
 * re-renders when the second changes, not every frame. Another note's time
 * (this one on its way out) is ignored.
 */
export function useSeconds(position: MotionValue<number>, offset: number) {
	const read = (value: number) => Math.floor(value - offset)
	const [seconds, setSeconds] = useState(() => read(position.get()))
	useMotionValueEvent(position, 'change', (value) => {
		const at = value - offset
		if (at < 0 || at >= SPAN) return
		const next = read(value)
		setSeconds((prev) => (prev === next ? prev : next))
	})
	return seconds
}
