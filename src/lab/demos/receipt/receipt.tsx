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

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ')

export function ReceiptBody({
	order,
	action,
}: {
	order: Order
	action?: ReactNode
}) {
	const now = new Date()
	const stamp = `${DAYS[now.getDay()]}–${MONTHS[now.getMonth()]} ${order.time}`
	const { product } = order

	return (
		<div className='px-6 pt-6 pb-7 text-[11px] leading-none normal-case'>
			<div className='flex items-center justify-between'>
				<span className='font-semibold tabular-nums'>{order.number}</span>
				<span className='text-[13px]'>Order Receipt</span>
			</div>
			<div className='my-5'>
				<Dashed />
			</div>

			<div className='text-[22px] font-bold tracking-tight uppercase'>
				{product.name}
			</div>
			<div className='mt-2.5 flex justify-between text-muted uppercase'>
				<span>{product.spec}</span>
				<span>{order.date}</span>
			</div>

			<Print
				scene={product.id}
				width={PAPER_WIDTH - 48}
				height={168}
				className='mt-5'
			/>

			<dl className='mt-5 grid grid-cols-3 gap-y-5 uppercase'>
				<Stat label='Net' value={eur(order.subtotal)} />
				<Stat label='VAT 21%' value={eur(order.vat)} align='center' />
				<Stat label='Shipping' value='Free' align='right' />
				<Stat label='Total' value={eur(order.total)} />
			</dl>

			<div className='mt-6'>
				<Dashed />
			</div>

			<div className='mt-6 flex flex-col items-center gap-1.5 text-center font-semibold uppercase'>
				<span>Paid · Visa 4821</span>
				<span className='tabular-nums'>{stamp}</span>
			</div>
			<div className='mt-4 text-center font-semibold uppercase'>
				It ships tomorrow.
			</div>
			<div className='mt-4 text-center text-[9px] text-foreground/35 uppercase'>
				Printed locally via agundez.me
			</div>
			{action && <div className='mt-5 flex justify-center'>{action}</div>}
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
