'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import type { LabItem } from '@/lab/items'
import {
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from 'react'
import { applyOrigin, applyOriginWithoutTransition } from '@/lab/origin'
import { demos } from '@/lab/registry'
import { DemoFit } from '@/lab/demo-fit'
import { XMark } from '@/components/icons/x-mark'
import { curveDuration } from '@/lab/curves'
import { MotionCurve } from '@/lab/motion-curve'
import './lab-modal.css'

export function LabModal({
	item,
	stageSize,
}: {
	item: LabItem | undefined
	// Side of the stage in px (see stageSize in card.ts)
	stageSize: number
}) {
	const router = useRouter()
	const [lastItem, setLastItem] = useState(item)

	if (item && lastItem?.slug !== item.slug) {
		setLastItem(item)
	}

	const shown = item ?? lastItem
	const Demo = shown ? demos[shown.slug] : undefined

	// Every curve of the piece shares one time axis, as long as its longest one
	const curves = shown?.curves
	const maxDuration = curves
		? Math.max(...curves.map((curve) => curveDuration(curve.transition)))
		: 0

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
					style={{ '--stage-max': `${stageSize}px` } as CSSProperties}
					className='lab-popup fixed inset-0 m-auto flex h-fit w-fit flex-col gap-3 text-foreground focus-visible:outline-none! md:flex-row'
				>
					{/* The frame travels and stretches from the card; the demo travels
					    with it but never scales (see lab-modal.css) */}
					<div data-lab-stage className='lab-stage relative size-(--stage)'>
						<div
							aria-hidden='true'
							className='lab-stage-frame absolute inset-0 rounded-sm bg-(--surface) ring-1 ring-foreground/10'
						/>
						<div className='lab-stage-content relative flex size-full items-center justify-center p-4'>
							{Demo ? (
								<DemoFit className='size-full'>
									<Demo />
								</DemoFit>
							) : (
								<span className='font-mono text-sm tracking-widest text-muted uppercase'>
									No demo yet
								</span>
							)}
						</div>
					</div>
					<aside className='lab-aside flex w-(--stage) flex-col gap-5 overflow-y-auto rounded-sm bg-(--surface) p-4 ring-1 ring-foreground/10 max-md:max-h-[calc(100dvh-3rem-var(--stage)-0.75rem)] md:w-72'>
						<div className='-mt-1 flex items-center justify-between'>
							{/* Same label as the card it opened from: 001 / DIAL */}
							<Dialog.Title className='flex gap-2 font-mono text-sm uppercase'>
								<span className='tabular-nums'>{shown?.id}</span>
								<span aria-hidden='true'>/</span>
								<span className='text-muted'>{shown?.title}</span>
							</Dialog.Title>
							<Dialog.Close
								aria-label='Close'
								className='-mr-2 flex size-8 items-center justify-center rounded-xs text-muted transition-colors duration-150 ease-out-strong hover:text-foreground active:scale-95'
							>
								<XMark className='size-4' />
							</Dialog.Close>
						</div>
						{shown?.summary && (
							<Dialog.Description className='text-sm text-pretty text-foreground/80'>
								{shown.summary}
							</Dialog.Description>
						)}
						<div className='mt-auto flex flex-col gap-3'>
							{curves && curves.length > 0 && (
								<div
									className='grid gap-px border border-border bg-border'
									style={{
										gridTemplateColumns: `repeat(${curveColumns(curves.length)}, minmax(0, 1fr))`,
									}}
								>
									{curves.map((curve) => (
										<MotionCurve
											key={curve.label}
											curve={curve}
											maxDuration={maxDuration}
										/>
									))}
								</div>
							)}
							{shown?.specs && (
								<dl className='grid gap-px border border-border bg-border font-mono text-xs'>
									{shown.specs.map((spec) => (
										<div
											key={spec.label}
											className='grid grid-cols-[4.5rem_1fr] gap-2 bg-(--surface) px-2.5 py-2'
										>
											<dt className='tracking-widest text-muted uppercase'>
												{spec.label}
											</dt>
											<dd>{spec.value}</dd>
										</div>
									))}
								</dl>
							)}
						</div>
					</aside>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

// Up to three curves in a row. Four make a 2 × 2 square instead of a row of
// four cells too narrow to read.
function curveColumns(count: number) {
	return count === 4 ? 2 : Math.min(count, 3)
}
