import { useEffect } from 'react'
import {
	motion,
	useMotionValue,
	useTransform,
	wrap,
	type MotionValue,
} from 'motion/react'
import { DIGIT_HEIGHT, DIGITS } from './constants'

type DigitItemProps = {
	digit: number
	pos: MotionValue<number>
}

function DigitItem({ digit, pos }: DigitItemProps) {
	const offset = useTransform(pos, (latest) => wrap(-5, 5, digit - latest))
	const y = useTransform(offset, (o) => o * DIGIT_HEIGHT)
	const opacity = useTransform(offset, (o) => Math.max(0, 1 - Math.abs(o)))

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
}

export function DigitColumn({ digit, isDimmed }: DigitColumnProps) {
	const pos = useMotionValue(digit)

	useEffect(() => {
		// Take the shortest way round the wheel: from 9 to 0 the target is 10, not 0.
		const current = pos.get()
		pos.set(current + wrap(-5, 5, digit - current))
	}, [digit, pos])

	return (
		<div
			className={`relative h-11 w-6.5 overflow-hidden font-mono transition-opacity duration-300 ease-out-strong ${isDimmed ? 'opacity-15' : ''}`}
		>
			{DIGITS.map((d) => (
				<DigitItem key={d} digit={d} pos={pos} />
			))}
		</div>
	)
}
