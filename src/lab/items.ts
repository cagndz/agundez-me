import { SIZE as DIAL_SIZE } from './demos/dial/constants'
import { SIZE as WALLET_SIZE } from './demos/wallet/constants'
import { SIZE as INSPECT_SIZE } from './demos/inspect/constants'

export type LabSpec = {
	label: string
	value: string
}

export type LabItem = {
	id: string
	slug: string
	title: string
	summary?: string
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
		summary:
			'Drag to turn the wheel, release to settle on a tick. Position is one continuous value; ticks and digits only read it.',
		specs: [
			{ label: 'Release', value: 'Spring · k 120 · ratio 0.72' },
			{ label: 'Ends', value: 'Progressive rubber band' },
			{ label: 'Render', value: 'DOM · 101 ticks · one rotation' },
			{ label: 'Digits', value: 'Rolling · 400 ms · 35 ms stagger' },
			{ label: 'A11y', value: 'Pointer only · reduced motion' },
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
		],
	},
	{
		id: '002',
		slug: 'wallet',
		title: 'Wallet',
		size: WALLET_SIZE,
		summary:
			'Click a card to lift it out of the case and turn it to landscape. Each stage hands off by position, not time, so a click mid-flight only changes the destination.',
		specs: [
			{ label: 'Rise', value: '280 ms · ease-out' },
			{ label: 'Present', value: 'Spring · 550 ms · bounce 0.2' },
			{ label: 'Return', value: 'Spring · 420 ms · drop 320 ms' },
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
			"Hover to read the form's measurements, click to pin the whole blueprint. Position and size are motion values, so moving the pointer re-renders nothing.",
		specs: [
			{ label: 'Follow', value: 'Spring · 160 ms · no bounce' },
			{ label: 'Release', value: 'Spring · 300 ms · no bounce' },
			{ label: 'Reveal', value: 'clip-path · lens to farthest corner' },
			{ label: 'Render', value: 'Motion values · no re-render per move' },
			{
				label: 'A11y',
				value: 'Keyboard · live summary · reduced motion',
			},
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
		],
	},
]
