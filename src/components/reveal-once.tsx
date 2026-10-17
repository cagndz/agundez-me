'use client'

import { useEffect, useState } from 'react'

let hasAnimated = false

export function RevealOnce({ children }: { children: React.ReactNode }) {
	const [shouldAnimate] = useState(() => !hasAnimated)

	useEffect(() => {
		hasAnimated = true
	}, [])

	return (
		<div className={shouldAnimate ? 'orchestration' : undefined}>
			{children}
		</div>
	)
}
