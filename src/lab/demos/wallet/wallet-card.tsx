import { useEffect } from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useMotionValueEvent,
	useTransform,
} from 'motion/react'
import { CardShadow } from './card-shadow'
import {
	CARD_FACE_BLUR,
	CARD_FACE_FADE_START,
	CARD_HEIGHT,
	CARD_HOVER,
	CARD_HOVER_LIFT,
	CARD_PALETTES,
	CARD_PRESENTED_LAYER,
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
	onOutChange: (id: string, isOut: boolean) => void
}

export function WalletCard({
	card,
	index,
	count,
	isPresented,
	isAnyPresented,
	onToggle,
	onOutChange,
}: WalletCardProps) {
	const palette = CARD_PALETTES[card.tone]
	const { y, rotate, scale, zIndex } = useWalletCardMotion({
		index,
		count,
		isPresented,
		isAnyPresented,
	})
	// The card is out of the case exactly while it sits on the presented layer:
	// the hook switches layers when the card crosses the case edge, both ways.
	useMotionValueEvent(zIndex, 'change', (layer) => {
		onOutChange(card.id, layer === CARD_PRESENTED_LAYER)
	})

	const hoverLift = useMotionValue(0)
	const cardY = useTransform(() => y.get() + hoverLift.get())
	const tabOpacity = useTransform(rotate, [0, CARD_TAB_FADE_END], [1, 0])
	// The two texts also blur while they swap, so the face comes into focus
	// instead of just appearing. Filters on these promoted layers are applied
	// by the compositor: measured, no extra paint or raster.
	const tabBlur = useTransform(
		rotate,
		[0, CARD_TAB_FADE_END],
		['blur(0px)', `blur(${CARD_FACE_BLUR}px)`],
	)
	const faceBlur = useTransform(
		rotate,
		[CARD_FACE_FADE_START, CARD_PRESENTED_ROTATION],
		[`blur(${CARD_FACE_BLUR}px)`, 'blur(0px)'],
	)
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
				data-wallet-card=''
				aria-label={card.title}
				aria-pressed={isPresented}
				onClick={() => onToggle(card.id)}
				onHoverStart={handleHoverStart}
				onHoverEnd={handleHoverEnd}
			>
				<motion.div
					className='absolute inset-x-3 top-2 flex items-center justify-between'
					style={{
						opacity: tabOpacity,
						filter: tabBlur,
						willChange: 'opacity, filter',
					}}
				>
					<span className='text-[11px] font-medium'>{card.title}</span>
					<span
						className='font-mono text-[10px]'
						style={{ color: palette.muted }}
					>
						{card.code}
					</span>
				</motion.div>
				{/* Static quarter turn: once the card turns -90 deg this face reads
				    horizontally. It is its own element so the animated layer inside
				    carries no transform of its own. */}
				<div
					aria-hidden='true'
					className='absolute top-0 left-0 origin-top-left'
					style={{
						width: CARD_HEIGHT,
						height: CARD_WIDTH,
						transform: `translateX(${CARD_WIDTH}px) rotate(90deg)`,
					}}
				>
					<motion.div
						className='flex size-full flex-col p-4 text-left'
						style={{
							opacity: faceOpacity,
							filter: faceBlur,
							willChange: 'opacity, filter',
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
				</div>
			</motion.button>
		</motion.div>
	)
}
