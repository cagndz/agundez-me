import type { LabItem } from './items'

// Air above and below the demo, and the shortest a card can be: the values
// the approved prototype used.
const CARD_PADDING_Y = 82
const CARD_MIN_HEIGHT = 300

/** A card's height on the board: its demo plus the air around it. */
export function cardHeight(item: LabItem) {
	return Math.max(CARD_MIN_HEIGHT, item.size.height + CARD_PADDING_Y * 2)
}

/**
 * Side of the modal's (square) stage: the tallest card in the lab. Every demo
 * then fits with the same air it has in its card, the modal is the same size
 * whichever piece is open, and a taller piece makes it grow on its own.
 * Cards are as wide as a column (400px or more) and demos at most 368px wide,
 * so the height is the side that decides.
 */
export function stageSize(items: LabItem[]) {
	return Math.max(...items.map(cardHeight))
}
