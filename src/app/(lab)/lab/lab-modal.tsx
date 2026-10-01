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
				<Dialog.Backdrop className='fixed inset-0 bg-foreground/20' />
				<Dialog.Popup
					data-theme='lab'
					className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-4 text-foreground'
				>
					<Dialog.Title>{title}</Dialog.Title>
					<Dialog.Close>Close</Dialog.Close>
					{children}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
