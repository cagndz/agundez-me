import {
	CARD_APEX_GAP,
	CARD_HEIGHT,
	CARD_PEEK,
	CARD_PRESENTED_CENTER_ABOVE_CASE,
	CASE_TOP,
	LAST_CARD_TOP,
} from './constants'

// Top edge of a card at rest: the last card sits at LAST_CARD_TOP and each
// earlier one is CARD_PEEK higher, so its tab shows above the next.
export function getRestTop(index: number, count: number): number {
	const stepsBehind = count - 1 - index
	return LAST_CARD_TOP - stepsBehind * CARD_PEEK
}

// How far up a card moves so its base ends above the case
export function getApexOffset(index: number, count: number): number {
	return CASE_TOP - CARD_APEX_GAP - (getRestTop(index, count) + CARD_HEIGHT)
}

export function getPresentedOffset(index: number, count: number): number {
	return (
		CASE_TOP -
		CARD_PRESENTED_CENTER_ABOVE_CASE -
		(getRestTop(index, count) + CARD_HEIGHT / 2)
	)
}
