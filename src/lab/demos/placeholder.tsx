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
				className='border border-border p-2 rounded-xs tabular-nums hover:bg-foreground/5 transition-colors duration-150 ease-out-quart'
			>
				Count +1
			</button>
			<span className='font-mono text-2xl'>{counter}</span>
		</div>
	)
}
