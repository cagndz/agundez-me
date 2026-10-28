import Link from 'next/link'
import { LabGrid } from './lab-grid'
import { LabModal } from './lab-modal'
import { items } from '@/lab/items'
import { stageSize } from '@/lab/card'
import { ArrowLeft } from '@/components/icons/arrow-left'

export default async function LabPage({ searchParams }: PageProps<'/lab'>) {
	const { c } = await searchParams
	const selected = items.find((item) => item.slug === c)

	return (
		<div className='lab-scope'>
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
						className='signal-flicker size-2 rounded-full bg-accent'
					/>
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
