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
// How far past the clear line (see getClearOffset) a card's base rises before it settles.
export const CARD_APEX_GAP = 6
export const CARD_PRESENTED_ROTATION = -90
// The small tab fades out early in the turn, before it looks tilted, and the
// landscape face fades in near the end. The gap between them keeps the two
// texts from ever crossing.
export const CARD_TAB_FADE_END = -30
export const CARD_FACE_FADE_START = -53
// Blur at the faded end of each text, in px.
export const CARD_FACE_BLUR = 4
export const CARD_PRESENTED_SCALE = 1.2
// How far above the case top the center of the presented card sits.
export const CARD_PRESENTED_CENTER_ABOVE_CASE = 50
// Must stay above the case front, z-10 in case.tsx
export const CARD_PRESENTED_LAYER = 20

// Card motion. Short tweens for straight moves along the case, springs for the turn.
export const CARD_RISE = { duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const
export const CARD_PRESENT_SPRING = {
	type: 'spring',
	duration: 0.55,
	bounce: 0.2,
} as const
export const CARD_RETURN_SPRING = {
	type: 'spring',
	duration: 0.42,
	bounce: 0,
} as const
export const CARD_DROP = { duration: 0.32, ease: [0.32, 0.72, 0, 1] } as const
export const CARD_SETTLE = { duration: 0.3, ease: [0.2, 0, 0, 1] } as const
// Degrees a returning card may still be tilted when it starts dropping into the case.
export const CARD_UPRIGHT_TOLERANCE = 2

// Card shadow. It lives on its own layer that never turns, so light always comes from above.
// The shape is inset to keep the blur tucked under the card's edges.
export const CARD_SHADOW_COLOR = 'rgb(0 0 0 / 0.32)'
export const CARD_SHADOW_BLUR = 9
export const CARD_SHADOW_INSET = 4
// Offset and strength go from resting in the case to fully lifted (presented).
export const CARD_SHADOW_OFFSET = [6, 22]
export const CARD_SHADOW_OPACITY = [0.6, 1]

// Hover: a small lift that only cards resting in the case get.
export const CARD_HOVER_LIFT = 8
export const CARD_HOVER = { duration: 0.18, ease: [0.2, 0, 0, 1] } as const

// Outer size of the whole demo, for the lab's card.
export const SIZE = { width: STAGE_WIDTH, height: STAGE_HEIGHT }
