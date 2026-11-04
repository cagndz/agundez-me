'use client'

import { useEffect, useRef, useState } from 'react'
import { EMAIL } from '@/content/contact'
import { Brackets } from './bracket-link'

// Copying the email, on a typewriter: the word is backspaced and
// "copied" typed in its place, with the caret showing while it types, then
// the same in reverse. Under reduced motion the word just changes.

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function CopyEmail() {
	const [text, setText] = useState('email')
	const run = useRef(0)

	useEffect(() => () => void run.current++, [])

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(EMAIL)
		} catch {
			location.href = `mailto:${EMAIL}`
			return
		}
		const id = ++run.current
		const alive = () => run.current === id
		if (reduced()) {
			setText('copied')
			await wait(1400)
			if (alive()) setText('email')
			return
		}
		// Backspace, type, hold, and back again
		const type = async (from: string, to: string) => {
			for (let i = from.length; i >= 0; i--) {
				if (!alive()) return
				setText(from.slice(0, i))
				await wait(28)
			}
			for (let i = 1; i <= to.length; i++) {
				if (!alive()) return
				setText(to.slice(0, i))
				await wait(46)
			}
		}
		await type(text, 'copied')
		await wait(1100)
		if (alive()) await type('copied', 'email')
	}

	return (
		<button
			type='button'
			onClick={copy}
			title={EMAIL}
			aria-label={`Copy ${EMAIL}`}
			className='group relative inline-block min-w-[6ch] text-center outline-none'
		>
			{text}
			{text !== 'email' && text !== 'copied' && (
				<span aria-hidden='true' className='home-caret' />
			)}
			<Brackets />
		</button>
	)
}
