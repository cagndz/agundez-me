import { projects } from '@/content/projects'
import { contactLinks, EMAIL } from '@/content/contact'
import type { PostMeta } from '@/lib/writing'
import type { Shape } from './print'

// What the homepage lists, row by row. While a row is hovered the ink block
// shows it in two levels: big, what it is; small, the detail. And it prints
// the row's object.

export type Row = {
	id: string
	name: string
	// Right column: a kind, a date, "copy" or an arrow
	meta: string
	href?: string
	// The email row copies the address instead of linking
	copy?: boolean
	// The block's big line, when it isn't the name
	title?: string
	// The block's small line, broken where the sense breaks, never by width
	detail: string[]
	shape: Shape
}

export type Section = { id: string; label: string; rows: Row[] }

export type Post = { slug: string; meta: PostMeta }

// The block's name before any row is hovered
export const HOME = {
	title: 'carlos agúndez',
	detail: ['design engineer based in spain'],
}

const PROJECT_ROWS: Record<
	string,
	Pick<Row, 'id' | 'name' | 'meta' | 'detail' | 'shape'>
> = {
	Lab: {
		id: 'lab',
		name: 'lab',
		meta: 'experiments',
		detail: ['interactive ui components', 'and experiments'],
		shape: 'tubes',
	},
	'Menubar Player': {
		id: 'menubar',
		name: 'menubar player',
		meta: 'macos app',
		detail: ['an audio player for youtube', 'that lives in the macos menu bar'],
		shape: 'cassette',
	},
	Silex: {
		id: 'silex',
		name: 'silex',
		meta: 'theme',
		detail: [
			'a quiet dark theme.',
			'color where it counts, gray everywhere else',
		],
		shape: 'laptop',
	},
}

// Per post: its object, and the block's lines. In the big line, product
// names stay whole: a no-break space inside "base ui", a word joiner after
// the hyphen in "will-change".
const POSTS: Record<string, Pick<Row, 'title' | 'detail' | 'shape'>> = {
	'when-will-change-helps': {
		title: "when will-\u2060change helps, and when it doesn't",
		detail: [
			'where will-change removed the repaint,',
			'and where it did nothing',
		],
		shape: 'layers',
	},
	'base-ui-dialog-mounts-open': {
		title: 'animating a base\u00a0ui dialog that mounts open',
		detail: [
			'a dialog that mounts open skips its enter animation.',
			'why, and the fix',
		],
		shape: 'openbox',
	},
}

const SOCIAL: Record<string, Pick<Row, 'detail' | 'shape'>> = {
	X: { detail: ['@cagndz'], shape: 'x' },
	GitHub: { detail: ['@cagndz'], shape: 'github' },
	LinkedIn: { detail: ['carlos agúndez torres'], shape: 'linkedin' },
}

export function sections(posts: Post[]): Section[] {
	return [
		{
			id: 'projects',
			label: 'projects',
			rows: projects.flatMap(({ name, href }) => {
				const row = PROJECT_ROWS[name]
				return row ? [{ ...row, href }] : []
			}),
		},
		{
			id: 'writing',
			label: 'writing',
			rows: posts.map(({ slug, meta }) => ({
				id: slug,
				name: meta.title.toLowerCase(),
				// ISO date: "2026-10-24" → "2026.10"
				meta: meta.date.slice(0, 7).replace('-', '.'),
				href: `/writing/${slug}`,
				// A post without its own lines shows its title and nothing under
				// it, and gets a stack of pages
				...(POSTS[slug] ?? { detail: [], shape: 'layers' as Shape }),
			})),
		},
		{
			id: 'contact',
			label: 'contact',
			rows: [
				{
					id: 'email',
					name: EMAIL,
					meta: 'copy',
					copy: true,
					title: 'email',
					detail: [EMAIL],
					shape: 'envelope',
				},
				...contactLinks.map(({ label, href }) => ({
					id: label.toLowerCase(),
					name: label.toLowerCase(),
					meta: '↗',
					href,
					...(SOCIAL[label] ?? { detail: [], shape: 'envelope' as Shape }),
				})),
			],
		},
	]
}
