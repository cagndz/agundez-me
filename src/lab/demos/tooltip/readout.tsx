const ROWS = [
	{ label: 'Status', value: 'Live', led: true },
	{ label: 'Route', value: 'Static' },
	{ label: 'Build', value: '16.3.6' },
]

// What the tooltip says: the lab's own status, read off the panel like a
// device's display.
export function Readout() {
	return (
		<>
			<div className='flex justify-between text-[10px] tracking-[0.06em] text-[#f4f4f2]/45'>
				<span>agundez.me</span>
				<span>Lab · 004</span>
			</div>
			<dl className='grid gap-1.5'>
				{ROWS.map((row) => (
					<div key={row.label} className='flex items-center justify-between'>
						<dt className='text-[#f4f4f2]/55'>{row.label}</dt>
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
