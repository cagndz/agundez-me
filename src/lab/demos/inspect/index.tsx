import { Blueprint } from './blueprint'
import { LENS_RADIUS, SIZE } from './constants'
import { Form } from './form'

export function Inspect() {
	const centerX = SIZE.width / 2
	const centerY = SIZE.height / 2
	return (
		<div
			className='relative rounded-2xl bg-white p-4 font-sans normal-case inset-ring inset-ring-foreground/10'
			style={{ width: SIZE.width, height: SIZE.height }}
		>
			<Form />

			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 rounded-[inherit]'
				style={{
					clipPath: `circle(${LENS_RADIUS}px at ${centerX}px ${centerY}px)`,
				}}
			>
				<Blueprint />
			</div>
		</div>
	)
}
