'use client'

import { useEffect, useRef, useState } from 'react'
import { contactLinks, EMAIL } from '@/content/contact'

const EMAIL_WORD = 'email'
const COPIED_WORD = 'copied'
const SLOTS = Math.max(EMAIL_WORD.length, COPIED_WORD.length)

// The links, under the list on the column's left edge, underlined with the
// list's own leaders (home.css). The email copies itself: its letters roll
// over, one after another, from "email" to "copied" and back. The word
// keeps one width throughout (it is monospaced, set in as many slots as
// the longer word needs), so nothing around it moves; only its underline
// grows or shrinks to the letters.
export function Contact({
	order = 0,
	className = '',
}: {
	// Where it comes in the entrance
	order?: number
	className?: string
}) {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
	useEffect(() => () => clearTimeout(timer.current), [])
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL)
		} catch {
			location.href = `mailto:${EMAIL}`
			return
		}
		setCopied(true)
		clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), 1600)
	}
	const word = copied ? COPIED_WORD : EMAIL_WORD
	return (
		<footer
			style={{ '--i': order } as React.CSSProperties}
			className={`home-foot flex flex-wrap gap-x-[3ch] ${className}`}
		>
			{contactLinks.map(({ label, href }) => (
				<a
					key={label}
					href={href}
					target='_blank'
					rel='noreferrer'
					className='home-link'
				>
					{label.toLowerCase()}
				</a>
			))}
			<button
				type='button'
				onClick={copy}
				title={EMAIL}
				aria-label={`Copy ${EMAIL}`}
				data-copied={copied ? '' : undefined}
				style={
					{
						'--cut': `${((SLOTS - word.length) / SLOTS) * 100}%`,
					} as React.CSSProperties
				}
				className='home-link home-copy inline-flex'
			>
				{Array.from({ length: SLOTS }, (_, k) => (
					<span
						key={k}
						aria-hidden='true'
						className='home-slot'
						style={{ '--k': k } as React.CSSProperties}
					>
						<span>
							<span>{EMAIL_WORD[k] ?? ' '}</span>
							<span>{COPIED_WORD[k] ?? ' '}</span>
						</span>
					</span>
				))}
			</button>
			<span role='status' className='sr-only'>
				{copied ? 'Email copied' : ''}
			</span>
		</footer>
	)
}
