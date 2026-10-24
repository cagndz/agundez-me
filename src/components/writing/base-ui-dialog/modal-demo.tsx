'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Figure } from '@/components/writing/figure'

type Mode = 'conditional' | 'mounted'

const MODES = {
	conditional: {
		label: 'Conditional',
		code: '{open && <Dialog.Root open>…</Dialog.Root>}',
		result: 'It is born open and removed at once: no enter, no exit.',
	},
	mounted: {
		label: 'Mounted',
		code: '<Dialog.Root open={open}>…</Dialog.Root>',
		result: 'It sees the open prop change, so it can fade in and out.',
	},
} satisfies Record<Mode, { label: string; code: string; result: string }>

const pillButton =
	'h-8 rounded-full bg-background px-3.5 text-[13px] shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_1px_2px_rgb(26_25_23/0.06)] transition-[scale,box-shadow] duration-150 ease-out-quart hover:shadow-[0_0_0_1px_rgb(26_25_23/0.1),0_1px_2px_rgb(26_25_23/0.08)] active:scale-[0.97]'

function DemoDialog({
	open,
	onOpenChange,
	slow,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	slow: boolean
}) {
	// Complete class strings on purpose: Tailwind only generates classes it can
	// find written out in full, so `duration-${n}` would never be picked up.
	const speed = slow
		? 'duration-3000 data-ending-style:duration-3000'
		: 'duration-300 data-ending-style:duration-200'

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop
					className={`fixed inset-0 bg-foreground/10 transition-opacity ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 ${speed}`}
				/>
				<Dialog.Popup
					className={`fixed inset-0 m-auto flex h-fit w-[min(22rem,calc(100vw-3rem))] flex-col gap-1 rounded-xl bg-background p-5 text-foreground shadow-[0_0_0_1px_rgb(26_25_23/0.06),0_16px_40px_-16px_rgb(26_25_23/0.3)] transition-[opacity,scale] ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-95 motion-safe:data-starting-style:scale-95 ${speed}`}
				>
					<Dialog.Title className='text-[15px] font-medium'>Modal</Dialog.Title>
					<Dialog.Description className='text-[13px] text-muted'>
						Open and close me a few times.
					</Dialog.Description>
					<Dialog.Close className={`${pillButton} mt-4 self-end`}>
						Close
					</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export function ModalDemo() {
	const [open, setOpen] = useState(false)
	const [mode, setMode] = useState<Mode>('conditional')
	const [slow, setSlow] = useState(true)
	const current = MODES[mode]

	return (
		<Figure
			caption='Slow motion stretches each transition to 3 s, so you can see what happens.'
			className='relative'
		>
			<div className='flex flex-col items-center gap-6 px-4 pt-14 pb-8 text-center'>
				<div
					role='group'
					aria-label='How the dialog is rendered'
					className='flex gap-0.5 rounded-full bg-foreground/5 p-0.5'
				>
					{(Object.keys(MODES) as Mode[]).map((value) => (
						<button
							key={value}
							type='button'
							aria-pressed={mode === value}
							onClick={() => setMode(value)}
							className='rounded-full px-3 py-1 text-[13px] transition-[color,background-color,box-shadow] duration-200 ease-out-quart not-aria-pressed:text-muted not-aria-pressed:hover:text-foreground aria-pressed:bg-background aria-pressed:shadow-[0_1px_2px_rgb(26_25_23/0.08)]'
						>
							{MODES[value].label}
						</button>
					))}
				</div>

				<code className='font-mono text-[12px] text-balance text-muted sm:text-[13px]'>
					{current.code}
				</code>

				<button
					type='button'
					onClick={() => setOpen(true)}
					className={pillButton}
				>
					Open modal
				</button>

				<p
					aria-live='polite'
					className='max-w-xs text-[13px] leading-5 text-muted'
				>
					{current.result}
				</p>
			</div>

			<button
				type='button'
				aria-pressed={slow}
				onClick={() => setSlow(!slow)}
				className='absolute top-3 right-3 flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-muted transition-colors duration-150 ease-out-quart hover:bg-foreground/5 hover:text-foreground'
			>
				<span
					aria-hidden='true'
					className={`size-1.5 rounded-full transition-colors duration-150 ${slow ? 'bg-accent' : 'bg-foreground/20'}`}
				/>
				Slow motion
			</button>

			{mode === 'mounted' ? (
				<DemoDialog
					key='mounted'
					open={open}
					onOpenChange={setOpen}
					slow={slow}
				/>
			) : (
				open && (
					<DemoDialog
						key='conditional'
						open
						onOpenChange={setOpen}
						slow={slow}
					/>
				)
			)}
		</Figure>
	)
}
