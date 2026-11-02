'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Print } from './print'
import { HOME, type Post, type Row } from './sections'
import { WorkTable } from './work-table'
import './home.css'

// The homepage, in one ink. Half the page is a blue block: the name leads,
// huge, and whatever row you're on takes its place, big line and small,
// with its object printed as a 1-bit dither in the bottom left, cut by the
// edges. Over the block the pointer is a loupe. The other half is the work,
// as a table.
//
// In one column (below 1024px, or without a mouse) the block is only a
// header: the name, no object, no loupe, and nothing in it reacts to the
// rows, so a tap on a row never reflows the page.

const INK = '#1f36d1'
// The site's paper (--background); the canvas needs the literal colour.
const PAPER = '#faf9f7'

const theme = {
	'--ink': INK,
	'--paper': PAPER,
	background: PAPER,
	color: INK,
} as React.CSSProperties

// Moving from one row to the next fires a leave, then an enter. Waiting a
// beat before going back to the name keeps it from flashing in between.
const SETTLE = 90

const WIDE = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

function useWide() {
	return useSyncExternalStore(
		(onChange) => {
			const m = matchMedia(WIDE)
			m.addEventListener('change', onChange)
			return () => m.removeEventListener('change', onChange)
		},
		() => matchMedia(WIDE).matches,
		() => false,
	)
}

// The entrance plays on every full load: the server always renders the
// page marked for it, and it's plain CSS. Coming back from a post or the
// lab with client navigation mounts the page again, but it keeps still:
// this module outlives client navigation and starts over on a full load.
let entered = false

export function Home({ posts }: { posts: Post[] }) {
	// Decided on mount, and only read here: on the server and at hydration
	// it's still false, so both render the entrance and agree.
	const [enter] = useState(() => !entered)
	useEffect(() => {
		entered = true
	}, [])
	const wide = useWide()
	const [row, setRow] = useState<Row | null>(null)
	const leave = useRef<ReturnType<typeof setTimeout>>(undefined)
	const type = useRef<HTMLDivElement>(null)

	useEffect(() => () => clearTimeout(leave.current), [])

	const hover = (r: Row | null) => {
		if (!wide) return
		clearTimeout(leave.current)
		if (r) return setRow(r)
		leave.current = setTimeout(() => setRow(null), SETTLE)
	}

	// Under the loupe the print takes the type over: the real type is masked
	// out in all but the outer quarter of the zone, where the dots under it
	// are still nearly solid, so the hand-over is soft.
	const lens = (x: number, y: number, r: number) => {
		const el = type.current
		if (!el) return
		if (r < 1) {
			el.style.maskImage = ''
			return
		}
		el.style.maskImage = `radial-gradient(circle ${r}px at ${x - el.offsetLeft}px ${y - el.offsetTop}px, transparent 75%, #000 100%)`
	}

	// Leaving the wide layout drops whatever was on show.
	const shown = wide ? row : null
	const title = shown ? (shown.title ?? shown.name) : HOME.title
	const detail = shown ? shown.detail : HOME.detail

	return (
		<div
			style={theme}
			data-enter={enter ? '' : undefined}
			className='min-h-screen text-base leading-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
		>
			<header className='relative overflow-hidden bg-(--ink) text-[15px] text-(--paper) lg:sticky lg:top-0 lg:h-screen'>
				{wide && (
					<Print
						shape={shown ? shown.shape : 'none'}
						color={PAPER}
						text={type}
						onLens={lens}
						className='absolute inset-0 h-full w-full'
					/>
				)}
				<div
					ref={type}
					className='pointer-events-none relative px-6 pt-10 pb-8 lg:p-8'
				>
					{/* The big type's side bearing is pulled back so it lines up
					    with the small text under it. */}
					<h1 className='-ml-[0.035em] text-[clamp(3rem,7.5vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.055em] [overflow-wrap:anywhere]'>
						{title}
					</h1>
					<p className='mt-4 min-h-4 font-mono text-xs leading-4 opacity-80'>
						{detail.map((line) => (
							<span key={line} className='block'>
								{line}
							</span>
						))}
					</p>
				</div>
			</header>
			<main className='px-6 py-4 lg:px-8 lg:py-12'>
				{/* Narrow on purpose: the kinds and dates stay close to the names
				    they belong to, instead of out at the far edge of the half. */}
				<div className='home-list mx-auto max-w-[40rem]'>
					<WorkTable posts={posts} onHover={hover} />
				</div>
			</main>
		</div>
	)
}
