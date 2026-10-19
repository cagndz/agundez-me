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
		slug: 'hold-to-confirm',
		title: 'hold to confirm',
		summary:
			'Hold to fill, release to rewind. Confirmation is progress reaching 1, not an event.',
		specs: [
			{ label: 'Trigger', value: 'Hold 1.2 s' },
			{ label: 'Release', value: '250 ms · ease-out' },
			{ label: 'Render', value: 'Canvas 2D · 637 dots' },
			{ label: 'Stack', value: 'React · Motion · TypeScript' },
			{ label: 'A11y', value: 'Enter · live region · reduced motion' },
		],
	},
	{ id: '002', slug: 'empty-002', title: 'Empty' },
	{ id: '003', slug: 'empty-003', title: 'Empty' },
	{ id: '004', slug: 'empty-004', title: 'Empty' },
	{ id: '005', slug: 'empty-005', title: 'Empty' },
	{ id: '006', slug: 'empty-006', title: 'Empty' },
]
