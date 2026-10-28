export type Project = {
	name: string
	description: string
	href: string
}

export const projects: Project[] = [
	{
		name: 'Menubar Player',
		description: 'An audio player for YouTube that lives in the macOS menu bar',
		href: 'https://github.com/cagndz/menubar-player',
	},
	{
		name: 'Silex',
		description:
			'A quiet dark theme. Color where it counts, gray everywhere else',
		href: 'https://github.com/cagndz/silex',
	},
	{
		name: 'Lab',
		description: 'Interactive UI components and experiments',
		href: '/lab',
	},
]
