import { contactLinks } from '@/content/contact'
import { CopyEmail } from './copy-email'

export function ContactLinks() {
	return (
		<ul className='flex gap-x-4'>
			<li>
				<CopyEmail />
			</li>
			{contactLinks.map(({ label, href }) => (
				<li key={label}>
					<a
						href={href}
						target='_blank'
						rel='noopener noreferrer'
						className='underline decoration-border underline-offset-4 transition-colors duration-150 ease-out-strong hover:decoration-accent'
					>
						{label}
					</a>
				</li>
			))}
		</ul>
	)
}
