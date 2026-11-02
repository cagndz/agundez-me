import { Plus_Jakarta_Sans } from 'next/font/google'
import { Home } from '@/components/home/home'
import { getAllPosts } from '@/lib/writing'

// The homepage sets its own sans; the writing pages and the lab keep Geist.
// The mono (Geist Mono) still comes from the root layout.
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

// The homepage sits outside (site): it's full-bleed, not the centred column
// the writing pages use.
export default async function HomePage() {
	const posts = await getAllPosts()
	return (
		<div className={jakarta.className}>
			<Home posts={posts} />
		</div>
	)
}
