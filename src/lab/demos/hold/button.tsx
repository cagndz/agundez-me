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
	BLEED,
	BLUR,
	DROP,
	FOLLOW,
	HEIGHT,
	HOLD,
	IMPACT,
	IMPACT_TIMING,
	NECK_FROM,
	NECK_H,
	NECK_MIN,
	NECK_W,
	RADIUS_CURVE,
	REACH_SPAN,
	RECOIL,
	RECOIL_TIMING,
	REFILL_CLIMB,
	REGATHER,
	REWIND,
	SAG,
	drawBack,
	fall,
} from './constants'
import { GooFilter } from './goo-filter'
import { LiquidInk } from './liquid'
import { useSvgId } from './utils'

// Hold to confirm, as a drop. The button is a reservoir of liquid ink.
// While held, it drains through the bottom centre into a drop that swells
// beneath it, heavier and lower on a neck that thins. Let go early and it
// all flows back. Hold to the end and the drop lets go: the neck follows it
// down and is absorbed, so nothing is left hanging. A fallen drop doesn't
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
	const filterId = useSvgId('hold-goo')
	const reduceMotion = useReducedMotion()
	const [phase, setPhase] = useState<Phase>('idle')
	const phaseRef = useRef<Phase>('idle')
	const hold = useRef<AnimationPlaybackControls | null>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	// How much of the ink has gone into the drop
	const progress = useMotionValue(0)
	// 0 while attached; 1 once the neck has followed the drop down
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
	const dropTop = useTransform(() => center.get() + fallY.get() - radius.get())

	// The neck runs from the bottom of the button to the drop. Released, its
	// top slides down to the drop, so it's absorbed instead of snapping.
	const neckTop = useTransform(
		() => NECK_FROM + (dropTop.get() - NECK_FROM) * released.get(),
	)
	const neckScaleY = useTransform(
		// Overlaps the drop by a couple of pixels while attached; none once
		// absorbed, so not even a sliver rides on top of the drop
		() =>
			Math.max(dropTop.get() + 2 * (1 - released.get()) - neckTop.get(), 0) /
			NECK_H,
	)
	const neckScaleX = useTransform(
		progress,
		[0, 0.12, 1],
		[0, 1, NECK_MIN / NECK_W],
	)

	// The drop's shape: stretched by speed while it travels
	const velocity = useVelocity(fallY)
	const stretch = useTransform(
		() => Math.min(Math.abs(velocity.get()) / 1600, 0.7) * falling.get(),
	)
	const dropY = useTransform(() => center.get() - DROP / 2 + fallY.get())
	const dropScaleX = useTransform(
		() => (radius.get() / (DROP / 2)) * (1 - stretch.get() * 0.3),
	)
	const dropScaleY = useTransform(
		() => (radius.get() / (DROP / 2)) * (1 + stretch.get()),
	)
	const innerScaleX = useTransform(() => squashX.get() * absorb.get())
	const innerScaleY = useTransform(() => squashY.get() * absorb.get())

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
			<GooFilter id={filterId} blur={BLUR} />
			{/* The ink: button, neck, drop and children in one filtered layer, so
			    the goo melts them together. It repaints on every frame of the
			    animation, so it gets its own GPU layer and its repaints stay
			    inside it. */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute [transform:translateZ(0)] [contain:layout_paint]'
				style={{
					top: -BLEED,
					left: -BLEED,
					width: area.width + BLEED * 2,
					height: area.height + BLEED * 2,
					padding: BLEED,
					filter: `url(#${filterId})`,
				}}
			>
				<div className='relative size-full'>
					{children}
					<LiquidInk
						progress={progress}
						buttonY={buttonY}
						phase={phase}
						x={x}
						width={width}
						height={HEIGHT}
					/>
					<motion.div
						className='absolute top-0 rounded-full bg-foreground'
						style={{
							left: x + width / 2 - NECK_W / 2,
							width: NECK_W,
							height: NECK_H,
							y: neckTop,
							scaleX: neckScaleX,
							scaleY: neckScaleY,
							originY: 0,
						}}
					/>
					{/* Outer: travels and grows from its centre. Inner: squashes from
					    its base when it lands, and is absorbed */}
					<motion.div
						className='absolute top-0'
						style={{
							left: x + width / 2 - DROP / 2,
							width: DROP,
							height: DROP,
							y: dropY,
							scaleX: dropScaleX,
							scaleY: dropScaleY,
						}}
					>
						<motion.div
							className='size-full rounded-full bg-foreground'
							style={{
								scaleX: innerScaleX,
								scaleY: innerScaleY,
								originY: 1,
							}}
						/>
					</motion.div>
				</div>
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
