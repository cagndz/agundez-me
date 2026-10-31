'use client'

import { useEffect, useRef } from 'react'

/** Escape tears the receipt off; the pull button takes focus once it's out. */
export function useReceiptFocus(open: boolean, onClose: () => void) {
	const closeRef = useRef<HTMLButtonElement>(null)
	const onCloseRef = useRef(onClose)
	useEffect(() => {
		onCloseRef.current = onClose
	})

	useEffect(() => {
		if (!open) return
		closeRef.current?.focus({ preventScroll: true })
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onCloseRef.current()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open])

	return closeRef
}
