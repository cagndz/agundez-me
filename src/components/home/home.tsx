'use client'

import { useEffect, useRef } from 'react'
import { Contact } from './contact'
import { homeProjects, type Post } from './data'
import { martian } from './fonts'
import { InlineScript } from './inline-script'
import { Ledger } from './ledger'
import { Name } from './name'
import { fine, Preview, type PreviewHandle } from './preview'
import './home.css'

// The homepage, after the sleeve of Aphex Twin's Syro (The Designers
// Republic): a deadpan list of what there is, set as a ledger, in one ink.
// One face for the whole page, Martian Mono at one width; the name is set
// in it too, a step up from the list. Name, list and links make one column
// on one left edge, a little above the middle of the screen. A project's
// demo shows beside the pointer (preview.tsx), and the rest of the list
// steps back from the row under it.
//
// Three sizes on a 4px grid. Font sizes are free; every line height, gap
// and box is a multiple of 4 (spacing in steps of 8 where it can). The
// text is 13 on a 20 line; the name a step up, 20 on 24; what only labels
// or qualifies a step down at 11 (the headings on the list's own 20 line,
// so each is one row of the ledger; the line under the name on 16). Gaps:
// 32 between sections and before the links, 48 from the name to the list.
// The demo's plate is 320 by 200. Hairlines and optical nudges (the
// underline's 2px drop, the name's side bearing) sit outside the grid on
// purpose.
//
// On the first visit of a session the page rules itself in (home.css).

const INK = '#1f36d1'
const PAPER = '#faf9f7'

// The entrance plays on the first visit of a session, on a page opened
// from outside the site, with motion allowed; ?intro forces it. A reload
// or coming back from a post shows the page as it is. An inline script
// decides and marks the page before its first paint, so that what the
// entrance brings in is never seen first; should the page never be
// played, the mark lifts on its own.
const GATE = `{var e=document.currentScript&&document.currentScript.parentElement;try{var q=/[?&]intro(=|&|$)/.test(location.search),r=document.referrer,s=false;try{s=!!r&&new URL(r).origin===location.origin}catch(_){}if(e&&(q||(!sessionStorage.getItem('intro')&&!s&&!matchMedia('(prefers-reduced-motion: reduce)').matches))){e.setAttribute('data-intro','');sessionStorage.setItem('intro','1');setTimeout(function(){if(!e.hasAttribute('data-play'))e.removeAttribute('data-intro')},4000)}}catch(_){}}`
// Long enough for the last of it (home.css)
const INTRO_MS = 2000

export function Home({ posts }: { posts: Post[] }) {
	const root = useRef<HTMLDivElement>(null)
	const preview = useRef<PreviewHandle>(null)
	const leave = useRef<ReturnType<typeof setTimeout>>(undefined)

	// A marked page is held, unseen, until its face has loaded; then the
	// entrance plays, and once it is over the marks come off
	useEffect(() => {
		const el = root.current
		if (!el?.hasAttribute('data-intro')) return
		let alive = true
		let timer: ReturnType<typeof setTimeout>
		document.fonts.ready.then(() => {
			if (!alive) return
			requestAnimationFrame(() => {
				el.setAttribute('data-play', '')
				timer = setTimeout(() => {
					el.removeAttribute('data-intro')
					el.removeAttribute('data-play')
				}, INTRO_MS)
			})
		})
		return () => {
			alive = false
			clearTimeout(timer)
		}
	}, [])

	// Pointing at a project raises its demo by the pointer; focusing one
	// from the keyboard raises it beside the row. Moving between projects
	// keeps it up, so only leaving them all lets it go.
	const bind = (i: number) => {
		const hold = () => clearTimeout(leave.current)
		const release = () => {
			clearTimeout(leave.current)
			leave.current = setTimeout(() => preview.current?.close(), 60)
		}
		return {
			onPointerEnter: (e: React.PointerEvent) => {
				if (!fine()) return
				hold()
				preview.current?.open(i, e.clientX, e.clientY)
			},
			onPointerMove: (e: React.PointerEvent) =>
				preview.current?.move(e.clientX, e.clientY),
			onPointerLeave: release,
			onFocus: (e: React.FocusEvent<HTMLElement>) => {
				if (!e.currentTarget.matches(':focus-visible')) return
				hold()
				const r = e.currentTarget.getBoundingClientRect()
				preview.current?.open(i, r.right, r.top + r.height / 2)
			},
			onBlur: release,
		}
	}

	return (
		<div
			ref={root}
			style={{ '--ink': INK, '--paper': PAPER } as React.CSSProperties}
			// The gate marks this element before it is painted
			suppressHydrationWarning
			className={`${martian.className} relative min-h-svh bg-(--paper) px-6 text-[13px] leading-5 text-(--ink) [font-stretch:87.5%]`}
		>
			<InlineScript html={GATE} />
			<div className='mx-auto flex min-h-svh max-w-[58ch] flex-col py-8'>
				<div className='min-h-6 flex-[1_1_0]' />
				<Name />
				<main className='mt-12'>
					<Ledger posts={posts} bind={bind} />
				</main>
				<Contact
					className='mt-8'
					order={homeProjects.length + posts.length + 2}
				/>
				<div className='min-h-6 flex-[1.4_1_0]' />
			</div>
			<Preview ref={preview} />
		</div>
	)
}
