'use client'
import { CaseBack, CaseFront } from './case'
import { STAGE_HEIGHT, STAGE_WIDTH } from './constants'
import type { WalletCardData } from './types'
import { WalletCard } from './wallet-card'
import { useState } from 'react'

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
	const isAnyPresented: boolean = presentedId !== null

	const handleToggle = (id: string) =>
		setPresentedId(id === presentedId ? null : id)

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
				/>
			))}
			<CaseFront />
		</div>
	)
}
