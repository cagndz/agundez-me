'use client'

import { useState } from 'react'
import {
	animate,
	motion,
	type PanInfo,
	useDragControls,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
	useTransform,
} from 'motion/react'
import {
	INITIAL,
	INITIAL_OFFSET_PX,
	MARKER_HEIGHT,
	MARKER_TOP,
	MARKER_WIDTH,
	READOUT_GAP,
	RELEASE_SPRING,
	TRAVEL,
	BAND_WIDTH,
	RADIUS,
	WHEEL_TOP,
	WINDOW_HEIGHT,
	WINDOW_WIDTH,
	UNITS,
} from './constants'
import {
	pixelToDegrees,
	pixelToPosition,
	getReleaseTarget,
	pixelToUnit,
} from './utils'
import { Tick } from './tick'
import { Readout } from './readout'

export function Dial() {
	const x = useMotionValue(INITIAL_OFFSET_PX)
	const rotateDial = useTransform(x, pixelToDegrees)
	const position = useTransform(x, pixelToPosition)
	const [value, setValue] = useState(INITIAL)
	const [isDragging, setIsDragging] = useState(false)
	const dragControls = useDragControls()
	const reduceMotion = useReducedMotion()

	function handleDragEnd(_event: PointerEvent, info: PanInfo) {
		setIsDragging(false)

		const target = getReleaseTarget(x.get(), info.velocity.x)

		if (reduceMotion) {
			x.set(target)
			return
		}

		// Start the spring with the finger's own velocity so the hand-off is seamless.
		animate(x, target, { ...RELEASE_SPRING, velocity: info.velocity.x })
	}

	useMotionValueEvent(x, 'change', (latest) => {
		setValue(pixelToUnit(latest))
	})

	return (
		<div
			role='group'
			aria-label='Dial'
			className='flex flex-col items-center select-none'
			style={{ gap: READOUT_GAP }}
		>
			<Readout value={value} isDragging={isDragging} />
			<div
				className='relative overflow-hidden'
				style={{ width: WINDOW_WIDTH, height: WINDOW_HEIGHT }}
			>
				<div
					aria-hidden
					className='absolute inset-0 mask-[linear-gradient(90deg,transparent,#000_22%,#000_78%,transparent)]'
				>
					<motion.div
						className='absolute left-1/2 -translate-x-1/2 rounded-full'
						style={{
							width: RADIUS * 2,
							height: RADIUS * 2,
							top: WHEEL_TOP,
							rotate: rotateDial,
						}}
					>
						{UNITS.map((unit) => {
							const isActive = value === unit

							return (
								<Tick
									key={unit}
									unit={unit}
									isActive={isActive}
									position={position}
								/>
							)
						})}
					</motion.div>
				</div>
				<motion.div
					aria-hidden
					className='absolute inset-y-0 left-1/2 font-mono'
					style={{
						x,
						width: BAND_WIDTH,
					}}
					drag='x'
					dragConstraints={{ left: -TRAVEL, right: 0 }}
					dragElastic={0.25}
					dragMomentum={false}
					dragListener={false}
					dragControls={dragControls}
					onDragStart={() => setIsDragging(true)}
					onDragEnd={handleDragEnd}
				/>
				<div
					aria-hidden
					onPointerDown={(e) => dragControls.start(e)}
					className='absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing'
				/>
				<div
					aria-hidden
					className='pointer-events-none absolute left-1/2 -translate-x-1/2 bg-accent [clip-path:polygon(50%_0%,0%_100%,100%_100%)]'
					style={{
						top: MARKER_TOP,
						width: MARKER_WIDTH,
						height: MARKER_HEIGHT,
					}}
				/>
			</div>
		</div>
	)
}
