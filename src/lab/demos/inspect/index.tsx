'use client'

import {
	animate,
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from 'motion/react'
import { useRef, useState, type PointerEvent } from 'react'
import { Blueprint } from './blueprint'
import {
	CENTER,
	LENS_CLOSE_SPRING,
	LENS_OPEN_SPRING,
	LENS_RADIUS,
	SIZE,
	SUMMARY,
} from './constants'
import { Form } from './form'
import type { CardPoint } from './types'
import { getCardPoint, getFarthestCorner } from './utils'

export function Inspect() {
	const reduceMotion = useReducedMotion()

	// Pinned changes what the card says (aria-pressed) and what is announced, so
	// it is state. It only changes on a click or a key press, never on a move.
	const [pinned, setPinned] = useState(false)

	// Not state: nothing is drawn from these, they only remember what happened.
	const lastPointerType = useRef('mouse')
	const radiusTarget = useRef(0)

	// Position and size of the lens are motion values: they change dozens of times
	// a second and must not re-render the card.
	const x = useSpring(CENTER.x, LENS_OPEN_SPRING)
	const y = useSpring(CENTER.y, LENS_OPEN_SPRING)
	const radius = useMotionValue(0)

	// A spring can dip a hair under 0, and a negative radius is invalid CSS: the
	// whole clip-path would be dropped and the blueprint would flash over the card.
	const clipRadius = useTransform(radius, (value) => Math.max(0, value))
	const clipPath = useMotionTemplate`circle(${clipRadius}px at ${x}px ${y}px)`

	// Whether the lens is off screen. Read from the radius, not from what was last
	// asked: a closing lens is still on screen, and jumping it would snap it across.
	function isLensClosed() {
		return radius.get() < 1
	}

	// Glide to a point, or jump there when the lens is not on screen yet (it
	// should appear where the pointer is, not fly in from where it was).
	function moveTo(point: CardPoint, instant: boolean) {
		if (instant || reduceMotion) {
			x.jump(point.x)
			y.jump(point.y)
		} else {
			x.set(point.x)
			y.set(point.y)
		}
	}

	// Growing uses the quick spring, shrinking the slower one. Every pointer move
	// asks for the same size, so only a new target starts an animation: restarting
	// one would re-estimate its velocity and make the opening wobble.
	function resizeTo(target: number) {
		if (target === radiusTarget.current) return
		radiusTarget.current = target
		if (reduceMotion) {
			radius.jump(target)
			return
		}
		const spring = target < radius.get() ? LENS_CLOSE_SPRING : LENS_OPEN_SPRING
		animate(radius, target, spring)
	}

	function showLens(point: CardPoint) {
		if (pinned) return
		// The pointer drives the lens, so it stays right under it: any glide here
		// would leave the crosshair behind on a quick move.
		moveTo(point, true)
		resizeTo(LENS_RADIUS)
	}

	function hideLens() {
		if (pinned) return
		resizeTo(0)
	}

	function pin(point: CardPoint) {
		setPinned(true)
		moveTo(point, isLensClosed())
		resizeTo(getFarthestCorner(point))
	}

	// With a point the lens comes back there; without one (keyboard, touch) it
	// closes, because there is no pointer to hold it. The pointer drives it, so it
	// jumps under it and only the radius animates.
	function unpin(point?: CardPoint) {
		setPinned(false)
		if (point) {
			moveTo(point, true)
			resizeTo(LENS_RADIUS)
		} else {
			resizeTo(0)
		}
	}

	// A finger has no hover: on touch there is no lens, only tap to pin.
	function handlePointer(e: PointerEvent<HTMLDivElement>) {
		lastPointerType.current = e.pointerType
		if (e.pointerType === 'touch') return
		showLens(getCardPoint(e))
	}

	return (
		<>
			<div
				role='button'
				tabIndex={0}
				aria-pressed={pinned}
				aria-label='Inspect layout'
				className='relative cursor-crosshair rounded-2xl bg-white p-4 font-sans normal-case inset-ring inset-ring-foreground/10 select-none focus-visible:outline-offset-2'
				style={{ width: SIZE.width, height: SIZE.height }}
				onPointerEnter={handlePointer}
				onPointerMove={handlePointer}
				onPointerDown={(e) => {
					lastPointerType.current = e.pointerType
				}}
				onPointerLeave={(e) => {
					if (e.pointerType !== 'touch') hideLens()
				}}
				onClick={(e) => {
					const point = getCardPoint(e)
					if (!pinned) pin(point)
					else unpin(lastPointerType.current === 'touch' ? undefined : point)
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						if (e.repeat) return
						if (pinned) unpin()
						else pin(CENTER)
					} else if (e.key === 'Escape' && pinned) {
						// First Escape lets go of the blueprint; it must not also close the modal.
						e.stopPropagation()
						unpin()
					}
				}}
			>
				<Form />

				<motion.div
					aria-hidden='true'
					className='pointer-events-none absolute inset-0 rounded-[inherit]'
					style={{ clipPath }}
				>
					<Blueprint />
				</motion.div>
			</div>

			{/* Outside the button: a button's children are presentational, and a live
          region inside it might never be announced. */}
			<p aria-live='polite' className='sr-only'>
				{pinned ? SUMMARY : ''}
			</p>
		</>
	)
}
