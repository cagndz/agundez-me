'use client'

import { type RefObject, useEffect, useRef } from 'react'
import { InlineScript } from './inline-script'
import { Name } from './name'

// The first time the homepage is opened, it is printed in. The whole
// screen starts as a sheet of ink with the name on it in paper, in the
// middle. After a beat the name glides up to where it lives at the head of
// the page, and as it arrives the sheet lifts away from the bottom upwards:
// where its edge passes, the name turns from paper on ink to ink on paper
// (the copy on the sheet is registered exactly over the real heading), the
// same inversion as a row of the list under the pointer. The rest of the
// page comes up behind the edge as it uncovers it.
//
// Only on the first visit of a session, on a page opened from outside the
// site: an inline script, read before the first paint, decides and marks
// the page, and CSS (home.css) shows the sheet with the name already in the
// middle, so nothing flashes or jumps first. Coming from a post or the lab
// (by a link, or by the back button), reloading, or with reduced motion,
// there is no intro. ?intro forces it. A click, a key or the wheel skips to
// the end; should the script never run, the gate lifts the mark on its own.

const INK = '#1f36d1'
const PAPER = '#faf9f7'

// Marks the page, from the script tag inside it, before it is painted
const GATE = `{var e=document.currentScript&&document.currentScript.parentElement;try{var q=/[?&]intro(=|&|$)/.test(location.search),r=document.referrer,s=false;try{s=!!r&&new URL(r).origin===location.origin}catch(_){}if(e&&(q||(!sessionStorage.getItem('intro')&&!s&&!matchMedia('(prefers-reduced-motion: reduce)').matches))){e.setAttribute('data-intro','');sessionStorage.setItem('intro','1');setTimeout(function(){e.removeAttribute('data-intro')},8000)}}catch(_){}}`

// The beats, in ms
const GLIDE_AT = 600
const GLIDE = 900
const LIFT_AT = GLIDE_AT + 300
const LIFT = 1000
const OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'
const IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)'
const LIFT_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'

// The script that decides; render it as the first child of the page
export function IntroGate() {
	return <InlineScript html={GATE} />
}

export function Intro({ root }: { root: RefObject<HTMLElement | null> }) {
	const sheet = useRef<HTMLDivElement>(null)
	const name = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const page = root.current
		const el = sheet.current
		const group = name.current
		if (!page?.hasAttribute('data-intro') || !el || !group) return

		const all: Animation[] = []
		const run = (
			target: Element,
			frames: Keyframe[],
			opts: KeyframeAnimationOptions,
		) => {
			const a = target.animate(frames, { fill: 'both', ...opts })
			all.push(a)
			return a
		}

		// From the middle, where the CSS holds it, up to its place
		run(
			group,
			[
				{ transform: getComputedStyle(group).transform },
				{ transform: 'translateY(0)' },
			],
			{ duration: GLIDE, delay: GLIDE_AT, easing: IN_OUT },
		)

		// The sheet lifts from the bottom up
		const lift = run(
			el,
			[{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
			{ duration: LIFT, delay: LIFT_AT, easing: LIFT_EASE },
		)

		// The rest of the page, each piece as the edge uncovers it (roughly:
		// the edge's eased path, sampled by the piece's height on screen)
		const items = page.querySelectorAll<HTMLElement>('[data-intro-item]')
		items.forEach((item) => {
			const y = item.getBoundingClientRect().top
			const passed = Math.min(1, Math.max(0, 1 - y / innerHeight))
			run(
				item,
				[
					{ opacity: 0, transform: 'translateY(10px)' },
					{ opacity: 1, transform: 'translateY(0)' },
				],
				{
					duration: 600,
					delay: LIFT_AT + LIFT * (0.15 + passed * 0.6),
					easing: OUT_EXPO,
				},
			)
		})

		const detach = () => {
			removeEventListener('pointerdown', skip)
			removeEventListener('keydown', skip)
			removeEventListener('wheel', skip)
		}
		// Only a finished intro unmarks the page; torn down before that (a
		// remount), the next run starts it over
		const end = () => {
			page.removeAttribute('data-intro')
			all.forEach((a) => a.cancel())
			detach()
		}
		const skip = () => all.forEach((a) => a.finish())
		Promise.all(all.map((a) => a.finished)).then(end, () => {})
		lift.finished.then(
			() => {
				el.style.pointerEvents = 'none'
			},
			() => {},
		)
		addEventListener('pointerdown', skip)
		addEventListener('keydown', skip)
		addEventListener('wheel', skip, { passive: true })
		return () => {
			all.forEach((a) => a.cancel())
			el.style.pointerEvents = ''
			detach()
		}
	}, [root])

	return (
		<div
			ref={sheet}
			aria-hidden='true'
			style={{ background: INK, color: PAPER }}
			className='home-intro fixed inset-0 z-[60] px-6 pt-[34px] text-center'
		>
			<div ref={name} className='intro-name'>
				<Name as='div' />
			</div>
		</div>
	)
}
