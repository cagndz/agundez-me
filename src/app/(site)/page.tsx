import { PostList } from '@/components/post-list'
import { getAllPosts } from '@/lib/writing'
import { RevealOnce } from '@/components/reveal-once'
import { ProjectList } from '@/components/project-list'
export default async function Home() {
	const posts = await getAllPosts()

	return (
		<RevealOnce>
			<h1 className='font-medium tracking-tight'>Carlos Agúndez</h1>
			<p className='text-muted'>Design engineer</p>
			<p className='mt-8'>
				Interested in design, interaction and the small details that make an
				interface feel right.{' '}
				<a
					href='mailto:carlos@agundez.me'
					className='underline decoration-border underline-offset-4 transition-colors duration-150 ease-out-strong hover:decoration-accent'
				>
					Get in touch
				</a>
				.
			</p>
			<div className='mt-16'>
				<ProjectList />
			</div>
			<div className='mt-16'>
				<PostList posts={posts} />
			</div>
		</RevealOnce>
	)
}
