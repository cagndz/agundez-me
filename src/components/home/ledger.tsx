import Link from 'next/link'
import { homeProjects, type Post } from './data'

// The list, set as a ledger: each row says what it is on the left and
// gives a detail on the right, with a row of leaders between, the way
// Syro's sleeve itemises its costs.

export const LABEL = 'text-[11px] tracking-[0.08em] uppercase'

const DOTS = '.'.repeat(240)

// A row of the ledger. `order` places it in the entrance (home.css).
// A label too long for a narrow screen would wrap and leave a hole before
// its leaders, so with `stack` it takes a line of its own there, and the
// leaders run on the next one out to the figure.
export function Row({
	href,
	label,
	figure,
	order = 0,
	stack = false,
	...rest
}: {
	href: string
	label: React.ReactNode
	figure: React.ReactNode
	order?: number
	stack?: boolean
} & React.HTMLAttributes<HTMLElement>) {
	const external = !href.startsWith('/')
	const props = {
		// One line of the page. The rows touch, so the pointer never falls
		// between two of them.
		className: `home-row flex items-end ${stack ? 'max-sm:flex-wrap' : ''}`,
		style: { '--i': order } as React.CSSProperties,
		...rest,
	}
	const inner = (
		<>
			<span
				className={`home-label min-w-0 ${stack ? 'max-sm:basis-full' : ''}`}
			>
				{label}
			</span>
			{/* The leaders, a space either side so they never run into a
			    letter. Only whole dots: the row of them is as many characters
			    wide as fit (the width rounded down to a whole number of
			    cells), set against the figure. */}
			<span
				aria-hidden='true'
				className={`home-dots relative mx-[1ch] min-w-[2ch] flex-1 self-stretch ${stack ? 'max-sm:ml-0' : ''}`}
			>
				<span className='absolute right-0 bottom-0 w-[round(down,100%,1ch)] overflow-hidden whitespace-nowrap'>
					{DOTS}
				</span>
			</span>
			<span className='home-figure shrink-0'>{figure}</span>
		</>
	)
	if (!external)
		return (
			<Link href={href} {...props}>
				{inner}
			</Link>
		)
	return (
		<a href={href} target='_blank' rel='noreferrer' {...props}>
			{inner}
		</a>
	)
}

function Heading({
	children,
	order = 0,
}: {
	children: React.ReactNode
	order?: number
}) {
	return (
		<h2
			style={{ '--i': order } as React.CSSProperties}
			className={`home-h text-(--ink)/60 ${LABEL}`}
		>
			{children}
		</h2>
	)
}

// "2026-10-14" as "oct 2026"
const month = (date: string) =>
	new Date(date)
		.toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC',
		})
		.toLowerCase()

// Projects and writing. On the right of a project, what kind of thing it
// is; of a post, when it came out. `bind` wires a project's row to its
// demo.
export function Ledger({
	posts,
	bind,
}: {
	posts: Post[]
	bind?: (i: number) => React.HTMLAttributes<HTMLElement>
}) {
	const n = homeProjects.length
	return (
		<div className='home-list flex flex-col gap-8'>
			<section>
				<Heading order={0}>Projects</Heading>
				<ul>
					{homeProjects.map((p, i) => (
						<li key={p.id}>
							<Row
								href={p.href}
								label={p.name.toLowerCase()}
								figure={`[${p.kind}]`}
								order={i + 1}
								{...bind?.(i)}
							/>
						</li>
					))}
				</ul>
			</section>
			<section>
				<Heading order={n + 1}>Writing</Heading>
				<ul>
					{posts.map((p, i) => (
						<li key={p.slug}>
							<Row
								href={`/writing/${p.slug}`}
								label={p.meta.title.toLowerCase()}
								figure={month(p.meta.date)}
								order={n + 2 + i}
								stack
							/>
						</li>
					))}
				</ul>
			</section>
		</div>
	)
}
