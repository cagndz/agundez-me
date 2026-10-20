import { DigitColumn } from './digit-column'
import { getDigits } from './utils'

type ReadoutProps = {
	value: number
}

export function Readout({ value }: ReadoutProps) {
	return (
		<div className='flex items-end'>
			{getDigits(value).map((digit, i) => (
				<DigitColumn
					key={i}
					digit={digit}
					isDimmed={value < 10 ** (2 - i) && i < 2}
				/>
			))}
			<span className='ml-2 pb-2 text-sm text-muted'>%</span>
		</div>
	)
}
