'use client'
import { useState } from 'react'

export default function Placeholder() {
	const [counter, setCounter] = useState(0)

	const handleClick = () => {
		setCounter((c) => c + 1)
	}

	return (
		<div className='flex flex-col items-center justify-center gap-4'>
			<button
				onClick={handleClick}
				type='button'
				className='rounded-xs border border-border p-2 tabular-nums transition-colors duration-150 ease-out-quart hover:bg-foreground/5'
			>
				Count +1
			</button>
			<span className='font-mono text-2xl'>{counter}</span>
		</div>
	)
}
