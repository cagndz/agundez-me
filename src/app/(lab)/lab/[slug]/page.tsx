import { items } from '@/lab/items'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function LabItemPage({
	params,
}: PageProps<'/lab/[slug]'>) {
	const { slug } = await params

	const item = items.find((item) => item.slug === slug)
	if (!item) notFound()

	return (
		<>
			<Link href='/lab' className='font-mono uppercase text-sm text-muted'>
				Back
			</Link>
			<h1>{item.id}</h1>
			<span>{item.title}</span>
		</>
	)
}
