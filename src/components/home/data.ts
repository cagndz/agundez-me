import { projects } from '@/content/projects'
import type { PostMeta } from '@/lib/writing'

// The homepage's projects, and the demo each one raises: a silent loop
// recorded from the real thing (scripts/home-media), with its poster.

export const homeProjects = projects

type ProjectId = (typeof projects)[number]['id']

export const media: Record<ProjectId, { src: string; poster: string }> = {
	lab: { src: '/media/home/lab.mp4', poster: '/media/home/lab.jpg' },
	menubar: {
		src: '/media/home/menubar.mp4',
		poster: '/media/home/menubar.jpg',
	},
	silex: { src: '/media/home/silex.mp4', poster: '/media/home/silex.jpg' },
}

export type Post = { slug: string; meta: PostMeta }
