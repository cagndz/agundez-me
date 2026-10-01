'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import type { LabItem } from '@/lab/items'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { applyOrigin, applyOriginWithoutTransition } from '@/lab/origin'

export default function LabModal({ item }: { item: LabItem | undefined }) {
	const router = useRouter()
	const [lastItem, setLastItem] = useState(item)

	if (item && lastItem?.slug !== item.slug) {
		setLastItem(item)
	}

	const shown = item ?? lastItem

	const slug = item?.slug
	const popupRef = useRef<HTMLDivElement | null>(null)

	// Al montarse el popup (al abrir), fijamos desde dónde nace.
	const setPopup = useCallback(
		(el: HTMLDivElement | null) => {
			popupRef.current = el
			if (el && slug) applyOriginWithoutTransition(el, slug)
		},
		[slug],
	)

	// Al cerrar, medimos de nuevo: la celda pudo moverse (resize) desde que se abrió.
	useLayoutEffect(() => {
		if (item === undefined && lastItem && popupRef.current) {
			applyOrigin(popupRef.current, lastItem.slug)
		}
	}, [item, lastItem])

	return (
		<Dialog.Root
			open={item !== undefined}
			onOpenChange={(open) => !open && router.back()}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className='fixed inset-0 bg-foreground/10 backdrop-blur-sm transition-opacity duration-300 ease-out-quart data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-250' />
				<Dialog.Popup
					ref={setPopup}
					data-theme='lab'
					className='fixed inset-0 m-auto size-[min(80rem,75dvh,calc(100vw-3rem))] flex flex-col rounded-xs border border-border bg-background p-4 text-foreground transition-[opacity,scale,translate] duration-350 ease-out-quart data-starting-style:opacity-0 data-ending-style:opacity-0 motion-safe:data-starting-style:translate-x-(--origin-x) motion-safe:data-starting-style:translate-y-(--origin-y) motion-safe:data-starting-style:scale-(--origin-s) motion-safe:data-ending-style:translate-x-(--origin-x) motion-safe:data-ending-style:translate-y-(--origin-y) motion-safe:data-ending-style:scale-(--origin-s) data-ending-style:duration-290 data-ending-style:ease-out-cubic'
				>
					<div className='flex items-center justify-between'>
						<Dialog.Title>{shown?.title}</Dialog.Title>
						<Dialog.Close className='text-sm text-muted hover:text-foreground'>
							Close
						</Dialog.Close>
					</div>
					<div className='mt-4 flex-1 min-h-0 overflow-y-auto'>
						{shown?.slug}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
