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
			if (e.key !== 'Escape') return
			// Behind something modal: the Escape is that one's
			if (closeRef.current?.closest('[inert], [aria-hidden="true"]')) return
			// Ahead of everything else, so a dialog the demo sits in doesn't
			// close on the same key: the first Escape tears, the next one closes
			e.stopPropagation()
			onCloseRef.current()
		}
		window.addEventListener('keydown', onKeyDown, true)
		return () => window.removeEventListener('keydown', onKeyDown, true)
	}, [open])

	return closeRef
}
