'use client'

import { type RefObject, useEffect, useImperativeHandle, useRef } from 'react'
import { homeProjects, media } from './data'

// A project's demo, risen over the pointer. Its place is just above the
// list (so the list is never covered), and it comes up into it from below:
// the whole picture rises a short way as it comes into focus and fades in,
// never scaled, never cut. There it keeps over the pointer, following it
// across with a soft lag. Moving to another project changes the picture in
// place; leaving the list lets it sink back a little as it blurs and fades
// away.
//
// Two layers, so the two motions never fight: the outer one is placed
// every frame (the follow), the inner one only animates the rise and the
// fall, relative to where the outer one is.
//
// Under reduced motion it simply appears and goes.

// Coming up: quick off the mark, long to settle (an exponential ease out).
// Going: gathering speed as it goes (ease in), much quicker.
const RISE = { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
const FALL = { duration: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
// Where it comes up from, and where it sinks to
const BELOW = { opacity: 0, transform: 'translateY(32px)', filter: 'blur(6px)' }
const GONE = { opacity: 0, transform: 'translateY(14px)', filter: 'blur(4px)' }
const UP = { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }
// Between the demo's bottom edge and the top of the list
const GAP = 21
// Its weight on the paper: a tight contact shadow and a soft one that
// spreads further, in the ink's own cool dark rather than black
const SHADOW = [
	'0 1px 2px rgb(15 23 60 / 0.10)',
	'0 4px 8px -2px rgb(15 23 60 / 0.10)',
	'0 12px 20px -10px rgb(15 23 60 / 0.22)',
	'0 2px 24px -4px rgb(15 23 60 / 0.10)',
].join(', ')
// The demos' proportions
const ASPECT = 16 / 10

// Where an animation has got to, to carry on from there
const now = (el: HTMLElement) => {
	const cs = getComputedStyle(el)
	return {
		opacity: Number(cs.opacity),
		transform: cs.transform === 'none' ? 'translateY(0)' : cs.transform,
		filter: cs.filter === 'none' ? 'blur(0px)' : cs.filter,
	}
}

export type RiseHandle = {
	open: (i: number, x: number) => void
	move: (x: number) => void
	close: () => void
}

export function RisePreview({
	ref,
	anchor,
	ceiling,
}: {
	ref: React.Ref<RiseHandle>
	// The list: the demo's bottom edge sits above its top
	anchor: RefObject<HTMLElement | null>
	// The name: the demo stays below it
	ceiling: RefObject<HTMLElement | null>
}) {
	const outer = useRef<HTMLDivElement>(null)
	const inner = useRef<HTMLDivElement>(null)
	const videos = useRef<(HTMLVideoElement | null)[]>([])
	const s = useRef({ open: false, i: -1, x: 0, tx: 0, raf: 0, w: 560 })

	const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches

	// Where the demo sits for the pointer at x: centred over it, kept on
	// screen, its bottom edge just above the list
	const box = (x: number) => {
		const a = anchor.current?.getBoundingClientRect()
		const w = s.current.w
		const h = w / ASPECT
		const left = Math.min(Math.max(16, x - w / 2), innerWidth - 16 - w)
		const top = (a?.top ?? innerHeight / 2) - GAP - h
		return { left, top, w, h }
	}

	const place = () => {
		const el = outer.current
		if (!el) return
		const b = box(s.current.x)
		el.style.transform = `translate(${b.left}px, ${b.top}px)`
	}

	// The soft lag across
	const follow = () => {
		const st = s.current
		st.x += (st.tx - st.x) * (reduce() ? 1 : 0.16)
		if (Math.abs(st.tx - st.x) < 0.3) st.x = st.tx
		place()
		st.raf = st.x !== st.tx ? requestAnimationFrame(follow) : 0
	}

	// Show project i's demo, from its start; the others wait, hidden
	const show = (i: number) => {
		videos.current.forEach((v, j) => {
			if (!v) return
			const on = j === i
			v.style.opacity = on ? '1' : '0'
			if (on) {
				v.currentTime = 0
				v.play().catch(() => {})
			} else v.pause()
		})
	}

	useImperativeHandle(ref, () => ({
		open(i, x) {
			const st = s.current
			const el = outer.current
			const inn = inner.current
			if (!el || !inn) return
			st.tx = x
			if (st.open) {
				// Already up: change the picture where it is
				if (i !== st.i) show(i)
				st.i = i
				if (!st.raf) st.raf = requestAnimationFrame(follow)
				return
			}
			st.open = true
			st.i = i
			st.x = x
			// As large as the room between the name and the list allows
			const a = anchor.current?.getBoundingClientRect()
			const c = ceiling.current?.getBoundingClientRect()
			const room = a && c ? a.top - GAP - c.bottom - 8 : 448
			st.w = Math.max(240, Math.min(480, innerWidth * 0.36, room * ASPECT))
			el.style.width = `${st.w}px`
			el.style.height = `${st.w / ASPECT}px`
			show(i)
			place()
			// If it was on its way out, it turns round from where it is
			const from = inn.getAnimations().length > 0 ? now(inn) : BELOW
			inn.getAnimations().forEach((an) => an.cancel())
			el.style.visibility = 'visible'
			if (reduce()) return
			inn.animate([from, UP], RISE)
		},
		move(x) {
			const st = s.current
			if (!st.open) return
			st.tx = x
			if (!st.raf) st.raf = requestAnimationFrame(follow)
		},
		close() {
			const st = s.current
			const el = outer.current
			const inn = inner.current
			if (!st.open || !el || !inn) return
			st.open = false
			const done = () => {
				if (st.open) return
				el.style.visibility = 'hidden'
				videos.current.forEach((v) => v?.pause())
			}
			if (reduce()) return done()
			// Away, from wherever the rise had got to: read where it is now,
			// then hand over from exactly there
			const from = now(inn)
			inn.getAnimations().forEach((an) => an.cancel())
			inn.animate([from, GONE], { ...FALL, fill: 'forwards' }).onfinish = done
		},
	}))

	useEffect(() => {
		const st = s.current
		return () => cancelAnimationFrame(st.raf)
	}, [])

	return (
		<div
			ref={outer}
			aria-hidden='true'
			style={{ visibility: 'hidden' }}
			className='pointer-events-none fixed top-0 left-0 z-40'
		>
			<div
				ref={inner}
				style={{ boxShadow: SHADOW }}
				className='relative h-full w-full overflow-hidden rounded-[8px]'
			>
				{homeProjects.map((p, i) => (
					<video
						key={p.id}
						ref={(v) => {
							videos.current[i] = v
						}}
						src={media[p.id].src}
						poster={media[p.id].poster}
						muted
						loop
						playsInline
						preload='auto'
						style={{ opacity: 0 }}
						className='absolute inset-0 size-full object-cover'
					/>
				))}
			</div>
		</div>
	)
}
