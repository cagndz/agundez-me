import { Space_Grotesk } from 'next/font/google'
import type { Face } from './face'

const font = Space_Grotesk({ subsets: ['latin'] })

export const spaceGrotesk: Face = {
	label: 'space grotesk',
	className: font.className,
	tracking: '-0.05em',
	bearing: '0.045em',
}
