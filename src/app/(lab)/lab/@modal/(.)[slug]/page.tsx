export default async function ModalPage({ params }: PageProps<'/lab/[slug]'>) {
	const { slug } = await params

	return (
		<div className='fixed bottom-4 right-4 border border-border bg-background font-mono text-sm'>
			{slug}
		</div>
	)
}
