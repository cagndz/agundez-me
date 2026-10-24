'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'

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

const buttonBase =
	'rounded-xs border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors duration-150 ease-out-quart active:scale-98'

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
					className={`fixed inset-0 m-auto h-fit w-[min(24rem,calc(100vw-3rem))] rounded-xs border border-border bg-background p-4 text-foreground transition-[opacity,scale] ease-out-quart data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-95 motion-safe:data-starting-style:scale-95 ${speed}`}
				>
					<Dialog.Title className='font-mono text-xs tracking-widest uppercase'>
						Modal
					</Dialog.Title>
					<Dialog.Description className='mt-2 text-sm text-muted'>
						Open and close me a few times.
					</Dialog.Description>
					<Dialog.Close
						className={`${buttonBase} mt-4 ml-auto block hover:bg-foreground/5`}
					>
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
		<div className='mt-8 rounded-xs border border-border p-4'>
			<div
				role='group'
				aria-label='Mount strategy'
				className='grid grid-cols-2 gap-0.5 rounded-xs border border-border p-0.5'
			>
				{(Object.keys(MODES) as Mode[]).map((value) => (
					<button
						key={value}
						type='button'
						aria-pressed={mode === value}
						onClick={() => setMode(value)}
						className='rounded-xs px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors duration-150 ease-out-quart not-aria-pressed:text-muted not-aria-pressed:hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background'
					>
						{MODES[value].label}
					</button>
				))}
			</div>

			<p className='mt-4 rounded-xs bg-border/40 px-3 py-2 font-mono text-xs'>
				{current.code}
			</p>

			<div className='mt-4 flex flex-wrap items-center gap-x-6 gap-y-3'>
				<button
					type='button'
					onClick={() => setOpen(true)}
					className='rounded-xs bg-foreground px-4 py-2 font-mono text-xs tracking-widest text-background uppercase transition-[opacity,scale] duration-150 ease-out-quart hover:opacity-85 active:scale-98'
				>
					Open modal
				</button>
				<label className='flex items-center gap-2 text-sm'>
					<input
						type='checkbox'
						checked={slow}
						onChange={(event) => setSlow(event.target.checked)}
						className='accent-foreground'
					/>
					Slow motion
				</label>
			</div>

			<p className='mt-4 border-t border-border pt-4 text-sm'>
				{current.result}
			</p>

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
		</div>
	)
}
