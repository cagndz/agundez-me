export function Form() {
	return (
		<div className='flex flex-col gap-4'>
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
		</div>
	)
}
