// The pad, and the pill it folds into once signed, centred in it
export const PAD = { width: 336, height: 176 }

// The pill's contents, left to right: miniature | check Signed. More room at
// the right end than the left: the miniature's thin line brings its own air,
// the word's last stroke doesn't, and the end is fully round.
const PAD_LEFT = 14
const PAD_RIGHT = 18
const MINI_WIDTH = 60
// Either side of the divider, and between the check and the word
const DIVIDER_GAP = 10
const LABEL_GAP = 8
// "Signed" at text-sm in Geist, measured
const LABEL_WIDTH = 45
export const RING = 18

export const PILL = {
	width:
		PAD_LEFT +
		MINI_WIDTH +
		DIVIDER_GAP * 2 +
		1 +
		RING +
		LABEL_GAP +
		LABEL_WIDTH +
		PAD_RIGHT,
	height: 44,
}
export const PILL_X = (PAD.width - PILL.width) / 2
export const PILL_Y = (PAD.height - PILL.height) / 2

// The pad above, the footer row below
export const FOOTER_GAP = 12
export const FOOTER_HEIGHT = 20
export const SIZE = {
	width: PAD.width,
	height: PAD.height + FOOTER_GAP + FOOTER_HEIGHT,
}

export const PAD_RADIUS = 12
export const PILL_RADIUS = PILL.height / 2

// The miniature's box inside the pill
export const SLOT = {
	x: PILL_X + PAD_LEFT,
	y: PILL_Y + 10,
	width: MINI_WIDTH,
	height: 24,
}
// The divider between the miniature and the check
export const DIVIDER_X = SLOT.x + MINI_WIDTH + DIVIDER_GAP

// The ring: an 18px box that rests in the pill as the check, and is carried
// to the pad's top-right corner (shrunk to 14px) as the countdown
const RING_CORNER = 14
export const RING_AT = {
	left: DIVIDER_X + 1 + DIVIDER_GAP,
	top: PILL_Y + (PILL.height - RING) / 2,
}
// Scaled about its centre, so the offsets are centre to centre
export const RING_HOME = {
	x: PAD.width - 14 - RING_CORNER / 2 - (RING_AT.left + RING / 2),
	y: 12 + RING_CORNER / 2 - (RING_AT.top + RING / 2),
	scale: RING_CORNER / RING,
}
// "Signed" rests beside the check
export const LABEL_AT = {
	left: RING_AT.left + RING + LABEL_GAP,
	top: PILL_Y + 13,
}

export const INK_WIDTH = 2.25
// Thinner in the miniature: the line doesn't scale with the ink
export const MINI_INK_WIDTH = 1.5

// Less ink than this is a slip, not a signature: no countdown starts
export const MIN_INK = 60
// The pen is up this long before the signature counts, in ms
export const DELAY = 1800
export const COUNTDOWN = { duration: DELAY / 1000, ease: [0, 0, 1, 1] } as const

// Your own hand again, in accent: every stroke in the order drawn, at an
// even pen speed
export const RETRACE = { duration: 0.6, ease: [0, 0, 1, 1] } as const
// A beat between the retrace ending and the fold
export const RETRACE_HOLD = 120

// A shape change the eye follows: a spring with no bounce, so the pill lands
// instead of wobbling
export const FOLD = { type: 'spring', duration: 0.5, bounce: 0 } as const

// Once the pill has nearly landed: the disc fills, then the check draws
export const FILL = {
	duration: 0.2,
	ease: [0.23, 1, 0.32, 1],
	delay: 0.15,
} as const
export const CHECK = {
	duration: 0.22,
	ease: [0, 0, 0.58, 1],
	delay: 0.3,
} as const
export const LABEL_IN = {
	duration: 0.2,
	ease: [0, 0, 0.58, 1],
	delay: 0.12,
} as const

// The pad's own text and hairline give way quickly as it folds
export const FADE = { duration: 0.15, ease: [0, 0, 0.58, 1] } as const

export const INSTANT = { duration: 0 } as const
