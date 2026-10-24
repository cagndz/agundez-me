'use client'

import { useEffect, useRef, useState } from 'react'
import { Figure } from '@/components/writing/figure'

type Row = {
	label: string
	ms: number
	detail?: string
	highlight?: boolean
}

// Bars for raster time, on a linear scale so small values look as small as
// they are. They grow once when the chart scrolls into view.
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
			<div ref={ref} className='flex flex-col gap-5 px-5 py-6 sm:px-8 sm:py-7'>
				{rows.map((row, index) => (
					<div key={row.label} className='flex flex-col gap-2'>
						<div className='flex items-baseline justify-between gap-4 text-[13px]'>
							<span>
								{row.label}
								{row.detail && (
									<span className='text-muted'> · {row.detail}</span>
								)}
							</span>
							<span
								className={`font-mono text-xs tabular-nums ${row.highlight ? 'text-accent' : ''}`}
							>
								{row.ms} ms
							</span>
						</div>
						<div className='h-1 overflow-hidden rounded-full bg-foreground/[0.06]'>
							<div
								className={`h-full origin-left rounded-full transition-transform duration-700 ease-out-strong motion-reduce:transition-none ${row.highlight ? 'bg-accent' : 'bg-foreground'}`}
								style={{
									transform: `scaleX(${shown ? Math.max(row.ms / max, 0.01) : 0})`,
									transitionDelay: `${index * 80}ms`,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</Figure>
	)
}
