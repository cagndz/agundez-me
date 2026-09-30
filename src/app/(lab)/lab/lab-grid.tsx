export default function LabGrid() {
	const cells = ['001', '002', '003', '004', '005', '006']

	return (
		<div className='grid grid-cols-1 border-t border-l border-border md:grid-cols-2 lg:grid-cols-3'>
			{cells.map((cell) => (
				<div
					key={cell}
					className='flex aspect-square flex-col justify-between border-r border-b border-border p-4 font-mono text-sm uppercase'
				>
					<span>{cell}</span>
					<span className='text-muted'>EMPTY</span>
				</div>
			))}
		</div>
	)
}
