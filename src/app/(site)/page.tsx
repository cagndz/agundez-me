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
				Interested in design, interaction and the small details that make an
				interface feel right.
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
