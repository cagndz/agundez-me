'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
	CHECK,
	COUNTDOWN,
	DELAY,
	DIVIDER_X,
	FADE,
	FILL,
	FOLD,
	FOOTER_GAP,
	FOOTER_HEIGHT,
	INK_WIDTH,
	INSTANT,
	LABEL_AT,
	LABEL_IN,
	MINI_INK_WIDTH,
	PAD,
	PAD_RADIUS,
	PILL,
	PILL_RADIUS,
	PILL_X,
	PILL_Y,
	RETRACE,
	RETRACE_HOLD,
	RING,
	RING_AT,
	RING_HOME,
	SIZE,
	SLOT,
} from './constants'
import { useSignature } from './hooks'
import { InkPaths, Retrace } from './ink'
import { fitInto, formatSignedAt, inset } from './utils'

// Sign, lift the pen, and wait. Your hand retraces the signature in accent,
// then the pad folds into a pill around a miniature of it. Nothing in the
// pill is new: the countdown ring flies in from its corner and fills into
// the check, and the ink shrinks into its slot. Click the pill to reopen.

const OPEN_CLIP = inset(0, 0, 0, 0, PAD_RADIUS)
const PILL_CLIP = inset(PILL_Y, PILL_X, PILL_Y, PILL_X, PILL_RADIUS)
const AT_REST = { scale: 1, x: 0, y: 0 }

type Step = 'ink' | 'retrace' | 'fold'

export function Signature() {
	const reduceMotion = useReducedMotion()
	const [step, setStep] = useState<Step>('ink')
	const [signedAt, setSignedAt] = useState('')

	const { strokes, phase, padProps, complete, edit, reset } = useSignature({
		delay: DELAY,
		onConfirm: () => {
			setSignedAt(formatSignedAt())
			// Reduced motion: no retrace, the pad folds at once
			if (reduceMotion) {
				setStep('fold')
				return
			}
			setStep('retrace')
			window.setTimeout(
				() => setStep('fold'),
				RETRACE.duration * 1000 + RETRACE_HOLD,
			)
		},
	})

	const folded = step === 'fold'
	const signed = phase === 'signed'
	const fold = reduceMotion ? INSTANT : FOLD
	// The ring shows from the countdown on, and stays full while the ink retraces
	const ringVisible = phase === 'pending' || step !== 'ink'

	function reopen() {
		setStep('ink')
		edit()
	}

	function clear() {
		setStep('ink')
		reset()
	}

	return (
		<div
			className='flex flex-col normal-case select-none'
			style={{ ...SIZE, gap: FOOTER_GAP }}
		>
			{/* The hairline is a drop-shadow outside the clip, so it follows the
			    pad as it folds into the pill */}
			<div className='[filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.35))_drop-shadow(0_1px_2px_rgb(0_0_0/0.06))]'>
				<motion.div
					{...padProps}
					role='img'
					aria-label={signed ? `Signed ${signedAt}` : 'Signature pad'}
					data-folded={folded}
					className='relative touch-none overflow-hidden bg-white data-[folded=false]:cursor-crosshair'
					style={PAD}
					initial={false}
					animate={{ clipPath: folded ? PILL_CLIP : OPEN_CLIP }}
					transition={fold}
				>
					{phase === 'empty' && (
						<span className='pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted'>
							Draw your signature
						</span>
					)}

					<motion.svg
						width={PAD.width}
						height={PAD.height}
						viewBox={`0 0 ${PAD.width} ${PAD.height}`}
						className='pointer-events-none absolute inset-0 overflow-visible'
						style={{ originX: 0, originY: 0 }}
						initial={false}
						animate={
							folded && strokes.length ? fitInto(strokes, SLOT) : AT_REST
						}
						transition={fold}
					>
						<InkPaths
							strokes={strokes}
							width={folded ? MINI_INK_WIDTH : INK_WIDTH}
							transition={fold}
						/>
						{step === 'retrace' && <Retrace strokes={strokes} />}
					</motion.svg>

					<motion.span
						className='pointer-events-none absolute text-sm leading-[18px]'
						style={LABEL_AT}
						initial={false}
						animate={{ opacity: folded ? 1 : 0 }}
						transition={folded && !reduceMotion ? LABEL_IN : FADE}
					>
						Signed
					</motion.span>

					{/* The ring travels one way: countdown in the corner, check in the
					    pill. Back on the pad there's no countdown to show, so it
					    vanishes and returns to its corner at once instead of
					    flying back as an empty ring. */}
					<motion.svg
						viewBox='0 0 16 16'
						className='pointer-events-none absolute'
						style={{ ...RING_AT, width: RING, height: RING }}
						initial={false}
						animate={{
							...(folded ? AT_REST : RING_HOME),
							opacity: ringVisible ? 1 : 0,
						}}
						transition={ringVisible ? { ...fold, opacity: FADE } : INSTANT}
					>
						<g transform='rotate(-90 8 8)' fill='none' strokeWidth={2}>
							<circle cx={8} cy={8} r={6} stroke='var(--border)' />
							{/* Remounted for each countdown, so it starts empty */}
							<motion.circle
								key={phase === 'pending' ? 'counting' : 'still'}
								cx={8}
								cy={8}
								r={6}
								stroke='var(--foreground)'
								initial={{ pathLength: phase === 'pending' ? 0 : 1 }}
								animate={{ pathLength: 1 }}
								transition={COUNTDOWN}
							/>
						</g>
						<motion.circle
							cx={8}
							cy={8}
							r={8}
							fill='var(--accent)'
							initial={false}
							animate={{ scale: folded ? 1 : 0 }}
							transition={folded && !reduceMotion ? FILL : INSTANT}
						/>
						<motion.path
							d='M4.75 8.25l2.25 2.25 4.25-4.75'
							fill='none'
							stroke='white'
							strokeWidth={1.75}
							strokeLinecap='round'
							strokeLinejoin='round'
							initial={false}
							animate={{
								pathLength: folded ? 1 : 0,
								opacity: folded ? 1 : 0,
							}}
							transition={folded && !reduceMotion ? CHECK : INSTANT}
							onAnimationComplete={() => {
								if (folded && phase === 'confirming') complete()
							}}
						/>
					</motion.svg>

					{folded && (
						<>
							<span
								className='pointer-events-none absolute h-5 w-px bg-border'
								style={{ left: DIVIDER_X, top: PILL_Y + 12 }}
							/>
							<button
								type='button'
								onClick={reopen}
								aria-label='Signed. Reopen to edit'
								className='absolute rounded-full'
								style={{ left: PILL_X, top: PILL_Y, ...PILL }}
							/>
						</>
					)}
				</motion.div>
			</div>

			<div
				className='flex items-center justify-between font-mono text-xs uppercase'
				style={{ height: FOOTER_HEIGHT }}
			>
				<span className='text-muted' aria-live='polite'>
					{signed ? `Signed · ${signedAt}` : ''}
				</span>
				<button
					type='button'
					onClick={clear}
					disabled={phase === 'empty' || phase === 'confirming'}
					className='touch-target text-muted uppercase transition-colors duration-150 ease-out-strong hover:text-foreground disabled:opacity-40 disabled:hover:text-muted'
				>
					{signed ? 'Start over' : 'Clear'}
				</button>
			</div>
		</div>
	)
}
