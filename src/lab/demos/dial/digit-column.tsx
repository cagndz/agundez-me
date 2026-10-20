import { useEffect } from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useTransform,
	wrap,
	type MotionValue,
} from 'motion/react'
import { DIGIT_HEIGHT, DIGITS, ROLL_FADE, ROLL_TWEEN } from './constants'

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
			className='absolute inset-0 grid place-items-center text-[38px] leading-none font-medium tabular-nums'
			style={{ y, opacity }}
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

		const controls = animate(
			pos,
			target,
			instant ? { duration: 0 } : { ...ROLL_TWEEN, delay },
		)

		// A new digit can arrive mid-roll: stop the old animation so they don't fight.
		return () => controls.stop()
	}, [digit, pos, delay, instant])

	return (
		<div
			className={`relative h-11 w-6.5 overflow-hidden mask-[linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] font-mono transition-opacity duration-300 ease-out-strong ${isDimmed ? 'opacity-15' : ''}`}
		>
			{DIGITS.map((d) => (
				<DigitItem key={d} digit={d} pos={pos} />
			))}
		</div>
	)
}
