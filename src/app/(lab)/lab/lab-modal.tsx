'use client'

import { useRouter } from 'next/navigation'
import { Dialog } from '@base-ui/react/dialog'

export default function LabModal({
	children,
	title,
}: {
	children: React.ReactNode
	title: string
}) {
	const router = useRouter()

	return (
		<Dialog.Root open={true} onOpenChange={(open) => !open && router.back()}>
			<Dialog.Portal>
				<Dialog.Backdrop className='fixed inset-0 bg-foreground/10 backdrop-blur-sm' />
				<Dialog.Popup
					data-theme='lab'
					className='fixed inset-3 md:inset-12 m-auto max-w-5xl max-h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-6rem)] h-144 rounded-xs border border-border bg-background p-4 text-foreground overflow-y-auto flex flex-col'
				>
					<div className='flex items-center justify-between'>
						<Dialog.Title>{title}</Dialog.Title>
						<Dialog.Close className='text-sm text-muted hover:text-foreground'>
							Close
						</Dialog.Close>
					</div>
					<div className='mt-4 flex-1 min-h-0 overflow-y-auto'>{children}</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
