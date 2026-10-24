'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

// One full turn every 2 s, for both cards.
const TURN_MS = 2000
const BLOCK_MS = 1000

const buttonBase =
	'rounded-xs border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors duration-150 ease-out-quart active:scale-98 disabled:opacity-50'

// Keeps the main thread busy, like a heavy render or a long task would.
function blockMainThread(ms: number) {
	const end = performance.now() + ms
	while (performance.now() < end) {
		// Busy on purpose.
	}
}

function Lane({
	label,
	note,
	children,
}: {
	label: string
	note: string
	children: ReactNode
}) {
	return (
		<div className='flex flex-col items-center gap-3'>
			<div className='grid size-24 place-items-center'>{children}</div>
			<div className='text-center'>
				<p className='font-mono text-xs tracking-widest uppercase'>{label}</p>
				<p className='text-sm text-muted'>{note}</p>
			</div>
		</div>
	)
}

const cardClass = 'h-14 w-10 rounded-[4px] bg-foreground'

export function MainThreadDemo() {
	const [playing, setPlaying] = useState(false)
	const [blocked, setBlocked] = useState(false)
	const jsCard = useRef<HTMLDivElement>(null)
	const angle = useRef(0)

	// The JavaScript card: a new rotation written to its style on every frame.
	useEffect(() => {
		if (!playing) return
		let frame = 0
		let last = performance.now()
		const tick = (now: number) => {
			angle.current = (angle.current + ((now - last) / TURN_MS) * 360) % 360
			last = now
			if (jsCard.current) {
				jsCard.current.style.transform = `rotate(${angle.current}deg)`
			}
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [playing])

	const handleBlock = () => {
		setPlaying(true)
		setBlocked(true)
		// Two frames later the label has painted, then the thread stops.
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				blockMainThread(BLOCK_MS)
				setBlocked(false)
			}),
		)
	}

	return (
		<div className='mt-8 rounded-xs border border-border p-4'>
			<div className='grid grid-cols-2 gap-4 py-2'>
				<Lane label='CSS' note='On the compositor'>
					<div
						className={`${cardClass} animate-[spin_2s_linear_infinite] ${playing ? '' : '[animation-play-state:paused]'}`}
					/>
				</Lane>
				<Lane label='JavaScript' note='On the main thread'>
					<div ref={jsCard} className={cardClass} />
				</Lane>
			</div>

			<div className='mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4'>
				<button
					type='button'
					aria-pressed={playing}
					onClick={() => setPlaying((value) => !value)}
					disabled={blocked}
					className={`${buttonBase} hover:bg-foreground/5`}
				>
					{playing ? 'Pause' : 'Play'}
				</button>
				<button
					type='button'
					onClick={handleBlock}
					disabled={blocked}
					className='rounded-xs bg-foreground px-4 py-2 font-mono text-xs tracking-widest text-background uppercase transition-[opacity,scale] duration-150 ease-out-quart hover:opacity-85 active:scale-98 disabled:opacity-50'
				>
					Block main thread for 1 s
				</button>
			</div>

			<p className='mt-4 text-sm' aria-live='polite'>
				{blocked
					? 'Main thread blocked. Only the CSS card keeps turning.'
					: 'Press block while they turn.'}
			</p>
		</div>
	)
}
