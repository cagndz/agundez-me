import type { LabItem } from '@/lab/items'
import Link from 'next/link'

export default function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<div className='grid grid-cols-1 border-t border-l border-border md:grid-cols-2 lg:grid-cols-3'>
			{items.map((item) => (
				<Link
					key={item.id}
					href={`/lab/${item.slug}`}
					className='flex aspect-square flex-col justify-between border-r border-b border-border p-4 font-mono text-sm uppercase'
				>
					<span>{item.id}</span>
					<span className='text-muted'>{item.title}</span>
				</Link>
			))}
		</div>
	)
}
