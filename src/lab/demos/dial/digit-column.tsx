import { useEffect } from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useTransform,
	wrap,
	type MotionValue,
} from 'motion/react'
import {
	DIGIT_FONT_SIZE,
	DIGIT_HEIGHT,
	DIGIT_WIDTH,
	DIGITS,
	ROLL_FADE,
	ROLL_SPRING,
} from './constants'

type DigitItemProps = {
	digit: number
	pos: MotionValue<number>
}

function DigitItem({ digit, pos }: DigitItemProps) {
	const offset = useTransform(pos, (latest) => wrap(-5, 5, digit - latest))
	const y = useTransform(offset, (o) => o * DIGIT_HEIGHT)
	const opacity = useTransform(offset, (o) =>
		Math.max(0, 1 - Math.abs(o) * ROLL_FADE),
	)

	return (
		<motion.span
			className='absolute inset-0 grid place-items-center leading-none font-medium tabular-nums'
			style={{ y, opacity, fontSize: DIGIT_FONT_SIZE }}
		>
			{digit}
		</motion.span>
	)
}

type DigitColumnProps = {
	digit: number
	isDimmed: boolean
	delay: number
	instant: boolean
}

export function DigitColumn({
	digit,
	isDimmed,
	delay,
	instant,
}: DigitColumnProps) {
	const pos = useMotionValue(digit)

	useEffect(() => {
		// Take the shortest way round the wheel: from 9 to 0 the target is 10, not 0.
		const current = pos.get()
		const target = current + wrap(-5, 5, digit - current)

		// A new digit can arrive mid-roll. Animating pos replaces the old roll,
		// and the spring picks up its velocity, so the column keeps turning
		// instead of restarting. The stagger only applies from rest: delaying a
		// retarget would freeze the column halfway between two digits.
		animate(
			pos,
			target,
			instant
				? { duration: 0 }
				: { ...ROLL_SPRING, delay: pos.isAnimating() ? 0 : delay },
		)
	}, [digit, pos, delay, instant])

	useEffect(() => () => pos.stop(), [pos])

	return (
		<div
			className={`relative overflow-hidden mask-[linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] font-mono transition-opacity duration-300 ease-out-strong ${isDimmed ? 'opacity-15' : ''}`}
			style={{ width: DIGIT_WIDTH, height: DIGIT_HEIGHT }}
		>
			{DIGITS.map((d) => (
				<DigitItem key={d} digit={d} pos={pos} />
			))}
		</div>
	)
}
