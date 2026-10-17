import { projects } from '@/content/projects'
import { ArrowUpRight } from './icons/arrow-up-right'

export function ProjectList() {
	return (
		<section aria-labelledby='projects-heading'>
			<h2 id='projects-heading' className='mb-3 text-muted'>
				Projects
			</h2>
			<ul className='group/list divide-y divide-border border-t border-border'>
				{projects.map(({ name, description, href }) => (
					<li key={name}>
						<a
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							className='group/link flex py-3 transition-opacity duration-150 ease-out-strong group-hover/list:opacity-40 hover:opacity-100!'
						>
							<div className='flex flex-col gap-1'>
								<span className='flex items-center gap-1.5'>
									{name}
									<ArrowUpRight className='size-3.5 shrink-0 transition-transform duration-150 ease-out-strong motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5' />
									<span className='sr-only'>(opens in a new tab)</span>
								</span>
								<span className='block text-muted'>{description}</span>
							</div>
						</a>
					</li>
				))}
			</ul>
		</section>
	)
}
