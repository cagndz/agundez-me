import { PostList } from '@/components/post-list'
import { getAllPosts } from '@/lib/writing'
import { RevealOnce } from '@/components/reveal-once'
import { ProjectList } from '@/components/project-list'
import { ContactLinks } from '@/components/contact-links'

export default async function Home() {
	const posts = await getAllPosts()

	return (
		<RevealOnce>
			<h1 className='font-medium tracking-tight'>Carlos Agúndez</h1>
			<p className='text-muted'>Design engineer</p>
			<p className='mt-8'>
				Based in Spain, I work between design and code. I prefer testing
				concepts and ideas through quick prototypes, then going deeper on the
				ones that hook me, with care for every detail.
			</p>
			<div className='mt-6'>
				<ContactLinks />
			</div>
			<div className='mt-16'>
				<ProjectList />
			</div>
			<div className='mt-16'>
				<PostList posts={posts} />
			</div>
		</RevealOnce>
	)
}
