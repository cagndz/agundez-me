'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'
import type { LabItem } from '@/lab/items'
import { useState } from 'react'

export default function LabModal({ item }: { item: LabItem | undefined }) {
	const router = useRouter()
	const [lastItem, setLastItem] = useState(item)

	if (item && lastItem?.slug !== item.slug) {
		setLastItem(item)
	}

	const shown = item ?? lastItem

	return (
		<Dialog.Root
			open={item !== undefined}
			onOpenChange={(open) => !open && router.back()}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className='data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-250 ease-out-strong data-ending-style:duration-180 fixed inset-0 bg-foreground/10 backdrop-blur-sm' />
				<Dialog.Popup
					data-theme='lab'
					className='fixed inset-3 md:inset-12 m-auto max-w-5xl max-h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-6rem)] h-144 rounded-xs border border-border bg-background p-4 text-foreground flex flex-col data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-[opacity,scale] duration-250 ease-out-strong data-ending-style:duration-180'
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
