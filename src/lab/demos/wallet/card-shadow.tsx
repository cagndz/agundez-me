import { motion, useTransform, type MotionValue } from 'motion/react'
import {
	CARD_PRESENTED_ROTATION,
	CARD_RADIUS,
	CARD_SHADOW_BLUR,
	CARD_SHADOW_COLOR,
	CARD_SHADOW_INSET,
	CARD_SHADOW_OFFSET,
	CARD_SHADOW_OPACITY,
} from './constants'

type CardShadowProps = {
	rotate: MotionValue<number>
	scale: MotionValue<number>
}

export function CardShadow({ rotate, scale }: CardShadowProps) {
	// How lifted the card is, from 0 (upright in the case) to 1 (turned and presented).
	const lift = useTransform(rotate, [0, CARD_PRESENTED_ROTATION], [0, 1])
	const offsetY = useTransform(lift, [0, 1], CARD_SHADOW_OFFSET)
	const opacity = useTransform(lift, [0, 1], CARD_SHADOW_OPACITY)

	return (
		// Outer layer: moves down in screen space and never turns.
		<motion.div
			aria-hidden='true'
			className='pointer-events-none absolute inset-0'
			style={{ y: offsetY, opacity, willChange: 'transform, opacity' }}
		>
			{/* Inner layer: the card's silhouette, turning and scaling with the card. */}
			<motion.div
				className='absolute'
				style={{
					inset: CARD_SHADOW_INSET,
					borderRadius: CARD_RADIUS,
					background: CARD_SHADOW_COLOR,
					filter: `blur(${CARD_SHADOW_BLUR}px)`,
					rotate,
					scale,
					willChange: 'transform',
				}}
			/>
		</motion.div>
	)
}
