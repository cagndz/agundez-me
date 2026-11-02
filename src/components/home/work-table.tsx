'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { EMAIL } from '@/content/contact'
import { Scramble } from './scramble'
import { type Post, type Row, sections } from './sections'

// The work as a table, after danielpetho.com: the section label on the
// left, a row per thing, its kind or date on the right.

function useCopy() {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => () => clearTimeout(timer.current), [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL)
			setCopied(true)
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setCopied(false), 1600)
		} catch {
			window.location.href = `mailto:${EMAIL}`
		}
	}
	return { copied, copy }
}

function RowLine({
	row,
	index,
	onHover,
	intro,
}: {
	row: Row
	index: number
	onHover: (row: Row | null) => void
	intro: boolean
}) {
	const { copied, copy } = useCopy()
	const external = row.href && !row.href.startsWith('/')
	const events = {
		onPointerEnter: () => onHover(row),
		onPointerLeave: () => onHover(null),
		onFocus: () => onHover(row),
		onBlur: () => onHover(null),
	}

	const body = (
		<>
			{/* Only the name underlines: it's what the link is. The meta just
			    comes up to full strength. The name decodes once on the way in. */}
			<span className='min-w-0 decoration-1 underline-offset-4 group-hover/row:underline group-focus-visible/row:underline lg:truncate'>
				<Scramble text={row.name} delay={120 + index * 45} intro={intro} />
			</span>
			<span className='shrink-0 tabular-nums opacity-70 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-visible/row:opacity-100'>
				{row.copy ? (
					<Scramble
						text={copied ? 'copied' : 'copy'}
						run={copied ? 1 : 0}
						duration={260}
					/>
				) : (
					<span aria-hidden={external ? true : undefined}>{row.meta}</span>
				)}
				{external && <span className='sr-only'>(opens in a new tab)</span>}
			</span>
		</>
	)

	const className =
		'group/row flex cursor-pointer items-baseline justify-between gap-6 py-0.5'

	if (row.copy)
		return (
			<button
				type='button'
				onClick={copy}
				aria-label={copied ? 'Email copied' : `Copy ${EMAIL}`}
				className={`w-full text-left ${className}`}
				{...events}
			>
				{body}
			</button>
		)
	if (external)
		return (
			<a
				href={row.href}
				target='_blank'
				rel='noopener noreferrer'
				className={className}
				{...events}
			>
				{body}
			</a>
		)
	return (
		<Link href={row.href!} className={className} {...events}>
			{body}
		</Link>
	)
}

export function WorkTable({
	posts,
	onHover,
	intro,
}: {
	posts: Post[]
	onHover: (row: Row | null) => void
	intro: boolean
}) {
	let index = 0
	return sections(posts).map((s) => (
		<section
			key={s.id}
			aria-labelledby={`${s.id}-heading`}
			className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 border-b border-(--ink)/20 py-6 last:border-0 lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-x-6'
		>
			<h2 id={`${s.id}-heading`} className='font-semibold'>
				{s.label}
			</h2>
			<ul>
				{s.rows.map((r) => (
					<li key={r.id}>
						<RowLine row={r} index={index++} onHover={onHover} intro={intro} />
					</li>
				))}
			</ul>
		</section>
	))
}
