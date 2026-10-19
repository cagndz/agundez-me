'use client'

import { useRef, useState } from 'react'
import { EMAIL } from '@/content/contact'

export function CopyEmail() {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
	const base =
		'col-start-1 row-start-1 transition-[opacity,filter,translate] duration-250 ease-out-strong'
	const hidden =
		'opacity-0 blur-[2px] translate-y-1 motion-reduce:blur-none motion-reduce:translate-y-0'

	async function handleClick() {
		try {
			await navigator.clipboard.writeText(EMAIL)
			setCopied(true)

			clearTimeout(timer.current)
			timer.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			window.location.href = `mailto:${EMAIL}`
		}
	}

	return (
		<>
			<button
				type='button'
				onClick={handleClick}
				aria-label='Copy email address'
				className='inline-grid cursor-pointer p-0 text-left link'
			>
				<span className={`${base} ${copied ? hidden : ''}`}>Email</span>
				<span className={`${base} ${copied ? '' : hidden}`}>Copied</span>
			</button>
			<span className='sr-only' aria-live='polite'>
				{copied ? 'Email copied' : ''}
			</span>
		</>
	)
}
