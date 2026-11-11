'use client'

import {
	useImperativeHandle,
	useRef,
	useState,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	type Ref,
} from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useTransform,
	useVelocity,
	type AnimationPlaybackControls,
} from 'motion/react'
import {
	ABSORB,
	DROP,
	FILLET,
	FOLLOW,
	HEIGHT,
	HOLD,
	IMPACT,
	IMPACT_TIMING,
	NECK_THIN,
	NECK_WIDE,
	RADIUS_CURVE,
	REACH_SPAN,
	RECOIL,
	RECOIL_TIMING,
	REFILL_CLIMB,
	REGATHER,
	REWIND,
	SAG,
	TAIL_SHARE,
	drawBack,
	fall,
} from './constants'
import { attached, ellipse, stub, tailed } from './drip'
import { LiquidInk } from './liquid'

// Hold to confirm, as a drop. The button is a reservoir of liquid ink.
// While held, it drains through the bottom centre into a drop that swells
// beneath it, heavier and lower on a neck that thins. Let go early and it
// all flows back. Hold to the end and the thread breaks: the drop falls,
// rounding up its half of the thread, and the button draws in the rest.
// Everything is drawn with real curves (see drip.ts), no blur. A fallen drop doesn't
// come back on its own; resetting has to draw it back up.

type Phase = 'idle' | 'holding' | 'falling' | 'done' | 'rising' | 'refilling'

export type HoldButtonHandle = {
	/** Draws the drop back up and refills the button. Only once done. */
	reset: () => void
	focus: () => void
}

type HoldButtonProps = {
	ref?: Ref<HoldButtonHandle>
	label: string
	doneLabel: string
	width: number
	// The button's left edge inside the area
	x: number
	// The ink layer's box: room for the drop to fall, and for whatever is
	// drawn in the same ink (children)
	area: { width: number; height: number }
	// Where the drop's base ends its fall, from the button's top
	landAt: number
	onLand: () => void
	// Drawn in the same ink layer as the button and drop, so they melt together
	children?: ReactNode
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

export function HoldButton({
	ref,
	label,
	doneLabel,
	width,
	x,
	area,
	landAt,
	onLand,
	children,
}: HoldButtonProps) {
	const reduceMotion = useReducedMotion()
	const [phase, setPhase] = useState<Phase>('idle')
	const phaseRef = useRef<Phase>('idle')
	const hold = useRef<AnimationPlaybackControls | null>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	// How much of the ink has gone into the drop
	const progress = useMotionValue(0)
	// 0 while attached; 1 once the thread has broken and drawn in
	const released = useMotionValue(0)
	const fallY = useMotionValue(0)
	const falling = useMotionValue(0)
	const squashX = useMotionValue(1)
	const squashY = useMotionValue(1)
	const absorb = useMotionValue(1)
	const buttonY = useMotionValue(0)

	// Nothing shows at rest: drop and neck start at zero and appear with the
	// first moment of the hold
	const radius = useTransform(
		progress,
		(p) => (DROP / 2) * Math.pow(p, RADIUS_CURVE),
	)
	const center = useTransform(
		() => HEIGHT - 3 + Math.pow(progress.get(), 1.4) * SAG + radius.get(),
	)
	// The drop's shape: stretched by speed while it travels
	const velocity = useVelocity(fallY)
	const stretch = useTransform(
		() => Math.min(Math.abs(velocity.get()) / 1600, 0.7) * falling.get(),
	)

	// Drop, neck and the fillet under the button as one outline
	const cx = x + width / 2
	const drip = useTransform(() => {
		const p = progress.get()
		const r = released.get()
		const top = HEIGHT + buttonY.get()
		const size = radius.get()
		const s = stretch.get()
		const k = absorb.get()
		// Stretched, squashed or absorbed, its base stays where it is
		const bottom = center.get() + fallY.get() + size
		const rx = size * (1 - s * 0.3) * squashX.get() * k
		const ry = size * (1 + s) * squashY.get() * k
		const drop = { cx, cy: bottom - ry, rx, ry }
		const half = Math.min(NECK_WIDE - (NECK_WIDE - NECK_THIN) * p, size * 0.7)
		const fillet = Math.min(FILLET, size)
		if (r <= 0.001) return attached(drop, cx, top, fillet, half)
		if (r >= 0.999) return ellipse(drop)
		// Parting, or closing: the gap between the button and the drop,
		// shared between the stub and the tail
		const open = Math.max(drop.cy - drop.ry - (top + fillet), 0) * (1 - r)
		return (
			stub(cx, top, fillet * (1 - r), half, open * (1 - TAIL_SHARE)) +
			tailed(drop, open * TAIL_SHARE)
		)
	})

	function go(next: Phase) {
		phaseRef.current = next
		setPhase(next)
	}

	function press() {
		if (phaseRef.current !== 'idle') return
		go('holding')
		hold.current?.stop()
		hold.current = animate(progress, 1, {
			duration: HOLD * (1 - progress.get()),
			ease: 'linear',
			onComplete: confirm,
		})
	}

	function release() {
		if (phaseRef.current !== 'holding') return
		hold.current?.stop()
		go('idle')
		animate(progress, 0, drawBack(progress.get()))
	}

	async function confirm() {
		go('falling')
		if (reduceMotion) {
			released.set(1)
			absorb.set(0)
			onLand()
			go('done')
			return
		}
		animate(released, 1, FOLLOW)
		animate(buttonY, RECOIL.y, RECOIL_TIMING)
		const distance = landAt - (center.get() + radius.get())
		falling.set(1)
		await animate(fallY, distance, fall(distance))
		falling.set(0)
		animate(squashX, IMPACT.scaleX, IMPACT_TIMING)
		animate(squashY, IMPACT.scaleY, IMPACT_TIMING)
		animate(absorb, 0, ABSORB)
		onLand()
		go('done')
	}

	function reset() {
		if (phaseRef.current !== 'done') return
		go('rising')
		squashX.set(1)
		squashY.set(1)
		if (reduceMotion) {
			for (const value of [fallY, released, progress]) value.set(0)
			absorb.set(1)
			go('idle')
			return
		}
		const rise = fallY.get()
		// The rise's share of the path, by distance (see REWIND)
		const split = rise / (rise + REFILL_CLIMB)
		let refilling = false

		// Out of the stain, back into a drop: its size, not its path
		animate(absorb, 1, REGATHER)
		falling.set(1)
		animate(0, 1, {
			...REWIND,
			onUpdate: (s) => {
				fallY.set(rise * (1 - clamp01(s / split)))
				released.set(1 - clamp01((s - (split - REACH_SPAN / 2)) / REACH_SPAN))
				progress.set(1 - clamp01((s - split) / (1 - split)))
				if (s >= split && !refilling) {
					refilling = true
					falling.set(0)
					go('refilling')
				}
			},
			onComplete: () => go('idle'),
		})
	}

	useImperativeHandle(ref, () => ({
		reset,
		focus: () => buttonRef.current?.focus(),
	}))

	function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
		if (event.button !== 0) return
		event.currentTarget.setPointerCapture(event.pointerId)
		press()
	}

	function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
			event.preventDefault()
			press()
		}
	}

	function onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === ' ' || event.key === 'Enter') release()
	}

	const showsDone =
		phase === 'falling' || phase === 'done' || phase === 'rising'

	return (
		<div
			// isolate: the label's difference blend reads only the button, never
			// the page behind it
			className='group/hold relative isolate'
			style={{ width: area.width, height: HEIGHT }}
		>
			{/* The empty button: what's left once the ink has gone into the drop */}
			<motion.div
				aria-hidden='true'
				// The focus ring lives here, not on the button: under the label's
				// difference blend it would turn white
				className='absolute top-0 rounded-full bg-(--surface) ring-1 ring-foreground/20 outline-offset-2 ring-inset group-has-[:focus-visible]/hold:outline-2'
				style={{ left: x, width, height: HEIGHT, y: buttonY }}
			/>
			{/* The ink: the stain (children), the liquid in the button, and the
			    drop with its neck */}
			<div aria-hidden='true' className='pointer-events-none absolute inset-0'>
				{children}
				<LiquidInk
					progress={progress}
					buttonY={buttonY}
					phase={phase}
					x={x}
					width={width}
					height={HEIGHT}
				/>
				<svg
					className='absolute top-0 left-0 overflow-visible text-foreground'
					width={area.width}
					height={area.height}
				>
					<motion.path d={drip} fill='currentColor' />
				</svg>
			</div>

			<motion.button
				ref={buttonRef}
				type='button'
				aria-disabled={phase !== 'idle' && phase !== 'holding'}
				data-phase={phase}
				// White under a difference blend: paper on the ink, ink once it has
				// drained, split along the surface while it drains
				className='absolute top-0 grid cursor-pointer touch-none place-items-center rounded-full text-sm text-white mix-blend-difference outline-none select-none aria-disabled:cursor-default'
				style={{ left: x, width, height: HEIGHT, y: buttonY }}
				onPointerDown={onPointerDown}
				onPointerUp={release}
				onPointerCancel={release}
				onLostPointerCapture={release}
				onKeyDown={onKeyDown}
				onKeyUp={onKeyUp}
				onBlur={release}
				onContextMenu={(event) => event.preventDefault()}
			>
				{showsDone ? doneLabel : label}
			</motion.button>
		</div>
	)
}
