import { Home } from '@/components/home/home'
import { jakarta } from '@/components/home/faces/jakarta'
import { getAllPosts } from '@/lib/writing'

// The homepage sits outside (site): it's full-bleed, not the centred column
// the writing pages use.
export default async function HomePage() {
	const posts = await getAllPosts()
	return <Home posts={posts} face={jakarta} />
}
