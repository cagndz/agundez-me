import { useEffect } from 'react'
import { useAnimate } from 'motion/react'
import {
	CARD_HEIGHT,
	CARD_PALETTES,
	CARD_PRESENTED_LAYER,
	CARD_PRESENTED_ROTATION,
	CARD_PRESENTED_SCALE,
	CARD_RADIUS,
	CARD_SINK,
	CARD_WIDTH,
} from './constants'
import type { WalletCardData } from './types'
import { getPresentedOffset, getRestTop } from './utils'

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
	let offsetY = 0
	let rotate = 0
	let scale = 1
	const [scope, animate] = useAnimate()

	if (isPresented) {
		offsetY = getPresentedOffset(index, count)
		rotate = CARD_PRESENTED_ROTATION
		scale = CARD_PRESENTED_SCALE
	} else if (isAnyPresented) {
		offsetY = CARD_SINK
	}

	useEffect(() => {
		animate(
			scope.current,
			{ y: offsetY, rotate, scale },
			{ duration: 0.3, ease: [0.2, 0, 0, 1] },
		)
	}, [offsetY, rotate, scale, animate, scope])

	return (
		<button
			type='button'
			ref={scope}
			className='absolute left-1/2 -translate-x-1/2'
			style={{
				top: getRestTop(index, count),
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				borderRadius: CARD_RADIUS,
				background: palette.background,
				color: palette.foreground,
				boxShadow: `inset 0 0 0 1px ${palette.edge}, 0 1px 0 rgb(0 0 0 / 0.06), 0 6px 16px -8px rgb(0 0 0 / 0.35)`,
				zIndex: isPresented ? CARD_PRESENTED_LAYER : index + 1,
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
		</button>
	)
}
