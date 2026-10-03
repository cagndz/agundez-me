import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ComponentType } from 'react'
import { slugify } from './slugify'

export type PostMeta = { title: string; date: string; summary: string }

const dir = path.join(process.cwd(), 'src/content/writing')

export async function getSlugs() {
	const files = await readdir(dir)
	return files
		.filter((file) => file.endsWith('.mdx'))
		.map((file) => file.replace(/\.mdx$/, ''))
}

export async function getPost(slug: string) {
	return (await import(`@/content/writing/${slug}.mdx`)) as {
		default: ComponentType
		meta: PostMeta
	}
}

// Newest first. ISO dates (YYYY-MM-DD) sort correctly as plain strings.
export async function getAllPosts() {
	const slugs = await getSlugs()
	const posts = await Promise.all(
		slugs.map(async (slug) => ({ slug, meta: (await getPost(slug)).meta })),
	)
	return posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date))
}

// timeZone UTC: otherwise "2026-09-29" can render as the 28th on the server.
export function formatDate(date: string) {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	})
}

export type Heading = { id: string; text: string }

// Reads the `## ` lines of the post source, skipping fenced code blocks.
export async function getHeadings(slug: string): Promise<Heading[]> {
	const source = await readFile(path.join(dir, `${slug}.mdx`), 'utf8')
	const headings: Heading[] = []
	let inFence = false
	for (const line of source.split('\n')) {
		if (line.trimStart().startsWith('```')) inFence = !inFence
		if (inFence) continue
		const match = /^## (.+)$/.exec(line)
		if (match) {
			// Plain text, as the rendered heading would give it: no code ticks,
			// emphasis marks or link syntax.
			const text = match[1]
				.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
				.replace(/[`*_]/g, '')
				.trim()
			headings.push({ id: slugify(text), text })
		}
	}
	return headings
}
