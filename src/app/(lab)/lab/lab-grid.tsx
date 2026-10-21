import type { LabItem } from '@/lab/items'
import Link from 'next/link'
import { demos } from '@/lab/registry'
import { DemoFit } from '@/lab/demo-fit'

// Below 800px (two 400px columns) the grid has a single column. Only there a
// tall item gets a 1:2 cell. The grid is the container, so this follows the
// grid's width, not the window's.
const TALL_ON_ONE_COLUMN = '@max-[800px]:aspect-[1/2]'

export function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<div className='@container grid grid-cols-[repeat(auto-fill,minmax(min(400px,100%),1fr))] border-t border-l border-border'>
			{items.map((item) => {
				const Demo = demos[item.slug]
				return (
					<div
						key={item.id}
						data-lab-item
						className={`group relative aspect-square border-r border-b border-border p-4 font-mono text-sm uppercase ${item.size === 'tall' ? TALL_ON_ONE_COLUMN : ''}`}
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
								className='size-2 rounded-full bg-accent opacity-0 transition-[opacity,translate] duration-150 ease-out-strong group-hover:opacity-100 group-hover:duration-200 group-has-[a:focus-visible]:opacity-100 group-has-[a:focus-visible]:duration-200 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 motion-safe:group-has-[a:focus-visible]:translate-x-0'
								aria-hidden='true'
							/>
							<span>{item.id}</span>
							<span aria-hidden='true'>/</span>
							<span className='text-muted'>{item.title}</span>
						</span>
						{/* inset-y-12 keeps the demo clear of the label, and equal top and
						    bottom so it stays centred in the cell */}
						{Demo && (
							<DemoFit className='pointer-events-none absolute inset-x-4 inset-y-12 *:pointer-events-auto'>
								<Demo />
							</DemoFit>
						)}
					</div>
				)
			})}
		</div>
	)
}
