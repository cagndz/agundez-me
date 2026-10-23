'use client'
import { useEffect, useState } from 'react'
import { CaseBack, CaseFront } from './case'
import { STAGE_HEIGHT, STAGE_WIDTH } from './constants'
import type { WalletCardData } from './types'
import { WalletCard } from './wallet-card'

const CARDS: WalletCardData[] = [
	{
		id: 'card-01',
		title: 'Card 01',
		description: 'Short description',
		code: '01',
		tone: 'dark',
	},
	{
		id: 'card-02',
		title: 'Card 02',
		description: 'Short description',
		code: '02',
		tone: 'light',
	},
	{
		id: 'card-03',
		title: 'Card 03',
		description: 'Short description',
		code: '03',
		tone: 'accent',
	},
]

export function Wallet() {
	const [presentedId, setPresentedId] = useState<string | null>(null)
	const isAnyPresented = presentedId !== null

	// Cards physically out of the case, which is not the same as presentedId:
	// a card is still in the case while it rises, and still out while it returns.
	const [outIds, setOutIds] = useState<string[]>([])

	const handleToggle = (id: string) =>
		setPresentedId(id === presentedId ? null : id)

	const handleOutChange = (id: string, isOut: boolean) =>
		setOutIds((ids) => {
			const others = ids.filter((outId) => outId !== id)
			return isOut ? [...others, id] : others
		})

	useEffect(() => {
		if (!isAnyPresented) return

		// pointerdown, not click: the click that presents a card also reaches
		// document, and a click listener added during it could close the card at once.
		const handlePointerDown = (event: PointerEvent) => {
			if (
				event.target instanceof Element &&
				event.target.closest('[data-wallet-card]')
			) {
				return
			}
			setPresentedId(null)
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [isAnyPresented])

	return (
		<div
			className='relative'
			style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
		>
			<CaseBack />
			{CARDS.map((card, index) => (
				<WalletCard
					key={card.id}
					card={card}
					index={index}
					count={CARDS.length}
					isPresented={card.id === presentedId}
					isAnyPresented={isAnyPresented}
					onToggle={handleToggle}
					onOutChange={handleOutChange}
				/>
			))}
			<CaseFront slots={CARDS.length} outCount={outIds.length} />
		</div>
	)
}
