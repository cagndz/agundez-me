import { calcGeneratorDuration, spring } from 'motion'

type Bezier = readonly [number, number, number, number]

// The transitions the demos use, in Motion's format (durations in seconds). The
// lab imports the same constants the demos animate with, so a curve can never
// show something the demo doesn't do.
export type CurveTransition =
	| { readonly duration: number; readonly ease: Bezier }
	| {
			readonly type: 'spring'
			readonly duration: number
			readonly bounce: number
	  }
	| {
			readonly type: 'spring'
			readonly stiffness: number
			readonly damping: number
	  }

type SpringTransition = Exclude<CurveTransition, { ease: Bezier }>

export type LabCurve = {
	label: string
	transition: CurveTransition
}

// The drawing box, in viewBox units. Time runs left to right, progress bottom
// to top. The target sits below the top edge to leave room for a spring's
// overshoot.
export const CURVE_BOX = { width: 100, height: 60, start: 54, target: 14 }

// Points sampled along a spring. Enough for a smooth line at the size it's drawn.
const SPRING_SAMPLES = 48

// Server and browser both draw the curves (the modal can be open on load), and
// the last decimals of Math.exp or Math.sin may differ between engines. Two
// decimals are far below a pixel and keep both outputs identical.
const round = (value: number) => Math.round(value * 100) / 100

// Motion works in milliseconds; the constants are in seconds.
function createSpring(transition: SpringTransition) {
	return spring(
		'bounce' in transition
			? {
					keyframes: [0, 1],
					duration: transition.duration * 1000,
					bounce: transition.bounce,
				}
			: {
					keyframes: [0, 1],
					stiffness: transition.stiffness,
					damping: transition.damping,
				},
	)
}

/**
 * How long the animation runs, in ms. A spring defined by stiffness and damping
 * has no duration of its own: it runs until Motion considers it at rest.
 */
export function curveDuration(transition: CurveTransition) {
	if ('ease' in transition) return transition.duration * 1000

	const generator = createSpring(transition)
	return generator.calculatedDuration ?? calcGeneratorDuration(generator)
}

/**
 * The curve as an SVG path. All the curves of a piece share one time axis:
 * `maxDuration` (ms) fills the width, so a shorter animation ends earlier and
 * then holds at the target.
 */
export function curvePath(transition: CurveTransition, maxDuration: number) {
	const { width, start, target } = CURVE_BOX
	const duration = curveDuration(transition)
	const end = (duration / maxDuration) * width
	const y = (progress: number) => round(start - progress * (start - target))

	// A cubic-bezier's four numbers are the two control points of the SVG curve.
	if ('ease' in transition) {
		const [x1, y1, x2, y2] = transition.ease
		return `M 0 ${start} C ${round(x1 * end)} ${y(y1)}, ${round(x2 * end)} ${y(y2)}, ${round(end)} ${target} H ${width}`
	}

	// A spring has no formula to copy, so ask Motion where it is along the way.
	const generator = createSpring(transition)
	const points = Array.from({ length: SPRING_SAMPLES + 1 }, (_, i) => {
		const time = (i / SPRING_SAMPLES) * duration
		return `${round((time / maxDuration) * width)} ${y(generator.next(time).value)}`
	})

	return `M ${points.join(' L ')} H ${width}`
}
