import { projects } from '@/content/projects'
import { LinkArrow } from './link-arrow'

export function ProjectList() {
	return (
		<section aria-labelledby='projects-heading'>
			<h2 id='projects-heading' className='mb-3 text-muted'>
				Projects
			</h2>
			<ul className='divide-y divide-border border-t border-border'>
				{projects.map(({ name, description, href }) => (
					<li key={name}>
						<a
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							className='group/link flex items-start justify-between gap-4 py-3'
						>
							<span>
								<span className='block'>{name}</span>
								<span className='block text-muted'>{description}</span>
								<span className='sr-only'>(opens in a new tab)</span>
							</span>
							<LinkArrow external />
						</a>
					</li>
				))}
			</ul>
		</section>
	)
}
