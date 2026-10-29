import type { LabCurve } from './curves'
import {
	RELEASE_SPRING,
	RETURN_SPRING,
	ROLL_SPRING,
	SIZE as DIAL_SIZE,
} from './demos/dial/constants'
import {
	CARD_DROP,
	CARD_PRESENT_SPRING,
	CARD_RETURN_SPRING,
	CARD_RISE,
	SIZE as WALLET_SIZE,
} from './demos/wallet/constants'
import {
	LENS_HIDE_SPRING,
	LENS_OPEN_SPRING,
	LENS_UNPIN_SPRING,
	SIZE as INSPECT_SIZE,
} from './demos/inspect/constants'

export type LabSpec = {
	label: string
	value: string
}

export type LabItem = {
	id: string
	slug: string
	title: string
	summary?: string
	// The piece's animations, drawn as curves in the modal. Built from the
	// demo's own constants, never typed by hand.
	curves?: LabCurve[]
	// Everything else worth knowing that isn't a curve
	specs?: LabSpec[]
	// The demo's natural size. The grid needs it before anything renders, to
	// give each card its height on the server (see lab-grid.tsx). Widest
	// allowed: 368px. DemoFit warns in development if the real size differs.
	size: { width: number; height: number }
}

export const items: LabItem[] = [
	{
		id: '001',
		slug: 'dial',
		title: 'Dial',
		size: DIAL_SIZE,
		summary: 'Drag to turn the wheel, release to settle on a tick.',
		curves: [
			{ label: 'Release', transition: RELEASE_SPRING },
			{ label: 'Return', transition: RETURN_SPRING },
			{ label: 'Digits', transition: ROLL_SPRING },
		],
		specs: [
			{ label: 'Ends', value: 'Progressive rubber band' },
			{ label: 'Stagger', value: '35 ms per digit' },
			{ label: 'Render', value: 'DOM · 101 ticks · one rotation' },
			{ label: 'A11y', value: 'Slider · keyboard · reduced motion' },
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
		],
	},
	{
		id: '002',
		slug: 'wallet',
		title: 'Wallet',
		size: WALLET_SIZE,
		summary:
			'Click a card to lift it out of the case and turn it to landscape.',
		curves: [
			{ label: 'Rise', transition: CARD_RISE },
			{ label: 'Present', transition: CARD_PRESENT_SPRING },
			{ label: 'Return', transition: CARD_RETURN_SPRING },
			{ label: 'Drop', transition: CARD_DROP },
		],
		specs: [
			{ label: 'Render', value: 'DOM · screen-space shadow' },
			{
				label: 'A11y',
				value: 'Toggle buttons · outside click · reduced motion',
			},
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
		],
	},
	{
		id: '003',
		slug: 'inspect',
		title: 'Inspect',
		size: INSPECT_SIZE,
		summary:
			"Hover to read the form's measurements, click to pin the whole blueprint.",
		curves: [
			{ label: 'Open', transition: LENS_OPEN_SPRING },
			{ label: 'Hide', transition: LENS_HIDE_SPRING },
			{ label: 'Unpin', transition: LENS_UNPIN_SPRING },
		],
		specs: [
			{ label: 'Reveal', value: 'clip-path · lens to farthest corner' },
			{ label: 'Render', value: 'Motion values · no React render per move' },
			{
				label: 'A11y',
				value: 'Keyboard · live summary · reduced motion',
			},
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
		],
	},
]
