import { BOX_MEASURES, DIMENSION_MEASURES } from './constants'

export function Blueprint() {
	return (
		<div className='absolute inset-0 bg-[#1a1a18] bg-[radial-gradient(circle,rgba(236,236,234,0.08)_0.8px,transparent_1.2px)] bg-size-[8px_8px] bg-position-[4px_4px]'>
			{BOX_MEASURES.map((box) => (
				<span
					key={box.name}
					className='absolute inset-ring inset-ring-[rgba(236,236,234,0.4)]'
					style={{
						left: box.x,
						top: box.y,
						width: box.width,
						height: box.height,
						borderRadius: box.radius,
					}}
				></span>
			))}
			{DIMENSION_MEASURES.map((dimension) => (
				<span
					key={dimension.name}
					style={{
						left: dimension.x,
						top: dimension.y,
						width: dimension.direction === 'horizontal' ? dimension.length : 1,
						height: dimension.direction === 'vertical' ? dimension.length : 1,
					}}
					className='absolute bg-accent'
				></span>
			))}
		</div>
	)
}
