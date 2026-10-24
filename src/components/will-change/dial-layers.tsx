import Image from 'next/image'
import { Figure } from '../figure'

const SHOTS = [
	{
		label: 'will-change on the wheel',
		src: '/media/will-change-measured/dial-layers-wheel.png',
		alt: 'The dial with layer borders on. The whole wheel is one large rotated layer.',
	},
	{
		label: 'will-change on every tick',
		src: '/media/will-change-measured/dial-layers-ticks.png',
		alt: 'The dial with layer borders on. Each of the ticks is outlined as a layer of its own.',
	},
]

export function DialLayers() {
	return (
		<Figure caption='Layer borders in Chromium. One layer for the wheel, or one for each of the 101 ticks.'>
			<div className='divide-y divide-border'>
				{SHOTS.map((shot) => (
					<div key={shot.src}>
						<p className='border-b border-border px-3 py-2 font-mono text-[11px] tracking-widest text-muted uppercase'>
							{shot.label}
						</p>
						<Image
							src={shot.src}
							alt={shot.alt}
							width={756}
							height={223}
							className='block h-auto w-full'
						/>
					</div>
				))}
			</div>
		</Figure>
	)
}
