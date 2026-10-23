import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { CardShadow } from './card-shadow'
import {
	CARD_FACE_FADE_START,
	CARD_HEIGHT,
	CARD_HOVER,
	CARD_HOVER_LIFT,
	CARD_PALETTES,
	CARD_PRESENTED_ROTATION,
	CARD_RADIUS,
	CARD_TAB_FADE_END,
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
	const hoverLift = useMotionValue(0)
	const cardY = useTransform(() => y.get() + hoverLift.get())
	const tabOpacity = useTransform(rotate, [0, CARD_TAB_FADE_END], [1, 0])
	const faceOpacity = useTransform(
		rotate,
		[0, CARD_FACE_FADE_START, CARD_PRESENTED_ROTATION],
		[0, 0, 1],
	)

	const handleHoverStart = () => {
		if (!isAnyPresented) {
			animate(hoverLift, -CARD_HOVER_LIFT, CARD_HOVER)
		}
	}

	const handleHoverEnd = () => {
		animate(hoverLift, 0, CARD_HOVER)
	}

	useEffect(() => {
		if (isAnyPresented) {
			animate(hoverLift, 0, CARD_HOVER)
		}
	}, [hoverLift, isAnyPresented])

	return (
		<motion.div
			className='absolute left-1/2 -translate-x-1/2'
			style={{
				top: getRestTop(index, count),
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				y: cardY,
				zIndex,
				willChange: 'transform',
			}}
		>
			<CardShadow rotate={rotate} scale={scale} />
			<motion.button
				type='button'
				className='absolute size-full'
				style={{
					borderRadius: CARD_RADIUS,
					background: palette.background,
					color: palette.foreground,
					boxShadow: `inset 0 0 0 1px ${palette.edge}`,
					rotate,
					scale,
					willChange: 'transform',
				}}
				aria-pressed={isPresented}
				onClick={() => onToggle(card.id)}
				onHoverStart={handleHoverStart}
				onHoverEnd={handleHoverEnd}
			>
				<motion.div
					className='absolute inset-x-3 top-2 flex items-center justify-between'
					style={{ opacity: tabOpacity, willChange: 'opacity' }}
				>
					<span className='text-[11px] font-medium'>{card.title}</span>
					<span
						className='font-mono text-[10px]'
						style={{ color: palette.muted }}
					>
						{card.code}
					</span>
				</motion.div>
				<motion.div
					aria-hidden='true'
					className='absolute top-0 left-0 flex origin-top-left flex-col p-4 text-left'
					style={{
						width: CARD_HEIGHT,
						height: CARD_WIDTH,
						transform: `translateX(${CARD_WIDTH}px) rotate(90deg)`,
						opacity: faceOpacity,
						willChange: 'opacity',
					}}
				>
					<div className='flex justify-between'>
						<span className='text-[14px] leading-none font-semibold tracking-tight'>
							{card.title}
						</span>
						<span
							className='font-mono text-[10px]'
							style={{ color: palette.muted }}
						>
							{card.code}
						</span>
					</div>
					<span
						className='mt-auto text-[10px] font-normal'
						style={{ color: palette.muted }}
					>
						{card.description}
					</span>
				</motion.div>
			</motion.button>
		</motion.div>
	)
}
