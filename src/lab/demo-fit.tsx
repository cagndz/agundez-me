'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { applyFit } from './fit'

type DemoFitProps = {
	children: ReactNode
	className?: string
	// The size the demo declares (items.ts). Only checked in development.
	expectedSize?: { width: number; height: number }
}

/**
 * Shrinks a demo (never enlarges it) so it fits its box. Demos are built at
 * their natural size once; the lab decides how much room they get.
 *
 * The scale lives in a CSS variable (--fit) on the box, not in React state:
 * DemoFitScript sets it before hydration and React must not overwrite it, and
 * resizing doesn't re-render the demo. See fit.ts for the calculation.
 */
export function DemoFit({
	children,
	className = '',
	expectedSize,
}: DemoFitProps) {
	const boxRef = useRef<HTMLDivElement>(null)
	const demoRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const box = boxRef.current
		const demo = demoRef.current
		if (!box || !demo) return

		const update = () => applyFit(box, demo)

		// Fires once on observe and again whenever the box or the demo resizes.
		// Callbacks run after layout and before paint, so there is no visible jump.
		const observer = new ResizeObserver(update)
		observer.observe(box)
		observer.observe(demo)
		return () => observer.disconnect()
	}, [])

	// The grid sizes each card from the declared size, so a stale one would
	// leave the demo cramped or floating. Say so instead of failing silently.
	useLayoutEffect(() => {
		const demo = demoRef.current
		if (process.env.NODE_ENV === 'production' || !expectedSize || !demo) return
		const width = demo.offsetWidth
		const height = demo.offsetHeight
		if (width !== expectedSize.width || height !== expectedSize.height) {
			console.warn(
				`DemoFit: the demo measures ${width}×${height} but declares ${expectedSize.width}×${expectedSize.height}. Update its size in items.ts.`,
			)
		}
	}, [expectedSize])

	return (
		<div
			ref={boxRef}
			data-demo-fit
			// DemoFitScript writes --fit on this element before React hydrates
			suppressHydrationWarning
			className={`flex items-center justify-center ${className}`}
		>
			{/* shrink-0: a flex item would otherwise squash the demo to the box's width */}
			<div ref={demoRef} className='shrink-0 scale-[var(--fit,1)]'>
				{children}
			</div>
		</div>
	)
}
