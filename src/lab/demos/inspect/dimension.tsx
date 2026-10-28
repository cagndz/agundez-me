import type { Dimension } from './types'
import { getDimensionParts } from './utils'

type DimensionLineProps = {
	dimension: Dimension
}

export function DimensionLine({ dimension }: DimensionLineProps) {
	const { line, startTick, endTick } = getDimensionParts(dimension)

	return (
		<>
			<span className='absolute bg-accent' style={line} />
			<span className='absolute bg-accent' style={startTick} />
			<span className='absolute bg-accent' style={endTick} />
		</>
	)
}
