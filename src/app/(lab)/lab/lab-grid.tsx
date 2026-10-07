import type { LabItem } from '@/lab/items'
import Link from 'next/link'
import { demos } from '@/lab/registry'

export default function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<div className='grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] border-t border-l border-border'>
			{items.map((item) => {
				const Demo = demos[item.slug]
				return (
					<div
						key={item.id}
						className='group relative aspect-square border-r border-b border-border p-4 font-mono text-sm uppercase transition-colors duration-100 ease-out-strong'
					>
						<Link
							href={`/lab?c=${item.slug}`}
							data-lab-cell={item.slug}
							scroll={false}
							aria-label={`Open ${item.title}`}
							className='absolute inset-0'
						/>
						<span className='flex items-center gap-2'>
							<span
								className='size-2 rounded-full bg-accent opacity-0 transition-[opacity,translate] duration-150 ease-out-strong group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 motion-safe:group-has-[a:focus-visible]:translate-x-0 group-hover:duration-200 group-has-[a:focus-visible]:duration-200'
								aria-hidden='true'
							/>
							<span>{item.id}</span>
							<span aria-hidden='true'>/</span>
							<span className='text-muted'>{item.title}</span>
						</span>
						<div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
							<div className='pointer-events-auto'>{Demo && <Demo />}</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
