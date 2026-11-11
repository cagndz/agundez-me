// Voice notes: the pending voice notes from every chat, stacked in one
// island. Idle it's a row of faces; open, the same row stays where it is
// and the island grows down from it, playing the notes one after another
// with the transcript lighting up as each word is said.

export const EASE_OUT = [0.23, 1, 0.32, 1] as const
export const INSTANT = { duration: 0 } as const

// The row: play button and faces, the same idle and open
export const ROW = 56
export const PLAY = 40
export const FACE = 36
// The faces overlap like any avatar stack, each a little over the one
// before it. Point at the stack and the whole of it fans out, every face
// whole and FAN apart, so any of them can be picked; it closes back up
// when the pointer leaves. Open, the one playing keeps that room after it
// so its ring shows whole.
export const OVERLAP = -12
export const FAN = 4

// No borders between overlapping faces: each one has a notch cut out where
// the next sits on it, CUT px wider than that face, so a true gap shows the
// island through (the way Apple, Vercel and Linear stack avatars). The
// notch slides out of the way as the stack fans and closes as it stacks.
export const CUT = 2
// Who's talking: a small disc of bars at their face's lower right, moving
// with their voice, with a notch of BADGE_CUT cut around it in the face.
// It sticks out past the face, so the face after makes BADGE_ROOM for it.
export const BADGE = 16
export const BADGE_AT = FACE - 5 // its centre, from the face's top left
export const BADGE_CUT = BADGE / 2 + 2
export const BADGE_ROOM = 4
// The voice level the bars follow: quick to rise, no wobble
export const LEVEL = { stiffness: 600, damping: 40 }

// The island, open. It keeps the row's corner radius, so idle and open read
// as one shape that only grew.
export const WIDTH = 340
export const RADIUS = ROW / 2
export const PAD = 16
export const LINE = 22
export const LINES = 3
export const STRIP = 32 // name row and scrubber row
export const GAP = 12
export const DETAILS = 4 + STRIP + GAP + LINE * LINES + GAP + STRIP + PAD
export const HEIGHT = ROW + DETAILS

export const SIZE = { width: WIDTH, height: HEIGHT }

// Depth: a tight contact shadow, a soft mid one and a wide faint one, so
// the island sits just above the page. A hairline of light along the top
// edge catches the dark. Set as a style, so Motion keeps it undistorted
// while the shape morphs.
export const SHADOW = [
	'inset 0 1px 0 rgba(255, 255, 255, 0.07)',
	'0 1px 2px rgba(0, 0, 0, 0.10)',
	'0 6px 16px -4px rgba(0, 0, 0, 0.18)',
	'0 22px 44px -14px rgba(0, 0, 0, 0.28)',
].join(', ')

// The island changing shape. A touch of bounce: it's a thing that grows,
// and the bounce is what makes it read as one surface rather than a swap.
export const MORPH = { type: 'spring', duration: 0.42, bounce: 0.18 } as const
// The details come down out of the row once the shape is mostly there, and
// leave first when it folds
export const DETAILS_IN = {
	duration: 0.26,
	ease: EASE_OUT,
	delay: 0.08,
} as const
export const DETAILS_OUT = { duration: 0.12, ease: EASE_OUT } as const
export const DROP = 10 // px the details travel down as they arrive

// Reduced motion: nothing moves or scales, but what changes still fades,
// so a new state reads as new rather than snapping in
export const REDUCED = { duration: 0.15, ease: EASE_OUT } as const

// A press is felt more than seen
export const PRESS = 0.97
// Faces arrive from, and leave to, nearly full size: nothing appears out
// of nothing
export const FACE_FROM = 0.9
export const BADGE_FROM = 0.95

// The play/pause icon and "All caught up" cross-fading in, with a touch of
// scale and blur so the two states read as one changing into the other
export const CROSSFADE = { duration: 0.15, ease: EASE_OUT } as const

// Faces dimming and coming and going in the row
export const FADE = { duration: 0.2, ease: EASE_OUT } as const

// The badge sliding along the row to whoever plays next
export const BADGE_SLIDE = {
	type: 'spring',
	duration: 0.36,
	bounce: 0.15,
} as const

// One person handing over to the next. The new one comes in from their
// side of the row: from the right for the next, from the left going back.
// A directional hint, not a slide.
export const SWAP_OUT = { duration: 0.16, ease: EASE_OUT } as const
export const SWAP_IN = { duration: 0.3, ease: EASE_OUT, delay: 0.04 } as const
export const SHIFT = 12 // px

// The playhead chasing a seek. Critically damped, so a jump glides and
// lands without overshoot; while playing it trails the clock by ~0.1s.
export const SEEK = { type: 'spring', stiffness: 420, damping: 42 } as const

// The playhead carries which note it's in: note i plays from i × SPAN. A
// person's transcript and waveform leaving then ignore the next note's
// time instead of rewinding to its zero on their way out.
export const SPAN = 1000

// The transcript scrolling to keep the line being said in view
export const SCROLL = { type: 'spring', duration: 0.5, bounce: 0 } as const

// Waveform bars on the scrubber: 45 bars 2.5px wide across its ~204px,
// about 2px apart, so a bar is a little wider than its gap. The played
// part fills them with a hard edge, no fade; since the edge spends
// more than half its way inside a bar rather than in a gap, you see it
// fill instead of stepping. Wider or denser and it reads as a block.
export const BARS = 45
export const BAR_WIDTH = 2.5

// Arrow keys on the scrubber move this many seconds
export const KEY_STEP = 2
