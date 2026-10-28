import { CURVE_BOX, curveDuration, curvePath, type LabCurve } from './curves'

// One animation of a piece, drawn from the transition it really uses.
export function MotionCurve({
	curve,
	maxDuration,
}: {
	curve: LabCurve
	// The longest animation of the piece, in ms: the width of the time axis
	maxDuration: number
}) {
	const { width, height, target } = CURVE_BOX

	return (
		<figure className='flex flex-col gap-2 bg-(--surface) px-2.5 pt-3 pb-2'>
			{/* The numbers are in the caption; the drawing adds nothing for a screen
			    reader. Stretched to the cell (preserveAspectRatio), with strokes that
			    keep their width while it stretches (non-scaling-stroke). */}
			<svg
				aria-hidden='true'
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio='none'
				className='h-11 w-full overflow-visible'
				fill='none'
			>
				<path
					d={`M 0 ${target} H ${width}`}
					className='stroke-border'
					strokeDasharray='3 3'
					vectorEffect='non-scaling-stroke'
				/>
				<path
					d={curvePath(curve.transition, maxDuration)}
					className='stroke-foreground'
					strokeWidth={1.5}
					vectorEffect='non-scaling-stroke'
				/>
			</svg>
			<figcaption className='font-mono text-xs'>
				<span className='block tracking-widest text-muted uppercase'>
					{curve.label}
				</span>
				<span className='mt-0.5 block tabular-nums'>
					{Math.round(curveDuration(curve.transition))} ms
				</span>
			</figcaption>
		</figure>
	)
}
