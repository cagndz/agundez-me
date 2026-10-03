'use client'

import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Heading } from '@/lib/writing'

// A heading counts as "read" once it is this far from the top. It sits just
// below where an anchor click lands (scroll-mt-24 = 96px), so the section you
// jump to is the one that gets highlighted.
const READING_LINE = 120

const DOT = 6 // px, diameter of the dot

export function PostToc({ headings }: { headings: Heading[] }) {
	const [activeId, setActiveId] = useState<string | null>(null)
	// Set by a click: the clicked item stays active while the page scrolls there,
	// until the reader scrolls on their own.
	const lockedRef = useRef(false)

	// The dot: a spring follows the active item.
	const reduceMotion = useReducedMotion()
	const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})
	const placedRef = useRef(false)
	const y = useSpring(0, { stiffness: 420, damping: 34, mass: 0.7 })

	function placeDot(jump: boolean) {
		const item = activeId ? itemRefs.current[activeId] : null
		if (!item) return
		const target = item.offsetTop + item.offsetHeight / 2 - DOT / 2
		if (jump || reduceMotion || !placedRef.current) y.jump(target)
		else y.set(target)
		placedRef.current = true
	}

	useLayoutEffect(() => {
		placeDot(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeId])

	useEffect(() => {
		const onResize = () => placeDot(true)
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeId])

	useEffect(() => {
		let frame = 0

		function update() {
			frame = 0
			const atBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 2

			// Last heading that already crossed the reading line. At the very end
			// of the page the last one wins, even if it never reaches the line.
			let current: string | null = null
			for (const { id } of headings) {
				const el = document.getElementById(id)
				if (el && el.getBoundingClientRect().top <= READING_LINE) {
					current = id
				}
			}
			if (atBottom) current = headings[headings.length - 1].id
			setActiveId(current)
		}

		// One update per frame, however many scroll events arrive.
		function onScroll() {
			if (lockedRef.current) return
			if (!frame) frame = requestAnimationFrame(update)
		}

		// Real user input gives control back to the scroll position.
		function release() {
			if (!lockedRef.current) return
			lockedRef.current = false
			onScroll()
		}

		update()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onScroll)
		window.addEventListener('wheel', release, { passive: true })
		window.addEventListener('touchstart', release, { passive: true })
		window.addEventListener('keydown', release)
		window.addEventListener('mousedown', release)
		return () => {
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onScroll)
			window.removeEventListener('wheel', release)
			window.removeEventListener('touchstart', release)
			window.removeEventListener('keydown', release)
			window.removeEventListener('mousedown', release)
			if (frame) cancelAnimationFrame(frame)
		}
	}, [headings])

	return (
		<nav aria-label='On this page' className='hidden max-w-48 xl:block'>
			<ul className='relative border-l border-border'>
				<motion.span
					aria-hidden='true'
					initial={false}
					animate={{ opacity: activeId ? 1 : 0 }}
					transition={{ opacity: { duration: 0.15 } }}
					style={{
						y,
						width: DOT,
						height: DOT,
					}}
					className='absolute top-0 -left-[3.5px] rounded-full bg-accent'
				/>
				{headings.map(({ id, text }) => (
					<li
						key={id}
						ref={(el) => {
							itemRefs.current[id] = el
						}}
					>
						<a
							href={`#${id}`}
							onClick={() => {
								lockedRef.current = true
								setActiveId(id)
							}}
							aria-current={activeId === id ? 'location' : undefined}
							className='block py-1 pl-4 text-sm text-muted transition-colors duration-150 ease-out-strong hover:text-foreground aria-[current=location]:text-foreground'
						>
							{text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
