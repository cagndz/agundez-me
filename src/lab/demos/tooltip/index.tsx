'use client'

import { useId, useState, type FocusEvent } from 'react'
import { motion } from 'motion/react'
import {
	BLEED,
	BLUR,
	CLOSE_DELAY,
	CLOSED,
	FALL,
	GATHER,
	HIT,
	IMPACT,
	IMPACT_TIMING,
	LAND,
	OPEN,
	PANEL_HEIGHT,
	PANEL_RADIUS,
	PANEL_WIDTH,
	REDUCED_FADE,
	REST,
	RISE,
	SIZE,
	SQUEEZE,
	SQUEEZE_TIMING,
	TEXT_DELAY,
	TEXT_IN,
	TEXT_OUT,
	TRIGGER,
	TRIGGER_TOP,
} from './constants'
import { GooFilter } from './goo-filter'
import { useHoverIntent, useHydratedReducedMotion } from './hooks'
import { Readout } from './readout'

const PANEL = { width: PANEL_WIDTH, height: PANEL_HEIGHT }
const TRIGGER_BOX = { top: TRIGGER_TOP, width: TRIGGER, height: TRIGGER }
const INSTANT = { duration: 0 }

export function Tooltip() {
	const tipId = useId()
	// url(#…) can't take the colons useId may return
	const filterId = `tooltip-goo-${tipId.replace(/[^a-zA-Z0-9]/g, '')}`
	const reduceMotion = useHydratedReducedMotion()
	const { open, show, hide, close } = useHoverIntent(CLOSE_DELAY)
	// The drop is for the pointer. Opened or closed from the keyboard, the
	// tooltip just appears and disappears: tabbing past it shouldn't cost
	// half a second of liquid every time.
	const [instant, setInstant] = useState(false)
	// The trigger only takes the hit of a drop that went out. Without this it
	// plays the impact on load, with nothing falling. Setting state during
	// render is the pattern React documents for following a changing value.
	const [hasOpened, setHasOpened] = useState(false)
	if (open && !hasOpened) setHasOpened(true)

	const isStill = reduceMotion || instant || !hasOpened

	function handlePointerEnter() {
		// Already open from the keyboard: leave it be, or the trigger would
		// squeeze with no drop coming out
		if (!open) setInstant(false)
		show()
	}

	function handleFocus(event: FocusEvent<HTMLButtonElement>) {
		// A click focuses the button too; only keyboard focus skips the drop
		setInstant(event.currentTarget.matches(':focus-visible'))
		show()
	}

	return (
		<div className='relative font-mono text-[11px] uppercase' style={SIZE}>
			<GooFilter id={filterId} blur={BLUR} />
			{/* The ink: trigger and panel in one filtered layer, so the goo melts
			    them together. Visual only, the text sits on top unfiltered. The
			    filter repaints this layer on every frame of the animation, so it
			    gets its own GPU layer and its repaints stay inside it. */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute [transform:translateZ(0)] [contain:layout_paint]'
				style={{ inset: -BLEED, padding: BLEED, filter: `url(#${filterId})` }}
			>
				<div className='relative size-full'>
					<motion.div
						className='absolute left-0 origin-bottom rounded-full bg-foreground'
						style={TRIGGER_BOX}
						initial={false}
						animate={isStill ? REST : open ? SQUEEZE : IMPACT}
						transition={
							isStill
								? INSTANT
								: open
									? SQUEEZE_TIMING
									: { ...IMPACT_TIMING, delay: HIT }
						}
					/>
					{!reduceMotion && (
						<motion.div
							className='absolute top-0 left-0 bg-foreground'
							style={{ ...PANEL, borderRadius: PANEL_RADIUS }}
							initial={CLOSED}
							animate={open ? OPEN : CLOSED}
							transition={
								instant
									? INSTANT
									: open
										? { x: LAND, y: RISE, scaleX: LAND, scaleY: LAND }
										: { x: GATHER, y: FALL, scaleX: GATHER, scaleY: GATHER }
							}
						/>
					)}
				</div>
			</div>
			{reduceMotion && (
				<motion.div
					aria-hidden='true'
					className='pointer-events-none absolute top-0 left-0 bg-foreground'
					style={{ ...PANEL, borderRadius: PANEL_RADIUS }}
					initial={{ opacity: 0 }}
					animate={{ opacity: open ? 1 : 0 }}
					transition={instant ? INSTANT : REDUCED_FADE}
				/>
			)}
			{/* Hoverable, so the pointer can move onto the panel to read it */}
			<motion.div
				id={tipId}
				role='tooltip'
				className='absolute top-0 left-0 flex flex-col justify-between px-4 py-3.5 text-[#f4f4f2]'
				style={{ ...PANEL, pointerEvents: open ? 'auto' : 'none' }}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={hide}
				initial={{ opacity: 0 }}
				animate={
					open
						? { opacity: 1, filter: 'blur(0px)' }
						: {
								opacity: 0,
								filter: reduceMotion || instant ? 'blur(0px)' : 'blur(3px)',
							}
				}
				transition={
					instant
						? INSTANT
						: open
							? { ...TEXT_IN, delay: reduceMotion ? 0 : TEXT_DELAY }
							: TEXT_OUT
				}
			>
				<Readout />
			</motion.div>
			{/* The button itself is see-through: its disc is drawn in the ink layer.
			    The ring is offset outward, an inset one would vanish on the ink. */}
			<button
				type='button'
				aria-label='Lab status'
				aria-describedby={tipId}
				className='absolute left-0 grid place-items-center rounded-full focus-visible:outline-offset-2'
				style={TRIGGER_BOX}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={hide}
				onFocus={handleFocus}
				// Closes the way it opened: instantly if from the keyboard
				onBlur={close}
				onKeyDown={(event) => {
					// The first Escape closes the tooltip; it must not also close
					// the lab's modal. Same rule as Wallet and Inspect.
					if (event.key === 'Escape' && open) {
						event.stopPropagation()
						setInstant(true)
						close()
					}
				}}
			>
				<span
					className={`size-2 rounded-full bg-accent ${open ? 'shadow-[0_0_8px_var(--color-accent)]' : ''}`}
				/>
			</button>
		</div>
	)
}
