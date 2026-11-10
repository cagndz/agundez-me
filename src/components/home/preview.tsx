'use client'

import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { homeProjects, media } from './data'

// A project's demo, beside the pointer: it appears where the pointer is
// and follows it both ways with a soft lag. From one project to the next
// the demos slide like a strip of film. Flat and square, a hairline in the
// ink round it: printed on the page, not a card over it.
//
// From the keyboard there is no pointer to follow, so it opens beside the
// focused row instead.
//
// The demos are only loaded where they can be seen: with a pointer that
// hovers, once the page itself has loaded and the browser is idle (or at
// the first project pointed at or focused, if that comes sooner). A touch
// screen never fetches them.

const W = 320
const H = 200
// Between the pointer and the demo
const OFF = 24

export const fine = () =>
	matchMedia('(hover: hover) and (pointer: fine)').matches

export type PreviewHandle = {
	open: (i: number, x: number, y: number) => void
	move: (x: number, y: number) => void
	close: () => void
}

export function Preview({ ref }: { ref: React.Ref<PreviewHandle> }) {
	const outer = useRef<HTMLDivElement>(null)
	const s = useRef({ open: false, x: 0, y: 0, tx: 0, ty: 0, raf: 0 })
	const [active, setActive] = useState(0)
	const [open, setOpen] = useState(false)
	const [instant, setInstant] = useState(true)
	const [armed, setArmed] = useState(false)

	// Fetch the demos once the page is in, on a screen that can show them
	useEffect(() => {
		if (!fine()) return
		// Safari has no requestIdleCallback: a second after load stands in
		const idle = typeof requestIdleCallback === 'function'
		let handle = 0
		const arm = () => {
			handle = idle
				? requestIdleCallback(() => setArmed(true), { timeout: 2000 })
				: window.setTimeout(() => setArmed(true), 1000)
		}
		if (document.readyState === 'complete') arm()
		else addEventListener('load', arm, { once: true })
		return () => {
			removeEventListener('load', arm)
			if (idle) cancelIdleCallback(handle)
			else clearTimeout(handle)
		}
	}, [])

	const place = () => {
		const st = s.current
		// To the right of the pointer, or to its left when there is no room
		let left = st.x + OFF
		if (left + W > innerWidth - 16) left = st.x - OFF - W
		const top = Math.min(Math.max(16, st.y - H / 2), innerHeight - 16 - H)
		if (outer.current)
			outer.current.style.transform = `translate(${left}px, ${top}px)`
	}

	const follow = () => {
		const st = s.current
		const k = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.18
		st.x += (st.tx - st.x) * k
		st.y += (st.ty - st.y) * k
		const still = Math.abs(st.tx - st.x) < 0.3 && Math.abs(st.ty - st.y) < 0.3
		if (still) {
			st.x = st.tx
			st.y = st.ty
		}
		place()
		st.raf = still ? 0 : requestAnimationFrame(follow)
	}

	useImperativeHandle(ref, () => ({
		open(i, x, y) {
			const st = s.current
			st.tx = x
			st.ty = y
			setArmed(true)
			if (!st.open) {
				// It appears where it was asked for, on the right frame
				st.open = true
				st.x = x
				st.y = y
				place()
				setInstant(true)
				requestAnimationFrame(() =>
					requestAnimationFrame(() => setInstant(false)),
				)
			} else if (!st.raf) st.raf = requestAnimationFrame(follow)
			setActive(i)
			setOpen(true)
		},
		move(x, y) {
			const st = s.current
			if (!st.open) return
			st.tx = x
			st.ty = y
			if (!st.raf) st.raf = requestAnimationFrame(follow)
		},
		close() {
			s.current.open = false
			setOpen(false)
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
			style={{ width: W }}
			className='pointer-events-none fixed top-0 left-0 z-40'
		>
			<div
				style={{ height: H }}
				className={`origin-left border border-(--ink) bg-(--paper) transition-[opacity,transform] motion-reduce:transition-none ${
					open
						? 'scale-100 opacity-100 duration-200 ease-[cubic-bezier(0.19,1,0.22,1)]'
						: 'scale-[0.97] opacity-0 duration-150 ease-[ease]'
				}`}
			>
				{armed && (
					<Strip
						active={active}
						playing={open}
						instant={instant}
						className='size-full'
					/>
				)}
			</div>
		</div>
	)
}

// The demos as a strip of film, one above the other: changing project
// slides the strip to its frame. Only the one showing plays, from its
// start.
function Strip({
	active,
	playing,
	instant,
	className,
}: {
	active: number
	playing: boolean
	// Jump to the frame, without the slide
	instant: boolean
	className: string
}) {
	const videos = useRef<(HTMLVideoElement | null)[]>([])

	useEffect(() => {
		videos.current.forEach((v, j) => {
			if (!v) return
			if (playing && j === active) {
				v.currentTime = 0
				v.play().catch(() => {})
			} else v.pause()
		})
	}, [active, playing])

	return (
		<div className={`overflow-hidden ${className}`}>
			<div
				style={{
					transform: `translateY(${-active * 100}%)`,
					transition: instant
						? 'none'
						: 'transform 500ms cubic-bezier(0.19, 1, 0.22, 1)',
				}}
				className='flex h-full flex-col motion-reduce:transition-none!'
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
						className='h-full w-full shrink-0 object-cover'
					/>
				))}
			</div>
		</div>
	)
}
