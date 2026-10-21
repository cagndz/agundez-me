import { CARD_PEEK, LAST_CARD_TOP } from './constants'

// Top edge of a card at rest: the last card sits at LAST_CARD_TOP and each
// earlier one is CARD_PEEK higher, so its tab shows above the next.
export function getRestTop(index: number, count: number): number {
	const stepsBehind = count - 1 - index
	return LAST_CARD_TOP - stepsBehind * CARD_PEEK
}
