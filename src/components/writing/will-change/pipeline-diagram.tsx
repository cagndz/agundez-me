'use client'

import { Fragment, useState } from 'react'
import { Figure } from '@/components/writing/figure'

type Layer = 'shared' | 'own'

// Which steps one frame runs when JavaScript moves a card with transform.
const STEPS = [
	{ name: 'Style', runs: { shared: true, own: true } },
	{ name: 'Layout', runs: { shared: false, own: false } },
	{ name: 'Paint', runs: { shared: true, own: false } },
	{ name: 'Composite', runs: { shared: true, own: true } },
] as const

const LAYERS: Record<Layer, string> = {
	shared: 'Shared layer',
	own: 'Own layer',
}

export function PipelineDiagram() {
	const [layer, setLayer] = useState<Layer>('shared')
	const skipped = STEPS.filter((step) => !step.runs[layer]).map(
		(step) => step.name,
	)

	return (
		<Figure caption='One frame of a transform set from JavaScript. Grey steps are skipped.'>
			<div className='flex flex-col items-center gap-8 px-4 py-7'>
				<div
					role='group'
					aria-label='Where the card is drawn'
					className='flex gap-0.5 rounded-full bg-foreground/5 p-0.5'
				>
					{(Object.keys(LAYERS) as Layer[]).map((value) => (
						<button
							key={value}
							type='button'
							aria-pressed={layer === value}
							onClick={() => setLayer(value)}
							className='rounded-full px-3 py-1 text-[13px] transition-[color,background-color,box-shadow] duration-200 ease-out-quart not-aria-pressed:text-muted not-aria-pressed:hover:text-foreground aria-pressed:bg-background aria-pressed:shadow-[0_1px_2px_rgb(26_25_23/0.08)]'
						>
							{LAYERS[value]}
						</button>
					))}
				</div>

				<p className='flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-2 text-[15px] tracking-tight sm:gap-x-4 sm:text-[17px]'>
					{STEPS.map((step, index) => (
						<Fragment key={step.name}>
							{index > 0 && (
								<span aria-hidden='true' className='text-foreground/20'>
									→
								</span>
							)}
							<span
								className={`transition-colors duration-200 ease-out-quart ${step.runs[layer] ? 'text-foreground' : 'text-foreground/25'}`}
							>
								{step.name}
							</span>
						</Fragment>
					))}
				</p>
				<p aria-live='polite' className='sr-only'>
					Skipped: {skipped.join(' and ')}.
				</p>
			</div>
		</Figure>
	)
}
