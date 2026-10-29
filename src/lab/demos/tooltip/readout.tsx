const ROWS = [
	{ label: 'Status', value: 'Live', led: true },
	{ label: 'Route', value: 'Static' },
	{ label: 'Build', value: '16.3.6' },
]

// What the tooltip says: the lab's own status, read off the panel like a
// device's display. On the ink (#111111), the labels at 65% contrast 7.7:1
// (AAA) and the header at 55% 5.8:1 (AA, for 10px text).
export function Readout() {
	return (
		<>
			<div className='flex justify-between text-[10px] tracking-[0.06em] text-[#f4f4f2]/55'>
				<span>agundez.me</span>
				<span>Lab · 004</span>
			</div>
			<dl className='grid gap-1.5'>
				{ROWS.map((row) => (
					<div key={row.label} className='flex items-center justify-between'>
						<dt className='text-[#f4f4f2]/65'>{row.label}</dt>
						<dd className='flex items-center gap-2'>
							{row.led && (
								<span className='size-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]' />
							)}
							{row.value}
						</dd>
					</div>
				))}
			</dl>
		</>
	)
}
