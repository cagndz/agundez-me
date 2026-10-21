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
	// 'tall' doubles the cell's height when the grid has a single column (phones),
	// for demos taller than they are wide. With two or more columns every cell
	// stays square, so the grid keeps its rhythm and the modal opens from a square.
	size?: 'square' | 'tall'
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
	{
		id: '002',
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
	{ id: '003', slug: 'empty-003', title: 'Empty' },
	{ id: '004', slug: 'empty-004', title: 'Empty' },
	{ id: '005', slug: 'empty-005', title: 'Empty' },
	{ id: '006', slug: 'empty-006', title: 'Empty' },
]
