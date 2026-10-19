import { LabGrid } from './lab-grid'
import { LabModal } from './lab-modal'
import { items } from '@/lab/items'

export default async function LabPage({ searchParams }: PageProps<'/lab'>) {
	const { c } = await searchParams
	const selected = items.find((item) => item.slug === c)

	return (
		<div className='lab-scope'>
			<h1 className='font-mono text-sm tracking-widest uppercase'>Lab / 000</h1>
			<p className='mt-2 font-mono text-xs tracking-widest text-muted uppercase'>
				Components, states, motion
			</p>
			<div className='mt-8 flex items-center gap-2 border-t border-border pt-4'>
				<span className='signal-dot block size-2 rounded-full bg-accent' />
				<span className='font-mono text-xs tracking-widest uppercase'>
					Signal
				</span>
			</div>
			<div className='mt-8'>
				<LabGrid items={items} />
			</div>
			<LabModal item={selected} />
		</div>
	)
}
