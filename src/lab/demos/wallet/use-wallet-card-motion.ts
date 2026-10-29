import { useEffect } from 'react'
import { animate, useMotionValue, useReducedMotion } from 'motion/react'
import {
	CARD_DROP,
	CARD_PRESENT_SPRING,
	CARD_PRESENTED_LAYER,
	CARD_PRESENTED_ROTATION,
	CARD_PRESENTED_SCALE,
	CARD_REDUCED_FADE,
	CARD_RETURN_SPRING,
	CARD_RISE,
	CARD_SETTLE,
	CARD_SINK,
	CARD_UPRIGHT_TOLERANCE,
} from './constants'
import {
	getApexOffset,
	getClearOffset,
	getPresentedOffset,
	waitUntil,
} from './utils'

type WalletCardMotionOptions = {
	index: number
	count: number
	isPresented: boolean
	isAnyPresented: boolean
}

export function useWalletCardMotion({
	index,
	count,
	isPresented,
	isAnyPresented,
}: WalletCardMotionOptions) {
	const restLayer = index + 1
	const y = useMotionValue(0)
	const rotate = useMotionValue(0)
	const scale = useMotionValue(1)
	const zIndex = useMotionValue(restLayer)
	const opacity = useMotionValue(1)
	const reduceMotion = useReducedMotion()

	useEffect(() => {
		const controller = new AbortController()
		const { signal } = controller

		const restOffset = isAnyPresented && !isPresented ? CARD_SINK : 0
		const presentedOffset = getPresentedOffset(index, count)
		const apexOffset = getApexOffset(index, count)
		const clearOffset = getClearOffset(index, count)
		// Read where the card really is, not what the props were last time:
		// a click can land halfway through any of the sequences below.
		const isOutOfCase = zIndex.get() === CARD_PRESENTED_LAYER
		const isClear = () => y.get() <= clearOffset

		function jump() {
			y.jump(isPresented ? presentedOffset : restOffset)
			rotate.jump(isPresented ? CARD_PRESENTED_ROTATION : 0)
			scale.jump(isPresented ? CARD_PRESENTED_SCALE : 1)
			zIndex.set(isPresented ? CARD_PRESENTED_LAYER : restLayer)
		}

		async function fadeJump() {
			await animate(opacity, 0, CARD_REDUCED_FADE)
			if (signal.aborted) return
			jump()
			animate(opacity, 1, CARD_REDUCED_FADE)
		}

		if (reduceMotion) {
			// Only the card going in or out of the case fades. The others just sink.
			if (isPresented !== isOutOfCase) {
				fadeJump()
			} else {
				jump()
				animate(opacity, 1, CARD_REDUCED_FADE)
			}
			return () => controller.abort()
		}

		// A fade cut short by turning reduced motion off must not leave the card hidden.
		opacity.jump(1)

		function present() {
			zIndex.set(CARD_PRESENTED_LAYER)
			animate(y, presentedOffset, CARD_PRESENT_SPRING)
			animate(rotate, CARD_PRESENTED_ROTATION, CARD_PRESENT_SPRING)
			animate(scale, CARD_PRESENTED_SCALE, CARD_PRESENT_SPRING)
		}

		async function open() {
			if (isOutOfCase) {
				present()
				return
			}
			animate(y, apexOffset, CARD_RISE)
			// Turn as soon as the card clears the cards in front, while it is still rising.
			await waitUntil([y], isClear, signal)
			if (signal.aborted) return
			present()
		}

		async function close() {
			animate(y, apexOffset, CARD_RETURN_SPRING)
			animate(rotate, 0, CARD_RETURN_SPRING)
			animate(scale, 1, CARD_RETURN_SPRING)
			// Drop as soon as the card is upright and clear, before the spring settles.
			await waitUntil(
				[y, rotate],
				() => isClear() && Math.abs(rotate.get()) <= CARD_UPRIGHT_TOLERANCE,
				signal,
			)
			if (signal.aborted) return
			zIndex.set(restLayer)
			animate(y, restOffset, CARD_DROP)
		}

		if (isPresented) {
			open()
		} else if (isOutOfCase) {
			close()
		} else {
			animate(y, restOffset, CARD_SETTLE)
		}

		return () => controller.abort()
	}, [
		count,
		index,
		isAnyPresented,
		isPresented,
		opacity,
		reduceMotion,
		restLayer,
		rotate,
		scale,
		y,
		zIndex,
	])

	return { y, rotate, scale, zIndex, opacity }
}
