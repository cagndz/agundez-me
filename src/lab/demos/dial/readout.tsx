import { getDigits } from './utils'

type ReadoutProps = {
	value: number
}

export function Readout({ value }: ReadoutProps) {
	return (
		<div className='flex items-end'>
			{getDigits(value).map((digit, i) => {
				const isLeadingZero = value < 10 ** (2 - i) && i < 2

				return (
					<div
						key={i}
						className='grid h-11 w-6.5 place-items-center overflow-hidden font-mono'
					>
						<span
							className={`text-[38px] leading-none font-medium tabular-nums ${isLeadingZero ? 'opacity-15' : ''} transition-opacity duration-250 ease-out-strong`}
						>
							{digit}
						</span>
					</div>
				)
			})}
			<span className='ml-2 pb-2 text-sm text-muted'>%</span>
		</div>
	)
}
