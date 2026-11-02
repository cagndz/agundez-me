'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { EMAIL } from '@/content/contact'
import { type Post, type Row, sections } from './sections'

// The work as a table, after danielpetho.com: the section label on the
// left, a row per thing, its kind or date on the right. Hovering a row
// dims the rest of the list, and every label but its own (home.css).

function useCopy() {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => () => clearTimeout(timer.current), [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL)
			setCopied(true)
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			window.location.href = `mailto:${EMAIL}`
		}
	}
	return { copied, copy }
}

// Two words in one cell, crossfading: the one leaving blurs and drops a
// little, the one arriving comes up into focus. Without motion, only the
// fade.
function Swap({ on, from, to }: { on: boolean; from: string; to: string }) {
	const base =
		'col-start-1 row-start-1 transition-[opacity,filter,translate] duration-250 ease-out-strong'
	const hidden =
		'opacity-0 blur-[2px] translate-y-1 motion-reduce:blur-none motion-reduce:translate-y-0'
	return (
		<span className='inline-grid justify-items-end' aria-hidden='true'>
			<span className={`${base} ${on ? hidden : ''}`}>{from}</span>
			<span className={`${base} ${on ? '' : hidden}`}>{to}</span>
		</span>
	)
}

function RowLine({
	row,
	onHover,
}: {
	row: Row
	onHover: (row: Row | null) => void
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
			<span className='min-w-0 lg:truncate lg:whitespace-nowrap'>
				{row.name}
			</span>
			{/* The meta comes up to full strength with its row. */}
			<span className='shrink-0 tabular-nums opacity-70 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-visible/row:opacity-100'>
				{row.copy ? (
					<Swap on={copied} from='copy' to='copied' />
				) : (
					<span aria-hidden={external ? true : undefined}>{row.meta}</span>
				)}
				{external && <span className='sr-only'>(opens in a new tab)</span>}
			</span>
			{row.copy && (
				<span className='sr-only' aria-live='polite'>
					{copied ? 'Email copied' : ''}
				</span>
			)}
		</>
	)

	const className =
		'home-row group/row flex cursor-pointer items-baseline justify-between gap-6 py-1'

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
}: {
	posts: Post[]
	onHover: (row: Row | null) => void
}) {
	return sections(posts).map((s, i) => (
		<section
			key={s.id}
			aria-labelledby={`${s.id}-heading`}
			// The entrance takes each section as one block (home.css)
			style={{ '--i': i } as React.CSSProperties}
			className='home-section grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 border-b border-(--ink)/20 py-8 last:border-0 lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:gap-x-6'
		>
			<h2 id={`${s.id}-heading`} className='home-label font-semibold'>
				{s.label}
			</h2>
			{/* The rows start a line below the label, so it sits alone at the
			    top of its section with empty space beside it. */}
			<ul className='col-start-2 row-start-2'>
				{s.rows.map((r) => (
					<li key={r.id}>
						<RowLine row={r} onHover={onHover} />
					</li>
				))}
			</ul>
		</section>
	))
}
