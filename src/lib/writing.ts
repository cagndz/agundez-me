import { readdir } from 'node:fs/promises'
import path from 'node:path'
import type { ComponentType } from 'react'

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

// "Sep 29": the year lives in the group heading of the list.
export function formatShortDate(date: string) {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	})
}
