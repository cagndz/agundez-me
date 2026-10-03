import type { ReactNode } from 'react'

// Builds the id of each <h2> (mdx-components) and the links of the table of
// contents, so both always match. No Node imports: it is also used on the client.
export function slugify(text: string) {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

// Plain text of a heading, even when it contains `code`, bold or links.
export function textOf(node: ReactNode): string {
	if (typeof node === 'string' || typeof node === 'number') return String(node)
	if (Array.isArray(node)) return node.map(textOf).join('')
	if (node && typeof node === 'object' && 'props' in node) {
		return textOf((node.props as { children?: ReactNode }).children)
	}
	return ''
}
