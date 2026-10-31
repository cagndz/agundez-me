'use client'

import type { ReactNode } from 'react'
import { PAPER_WIDTH } from './constants'
import { eur, type Order } from './data'
import { Print } from './dither'

// The printed receipt itself.

export function Dashed() {
	return (
		<div
			aria-hidden='true'
			className='border-t border-dashed border-foreground/25'
		/>
	)
}

export function ReceiptBody({
	order,
	action,
}: {
	order: Order
	action?: ReactNode
}) {
	const { product } = order

	return (
		<div className='px-6 pt-5 pb-3 text-[11px] leading-none normal-case'>
			<div className='flex items-center justify-between'>
				<span className='font-semibold tabular-nums'>{order.number}</span>
				<span className='text-[13px]'>Order Receipt</span>
			</div>
			<div className='my-3'>
				<Dashed />
			</div>

			<div className='text-[22px] font-bold tracking-tight uppercase'>
				{product.name}
			</div>
			<div className='mt-2 flex justify-between gap-4 text-muted uppercase'>
				<span>{product.spec}</span>
				<span className='whitespace-nowrap tabular-nums'>
					{order.date} {order.time}
				</span>
			</div>

			<Print
				product={product}
				width={PAPER_WIDTH - 48}
				height={120}
				className='mt-4'
			/>

			<dl className='mt-4 grid grid-cols-3 uppercase'>
				<Stat label='Net' value={eur(order.subtotal)} />
				<Stat label='VAT 21%' value={eur(order.vat)} align='center' />
				<Stat label='Shipping' value='Free' align='right' />
			</dl>

			<div className='my-3'>
				<Dashed />
			</div>
			{/* What it all comes to: the line you look for on a receipt */}
			<dl className='flex items-baseline justify-between font-bold uppercase'>
				<dt className='text-[13px]'>Total</dt>
				<dd className='text-[20px] tabular-nums'>{eur(order.total)}</dd>
			</dl>
			<div className='mt-4'>
				<Dashed />
			</div>

			<div className='mt-4 text-center font-semibold uppercase'>
				Paid · Visa 4821
			</div>
			<div className='mt-1.5 text-center font-semibold uppercase'>
				It ships tomorrow.
			</div>
			<div className='mt-2.5 text-center text-[9px] text-foreground/35 uppercase'>
				Printed locally via agundez.me
			</div>
			{action && <div className='mt-3 flex justify-center'>{action}</div>}
		</div>
	)
}

function Stat({
	label,
	value,
	align = 'left',
}: {
	label: string
	value: string
	align?: 'left' | 'center' | 'right'
}) {
	const alignment =
		align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''
	return (
		<div className={alignment}>
			<dt className='text-[10px] text-muted'>{label}</dt>
			<dd className='mt-1.5 text-[13px] font-bold tabular-nums'>{value}</dd>
		</div>
	)
}
