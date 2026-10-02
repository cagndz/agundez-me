'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import type { LabItem } from '@/lab/items'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { applyOrigin, applyOriginWithoutTransition } from '@/lab/origin'
import { demos } from '@/lab/registry'

export default function LabModal({ item }: { item: LabItem | undefined }) {
	const router = useRouter()
	const [lastItem, setLastItem] = useState(item)

	if (item && lastItem?.slug !== item.slug) {
		setLastItem(item)
	}

	const shown = item ?? lastItem
	const Demo = shown ? demos[shown.slug] : undefined

	// ¿Se abrió el modal navegando dentro de la app (hay historial nuestro)?
	// Si la página cargó ya con ?c=, no hay transición cerrado → abierto.
	const open = item !== undefined
	const [prevOpen, setPrevOpen] = useState(open)
	const [openedInApp, setOpenedInApp] = useState(false)

	if (open !== prevOpen) {
		setPrevOpen(open)
		setOpenedInApp(open)
	}

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
			open={open}
			onOpenChange={(nextOpen) => {
				if (nextOpen) return
				if (openedInApp) router.back()
				else router.replace('/lab', { scroll: false })
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className='fixed inset-0 bg-foreground/10 backdrop-blur-sm transition-opacity duration-300 ease-out-quart data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-250' />
				<Dialog.Popup
					ref={setPopup}
					data-theme='lab'
					tabIndex={-1}
					initialFocus={popupRef}
					className='focus-visible:outline-none! fixed inset-0 m-auto size-[min(80rem,75dvh,calc(100vw-3rem))] flex flex-col rounded-xs border border-border bg-background p-4 text-foreground transition-[opacity,scale,translate] duration-350 ease-out-quart data-starting-style:opacity-0 data-ending-style:opacity-0 motion-safe:data-starting-style:translate-x-(--origin-x) motion-safe:data-starting-style:translate-y-(--origin-y) motion-safe:data-starting-style:scale-(--origin-s) motion-safe:data-ending-style:translate-x-(--origin-x) motion-safe:data-ending-style:translate-y-(--origin-y) motion-safe:data-ending-style:scale-(--origin-s) data-ending-style:duration-290 data-ending-style:ease-out-cubic'
				>
					<div className='flex items-start justify-between'>
						<div className='flex flex-col gap-1'>
							<span className='font-mono text-xs uppercase tracking-widest text-muted tabular-nums'>
								{shown?.id}
							</span>
							<Dialog.Title className='font-mono text-sm uppercase tracking-widest'>
								{shown?.title}
							</Dialog.Title>
						</div>
						<Dialog.Close
							aria-label='Close'
							className='-mr-2 -mt-2 flex size-8 items-center justify-center rounded-xs text-muted transition-colors duration-150 ease-out-quart hover:bg-foreground/5 hover:text-foreground active:opacity-80'
						>
							<svg
								aria-hidden='true'
								viewBox='0 0 16 16'
								className='size-4'
								fill='none'
								stroke='currentColor'
								strokeWidth='1.5'
								strokeLinecap='square'
							>
								<path d='M3 3 L13 13 M13 3 L3 13' />
							</svg>
						</Dialog.Close>
					</div>
					<div className='mt-4 flex-1 flex items-center justify-center min-h-0 overflow-y-auto'>
						{Demo ? (
							<Demo />
						) : (
							<span className='uppercase tracking-widest text-muted font-mono text-sm'>
								No demo yet
							</span>
						)}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
