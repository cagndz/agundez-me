// The trigger is a round ink button; the tooltip is an ink panel above it,
// left-aligned with it.
export const TRIGGER = 44
export const PANEL_WIDTH = 216
export const PANEL_HEIGHT = 112
export const PANEL_RADIUS = 14
// Wider than twice the blur, so the open panel and the trigger stay apart
export const GAP = 12
export const TRIGGER_TOP = PANEL_HEIGHT + GAP

export const SIZE = {
	width: PANEL_WIDTH,
	height: TRIGGER_TOP + TRIGGER,
}

// The goo: shapes closer than about twice the blur melt into each other.
export const BLUR = 6
// Room around the shapes so the blur isn't cut at the filter layer's edge
export const BLEED = 32

// The drop waits inside the trigger, tall rather than round
export const DROP = { width: 16, height: 26 }

// The panel's resting transform, and the one that hides it in the trigger as
// the drop: centred on the trigger, scaled down to the drop's size.
export const OPEN = { x: 0, y: 0, scaleX: 1, scaleY: 1 }
export const CLOSED = {
	x: TRIGGER / 2 - PANEL_WIDTH / 2,
	y: TRIGGER_TOP + TRIGGER / 2 - PANEL_HEIGHT / 2,
	scaleX: DROP.width / PANEL_WIDTH,
	scaleY: DROP.height / PANEL_HEIGHT,
}

// Squash and stretch. The trigger squeezes the drop out (squash, rebound,
// settle, from its base), the drop leaves tall and lands with weight. Closing,
// it falls back and the trigger takes the hit.
export const SQUEEZE = {
	scaleX: [1, 1.12, 0.96, 1],
	scaleY: [1, 0.84, 1.06, 1],
}
export const IMPACT = {
	scaleX: [1, 1.14, 0.97, 1],
	scaleY: [1, 0.82, 1.05, 1],
}
export const SQUEEZE_TIMING = { duration: 0.36, times: [0, 0.3, 0.65, 1] }

// The drop leaves at the top of the squeeze, then lands into the panel with
// overshoot. Rising before swelling is what pulls a neck out of the trigger.
export const RISE = {
	type: 'spring',
	duration: 0.32,
	bounce: 0.2,
	delay: 0.08,
} as const
export const LAND = {
	type: 'spring',
	duration: 0.46,
	bounce: 0.34,
	delay: 0.16,
} as const
// Closing: gather into a drop, then fall. Gravity is the one place ease-in is
// right: it speeds up until it hits.
export const GATHER = { type: 'spring', duration: 0.2, bounce: 0 } as const
export const FALL = {
	duration: 0.2,
	ease: [0.55, 0, 1, 0.45],
	delay: 0.1,
} as const
// When the falling drop reaches the trigger
export const HIT = 0.28

// The text lights up once the panel has nearly landed
export const TEXT_DELAY = 0.24
export const TEXT_IN = {
	duration: 0.2,
	ease: [0.23, 1, 0.32, 1],
} as const
export const TEXT_OUT = { duration: 0.08 }
// Reduced motion: no liquid, the panel fades in place
export const REDUCED_FADE = { duration: 0.15 }

// Hover grace: long enough to cross the gap from the trigger to the panel
export const CLOSE_DELAY = 120
