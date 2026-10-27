import { LENS_RADIUS, SIZE } from './constants'

export function Inspect() {
	const centerX = SIZE.width / 2
	const centerY = SIZE.height / 2
	return (
		<div
			className='relative flex flex-col gap-4 rounded-2xl bg-white p-4 font-sans normal-case inset-ring inset-ring-foreground/10'
			style={{ width: SIZE.width, height: SIZE.height }}
		>
			<div className='flex flex-col gap-2'>
				<span className='text-[13px]/[18px] font-medium text-foreground'>
					Email
				</span>
				<div className='flex h-11 items-center rounded-lg bg-[#f6f6f4] pl-3 text-sm/5 font-normal text-muted inset-ring inset-ring-foreground/14'>
					you@inspect.com
				</div>
				<span className='text-xs/4 font-normal text-muted'>
					One email a month. Unsubscribe anytime.
				</span>
			</div>
			<div className='flex h-11 items-center justify-center rounded-lg bg-foreground text-sm/5 font-medium text-[#f4f4f2]'>
				Subscribe
			</div>
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 rounded-[inherit] bg-[#1a1a18] bg-[radial-gradient(circle,rgba(236,236,234,0.08)_0.8px,transparent_1.2px)] bg-size-[8px_8px] bg-position-[4px_4px]'
				style={{
					clipPath: `circle(${LENS_RADIUS}px at ${centerX}px ${centerY}px)`,
				}}
			></div>
		</div>
	)
}
