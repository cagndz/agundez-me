'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import type { LabItem } from '@/lab/items'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { applyOrigin, applyOriginWithoutTransition } from '@/lab/origin'
import { demos } from '@/lab/registry'
import { XMark } from '@/components/icons/x-mark'
import './lab-modal.css'

export function LabModal({ item }: { item: LabItem | undefined }) {
	const router = useRouter()
	const [lastItem, setLastItem] = useState(item)

	if (item && lastItem?.slug !== item.slug) {
		setLastItem(item)
	}

	const shown = item ?? lastItem
	const Demo = shown ? demos[shown.slug] : undefined

	// Was the modal opened by navigating inside the app (so there is history to
	// go back to)? If the page loaded with ?c= already set, it never went from
	// closed to open.
	const open = item !== undefined
	const [prevOpen, setPrevOpen] = useState(open)
	const [openedInApp, setOpenedInApp] = useState(false)

	if (open !== prevOpen) {
		setPrevOpen(open)
		setOpenedInApp(open)
	}

	const slug = item?.slug
	const popupRef = useRef<HTMLDivElement | null>(null)

	// When the popup mounts (on open), set where it grows from.
	const setPopup = useCallback(
		(el: HTMLDivElement | null) => {
			popupRef.current = el
			if (el && slug) applyOriginWithoutTransition(el, slug)
		},
		[slug],
	)

	// On close, measure again: the cell may have moved (resize) since it opened.
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
				<Dialog.Backdrop className='fixed inset-0 bg-foreground/10 backdrop-blur-sm transition-opacity duration-320 ease-out-strong data-ending-style:opacity-0 data-ending-style:duration-220 data-starting-style:opacity-0' />
				<Dialog.Popup
					ref={setPopup}
					data-theme='lab'
					tabIndex={-1}
					initialFocus={popupRef}
					className='lab-popup fixed inset-0 m-auto flex h-fit w-fit flex-col gap-3 text-foreground focus-visible:outline-none! md:flex-row'
				>
					<div
						data-lab-stage
						className='lab-stage flex size-(--stage) items-center justify-center rounded-xs border border-border bg-background p-4'
					>
						{Demo ? (
							<Demo />
						) : (
							<span className='font-mono text-sm tracking-widest text-muted uppercase'>
								No demo yet
							</span>
						)}
					</div>
					<aside className='lab-aside flex w-(--stage) flex-col gap-6 overflow-y-auto rounded-xs border border-border bg-background p-4 max-md:max-h-[calc(100dvh-3rem-var(--stage)-0.75rem)] md:w-72'>
						<div className='flex items-start justify-between'>
							<div className='flex flex-col gap-1'>
								<span className='font-mono text-xs tracking-widest text-muted uppercase tabular-nums'>
									{shown?.id}
								</span>
								<Dialog.Title className='font-mono text-sm tracking-widest uppercase'>
									{shown?.title}
								</Dialog.Title>
							</div>
							<Dialog.Close
								aria-label='Close'
								className='-mt-2 -mr-2 flex size-8 items-center justify-center rounded-xs text-muted transition-colors duration-150 ease-out-quart hover:text-foreground active:scale-95'
							>
								<XMark className='size-4' />
							</Dialog.Close>
						</div>
						{shown?.summary && (
							<Dialog.Description className='font-mono text-xs leading-relaxed text-muted'>
								{shown.summary}
							</Dialog.Description>
						)}
						{shown?.specs && (
							<dl className='mt-auto border-t border-border font-mono text-xs'>
								{shown.specs.map((spec) => (
									<div
										key={spec.label}
										className='grid grid-cols-[5rem_1fr] gap-2 border-b border-border py-2'
									>
										<dt className='tracking-widest text-muted uppercase'>
											{spec.label}
										</dt>
										<dd>{spec.value}</dd>
									</div>
								))}
							</dl>
						)}
					</aside>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
