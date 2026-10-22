import { motion } from 'motion/react'
import {
	CARD_HEIGHT,
	CARD_PALETTES,
	CARD_RADIUS,
	CARD_WIDTH,
} from './constants'
import type { WalletCardData } from './types'
import { useWalletCardMotion } from './use-wallet-card-motion'
import { getRestTop } from './utils'

type WalletCardProps = {
	card: WalletCardData
	index: number
	count: number
	isPresented: boolean
	isAnyPresented: boolean
	onToggle: (id: string) => void
}

export function WalletCard({
	card,
	index,
	count,
	isPresented,
	isAnyPresented,
	onToggle,
}: WalletCardProps) {
	const palette = CARD_PALETTES[card.tone]
	const { y, rotate, scale, zIndex } = useWalletCardMotion({
		index,
		count,
		isPresented,
		isAnyPresented,
	})

	return (
		<motion.div
			className='absolute left-1/2 -translate-x-1/2'
			style={{
				top: getRestTop(index, count),
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				y,
				zIndex,
				willChange: 'transform',
			}}
		>
			<motion.button
				type='button'
				className='absolute size-full'
				style={{
					borderRadius: CARD_RADIUS,
					background: palette.background,
					color: palette.foreground,
					boxShadow: `inset 0 0 0 1px ${palette.edge}, 0 1px 0 rgb(0 0 0 / 0.06), 0 6px 16px -8px rgb(0 0 0 / 0.35)`,
					rotate,
					scale,
					willChange: 'transform',
				}}
				aria-pressed={isPresented}
				onClick={() => onToggle(card.id)}
			>
				<div className='absolute inset-x-3 top-2 flex items-center justify-between'>
					<span className='text-[11px] font-medium'>{card.title}</span>
					<span
						className='font-mono text-[10px]'
						style={{ color: palette.muted }}
					>
						{card.code}
					</span>
				</div>
			</motion.button>
		</motion.div>
	)
}
