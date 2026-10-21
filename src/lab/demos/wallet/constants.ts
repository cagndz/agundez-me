import type { WalletCardPalette, WalletCardTone } from './types'

export const STAGE_WIDTH = 300
// The stage fits the wallet at rest: the top card's tab (minus room for the
// hover lift) down to the case's shadow. A presented card is allowed to
// overflow it, so the stage doesn't reserve empty space for that moment.
export const STAGE_HEIGHT = 380
export const CARD_WIDTH = 132
export const CARD_HEIGHT = 208
export const CARD_PEEK = 32
export const CASE_TOP = 120
export const CASE_WIDTH = 184
export const CASE_HEIGHT = 244
export const CASE_RADIUS = 14
export const LIP_WIDTH = 178
// How far the lip pokes above the glass. The rest of LIP_HEIGHT hides behind the glass corner.
export const LIP_OVERHANG = 16
export const LIP_HEIGHT = 22
// Top edge of the lip: the case top minus the part that pokes out.
export const LIP_TOP = CASE_TOP - LIP_OVERHANG
// How far the last card sits inside the case, measured from the case top to the card's bottom edge.
export const CARDS_IN_CASE = 174
// Top edge of the last card at rest: its bottom edge (case top + depth) minus its height.
// The other cards stack above it, CARD_PEEK apart.
export const LAST_CARD_TOP = CASE_TOP + CARDS_IN_CASE - CARD_HEIGHT
// Dark and light are the colors of an object, so they are fixed. Accent is the
// site's brand color, so it follows --accent instead of repeating its value.
export const CARD_PALETTES: Record<WalletCardTone, WalletCardPalette> = {
	dark: {
		background: '#1a1a18',
		foreground: '#ececea',
		muted: '#8f8f8c',
		edge: 'rgb(255 255 255 / 0.16)',
	},
	light: {
		background: '#f6f6f4',
		foreground: '#111111',
		muted: '#5f5f5d',
		edge: 'rgb(17 17 17 / 0.14)',
	},
	accent: {
		background: 'var(--accent)',
		foreground: '#111111',
		muted: '#5a2200',
		edge: 'rgb(17 17 17 / 0.18)',
	},
}
export const CARD_RADIUS = 10
export const CARD_SINK = 12
// How far above the case a card's base stops at the top of its rise.
export const CARD_APEX_GAP = 6
export const CARD_PRESENTED_ROTATION = -90
export const CARD_PRESENTED_SCALE = 1.2
// How far above the case top the center of the presented card sits.
export const CARD_PRESENTED_CENTER_ABOVE_CASE = 50
