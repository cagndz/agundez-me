import { Martian_Mono } from 'next/font/google'

// The page's one family. Variable in width as well as weight: the name is
// set at its narrowest, the rest a step wider.
export const martian = Martian_Mono({
	subsets: ['latin'],
	axes: ['wdth'],
	// The page is nothing but type, set to measure: it waits a moment for
	// its face rather than lay out in another and reflow
	display: 'block',
})
