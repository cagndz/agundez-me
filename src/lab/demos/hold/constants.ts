// Hold: a button whose ink drains into a drop while you hold it. Let go
// early and it flows back; hold to the end and the drop falls on the paper
// below and spreads into a stain that says where the piece now lives.

export const EASE_OUT = [0.23, 1, 0.32, 1] as const
export const INSTANT = { duration: 0 } as const

// The button, centred over the stain so the drop lands in its middle
export const HEIGHT = 40
export const BUTTON = 160
export const GAP = 40
export const STAMP = { width: 272, height: 32 }
export const STAMP_TOP = HEIGHT + GAP
export const BUTTON_X = (STAMP.width - BUTTON) / 2
// The reset control, inside the stain's right end
export const RESET = 24

export const SIZE = {
	width: STAMP.width,
	height: STAMP_TOP + STAMP.height,
}

// How long the hold takes, in seconds
export const HOLD = 1.2

// The drop is drawn at this size and scaled
export const DROP = 20
// The neck's half-width: wide as the drop starts to form, a thread by the
// time it's about to let go. That thinning is the hold's progress.
export const NECK_WIDE = 5
export const NECK_THIN = 1.6
// The concave curve where the neck leaves the button's underside
export const FILLET = 5
// When the thread breaks, the share that stays on the drop as a tail; the
// rest retracts into the button. Coming back, the same shares close the gap.
export const TAIL_SHARE = 0.6
// How far the drop sags at full weight, past its own size
export const SAG = 20
// Fast to appear, slow to finish: visible from the first moment of the hold.
// One smooth curve, no corners: a kink here shows up as a hitch in the
// drop's movement on the way back up.
export const RADIUS_CURVE = 0.55

// Where the drop's base ends its fall: just past the stain's middle, so it
// lands in it
export const LAND_AT = STAMP_TOP + STAMP.height / 2 + 6
// The drop's centre at full weight
const FULL_CENTER = HEIGHT - 3 + SAG + DROP / 2

// Let go early, it's drawn back: slow to start, as if it resisted, then home.
// The fuller the drop, the longer it takes.
export const drawBack = (progress: number) =>
	({ duration: 0.2 + 0.35 * progress, ease: [0.65, 0, 0.35, 1] }) as const
// Gravity is the one place ease-in is right: it speeds up until it hits.
// Longer falls take longer, but not proportionally (t ∝ √distance).
export const fall = (distance: number) =>
	({
		duration: 0.08 + 0.022 * Math.sqrt(Math.max(distance, 0)),
		ease: [0.55, 0, 1, 0.45],
	}) as const
// The thread breaking: tail and stub draw in, the drop rounds up
export const FOLLOW = { type: 'spring', duration: 0.24, bounce: 0 } as const
// Rid of the weight, the button springs up a touch
export const RECOIL = { y: [0, -3, 1, 0] }
export const RECOIL_TIMING = { duration: 0.4, times: [0, 0.25, 0.6, 1] }
export const IMPACT = {
	scaleX: [1, 1.5, 0.9, 1],
	scaleY: [1, 0.55, 1.08, 1],
}
export const IMPACT_TIMING = { duration: 0.26, times: [0, 0.3, 0.65, 1] }
// Absorbed by the stain it lands in
export const ABSORB = { duration: 0.22, ease: EASE_OUT, delay: 0.08 } as const

// The stain: spreads fast and settles with a little give
export const SPREAD = { type: 'spring', duration: 0.5, bounce: 0.22 } as const
// Gathering back: no give, it's being pulled together. It loses its width
// before its height, so it rounds into a drop instead of thinning to a line.
export const GATHER = {
	scaleX: { type: 'spring', duration: 0.3, bounce: 0 },
	scaleY: { type: 'spring', duration: 0.38, bounce: 0 },
} as const
// Its text, once the stain has nearly spread, so it never sits on bare paper
export const CONTENT_IN = {
	duration: 0.2,
	ease: EASE_OUT,
	delay: 0.32,
} as const
export const CONTENT_OUT = { duration: 0.1, ease: [0, 0, 0.58, 1] } as const

// Reset, the way back up. The drop gathers out of the stain...
export const REGATHER = { type: 'spring', duration: 0.3, bounce: 0 } as const
// ...and the rest is one movement on one clock, never a chain of
// animations: chained, each one's ease-out met the next one's start and the
// drop stalled between them. A single value runs from the stain to inside
// the button with one curve; the rise, the neck reaching up and the refill
// are all read off it, each over a share of the path as long as the
// distance it covers. So the speed is continuous by construction: it starts
// slow, as if drawn up against its weight, and brakes once, at the end.
export const REWIND = { duration: 0.9, ease: [0.45, 0, 0.25, 1] } as const
// How far the drop's centre climbs while the button refills, roughly: its
// sag plus its radius. Sets the refill's share of the path.
export const REFILL_CLIMB = SAG + DROP / 2
// The neck reaches up over this share of the path, across the moment the
// drop arrives
export const REACH_SPAN = 0.16

// For the lab's curves: the fall as it happens here, from full weight into
// the stain, and drawing back a full drop
export const FALL = fall(LAND_AT - (FULL_CENTER + DROP / 2))
export const DRAW_BACK = drawBack(1)
