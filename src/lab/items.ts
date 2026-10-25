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
}

export const items: LabItem[] = [
	{
		id: '001',
		slug: 'dial',
		title: 'Dial',
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
	{ id: '003', slug: 'empty-003', title: 'Empty' },
	{ id: '004', slug: 'empty-004', title: 'Empty' },
	{ id: '005', slug: 'empty-005', title: 'Empty' },
	{ id: '006', slug: 'empty-006', title: 'Empty' },
]
