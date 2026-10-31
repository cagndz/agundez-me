// The demo is a box the receipt hangs into from its top edge, with the
// showroom underneath.
export const SIZE = { width: 368, height: 700 }

// The receipt's width
export const PAPER_WIDTH = 296

// Printing is the moment: longer than UI motion, still decelerating into place
export const FEED = { duration: 0.7, ease: [0.32, 0.72, 0, 1] } as const

// Torn off, it drops clean out of the box: gravity is where ease-in belongs
export const FALL = { duration: 0.55, ease: [0.55, 0, 1, 0.45] } as const

// Let go before it tears, and the paper springs back to the roll
export const SPRING_BACK = {
	type: 'spring',
	duration: 0.4,
	bounce: 0.3,
} as const

// The ring has weight: a flick carries it on, and it snaps onto the product
// without overshooting
export const TURN = { type: 'spring', stiffness: 220, damping: 30 } as const
