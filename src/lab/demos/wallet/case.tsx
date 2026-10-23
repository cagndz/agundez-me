import { useState } from 'react'
import {
	CARD_SINK,
	CARDS_IN_CASE,
	CASE_HEIGHT,
	CASE_RADIUS,
	CASE_TOP,
	CASE_WIDTH,
	LIP_HEIGHT,
	LIP_TOP,
	LIP_WIDTH,
} from './constants'

// The label plate sits in the strip below the cards, where nothing shows
// through the glass. It clears the front card even when that card sinks.
const PLATE_TOP = CARDS_IN_CASE + CARD_SINK + 2
const SCREW_INSET = 10
// Slot angles are irregular on purpose: screws driven by hand never line up.
const SCREWS = [
	{ x: 'left', y: 'top', angle: 35 },
	{ x: 'right', y: 'top', angle: -20 },
	{ x: 'left', y: 'bottom', angle: 80 },
	{ x: 'right', y: 'bottom', angle: 10 },
] as const

export function CaseBack() {
	return (
		<div
			className='absolute left-1/2 -translate-x-1/2 rounded-t-[10px] border border-b-0 border-foreground/18 bg-foreground/2.5'
			style={{ top: LIP_TOP, width: LIP_WIDTH, height: LIP_HEIGHT }}
			aria-hidden='true'
		/>
	)
}

type CaseFrontProps = {
	slots: number
	outCount: number
}

export function CaseFront({ slots, outCount }: CaseFrontProps) {
	return (
		<div
			className='absolute left-1/2 z-10 -translate-x-1/2 bg-white/16 shadow-[inset_0_0_0_1px_rgb(17_17_17/0.28),inset_0_2px_0_rgb(255_255_255/0.9),inset_0_-14px_22px_-16px_rgb(17_17_17/0.25),0_14px_24px_-14px_rgb(17_17_17/0.26)]'
			style={{
				top: CASE_TOP,
				width: CASE_WIDTH,
				height: CASE_HEIGHT,
				borderRadius: CASE_RADIUS,
			}}
			aria-hidden='true'
		>
			<DotGrid />
			{SCREWS.map((screw) => (
				<Screw key={`${screw.x}-${screw.y}`} {...screw} />
			))}
			<LabelPlate slots={slots} outCount={outCount} />
		</div>
	)
}

// Printed on the glass over the card bodies, so a card at rest reads as
// something behind a surface rather than a flat shape.
function DotGrid() {
	return (
		<div
			className='absolute top-[26px] left-6 h-36 w-34 bg-[radial-gradient(circle,rgb(17_17_17/0.2)_0.9px,transparent_1.3px)] bg-size-[8px_8px]'
			aria-hidden='true'
		/>
	)
}

type ScrewProps = {
	x: 'left' | 'right'
	y: 'top' | 'bottom'
	angle: number
}

function Screw({ x, y, angle }: ScrewProps) {
	return (
		<div
			className='absolute size-2.5 rounded-full border border-[rgb(17_17_17/0.42)] bg-[rgb(17_17_17/0.06)] shadow-[0_1px_0_rgb(255_255_255/0.8)]'
			style={{ [x]: SCREW_INSET, [y]: SCREW_INSET }}
		>
			<div
				className='absolute top-[3.25px] left-px h-[1.5px] w-1.5 rounded-[1px] bg-[rgb(17_17_17/0.6)]'
				style={{ rotate: `${angle}deg` }}
			/>
		</div>
	)
}

type LabelPlateProps = {
	slots: number
	outCount: number
}

function LabelPlate({ slots, outCount }: LabelPlateProps) {
	const readout =
		outCount > 0 ? `${outCount} out` : `${String(slots).padStart(2, '0')} slots`
	// Counts readout changes, so the line flickers when it changes but not when
	// the wallet first mounts (in the grid, or when the modal opens).
	// Adjusting state while rendering: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	const [previousReadout, setPreviousReadout] = useState(readout)
	const [changes, setChanges] = useState(0)
	if (previousReadout !== readout) {
		setPreviousReadout(readout)
		setChanges(changes + 1)
	}

	return (
		<div
			className='absolute inset-x-3.5 flex h-8 items-center justify-between rounded-lg bg-[rgb(246_246_244/0.55)] px-3 font-mono text-[10px]/[1.2] font-medium tracking-[0.06em] uppercase shadow-[inset_0_0_0_1px_rgb(17_17_17/0.14),inset_0_1px_0_rgb(17_17_17/0.06)]'
			style={{ top: PLATE_TOP }}
		>
			<div className='flex flex-col gap-0.5 text-foreground'>
				card case
				{/* A new key remounts the line, so the flicker replays on every change. */}
				<span
					key={changes}
					className={`font-normal text-muted ${changes > 0 ? 'signal-flicker' : ''}`}
				>
					{readout}
				</span>
			</div>
			<div
				className={
					outCount > 0
						? 'led-blink size-[7px] rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]'
						: 'size-[7px] rounded-full bg-[rgb(17_17_17/0.18)] shadow-[inset_0_1px_1px_rgb(17_17_17/0.3)]'
				}
			/>
		</div>
	)
}
