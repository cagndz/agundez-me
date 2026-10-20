import { getDigits } from './utils'

type ReadoutProps = {
	value: number
}

export function Readout({ value }: ReadoutProps) {
	return (
		<div className='flex items-end'>
			{getDigits(value).map((digit, i) => (
				<div key={i}>
					<span>{digit}</span>
				</div>
			))}
			<span>%</span>
		</div>
	)
}
