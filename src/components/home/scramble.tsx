'use client'

import { useEffect, useState } from 'react'

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz#%&*@!$_^+'

// Text that decodes from noise, left to right. The server renders the real
// text and the noise only starts on the client, so hydration always matches
// and the text reads without JavaScript. Changing `run` plays it again.
export function Scramble({
	text,
	run = 0,
	delay = 0,
	duration = 520,
}: {
	text: string
	run?: number
	delay?: number
	duration?: number
}) {
	// The noise is kept with the text it belongs to: when the text changes
	// and no animation runs (reduced motion), the new text shows as is.
	const [frame, setFrame] = useState({ text, out: text })
	const out = frame.text === text ? frame.out : text

	useEffect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const chars = [...text]
		// Each character lands at its own time: left to right, with a little
		// jitter so the front edge isn't a straight line.
		const at = chars.map(
			(_, i) =>
				delay +
				(i / Math.max(chars.length, 1)) * duration * 0.75 +
				Math.random() * duration * 0.25,
		)
		let raf = 0
		let last = 0
		const t0 = performance.now()
		const tick = (now: number) => {
			const t = now - t0
			// New noise about every 40ms, so it flickers instead of boiling.
			if (now - last > 40 || t > delay + duration) {
				last = now
				setFrame({
					text,
					out: chars
						.map((c, i) =>
							c === ' ' || t >= at[i]
								? c
								: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
						)
						.join(''),
				})
			}
			if (t < delay + duration + 20) raf = requestAnimationFrame(tick)
		}
		raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(raf)
	}, [text, run, delay, duration])

	return (
		<>
			<span className='sr-only'>{text}</span>
			<span aria-hidden='true'>{out}</span>
		</>
	)
}
