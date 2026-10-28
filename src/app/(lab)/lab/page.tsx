import Link from 'next/link'
import { LabGrid } from './lab-grid'
import { LabModal } from './lab-modal'
import { items } from '@/lab/items'
import { stageSize } from '@/lab/card'

export default async function LabPage({ searchParams }: PageProps<'/lab'>) {
	const { c } = await searchParams
	const selected = items.find((item) => item.slug === c)

	return (
		<div className='lab-scope'>
			<header className='max-w-md'>
				<Link
					href='/'
					className='font-mono text-xs text-muted hover:text-foreground'
				>
					agundez.me
				</Link>
				<h1 className='mt-7 font-mono text-xs tracking-widest uppercase'>
					Lab
				</h1>
				<p className='mt-2 text-2xl tracking-tight text-balance'>
					A small studio for playing with interface ideas.
				</p>
			</header>
			<div className='mt-11'>
				<LabGrid items={items} />
			</div>
			<LabModal item={selected} stageSize={stageSize(items)} />
		</div>
	)
}
