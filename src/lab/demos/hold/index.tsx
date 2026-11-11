'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { HoldButton, type HoldButtonHandle } from './button'
import {
	BUTTON,
	BUTTON_X,
	CONTENT_IN,
	CONTENT_OUT,
	GATHER,
	INSTANT,
	LAND_AT,
	RESET,
	SIZE,
	SPREAD,
	STAMP,
	STAMP_TOP,
} from './constants'

// Hold to publish, and nothing but the button. Holding it, its ink drains
// into a drop beneath it; at the end the drop falls on the paper and
// spreads into a stain, and the stain is the receipt: where the piece now
// lives, which is this very page. Reset gathers the stain back into a drop,
// draws it up and refills the button.

export function Hold() {
	const reduceMotion = useReducedMotion()
	const [published, setPublished] = useState(false)
	const button = useRef<HoldButtonHandle>(null)

	function reset() {
		setPublished(false)
		button.current?.reset()
		// The reset control is about to go; focus goes back to the button
		button.current?.focus()
	}

	return (
		<div className='relative font-sans normal-case' style={SIZE}>
			<HoldButton
				ref={button}
				label='Hold to publish'
				doneLabel='Published'
				width={BUTTON}
				x={BUTTON_X}
				area={SIZE}
				landAt={LAND_AT}
				onLand={() => setPublished(true)}
			>
				<motion.div
					className='absolute left-0 rounded-full bg-foreground'
					style={{
						top: STAMP_TOP,
						...STAMP,
						// Spreads from the middle, where the drop hit; gathers toward
						// its top, where the drop is leaving from, so nothing is left
						// behind on the paper
						originY: published ? 0.5 : 0,
					}}
					initial={{ scaleX: 0, scaleY: 0 }}
					animate={
						published ? { scaleX: 1, scaleY: 1 } : { scaleX: 0, scaleY: 0 }
					}
					transition={reduceMotion ? INSTANT : published ? SPREAD : GATHER}
				/>
			</HoldButton>

			<motion.div
				className='absolute left-0 flex items-center justify-between font-mono text-[11px] whitespace-nowrap text-[#f4f4f2]'
				style={{
					top: STAMP_TOP,
					...STAMP,
					paddingLeft: 14,
					paddingRight: (STAMP.height - RESET) / 2,
					pointerEvents: published ? 'auto' : 'none',
				}}
				initial={false}
				animate={{ opacity: published ? 1 : 0 }}
				transition={
					reduceMotion ? INSTANT : published ? CONTENT_IN : CONTENT_OUT
				}
			>
				<p role='status' className='flex items-center gap-2'>
					{published && (
						<>
							<span className='size-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]' />
							Live at agundez.me/lab?c=hold
						</>
					)}
				</p>
				{published && (
					<button
						type='button'
						aria-label='Reset'
						title='Reset'
						onClick={reset}
						className='group grid shrink-0 cursor-pointer place-items-center rounded-full text-[#f4f4f2]/55 outline-[#f4f4f2] transition-colors duration-150 ease-out-strong hover:bg-[#f4f4f2]/10 hover:text-[#f4f4f2] focus-visible:outline-2 focus-visible:-outline-offset-2 active:scale-[0.96]'
						style={{ width: RESET, height: RESET }}
					>
						{/* Counter-clockwise: back the way it came */}
						<svg
							aria-hidden='true'
							width='12'
							height='12'
							viewBox='0 0 12 12'
							fill='none'
							stroke='currentColor'
							strokeWidth='1.25'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='transition-transform duration-200 ease-out-strong group-hover:-rotate-45'
						>
							<path d='M2.5 6a3.5 3.5 0 1 0 1.03-2.47' />
							<path d='M2.5 1.75v2h2' />
						</svg>
					</button>
				)}
			</motion.div>
		</div>
	)
}
