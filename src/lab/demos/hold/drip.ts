// The drop and its neck as one outline, drawn with real curves instead of
// shapes melted together by a blur. The blur rounded the joins but left
// them soft, and a neck that was a scaled rectangle read as a stick. Here
// the neck leaves the button's underside through a concave fillet, narrows,
// and flares back out into the drop along the drop's own tangent. When it
// breaks, the thread parts at a point: the lower half stays on the drop as
// a tail that it rounds up, the upper half retracts into the button. Coming
// back, the same in reverse: a tail reaches up, meets the stub, and the two
// close into a neck.

export type Ellipse = { cx: number; cy: number; rx: number; ry: number }

// A quarter circle as a cubic Bézier
const K = 0.5523

type Point = [number, number]

const f2 = (n: number) => n.toFixed(2)

/** A point on the ellipse, an angle θ from its top, left (-1) or right (1). */
function onEllipse(e: Ellipse, theta: number, side: -1 | 1): Point {
	return [e.cx + side * e.rx * Math.sin(theta), e.cy - e.ry * Math.cos(theta)]
}

/** The unit tangent there, heading up toward the top. */
function upTangent(e: Ellipse, theta: number, side: -1 | 1): Point {
	const x = -side * e.rx * Math.cos(theta)
	const y = -e.ry * Math.sin(theta)
	const length = Math.hypot(x, y) || 1
	return [x / length, y / length]
}

/** The drop alone. */
export function ellipse(e: Ellipse) {
	if (e.rx < 0.3 || e.ry < 0.3) return ''
	const { cx, cy, rx, ry } = e
	return `M${f2(cx - rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx + rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx - rx)} ${f2(cy)}Z`
}

/**
 * From a point above the drop, down each side into the drop along its
 * tangent, around its base and back up. `from` gives the left and right
 * points the outline leaves from; `lead` how the curve leaves them.
 */
function intoDrop(
	e: Ellipse,
	left: Point,
	right: Point,
	theta: number,
	lead: number,
) {
	const pl = onEllipse(e, theta, -1)
	const pr = onEllipse(e, theta, 1)
	const tl = upTangent(e, theta, -1)
	const tr = upTangent(e, theta, 1)
	const hl = Math.hypot(pl[0] - left[0], pl[1] - left[1]) * 0.45
	const hr = Math.hypot(pr[0] - right[0], pr[1] - right[1]) * 0.45
	return {
		down: `C${f2(left[0])} ${f2(left[1] + lead)} ${f2(pl[0] + tl[0] * hl)} ${f2(pl[1] + tl[1] * hl)} ${f2(pl[0])} ${f2(pl[1])}A${f2(e.rx)} ${f2(e.ry)} 0 1 0 ${f2(pr[0])} ${f2(pr[1])}`,
		up: `C${f2(pr[0] + tr[0] * hr)} ${f2(pr[1] + tr[1] * hr)} ${f2(right[0])} ${f2(right[1] + lead)} ${f2(right[0])} ${f2(right[1])}`,
	}
}

/** The fillet where the neck leaves the button's underside, left side. */
function filletDown(cx: number, top: number, fillet: number, half: number) {
	const ax = cx - half - fillet
	const by = top + fillet
	// Starts a pixel inside the button, so it joins the ink in there
	return `M${f2(ax)} ${f2(top - 1)}L${f2(ax)} ${f2(top)}C${f2(ax + fillet * K)} ${f2(top)} ${f2(cx - half)} ${f2(by - fillet * K)} ${f2(cx - half)} ${f2(by)}`
}

/** The same fillet on the right side, back up to the underside. */
function filletUp(cx: number, top: number, fillet: number, half: number) {
	const ax = cx + half + fillet
	const by = top + fillet
	return `C${f2(cx + half)} ${f2(by - fillet * K)} ${f2(ax - fillet * K)} ${f2(top)} ${f2(ax)} ${f2(top)}L${f2(ax)} ${f2(top - 1)}Z`
}

/** Where the neck meets the drop: past where it would hit it straight down. */
function meetAngle(e: Ellipse, half: number) {
	return Math.min(
		Math.asin(Math.min(half / Math.max(e.rx, 0.01), 0.95)) + 0.5,
		1.3,
	)
}

/** Button, fillet, neck and drop as one outline. */
export function attached(
	e: Ellipse,
	cx: number,
	top: number,
	fillet: number,
	half: number,
) {
	if (e.rx < 0.3) return ''
	const theta = meetAngle(e, half)
	const meetY = onEllipse(e, theta, -1)[1]
	// The drop right under the button leaves no room for the whole fillet
	const f = Math.max(Math.min(fillet, meetY - top - 0.5), 0)
	const by = top + f
	const lead = Math.max(meetY - by, 0) * 0.5
	const { down, up } = intoDrop(
		e,
		[cx - half, by],
		[cx + half, by],
		theta,
		lead,
	)
	return filletDown(cx, top, f, half) + down + up + filletUp(cx, top, f, half)
}

/** The drop with a tail of the given length pointing up. */
export function tailed(e: Ellipse, tail: number) {
	if (tail < 0.5) return ellipse(e)
	if (e.rx < 0.3) return ''
	const theta = 0.6
	const tip: Point = [e.cx, e.cy - e.ry - tail]
	const lead = tail * 0.35
	// The tail's tip is a hair wide, not a point
	const { down, up } = intoDrop(
		e,
		[tip[0] - 0.4, tip[1]],
		[tip[0] + 0.4, tip[1]],
		theta,
		lead,
	)
	return `M${f2(tip[0] - 0.4)} ${f2(tip[1])}${down}${up}Z`
}

/** What's left on the button: the fillet and a stub of the given length. */
export function stub(
	cx: number,
	top: number,
	fillet: number,
	half: number,
	length: number,
) {
	if (fillet < 0.3 && length < 0.3) return ''
	const by = top + fillet
	const tipY = by + length
	const lead = length * 0.5
	return (
		filletDown(cx, top, fillet, half) +
		`C${f2(cx - half)} ${f2(by + lead)} ${f2(cx - half * 0.6)} ${f2(tipY)} ${f2(cx)} ${f2(tipY)}` +
		`C${f2(cx + half * 0.6)} ${f2(tipY)} ${f2(cx + half)} ${f2(by + lead)} ${f2(cx + half)} ${f2(by)}` +
		filletUp(cx, top, fillet, half)
	)
}
