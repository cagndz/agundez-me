import { projects } from '@/content/projects'
import { contactLinks, EMAIL } from '@/content/contact'
import type { PostMeta } from '@/lib/writing'
import type { Shape } from './print'

// What the homepage lists, row by row. Each row names the object printed
// in the ink block while it's hovered.

export type Row = {
	id: string
	name: string
	// Right column: a kind, a date, "copy" or an arrow
	meta: string
	href?: string
	// The email row copies the address instead of linking
	copy?: boolean
	shape: Shape
}

export type Section = { id: string; label: string; rows: Row[] }

export type Post = { slug: string; meta: PostMeta }

// Projects get their kind under the name in the block; the rest don't.
export const PROJECT_IDS = new Set(['lab', 'menubar', 'silex'])

const PROJECT_ROWS: Record<
	string,
	Pick<Row, 'id' | 'name' | 'meta' | 'shape'>
> = {
	Lab: { id: 'lab', name: 'lab', meta: 'experiments', shape: 'mat' },
	'Menubar Player': {
		id: 'menubar',
		name: 'menubar player',
		meta: 'macos app',
		shape: 'cassette',
	},
	Silex: { id: 'silex', name: 'silex', meta: 'theme', shape: 'swatches' },
}

// One object per post. A post without one gets a stack of pages.
const POST_SHAPES: Record<string, Shape> = {
	'when-will-change-helps': 'layers',
	'base-ui-dialog-mounts-open': 'openbox',
}

const SOCIAL_SHAPES: Record<string, Shape> = {
	X: 'x',
	GitHub: 'github',
	LinkedIn: 'linkedin',
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
				shape: POST_SHAPES[slug] ?? 'layers',
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
					shape: 'envelope',
				},
				...contactLinks.map(({ label, href }) => ({
					id: label.toLowerCase(),
					name: label.toLowerCase(),
					meta: '↗',
					href,
					shape: SOCIAL_SHAPES[label] ?? 'envelope',
				})),
			],
		},
	]
}
