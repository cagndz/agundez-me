import type { LabItem } from '@/lab/items'
import Link from 'next/link'

export default function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<div className='grid grid-cols-1 border-t border-l border-border md:grid-cols-2 lg:grid-cols-3'>
			{items.map((item) => (
				<Link
					key={item.id}
					href={`/lab?c=${item.slug}`}
					scroll={false}
					className='group flex aspect-square flex-col justify-between border-r border-b border-border p-4 font-mono text-sm uppercase transition-colors duration-100 ease-out-strong active:bg-foreground/5'
				>
					<span className='flex items-center gap-2'>
						<span>{item.id}</span>
						<span
							className='size-2 rounded-full bg-accent opacity-0 transition-[opacity,translate] duration-150 ease-out-strong group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 motion-safe:group-focus-visible:translate-x-0 group-hover:duration-200 group-focus-visible:duration-200'
							aria-hidden='true'
						/>
					</span>
					<span className='text-muted'>{item.title}</span>
				</Link>
			))}
		</div>
	)
}
