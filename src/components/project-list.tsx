import Link from 'next/link'
import { projects } from '@/content/projects'
import { LinkArrow } from './link-arrow'

export function ProjectList() {
	return (
		<section aria-labelledby='projects-heading'>
			<h2 id='projects-heading' className='mb-3 text-muted'>
				Projects
			</h2>
			<ul className='divide-y divide-border border-t border-border'>
				{projects.map(({ name, description, href }) => {
					// A path stays on the site, so it behaves like the writing list:
					// same tab, no warning, a → arrow. Anything else leaves it.
					const isInternal = href.startsWith('/')
					const className =
						'group/link flex items-start justify-between gap-4 py-3'
					const content = (
						<>
							<span>
								<span className='block'>{name}</span>
								<span className='block text-muted'>{description}</span>
								{!isInternal && (
									<span className='sr-only'>(opens in a new tab)</span>
								)}
							</span>
							<LinkArrow external={!isInternal} />
						</>
					)

					return (
						<li key={name}>
							{isInternal ? (
								<Link href={href} className={className}>
									{content}
								</Link>
							) : (
								<a
									href={href}
									target='_blank'
									rel='noopener noreferrer'
									className={className}
								>
									{content}
								</a>
							)}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
