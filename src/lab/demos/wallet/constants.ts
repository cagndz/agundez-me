export const STAGE_WIDTH = 300
export const STAGE_HEIGHT = 512
export const CARD_WIDTH = 132
export const CARD_HEIGHT = 208
export const CARD_PEEK = 32
export const CASE_TOP = 240
export const CASE_WIDTH = 184
export const CASE_HEIGHT = 244
export const CASE_RADIUS = 14
export const LIP_WIDTH = 178
export const LIP_HEIGHT = 22
// How far the last card sits inside the case, measured from the case top to the card's bottom edge.
export const CARDS_IN_CASE = 174
// Top edge of the last card at rest: its bottom edge (case top + depth) minus its height.
// The other cards stack above it, CARD_PEEK apart.
export const LAST_CARD_TOP = CASE_TOP + CARDS_IN_CASE - CARD_HEIGHT
