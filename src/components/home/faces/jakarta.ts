import { Plus_Jakarta_Sans } from 'next/font/google'
import type { Face } from './face'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const jakarta: Face = {
	label: 'jakarta',
	className: font.className,
	tracking: '-0.04em',
	bearing: '0.04em',
}
