type GooFilterProps = {
	id: string
	blur: number
}

/**
 * The Tooltip's metaball filter, plus the crisp shapes drawn back over it.
 * The threshold alone rounds and wobbles a resting pill; the union keeps
 * the real edges where shapes are, and the goo only where they meet.
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
						result='goo'
					/>
					<feComposite in='SourceGraphic' in2='goo' operator='over' />
				</filter>
			</defs>
		</svg>
	)
}
