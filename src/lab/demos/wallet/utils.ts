import type { MotionValue } from 'motion/react'
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

// How far up a card moves until its base clears everything drawn in front of it:
// the tab of the next card (it peeks above the case), or the case top for the front card.
// Only from there can it change layer without popping over or under another card.
export function getClearOffset(index: number, count: number): number {
	const isFrontCard = index === count - 1
	const clearLine = isFrontCard ? CASE_TOP : getRestTop(index + 1, count)
	return clearLine - (getRestTop(index, count) + CARD_HEIGHT)
}

// The top of the rise: a little past the clear point, so the card is still moving when it turns.
export function getApexOffset(index: number, count: number): number {
	return getClearOffset(index, count) - CARD_APEX_GAP
}

export function getPresentedOffset(index: number, count: number): number {
	return (
		CASE_TOP -
		CARD_PRESENTED_CENTER_ABOVE_CASE -
		(getRestTop(index, count) + CARD_HEIGHT / 2)
	)
}

// Resolves once `check` passes, testing it again whenever one of `values` changes.
// Aborting `signal` stops listening; the caller checks `signal.aborted` after awaiting.
export function waitUntil(
	values: MotionValue<number>[],
	check: () => boolean,
	signal: AbortSignal,
): Promise<void> {
	return new Promise((resolve) => {
		if (signal.aborted || check()) {
			resolve()
			return
		}

		function finish() {
			unsubscribers.forEach((unsubscribe) => unsubscribe())
			signal.removeEventListener('abort', finish)
			resolve()
		}

		const unsubscribers = values.map((value) =>
			value.on('change', () => {
				if (check()) finish()
			}),
		)
		signal.addEventListener('abort', finish, { once: true })
	})
}
