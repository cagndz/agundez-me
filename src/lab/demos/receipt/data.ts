export type Product = {
	id: string
	name: string
	spec: string
	price: number
}

export const PRODUCTS: Product[] = [
	{ id: 'ear', name: 'Ear buds', spec: 'ANC · 38h case', price: 149 },
	{ id: 'phn', name: 'Phone', spec: '256 GB · Graphite', price: 699 },
	{ id: 'wch', name: 'Watch', spec: '42 mm · Steel', price: 229 },
	{ id: 'spk', name: 'Speaker', spec: '60 W · Stereo', price: 289 },
]

export type Order = {
	number: string
	date: string
	time: string
	product: Product
	subtotal: number
	vat: number
	total: number
}

const VAT_RATE = 0.21

export function makeOrder(product: Product): Order {
	const now = new Date()
	const pad = (n: number) => String(n).padStart(2, '0')
	// Price includes VAT, as it would in Spain
	const subtotal = product.price / (1 + VAT_RATE)
	return {
		number: `#${String(now.getTime() % 100000).padStart(5, '0')}`,
		date: `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`,
		time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
		product,
		subtotal,
		vat: product.price - subtotal,
		total: product.price,
	}
}

export const eur = (n: number) => `€${n.toFixed(2)}`
