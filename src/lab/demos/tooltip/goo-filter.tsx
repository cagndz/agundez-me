type GooFilterProps = {
	id: string
	blur: number
}

/**
 * The metaball trick: blur the shapes so nearby edges bleed into each other,
 * then crank the alpha contrast so the blur snaps back to a hard edge. Two
 * shapes closer than the blur get a liquid neck between them. The threshold
 * (alpha × 24 − 11) sits near 0.48, so a straight edge stays where it was.
 */
export function GooFilter({ id, blur }: GooFilterProps) {
	return (
		<svg aria-hidden='true' className='absolute size-0'>
			<defs>
				<filter
					id={id}
					x='-20%'
					y='-20%'
					width='140%'
					height='140%'
					colorInterpolationFilters='sRGB'
				>
					<feGaussianBlur in='SourceGraphic' stdDeviation={blur} />
					<feColorMatrix
						mode='matrix'
						values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11'
					/>
				</filter>
			</defs>
		</svg>
	)
}
