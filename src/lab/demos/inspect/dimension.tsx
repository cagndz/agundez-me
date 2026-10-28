import { LABEL_LINE_HEIGHT } from './constants'
import type { Dimension, Side } from './types'
import { getDimensionParts } from './utils'

type DimensionLineProps = {
	dimension: Dimension
}

// The translate that puts the number on its side of the point it is placed at.
// Percentages are of the number's own size, so this works for "8" and for "336".
// The number takes the blueprint's background (bg-inherit) to hide the dots
// behind it.
// Full class names, so Tailwind can find them.
const LABEL_SHIFT: Record<Side, string> = {
	above: '-translate-x-1/2',
	right: '',
	left: '-translate-x-full',
}

export function DimensionLine({ dimension }: DimensionLineProps) {
	const { line, startTick, endTick, label } = getDimensionParts(dimension)

	return (
		<>
			<span className='absolute bg-accent' style={line} />
			<span className='absolute bg-accent' style={startTick} />
			<span className='absolute bg-accent' style={endTick} />
			<span
				className={`absolute bg-inherit px-0.5 font-mono text-[9px] tracking-[0.04em] whitespace-nowrap text-accent ${LABEL_SHIFT[dimension.side]}`}
				style={{ ...label, lineHeight: `${LABEL_LINE_HEIGHT}px` }}
			>
				{dimension.length}
			</span>
		</>
	)
}
