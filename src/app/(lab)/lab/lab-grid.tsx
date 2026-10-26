import type { CSSProperties } from 'react'
import type { LabItem } from '@/lab/items'
import Link from 'next/link'
import { demos } from '@/lab/registry'
import { DemoFit } from '@/lab/demo-fit'
import { DemoFitScript } from '@/lab/demo-fit-script'
import { cardHeight } from '@/lab/card'

// Loose cards in a masonry: each card is as tall as its demo needs and doesn't
// change the height of its neighbours. Demos keep their natural size (except on
// phones, where a column can be narrower than a demo; DemoFit handles that).
//
// The masonry is plain CSS, so the server sends it already laid out: the grid
// has 1px rows (.lab-board in lab.css) and each card spans as many rows as it
// is tall (card.ts), plus the gap below it. Auto-placement then drops every card into
// the column that ends first, which is what a masonry does.

// Must match --gap on .lab-page (lab.css)
const GAP = 12

export function LabGrid({ items }: { items: LabItem[] }) {
	return (
		<>
			<div className='lab-board'>
				{items.map((item) => {
					const Demo = demos[item.slug]
					const height = cardHeight(item)
					const style: CSSProperties = {
						height,
						gridRowEnd: `span ${height + GAP}`,
					}
					return (
						<div
							key={item.id}
							data-lab-item
							style={style}
							className='group relative grid place-items-center rounded-sm bg-(--surface) px-4 font-mono text-sm uppercase ring-1 ring-foreground/10'
						>
							<Link
								href={`/lab?c=${item.slug}`}
								data-lab-cell={item.slug}
								scroll={false}
								aria-label={`Open ${item.title}`}
								className='absolute inset-0 rounded-sm'
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
							{/* relative: paints above the card's link, which is positioned too.
								    w-full min-w-0: the column's width, never the demo's, so on
								    phones DemoFit sees how much room there really is */}
							{Demo && (
								<DemoFit
									expectedSize={item.size}
									className='pointer-events-none relative w-full min-w-0 *:pointer-events-auto'
								>
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
