import { useEffect, useEffectEvent, useId, useRef } from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
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
	const { y, rotate, scale, zIndex, opacity } = useWalletCardMotion({
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

	const descriptionId = useId()
	const reduceMotion = useReducedMotion()
	const liftTransition = reduceMotion ? { duration: 0 } : CARD_HOVER

	// The pointer over the card or keyboard focus on it: either one lifts a card
	// resting in the case, so the keyboard gets the same cue as the mouse. Refs,
	// not state: they only decide where hoverLift goes, nothing renders from them.
	const isHovered = useRef(false)
	const isFocusVisible = useRef(false)

	function updateLift() {
		const isLifted =
			!isAnyPresented && (isHovered.current || isFocusVisible.current)
		animate(hoverLift, isLifted ? -CARD_HOVER_LIFT : 0, liftTransition)
	}

	// Presenting a card drops every lift; closing it restores the lift of a card
	// that still has the pointer or keyboard focus on it.
	const syncLift = useEffectEvent(updateLift)

	useEffect(() => {
		syncLift()
	}, [isAnyPresented])

	return (
		<motion.div
			className='absolute left-1/2 -translate-x-1/2'
			style={{
				top: getRestTop(index, count),
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				y: cardY,
				zIndex,
				opacity,
				willChange: 'transform',
			}}
		>
			<CardShadow rotate={rotate} scale={scale} />
			<motion.button
				type='button'
				// The case's ring sits inside an element; here it would vanish on the
				// dark card and hide behind the next card down. Outside, it reads on
				// all three. Focus also lifts the card (updateLift).
				className='absolute size-full focus-visible:outline-offset-2'
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
				// The three cards share a title, so the code tells them apart: "Card 01".
				aria-label={`${card.title} ${card.code}`}
				aria-pressed={isPresented}
				aria-describedby={descriptionId}
				onClick={() => onToggle(card.id)}
				onHoverStart={() => {
					isHovered.current = true
					updateLift()
				}}
				onHoverEnd={() => {
					isHovered.current = false
					updateLift()
				}}
				onFocus={(event) => {
					// Only keyboard focus: a click also focuses the button.
					isFocusVisible.current = event.currentTarget.matches(':focus-visible')
					updateLift()
				}}
				onBlur={() => {
					isFocusVisible.current = false
					updateLift()
				}}
			>
				<motion.div
					className='absolute inset-x-3 top-2 flex items-center justify-between'
					style={{
						opacity: tabOpacity,
						filter: tabBlur,
						willChange: 'opacity, filter',
					}}
				>
					{/* The button's name is its aria-label, so neither text is read twice. */}
					<span className='text-[11px] font-medium'>{card.title}</span>
					<span
						aria-hidden='true'
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
						{/* Read as the button's description. aria-describedby still reads
						    it from inside the aria-hidden face. */}
						<span
							id={descriptionId}
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
