import { projects } from '@/content/projects'
import type { PostMeta } from '@/lib/writing'

// The homepage's projects, as the list sets them, and the demo each one
// raises: a silent loop recorded from the real thing (scripts/home-media),
// with its poster.

export type ProjectId = 'lab' | 'menubar' | 'silex'

export type HomeProject = {
	id: ProjectId
	name: string
	kind: string
	year: string
	href: string
}

const META: Record<string, Pick<HomeProject, 'id' | 'kind' | 'year'>> = {
	Lab: { id: 'lab', kind: 'interactive components', year: '2026' },
	'Menubar Player': { id: 'menubar', kind: 'macos app', year: '2026' },
	Silex: { id: 'silex', kind: 'editor theme', year: '2026' },
}

export const homeProjects: HomeProject[] = projects.flatMap((p) => {
	const meta = META[p.name]
	return meta ? [{ ...meta, name: p.name, href: p.href }] : []
})

export const media: Record<ProjectId, { src: string; poster: string }> = {
	lab: { src: '/media/home/lab.mp4', poster: '/media/home/lab.jpg' },
	menubar: {
		src: '/media/home/menubar.mp4',
		poster: '/media/home/menubar.jpg',
	},
	silex: { src: '/media/home/silex.mp4', poster: '/media/home/silex.jpg' },
}

export type Post = { slug: string; meta: PostMeta }
