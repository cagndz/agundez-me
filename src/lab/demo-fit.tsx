'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type DemoFitProps = {
	children: ReactNode
	className?: string
}

/**
 * Shrinks a demo (never enlarges it) so it fits its box. Demos are built at
 * their natural size once; the lab decides how much room they get.
 *
 * offsetWidth/offsetHeight ignore transforms, so the demo's natural size is
 * read correctly even while it is scaled.
 */
export function DemoFit({ children, className = '' }: DemoFitProps) {
	const boxRef = useRef<HTMLDivElement>(null)
	const demoRef = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(1)

	useLayoutEffect(() => {
		const box = boxRef.current
		const demo = demoRef.current
		if (!box || !demo) return

		const update = () => {
			const width = demo.offsetWidth
			const height = demo.offsetHeight
			if (!width || !height) return
			setScale(Math.min(1, box.clientWidth / width, box.clientHeight / height))
		}

		// Fires once on observe and again whenever the box or the demo resizes.
		// Callbacks run after layout and before paint, so there is no visible jump.
		const observer = new ResizeObserver(update)
		observer.observe(box)
		observer.observe(demo)
		return () => observer.disconnect()
	}, [])

	return (
		<div
			ref={boxRef}
			className={`flex items-center justify-center ${className}`}
		>
			{/* shrink-0: a flex item would otherwise squash the demo to the box's width */}
			<div ref={demoRef} className='shrink-0' style={{ scale: `${scale}` }}>
				{children}
			</div>
		</div>
	)
}
