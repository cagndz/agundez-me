'use client'

import { useState } from 'react'
import { Figure } from '../figure'

type Layer = 'shared' | 'own'

const STEPS = [
	{
		name: 'Style',
		detail: 'A new inline transform arrives',
		runs: { shared: true, own: true },
	},
	{
		name: 'Layout',
		detail: 'A transform never changes layout',
		runs: { shared: false, own: false },
	},
	{
		name: 'Paint · raster',
		detail: 'Draw the layer again, in pixels',
		runs: { shared: true, own: false },
	},
	{
		name: 'Composite',
		detail: 'Place the layers on screen',
		runs: { shared: true, own: true },
	},
] as const

const LAYERS = {
	shared: {
		label: 'Shared layer',
		summary:
			'The card is drawn into the page’s layer. Every frame it moves, that layer is painted and rastered again.',
	},
	own: {
		label: 'Own layer',
		summary:
			'The card is a layer of its own. The compositor moves it and nothing is painted again.',
	},
} satisfies Record<Layer, { label: string; summary: string }>

export function PipelineDiagram() {
	const [layer, setLayer] = useState<Layer>('shared')

	return (
		<Figure caption='What one frame costs when JavaScript moves a card with transform.'>
			<div className='p-3 sm:p-4'>
				<div
					role='group'
					aria-label='Where the card is drawn'
					className='inline-grid grid-cols-2 gap-0.5 rounded-xs border border-border p-0.5'
				>
					{(Object.keys(LAYERS) as Layer[]).map((value) => (
						<button
							key={value}
							type='button'
							aria-pressed={layer === value}
							onClick={() => setLayer(value)}
							className='rounded-[3px] px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors duration-150 ease-out-quart not-aria-pressed:text-muted not-aria-pressed:hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background'
						>
							{LAYERS[value].label}
						</button>
					))}
				</div>

				<ol className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
					{STEPS.map((step, index) => {
						const runs = step.runs[layer]
						return (
							<li
								key={step.name}
								data-runs={runs}
								className='group flex flex-col gap-3 rounded-xs border p-3 transition-[border-color,background-color,opacity] duration-200 ease-out-quart data-[runs=false]:border-dashed data-[runs=false]:border-border data-[runs=false]:opacity-55 data-[runs=true]:border-foreground/25 data-[runs=true]:bg-background'
							>
								<div className='flex items-center justify-between font-mono text-[11px] tracking-widest uppercase'>
									<span className='text-muted'>0{index + 1}</span>
									<span className='flex items-center gap-1.5'>
										<span
											aria-hidden='true'
											className='size-1.5 rounded-full transition-colors duration-200 group-data-[runs=false]:bg-foreground/20 group-data-[runs=true]:bg-accent'
										/>
										{runs ? 'Runs' : 'Skipped'}
									</span>
								</div>
								<div>
									<p className='font-medium'>{step.name}</p>
									<p className='mt-1 text-xs leading-5 text-muted'>
										{step.detail}
									</p>
								</div>
							</li>
						)
					})}
				</ol>

				<p aria-live='polite' className='mt-4 text-sm leading-6'>
					{LAYERS[layer].summary}
				</p>
			</div>
		</Figure>
	)
}
