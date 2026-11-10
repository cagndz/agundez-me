// The projects on the homepage, in order. `kind` is what the list says the
// project is; `id` names its demo (components/home/data.ts).
type Project = {
	id: 'lab' | 'menubar' | 'silex'
	name: string
	kind: string
	href: string
}

export const projects: Project[] = [
	{ id: 'lab', name: 'Lab', kind: 'interactive components', href: '/lab' },
	{
		id: 'menubar',
		name: 'Menubar Player',
		kind: 'macos app',
		href: 'https://github.com/cagndz/menubar-player',
	},
	{
		id: 'silex',
		name: 'Silex',
		kind: 'editor theme',
		href: 'https://github.com/cagndz/silex',
	},
]
