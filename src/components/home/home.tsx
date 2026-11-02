'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Print } from './print'
import { Scramble } from './scramble'
import { type Post, PROJECT_IDS, type Row } from './sections'
import { WorkTable } from './work-table'

// The homepage, in one ink. Half the page is a blue block: the name leads,
// huge, and whatever row you're on takes its place, with its object printed
// as a 1-bit dither in the bottom left, small and cut by the edges. The
// other half is the work, as a table.
//
// In one column (below 1024px, or without a mouse) the block is only a
// header: the name, no object, and nothing in it reacts to the rows, so a
// tap on a row never reflows the page.

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

// The entrance plays once per visit: coming back from a post or the lab
// with client navigation keeps the page as it was. A full reload plays it
// again, since this lives in the module.
let introPlayed = false

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

export function Home({ posts }: { posts: Post[] }) {
	const wide = useWide()
	const [row, setRow] = useState<Row | null>(null)
	const [run, setRun] = useState(0)
	const leave = useRef<ReturnType<typeof setTimeout>>(undefined)
	const [intro] = useState(() => !introPlayed)

	useEffect(() => {
		introPlayed = true
		return () => clearTimeout(leave.current)
	}, [])

	// What's on show, kept outside render so the handlers can compare against
	// it. A click focuses the row it's already hovering (and blurs it on the
	// way out); those repeat events must not decode the name again.
	const current = useRef<string | null>(null)

	const show = (r: Row | null) => {
		const id = r ? r.id : null
		if (id === current.current) return
		current.current = id
		setRow(r)
		setRun((n) => n + 1)
	}

	const hover = (r: Row | null) => {
		if (!wide) return
		clearTimeout(leave.current)
		if (r) return show(r)
		leave.current = setTimeout(() => show(null), SETTLE)
	}

	// Leaving the wide layout drops whatever was on show.
	const shown = wide ? row : null
	// Under the name: "design engineer" on the way in, a project's kind on a
	// project, nothing for the rest.
	const sub = !shown
		? 'design engineer'
		: PROJECT_IDS.has(shown.id)
			? shown.meta
			: ''

	return (
		<div
			style={theme}
			className='min-h-screen text-[15px] leading-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
		>
			<header className='relative overflow-hidden bg-(--ink) text-(--paper) lg:sticky lg:top-0 lg:h-screen'>
				{wide && (
					<Print
						shape={shown ? shown.shape : 'none'}
						color={PAPER}
						className='absolute inset-0 h-full w-full'
					/>
				)}
				<div className='relative px-6 pt-10 pb-8 lg:p-8'>
					{/* The big type's side bearing is pulled back so it lines up
					    with the small text under it. */}
					<h1 className='-ml-[0.035em] text-[clamp(3rem,7.5vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.055em] [overflow-wrap:anywhere]'>
						<Scramble
							text={shown ? shown.name : 'carlos agúndez'}
							run={run}
							duration={420}
							intro={intro}
						/>
					</h1>
					<p className='mt-4 h-4 font-mono text-xs tabular-nums opacity-80'>
						<Scramble text={sub} run={run} duration={300} intro={intro} />
					</p>
				</div>
			</header>
			<main className='px-6 py-4 lg:px-8 lg:py-12'>
				{/* Narrow on purpose: the kinds and dates stay close to the names
				    they belong to, instead of out at the far edge of the half. */}
				<div className='mx-auto max-w-[38rem]'>
					<WorkTable posts={posts} onHover={hover} intro={intro} />
				</div>
			</main>
		</div>
	)
}
