import Link from 'next/link'
import type { Metadata } from 'next'
import { LabGrid } from './lab-grid'
import { LabModal } from './lab-modal'
import { items } from '@/lab/items'
import { stageSize } from '@/lab/card'
import { ArrowLeft } from '@/components/icons/arrow-left'

export const metadata: Metadata = {
	title: { absolute: 'Lab' },
	description: 'Interactive UI components and experiments by Carlos Agúndez',
}

export default async function LabPage({ searchParams }: PageProps<'/lab'>) {
	const { c } = await searchParams
	const selected = items.find((item) => item.slug === c)

	return (
		<div className='lab-scope group/scope'>
			<header className='max-w-md'>
				<Link
					href='/'
					className='group touch-target inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors duration-150 ease-out-strong hover:text-foreground'
				>
					<ArrowLeft className='size-3 transition-transform duration-150 ease-out-strong motion-safe:group-hover:-translate-x-0.5' />
					agundez.me
				</Link>
				<h1 className='mt-7 flex items-center gap-2 font-mono text-xs tracking-widest uppercase'>
					<span
						aria-hidden='true'
						className='signal-flicker size-2 rounded-full bg-accent transition-opacity duration-150 ease-out-strong group-has-[[data-lab-cell]:focus-visible]/scope:opacity-30 group-has-[[data-lab-item]:hover]/scope:opacity-30'
					/>
					Lab
				</h1>
				<p className='mt-2 text-3xl tracking-tight text-balance'>
					A small studio for playing with interface ideas
				</p>
			</header>
			<div className='mt-11'>
				<LabGrid items={items} />
			</div>
			<LabModal item={selected} stageSize={stageSize(items)} />
		</div>
	)
}
