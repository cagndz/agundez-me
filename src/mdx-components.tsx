import type { MDXComponents } from 'mdx/types'
import { ModalDemo } from '@/components/modal-demo'
import { slugify, textOf } from '@/lib/slugify'

const components: MDXComponents = {
	ModalDemo,
	h2: ({ children, ...props }) => (
		<h2
			id={slugify(textOf(children))}
			className='mt-12 mb-3 scroll-mt-24 font-medium tracking-tight'
			{...props}
		>
			{children}
		</h2>
	),
	p: (props) => <p className='mt-5 leading-7' {...props} />,
	a: ({ href, ...props }) => {
		const external = href?.startsWith('http')
		return (
			<a
				href={href}
				{...(external && { target: '_blank', rel: 'noopener noreferrer' })}
				className='link'
				{...props}
			/>
		)
	},
	ul: (props) => (
		<ul
			className='mt-5 list-disc space-y-2 pl-5 leading-7 marker:text-muted'
			{...props}
		/>
	),
	code: (props) => (
		<code
			className='rounded bg-border/60 px-1.5 py-0.5 font-mono text-[0.9em] in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-[1em]'
			{...props}
		/>
	),
	pre: (props) => (
		<pre
			className='mt-5 scrollbar-thin overflow-x-auto overscroll-x-contain rounded-xs p-4 font-mono text-sm leading-6'
			{...props}
		/>
	),
}

export function useMDXComponents(): MDXComponents {
	return components
}
