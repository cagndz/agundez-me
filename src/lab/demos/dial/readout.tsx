import { useReducedMotion } from 'motion/react'
import { ROLL_STAGGER, UNIT_FONT_SIZE, UNIT_GAP, UNIT_LIFT } from './constants'
import { DigitColumn } from './digit-column'
import { getDigits } from './utils'

type ReadoutProps = {
	value: number
	isDragging: boolean
}

const DIGIT_COUNT = 3

export function Readout({ value, isDragging }: ReadoutProps) {
	const reduceMotion = useReducedMotion()

	return (
		<div className='flex items-end'>
			<span className='sr-only'>{value}%</span>
			<div aria-hidden className='flex items-end'>
				{getDigits(value).map((digit, i) => (
					<DigitColumn
						key={i}
						digit={digit}
						instant={isDragging || reduceMotion === true}
						delay={(DIGIT_COUNT - 1 - i) * ROLL_STAGGER}
						isDimmed={value < 10 ** (2 - i) && i < 2}
					/>
				))}
				<span
					className='text-muted'
					style={{
						marginLeft: UNIT_GAP,
						paddingBottom: UNIT_LIFT,
						fontSize: UNIT_FONT_SIZE,
					}}
				>
					%
				</span>
			</div>
		</div>
	)
}
