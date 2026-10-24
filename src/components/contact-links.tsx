import { contactLinks } from '@/content/contact'
import { CopyEmail } from './copy-email'

export function ContactLinks() {
	return (
		<ul className='flex gap-x-4'>
			{contactLinks.map(({ label, href }) => (
				<li key={label}>
					<a
						href={href}
						target='_blank'
						rel='noopener noreferrer'
						className='touch-target link'
					>
						{label}
					</a>
				</li>
			))}
			{/* Last: the button is as wide as "Copied", and that extra room
			    only shows as a gap when something follows it. */}
			<li>
				<CopyEmail />
			</li>
		</ul>
	)
}
