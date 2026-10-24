'use client'

import { useEffect, useRef, useState } from 'react'
import { Figure } from '../figure'

type Row = {
	label: string
	ms: number
	detail: string
}

// Horizontal bars for raster time, on a linear scale so small values look as
// small as they are. They grow once when the chart scrolls into view.
export function RasterBars({
	rows,
	caption,
}: {
	rows: Row[]
	caption: string
}) {
	const ref = useRef<HTMLDivElement>(null)
	const [shown, setShown] = useState(false)
	const max = Math.max(...rows.map((row) => row.ms))

	useEffect(() => {
		const element = ref.current
		if (!element) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setShown(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.6 },
		)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	return (
		<Figure caption={caption}>
			<div ref={ref} className='flex flex-col gap-4 p-3 sm:p-4'>
				{rows.map((row, index) => (
					<div key={row.label}>
						<div className='flex items-baseline justify-between gap-4'>
							<p className='text-sm'>{row.label}</p>
							<p className='font-mono text-sm tabular-nums'>
								{row.ms} <span className='text-muted'>ms</span>
							</p>
						</div>
						<div className='mt-2 h-1.5 overflow-hidden rounded-full bg-border/70'>
							<div
								className='h-full origin-left rounded-full bg-foreground transition-transform duration-700 ease-out-strong motion-reduce:transition-none'
								style={{
									transform: `scaleX(${shown ? Math.max(row.ms / max, 0.004) : 0})`,
									transitionDelay: `${index * 80}ms`,
								}}
							/>
						</div>
						<p className='mt-1.5 text-xs text-muted'>{row.detail}</p>
					</div>
				))}
			</div>
		</Figure>
	)
}
