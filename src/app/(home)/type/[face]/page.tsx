import type { Metadata } from 'next'
import Link from 'next/link'
import { Home } from '@/components/home/home'
import type { Face } from '@/components/home/faces/face'
import { geist } from '@/components/home/faces/geist'
import { jakarta } from '@/components/home/faces/jakarta'
import { spaceGrotesk } from '@/components/home/faces/space-grotesk'
import { getAllPosts } from '@/lib/writing'

// The homepage set in each candidate face, to compare them side by side in
// tabs. Temporary: it goes once the face is picked.

const FACES: Record<string, Face> = {
	geist,
	jakarta,
	'space-grotesk': spaceGrotesk,
}

export const dynamicParams = false

export function generateStaticParams() {
	return Object.keys(FACES).map((face) => ({ face }))
}

export const metadata: Metadata = {
	robots: { index: false, follow: false },
}

export default async function TypePage({ params }: PageProps<'/type/[face]'>) {
	const { face } = await params
	const posts = await getAllPosts()
	return (
		<>
			<Home posts={posts} face={FACES[face]} />
			<nav className='fixed right-4 bottom-4 z-10 flex gap-1 rounded-full bg-black/80 p-1 font-mono text-xs text-white backdrop-blur'>
				{Object.entries(FACES).map(([slug, f]) => (
					<Link
						key={slug}
						href={`/type/${slug}`}
						aria-current={slug === face ? 'page' : undefined}
						className='rounded-full px-3 py-1.5 aria-[current=page]:bg-white aria-[current=page]:text-black'
					>
						{f.label}
					</Link>
				))}
			</nav>
		</>
	)
}
