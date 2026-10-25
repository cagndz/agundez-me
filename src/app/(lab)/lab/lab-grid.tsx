import type { LabItem } from '@/lab/items'
import Link from 'next/link'
import { demos } from '@/lab/registry'
import { DemoFit } from '@/lab/demo-fit'
import { DemoFitScript } from '@/lab/demo-fit-script'

// Cells are square by default and grow taller when their demo needs it, so a
// demo is never scaled to fit (except on phones, where a column can be
// narrower than a demo; DemoFit handles that).
//
// The grid sets the width: columns are at least 400px, so demos are designed
// at most 368px wide (400 minus px-4 on both sides). Height is free: a cell is
// its demo's height plus py-12, which leaves room for the label above and
// keeps the demo centred.
//
// place-self-stretch: a grid item with an aspect ratio doesn't stretch by
// default. Without it, a square cell next to a taller one would end short, and
// a taller cell would grow wider than its column to stay square.
export function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<>
			<div className='grid grid-cols-[repeat(auto-fill,minmax(min(400px,100%),1fr))] border-t border-l border-border'>
				{items.map((item) => {
					const Demo = demos[item.slug]
					return (
						<div
							key={item.id}
							data-lab-item
							className='group relative grid aspect-square place-items-center place-self-stretch border-r border-b border-border px-4 py-12 font-mono text-sm uppercase'
						>
							<Link
								href={`/lab?c=${item.slug}`}
								data-lab-cell={item.slug}
								scroll={false}
								aria-label={`Open ${item.title}`}
								className='absolute inset-0'
							/>
							<span className='absolute top-4 left-4 flex items-center gap-2'>
								<span
									className='size-2 rounded-full bg-accent opacity-0 transition-[opacity,translate] duration-150 ease-out-strong group-hover:opacity-100 group-hover:duration-200 group-has-[a:focus-visible]:opacity-100 group-has-[a:focus-visible]:duration-200 motion-safe:-translate-x-2 motion-safe:group-hover:translate-x-0 motion-safe:group-has-[a:focus-visible]:translate-x-0'
									aria-hidden='true'
								/>
								<span>{item.id}</span>
								<span aria-hidden='true'>/</span>
								<span className='text-muted'>{item.title}</span>
							</span>
							{/* relative: paints above the cell's link, which is positioned too.
							    w-full min-w-0: the column's width, never the demo's, so on
							    phones DemoFit sees how much room there really is */}
							{Demo && (
								<DemoFit className='pointer-events-none relative w-full min-w-0 *:pointer-events-auto'>
									<Demo />
								</DemoFit>
							)}
						</div>
					)
				})}
			</div>
			{/* Right after the grid: every DemoFit above is already in the HTML */}
			<DemoFitScript />
		</>
	)
}
