'use client'

import { useEffect, useState } from 'react'

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz#%&*@!$_^+'

// Text that decodes from noise, left to right. The server renders the real
// text and the noise only starts on the client, so hydration always matches
// and the text reads without JavaScript. Changing `run` plays it again;
// `intro={false}` skips the first play, so it only runs on a change.
export function Scramble({
	text,
	run = 0,
	delay = 0,
	duration = 520,
	intro = true,
	className = '',
}: {
	text: string
	run?: number
	delay?: number
	duration?: number
	intro?: boolean
	// Applied to the real text (e.g. truncation). The noise only inherits
	// from the parent, and is clipped to the real text's box with no ellipsis.
	className?: string
}) {
	// The noise is kept with the text it belongs to: when the text changes
	// and no animation runs (reduced motion), the new text shows as is.
	const [frame, setFrame] = useState({ text, out: text })
	const out = frame.text === text ? frame.out : text

	// What it showed on mount. Comparing against it (not a "has run" flag)
	// keeps this right when Strict Mode runs effects twice.
	const [initial] = useState(text)

	useEffect(() => {
		if (!intro && run === 0 && text === initial) return
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
		// intro only matters on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text, run, delay, duration])

	// The real text always holds the space, and the noise is laid over it.
	// Noise glyphs are wider or narrower than the letters they stand for, so
	// in flow they'd rewrap the line and shove everything below it around.
	const noisy = out !== text
	return (
		<span className='relative block'>
			<span className='sr-only'>{text}</span>
			<span
				aria-hidden='true'
				className={`block ${noisy ? 'invisible' : ''} ${className}`}
			>
				{text}
			</span>
			{noisy && (
				<span
					aria-hidden='true'
					className='absolute inset-0 block overflow-hidden'
				>
					{out}
				</span>
			)}
		</span>
	)
}
