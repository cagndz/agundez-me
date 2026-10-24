'use client'

import { type RefObject, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Figure } from '@/components/writing/figure'

type Strategy = 'conditional' | 'mounted'

const STRATEGIES = {
	conditional: {
		label: 'Conditional',
		code: '{open && <Dialog.Root open>}',
	},
	mounted: {
		label: 'Mounted',
		code: '<Dialog.Root open={open}>',
	},
} satisfies Record<Strategy, { label: string; code: string }>

const pillButton =
	'h-8 rounded-full bg-background px-3.5 text-[13px] shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_1px_2px_rgb(26_25_23/0.06)] transition-[scale,box-shadow] duration-150 ease-out-quart hover:shadow-[0_0_0_1px_rgb(26_25_23/0.1),0_1px_2px_rgb(26_25_23/0.08)] active:scale-[0.97]'

// The dialog renders into its own stage instead of the page. It is not modal
// and a click outside doesn't close it, so both stages work independently and
// the page never locks its scroll.
function StageDialog({
	open,
	onOpenChange,
	stage,
	slow,
	label,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	stage: RefObject<HTMLDivElement | null>
	slow: boolean
	label: string
}) {
	// Complete class strings on purpose: Tailwind only generates classes it can
	// find written out in full, so `duration-${n}` would never be picked up.
	// Quarter speed is 4× the real 300 ms enter and 200 ms exit.
	const speed = slow
		? 'duration-1200 data-ending-style:duration-800'
		: 'duration-300 data-ending-style:duration-200'

	return (
		<Dialog.Root
			open={open}
			onOpenChange={onOpenChange}
			modal={false}
			disablePointerDismissal
		>
			<Dialog.Portal container={stage}>
				<Dialog.Backdrop
					className={`absolute inset-0 bg-foreground/[0.04] transition-opacity ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 ${speed}`}
				/>
				<Dialog.Popup
					className={`absolute inset-0 m-auto flex h-fit w-[min(14rem,calc(100%-2rem))] flex-col gap-1 rounded-[10px] bg-background p-4 text-left shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_12px_28px_-12px_rgb(26_25_23/0.3)] transition-[opacity,scale] ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-95 motion-safe:data-starting-style:scale-95 ${speed}`}
				>
					<Dialog.Title className='text-[13px] font-medium'>Modal</Dialog.Title>
					<Dialog.Description className='text-xs text-muted'>
						{label}
					</Dialog.Description>
					<Dialog.Close className={`${pillButton} mt-3 self-end`}>
						Close
					</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function Stage({ strategy, slow }: { strategy: Strategy; slow: boolean }) {
	const stage = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)
	const { label, code } = STRATEGIES[strategy]

	return (
		<div className='flex flex-col items-center gap-4'>
			{/* The dialog portals into this element. The button sits in its own
			    absolute layer, so whatever the portal adds can't shift it. */}
			<div
				ref={stage}
				className='relative h-48 w-full overflow-hidden rounded-lg bg-foreground/[0.035]'
			>
				<div className='absolute inset-0 grid place-items-center'>
					<button
						type='button'
						onClick={() => setOpen(true)}
						className={pillButton}
						aria-label={`Open the ${label.toLowerCase()} dialog`}
					>
						Open
					</button>
				</div>
				{strategy === 'mounted' ? (
					<StageDialog
						open={open}
						onOpenChange={setOpen}
						stage={stage}
						slow={slow}
						label={label}
					/>
				) : (
					open && (
						<StageDialog
							open
							onOpenChange={setOpen}
							stage={stage}
							slow={slow}
							label={label}
						/>
					)
				)}
			</div>
			<div className='flex flex-col items-center gap-0.5 text-center'>
				<p className='text-[13px]'>{label}</p>
				<code className='font-mono text-[11px] text-muted'>{code}</code>
			</div>
		</div>
	)
}

export function ModalDemo() {
	const [slow, setSlow] = useState(false)

	return (
		<Figure
			caption='Each stage has its own dialog. 0.25× plays the transitions at a quarter of their speed.'
			className='relative px-4 pt-14 pb-6'
		>
			<div className='grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4'>
				<Stage strategy='conditional' slow={slow} />
				<Stage strategy='mounted' slow={slow} />
			</div>
			<div
				role='group'
				aria-label='Animation speed'
				className='absolute top-3 right-3 flex gap-0.5 rounded-full bg-foreground/5 p-0.5'
			>
				{[
					{ label: '1×', value: false, name: 'Real speed' },
					{ label: '0.25×', value: true, name: 'Quarter speed' },
				].map((option) => (
					<button
						key={option.label}
						type='button'
						aria-pressed={slow === option.value}
						aria-label={option.name}
						onClick={() => setSlow(option.value)}
						className='h-7 min-w-9 rounded-full px-2 font-mono text-[12px] tabular-nums transition-[color,background-color,box-shadow] duration-200 ease-out-quart not-aria-pressed:text-muted not-aria-pressed:hover:text-foreground aria-pressed:bg-background aria-pressed:shadow-[0_1px_2px_rgb(26_25_23/0.08)]'
					>
						{option.label}
					</button>
				))}
			</div>
		</Figure>
	)
}
