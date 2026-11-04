'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { contactLinks } from '@/content/contact'
import { BracketLink } from './bracket-link'
import { CopyEmail } from './copy-email'
import { homeProjects, type Post } from './data'
import { Intro, IntroGate } from './intro'
import { Name } from './name'
import { type RiseHandle, RisePreview } from './rise-preview'
import './home.css'

// The homepage as a typewritten booklet: one ink, a list in Geist Mono where every entry runs out to its figure
// along a row of dots, and the name at the head of the page in Unbounded.
// A project's demo rises out of the pointer. The first visit is printed in
// (intro.tsx).
//
// Sizes follow one golden scale from the body: 13 · 21 · 34 · 55 · 89 ·
// 144 · 233. The text is 13 on a 21 line (13 × φ), the name runs from 55
// on a phone to 233 on a large screen, the gaps are steps of the scale.

const INK = '#1f36d1'
const PAPER = '#faf9f7'
// The golden scale, in pixels
const S = { 0: 13, 1: 21, 2: 34, 3: 55, 4: 89, 5: 144, 6: 233 } as const
const DOTS = '.'.repeat(240)

const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches

function Entry({
	href,
	label,
	figure,
	...rest
}: {
	href: string
	label: React.ReactNode
	figure: string
} & React.HTMLAttributes<HTMLElement>) {
	const className =
		'flex items-end outline-none hover:bg-(--ink) hover:text-(--paper) focus-visible:bg-(--ink) focus-visible:text-(--paper)'
	const inner = (
		<>
			{/* On a narrow screen a long title wraps, its dots on its last line */}
			<span className='min-w-0'>{label}</span>
			<span
				aria-hidden='true'
				className='min-w-[2ch] flex-1 overflow-hidden whitespace-nowrap'
			>
				{DOTS}
			</span>
			<span className='shrink-0'>{figure}</span>
		</>
	)
	if (href.startsWith('/'))
		return (
			<Link href={href} className={className} {...rest}>
				{inner}
			</Link>
		)
	return (
		<a
			href={href}
			target={href.startsWith('http') ? '_blank' : undefined}
			rel={href.startsWith('http') ? 'noreferrer' : undefined}
			className={className}
			{...rest}
		>
			{inner}
		</a>
	)
}

export function Home({ posts }: { posts: Post[] }) {
	const page = useRef<HTMLDivElement>(null)
	const list = useRef<HTMLDivElement>(null)
	const head = useRef<HTMLElement>(null)
	const rise = useRef<RiseHandle>(null)
	const leave = useRef<ReturnType<typeof setTimeout>>(undefined)

	// Pointing at a project raises its demo; moving between projects keeps
	// it up, so only leaving them all lets it go
	const bind = (i: number) => ({
		onPointerEnter: (e: React.PointerEvent) => {
			if (!fine()) return
			clearTimeout(leave.current)
			rise.current?.open(i, e.clientX)
		},
		onPointerMove: (e: React.PointerEvent) => rise.current?.move(e.clientX),
		onPointerLeave: () => {
			clearTimeout(leave.current)
			leave.current = setTimeout(() => rise.current?.close(), 60)
		},
	})

	return (
		<div
			ref={page}
			// The intro's gate marks this element before it is painted
			suppressHydrationWarning
			style={{ '--ink': INK, '--paper': PAPER } as React.CSSProperties}
			className='grid min-h-svh grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr_auto] bg-(--paper) px-6 font-mono text-[13px] leading-[21px] text-(--ink)'
		>
			<IntroGate />
			<header ref={head} style={{ paddingTop: S[2] }} className='text-center'>
				<Name />
				<p
					data-intro-item
					style={{ marginTop: S[2] }}
					className='tracking-[0.08em] uppercase'
				>
					Design engineer, Spain
				</p>
			</header>

			<main
				style={{ paddingBlock: S[3] }}
				// With a pointer that hovers, the list sits in the middle of the
				// page, leaving room above it for the demos to rise into; on a
				// touch screen there are none, so it follows the name closely
				className='flex items-start justify-center [@media(hover:hover)_and_(pointer:fine)]:items-center'
			>
				<div ref={list} className='relative w-full max-w-[58ch]'>
					<section>
						<h2
							data-intro-item
							style={{ marginBottom: 8 }}
							className='tracking-[0.08em] text-(--ink)/60 uppercase'
						>
							Projects
						</h2>
						<ul>
							{homeProjects.map((p, i) => (
								<li key={p.id} data-intro-item>
									<Entry
										href={p.href}
										label={
											<>
												{p.name.toLowerCase()} [{p.kind}]
											</>
										}
										figure={p.year}
										{...bind(i)}
									/>
								</li>
							))}
						</ul>
					</section>

					<section style={{ marginTop: S[2] }}>
						<h2
							data-intro-item
							style={{ marginBottom: 8 }}
							className='tracking-[0.08em] text-(--ink)/60 uppercase'
						>
							Writing
						</h2>
						<ul>
							{posts.map(({ slug, meta }) => (
								<li key={slug} data-intro-item>
									<Entry
										href={`/writing/${slug}`}
										label={meta.title.toLowerCase()}
										figure={meta.date.slice(0, 7).replace('-', '.')}
									/>
								</li>
							))}
						</ul>
					</section>
				</div>
			</main>

			<footer
				data-intro-item
				style={{ paddingBottom: S[2] }}
				className='text-center'
			>
				{contactLinks.map(({ label, href }) => (
					<span key={label}>
						<BracketLink href={href}>{label.toLowerCase()}</BracketLink>
						<span
							aria-hidden='true'
							className='px-[1.25ch] opacity-40 sm:px-[2.25ch]'
						>
							·
						</span>
					</span>
				))}
				<CopyEmail />
			</footer>

			<RisePreview ref={rise} anchor={list} ceiling={head} />

			<Intro root={page} />
		</div>
	)
}
