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
