'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, type MotionValue } from 'motion/react'
import { useSvgId } from './utils'

// The button's ink as a liquid, not a shape. Its surface is a row of
// columns joined by springs (the classic 2D water trick): each is pulled
// toward a target height and drags its neighbours along, so a disturbance
// travels as a wave and bounces off the walls. The drain at the bottom
// centre pulls the surface into a funnel as deep as the flow is fast;
// refilling, the ink coming in mounds it up instead. Volume is kept: what
// the button loses is what the drop gains. Below a puddle's natural
// thickness the ink stops covering the floor and draws in toward the
// drain, its ends rounded by surface tension. The simulation only runs
// while something moves; at rest it costs nothing.

const COLUMNS = 24
// Spring-water constants, per step of a 120 Hz clock
const TENSION = 0.018
const DAMPING = 0.035
const SPREAD = 0.2
const STEP = 1000 / 120
// The thickness a puddle of this ink settles at. Thinner than this, it
// draws in instead of spreading out.
const PUDDLE = 12
// The ink climbs the walls a little, and over this distance from them
const MENISCUS = 2.5
const MENISCUS_REACH = 5
// How deep the funnel gets per unit of flow (progress per second), how
// wide it is, and how much of the ink's depth it may take
const DIP_PER_FLOW = 15
const DIP_WIDTH = 16
const DIP_MAX = 0.55
// Flow is smoothed over about this long, so the funnel deepens and eases
// like a liquid, not like a number
const FLOW_SMOOTHING = 0.08
// A small push at the drain: down when the hold starts, up when it's let
// go early and the ink rushes back
const KICK_PRESS = -1.4
const KICK_RELEASE = 2.4
// Below this everywhere (a few hundredths of a pixel), the surface is still
// and the loop stops
const STILL = 0.03
// Points the surface is drawn through
const SAMPLES = 33

type LiquidInkProps = {
	progress: MotionValue<number>
	buttonY: MotionValue<number>
	phase: string
	x: number
	width: number
	height: number
}

export function LiquidInk({
	progress,
	buttonY,
	phase,
	x,
	width,
	height,
}: LiquidInkProps) {
	const clipId = useSvgId('liquid-clip')
	const reduceMotion = useReducedMotion()
	const pathRef = useRef<SVGPathElement>(null)
	const sim = useRef({
		d: new Float32Array(COLUMNS),
		v: new Float32Array(COLUMNS),
		flow: 0,
		lastP: 0,
		lastT: 0,
		carry: 0,
		frame: 0,
	})
	const kickRef = useRef<(amount: number) => void>(() => {})
	const lastPhase = useRef(phase)

	useEffect(() => {
		const s = sim.current
		const center = width / 2
		const colX = (i: number) => ((i + 0.5) / COLUMNS) * width
		const gauss = (dx: number) =>
			Math.exp(-(dx * dx) / (2 * DIP_WIDTH * DIP_WIDTH))

		function geometry(p: number) {
			const area = Math.max(1 - p, 0) * width * height
			// Covers the floor while there's enough to be a puddle; past that,
			// keeps its thickness and narrows
			if (area >= width * PUDDLE)
				return { level: area / width, span: width, area }
			return { level: PUDDLE, span: area / PUDDLE, area }
		}

		function render(p: number) {
			const path = pathRef.current
			if (!path) return
			const { level, span, area } = geometry(p)
			if (area < 1) {
				path.setAttribute('d', '')
				return
			}
			const left = center - span / 2
			const points: [number, number][] = []
			for (let k = 0; k < SAMPLES; k++) {
				const px = left + (k / (SAMPLES - 1)) * span
				// The column displacement under this point, interpolated
				const f = Math.min(
					Math.max((px / width) * COLUMNS - 0.5, 0),
					COLUMNS - 1,
				)
				const i = Math.floor(f)
				const j = Math.min(i + 1, COLUMNS - 1)
				const wave = s.d[i] + (s.d[j] - s.d[i]) * (f - i)
				// Narrowed, the ends round off like a drop's edge
				const fromEnd = span / 2 - Math.abs(px - center)
				let h = level
				let edge = 1
				if (span < width && fromEnd < level) {
					const e = Math.max(fromEnd, 0)
					h = Math.sqrt(Math.max(level * level - (level - e) * (level - e), 0))
					edge = e / level
				}
				// Against the walls, a little climb
				if (span >= width && level > 4 && level < height - 2) {
					const toWall = Math.min(px, width - px)
					h += MENISCUS * Math.exp(-toWall / MENISCUS_REACH)
				}
				h = Math.max(h + wave * edge, 0)
				points.push([px, height - h])
			}
			// Down to the floor at both ends, the surface between them through
			// a smooth curve (Catmull-Rom as cubic Béziers)
			let d = `M${left} ${height + 1}L${points[0][0]} ${points[0][1]}`
			for (let k = 0; k < points.length - 1; k++) {
				const p0 = points[Math.max(k - 1, 0)]
				const p1 = points[k]
				const p2 = points[k + 1]
				const p3 = points[Math.min(k + 2, points.length - 1)]
				const c1x = p1[0] + (p2[0] - p0[0]) / 6
				const c1y = p1[1] + (p2[1] - p0[1]) / 6
				const c2x = p2[0] - (p3[0] - p1[0]) / 6
				const c2y = p2[1] - (p3[1] - p1[1]) / 6
				d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
			}
			d += `L${left + span} ${height + 1}Z`
			path.setAttribute('d', d)
		}

		function step(targets: Float32Array) {
			const { d, v } = s
			for (let i = 0; i < COLUMNS; i++) {
				v[i] += TENSION * (targets[i] - d[i]) - DAMPING * v[i]
			}
			// Each column drags its neighbours; the walls reflect
			for (let i = 0; i < COLUMNS; i++) {
				const l = d[i > 0 ? i - 1 : i]
				const r = d[i < COLUMNS - 1 ? i + 1 : i]
				v[i] += SPREAD * (l + r - 2 * d[i])
			}
			let mean = 0
			for (let i = 0; i < COLUMNS; i++) {
				d[i] += v[i]
				mean += d[i]
			}
			// What sinks in one place rises in another: volume is kept
			mean /= COLUMNS
			for (let i = 0; i < COLUMNS; i++) d[i] -= mean
		}

		const targets = new Float32Array(COLUMNS)

		function frame(now: number) {
			const dt = Math.min(now - s.lastT, 50)
			s.lastT = now
			const p = progress.get()
			const rawFlow = dt > 0 ? ((p - s.lastP) / dt) * 1000 : 0
			s.lastP = p
			s.flow += (rawFlow - s.flow) * (1 - Math.exp(-dt / 1000 / FLOW_SMOOTHING))

			const { level } = geometry(p)
			const dip = Math.max(
				Math.min(s.flow * DIP_PER_FLOW, level * DIP_MAX),
				-level * DIP_MAX,
			)
			for (let i = 0; i < COLUMNS; i++)
				targets[i] = -dip * gauss(colX(i) - center)

			if (reduceMotion) {
				s.d.set(targets)
				s.v.fill(0)
			} else {
				s.carry += dt
				while (s.carry >= STEP) {
					step(targets)
					s.carry -= STEP
				}
			}
			render(p)

			let moving = Math.abs(rawFlow) > 0.001 || Math.abs(s.flow) > 0.002
			for (let i = 0; i < COLUMNS && !moving; i++)
				if (Math.abs(s.v[i]) > STILL || Math.abs(s.d[i] - targets[i]) > STILL)
					moving = true
			s.frame = moving ? requestAnimationFrame(frame) : 0
		}

		function wake() {
			if (s.frame) return
			s.lastT = performance.now()
			s.frame = requestAnimationFrame(frame)
		}

		kickRef.current = (amount) => {
			if (reduceMotion) return
			for (let i = 0; i < COLUMNS; i++)
				s.v[i] += amount * gauss(colX(i) - center)
			wake()
		}

		s.lastP = progress.get()
		render(s.lastP)
		const unsubscribe = progress.on('change', wake)
		return () => {
			unsubscribe()
			cancelAnimationFrame(s.frame)
			s.frame = 0
		}
	}, [progress, width, height, reduceMotion])

	// The hold starting, or let go early: a push at the drain
	useEffect(() => {
		const from = lastPhase.current
		lastPhase.current = phase
		if (phase === 'holding') kickRef.current(KICK_PRESS)
		else if (from === 'holding' && phase === 'idle')
			kickRef.current(KICK_RELEASE)
	}, [phase])

	return (
		<motion.svg
			className='absolute top-0 overflow-visible text-foreground'
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			style={{ left: x, y: buttonY }}
		>
			<defs>
				<clipPath id={clipId}>
					<rect width={width} height={height} rx={height / 2} />
				</clipPath>
			</defs>
			<path ref={pathRef} fill='currentColor' clipPath={`url(#${clipId})`} />
		</motion.svg>
	)
}
