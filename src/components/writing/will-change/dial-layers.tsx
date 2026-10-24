import { Figure } from '@/components/writing/figure'

// A schematic of the dial: a stretch of its ticks along the arc, and tinted
// shapes for the layers they are drawn into.
const RADIUS = 260
const CENTER_X = 130
const CENTER_Y = RADIUS + 30
const TICKS = Array.from({ length: 13 }, (_, i) => {
	const step = i - 6
	const angle = step * 3.8
	const length = step === 0 ? 20 : step % 3 === 0 ? 15 : 10
	const radians = (angle * Math.PI) / 180
	const point = (r: number) => ({
		x: CENTER_X + r * Math.sin(radians),
		y: CENTER_Y - r * Math.cos(radians),
	})
	const base = point(RADIUS)
	const tip = point(RADIUS + length)
	return {
		angle,
		length,
		base,
		tip,
		middle: { x: (base.x + tip.x) / 2, y: (base.y + tip.y) / 2 },
		opacity: Math.max(0.35, 1 - Math.abs(step) / 9),
	}
})

function Dial({ layers }: { layers: 'wheel' | 'ticks' }) {
	return (
		<svg
			viewBox='0 0 260 68'
			className='h-auto w-full max-w-65'
			aria-hidden='true'
		>
			{layers === 'wheel' && (
				<rect
					x='10'
					y='2'
					width='240'
					height='64'
					rx='10'
					className='fill-accent/10'
				/>
			)}
			{layers === 'ticks' &&
				TICKS.map((tick) => (
					<rect
						key={tick.angle}
						x={tick.middle.x - 4.5}
						y={tick.middle.y - tick.length / 2 - 3.5}
						width='9'
						height={tick.length + 7}
						rx='2'
						className='fill-accent/15'
						transform={`rotate(${tick.angle} ${tick.middle.x} ${tick.middle.y})`}
					/>
				))}
			{TICKS.map((tick) => (
				<line
					key={tick.angle}
					x1={tick.base.x}
					y1={tick.base.y}
					x2={tick.tip.x}
					y2={tick.tip.y}
					strokeWidth='1.5'
					strokeLinecap='round'
					opacity={tick.opacity}
					className='stroke-foreground'
				/>
			))}
		</svg>
	)
}

export function DialLayers() {
	return (
		<Figure caption='Tinted shapes are layers: one for the whole wheel, or one for each tick.'>
			<div className='grid grid-cols-1 gap-8 px-5 py-8 sm:grid-cols-2 sm:gap-4'>
				<div className='flex flex-col items-center gap-5'>
					<Dial layers='wheel' />
					<p className='text-[13px] text-muted'>will-change on the wheel</p>
				</div>
				<div className='flex flex-col items-center gap-5'>
					<Dial layers='ticks' />
					<p className='text-[13px] text-muted'>will-change on every tick</p>
				</div>
			</div>
		</Figure>
	)
}
