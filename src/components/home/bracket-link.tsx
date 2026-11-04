// Brackets for a link under the pointer or focus, as the list sets
// "[macos app]". They wait folded against the word, unseen, and open out
// to embrace it as they appear; on the way out they fold back in, quicker.
// They sit outside the word, so the line never moves. Only transform and
// opacity change, so it stays on the compositor.
//
// The parent must be a `group`.

const BASE =
	'pointer-events-none absolute top-0 opacity-0 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.4,0,1,1)] group-hover:opacity-100 group-hover:duration-200 group-hover:ease-[cubic-bezier(0.23,1,0.32,1)] group-focus-visible:opacity-100 motion-reduce:transition-none'

export function Brackets() {
	return (
		<>
			<span
				aria-hidden='true'
				className={`${BASE} right-full translate-x-[0.7ch] pr-[0.3ch] group-hover:translate-x-0 group-focus-visible:translate-x-0`}
			>
				[
			</span>
			<span
				aria-hidden='true'
				className={`${BASE} left-full -translate-x-[0.7ch] pl-[0.3ch] group-hover:translate-x-0 group-focus-visible:translate-x-0`}
			>
				]
			</span>
		</>
	)
}

export function BracketLink({
	href,
	children,
}: {
	href: string
	children: React.ReactNode
}) {
	const external = href.startsWith('http')
	return (
		<a
			href={href}
			target={external ? '_blank' : undefined}
			rel={external ? 'noreferrer' : undefined}
			className='group relative inline-block outline-none'
		>
			{children}
			<Brackets />
		</a>
	)
}
