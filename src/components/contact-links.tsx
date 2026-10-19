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
						className='link'
					>
						{label}
					</a>
				</li>
			))}
		</ul>
	)
}
