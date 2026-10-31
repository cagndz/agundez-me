'use client'

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
	type Ref,
	type RefObject,
} from 'react'
import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	type PanInfo,
} from 'motion/react'
import { FALL, FEED, PAPER_WIDTH, SPRING_BACK } from './constants'
import { makeOrder, type Order, type Product } from './data'
import { useReceiptFocus } from './hooks'
import { Dashed, ReceiptBody } from './receipt'

// No printer: the paper hangs from the box's top edge. Pick a product
// and the receipt feeds down over the menu. Pull it and the paper rips along
// its top, from the corner nearest your finger across; once it gives, the
// receipt falls and the menu is back.

const W = PAPER_WIDTH
// Paper still showing below the edge when nothing is printed
const STUB = 20
// The band at each end of a slip where its torn edge runs
const EDGE = 8
// The rest of the roll, above the edge
const TAIL = 480
// Degrees the slip turns as it falls, toward the side that tore first
const TILT = 6
const FALL_DISTANCE = 820
// The box dims under a receipt, so the white paper and its crack read clearly.
// The crack is painted in the same colour the dimmed box ends up as.
const DIM = 80
const DIM_COLOR = `color-mix(in srgb, var(--foreground) ${DIM}%, var(--surface))`

// Finger distance for a full tear; the paper itself only shows a fraction
const TEAR_DISTANCE = 180
const TEAR_VELOCITY = 1000
// The roll is held at the top: it gives less and less, never past LIMIT
const LIMIT = 56
const STIFFNESS = 0.55
function rubberBand(offset: number) {
	if (offset < 0) return offset * 0.06
	return (1 - 1 / ((offset * STIFFNESS) / LIMIT + 1)) * LIMIT
}

type Pt = [number, number]
type Side = 'start' | 'end'

// A torn edge: fine, irregular teeth inside the EDGE band
function jagged(): Pt[] {
	const pts: Pt[] = []
	for (let x = 0; x < W; x += 3) {
		const dir = (x / 3) % 2 ? 1 : -1
		pts.push([x, 4 + dir * (0.5 + Math.random() * 1.7) + Math.random() - 0.5])
	}
	pts.push([W, 4])
	return pts
}

// How far the crack has opened, by distance behind the tear front
function opening(behind: number, p: number) {
	return Math.min(1.5 + 7 * p, 0.6 + behind * 0.06)
}

function seamAt(seam: Pt[], x: number) {
	for (let i = 1; i < seam.length; i++) {
		const [x1, y1] = seam[i]
		if (x <= x1) {
			const [x0, y0] = seam[i - 1]
			return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
		}
	}
	return seam[seam.length - 1][1]
}

/** The crack so far, from the outer edge to the tear front. */
function gapPath(seam: Pt[], p: number, side: Side) {
	if (p <= 0) return ''
	const from = side === 'start' ? 0 : W
	const to = side === 'start' ? p * W : W - p * W
	const lo = Math.min(from, to)
	const hi = Math.max(from, to)
	const xs = [lo, ...seam.map(([x]) => x).filter((x) => x > lo && x < hi), hi]
	const top = xs.map((x) => [x, seamAt(seam, x)])
	const bottom = xs.map((x, i) => [x, top[i][1] + opening(Math.abs(to - x), p)])
	// Past the paper's outer edge, so no hairline is left there
	const out = (x: number) => (x === 0 ? -1 : x === W ? W + 1 : x)
	const line = (pts: number[][]) =>
		pts.map(([x, y]) => `${out(x)} ${y}`).join('L')
	return `M${line(top)}L${line(bottom.reverse())}Z`
}

/** The roll above the edge, ending in the last tear. */
function tailClip(seam: Pt[]) {
	const edge = [...seam].reverse().map(([x, y]) => `${x}px ${TAIL + y}px`)
	return `polygon(0 0, ${W}px 0, ${edge.join(', ')})`
}

/** A slip: its bottom is the last tear, its top the one being made. */
function slipClip(
	height: number,
	bottom: Pt[],
	top: Pt[] = [
		[0, 0],
		[W, 0],
	],
) {
	const edge = [...bottom]
		.reverse()
		.map(([x, y]) => `${x}px ${height - EDGE + y}px`)
	return `polygon(${top.map(([x, y]) => `${x}px ${y}px`).join(', ')}, ${edge.join(', ')})`
}

/** What sits under the paper: how you browse and pick a product to print. */
export type Menu = (props: {
	// A receipt is over it: it's dimmed and out of reach
	covered: boolean
	pick: (product: Product) => void
	// Where focus goes back to once a receipt that had it is torn off
	homeRef: RefObject<HTMLElement | null>
}) => ReactNode

export function TearMachine({ menu }: { menu: Menu }) {
	const [order, setOrder] = useState<Order | null>(null)
	const [fed, setFed] = useState(false)
	const [falling, setFalling] = useState(false)
	const rollRef = useRef<HTMLDivElement>(null)
	const tailRef = useRef<HTMLDivElement>(null)
	const slipRef = useRef<HTMLDivElement>(null)
	const gapRef = useRef<SVGPathElement>(null)
	// The edge the next slip ends on, and the one it will be torn along
	const seams = useRef<{ last: Pt[]; next: Pt[] }>({ last: [], next: [] })
	const side = useRef<Side>('start')
	const torn = useRef(false)
	const base = useRef(0)
	// A drag that starts on the button mustn't end in a click on it
	const panned = useRef(false)
	const pullY = useMotionValue(0)
	const progress = useMotionValue(0)
	const reduce = useReducedMotion()
	const homeRef = useRef<HTMLElement>(null)
	// Focus was on the receipt when it went: hand it back to the menu
	const refocus = useRef(false)

	useLayoutEffect(() => {
		seams.current = { last: jagged(), next: jagged() }
		if (tailRef.current)
			tailRef.current.style.clipPath = tailClip(seams.current.last)
	}, [])

	useEffect(
		() =>
			progress.on('change', (p) =>
				gapRef.current?.setAttribute(
					'd',
					gapPath(seams.current.next, p, side.current),
				),
			),
		[progress],
	)

	const complete = async () => {
		const slip = slipRef.current
		const tail = tailRef.current
		if (!slip || !tail || torn.current) return
		torn.current = true
		setFed(false)
		setFalling(true)
		const { last, next } = seams.current
		// Split along the crack as it stands: the roll keeps the top edge, the
		// slip falls with the bottom one
		const top = next.map(([x, y]): Pt => [x, y + opening(0, 1)])
		tail.style.clipPath = tailClip(next)
		slip.style.clipPath = slipClip(slip.offsetHeight, last, top)
		gapRef.current?.setAttribute('d', '')
		if (reduce) {
			pullY.set(0)
		} else {
			animate(pullY, 0, SPRING_BACK)
			const first = side.current === 'start'
			slip.style.transformOrigin = first ? 'top right' : 'top left'
			// Out through the bottom of the box, gathering speed as it goes
			await animate(
				slip,
				{ y: FALL_DISTANCE, rotate: TILT * (first ? -1 : 1) },
				FALL,
			)
		}
		seams.current = { last: next, next: jagged() }
		progress.jump(0)
		gapRef.current?.setAttribute('d', '')
		torn.current = false
		// The pull button kept focus through the fall; if it still has it,
		// focus follows the menu, not the dialog the demo sits in. Moved
		// elsewhere meanwhile, it stays there.
		refocus.current = slip.contains(document.activeElement)
		setOrder(null)
		setFalling(false)
	}

	// Once the slip is gone and the menu is in reach again. In the same
	// commit that drops the button, before the dialog around the demo finds
	// focus lost and takes it itself.
	useLayoutEffect(() => {
		if (order || !refocus.current) return
		refocus.current = false
		homeRef.current?.focus({ preventScroll: true })
	}, [order])

	// From the button or Escape: the same tear, run for you
	const finish = async (duration = 0.45) => {
		if (torn.current) return
		if (!reduce) {
			await animate(progress, 1, { duration, ease: [0.55, 0, 1, 0.45] })
		}
		complete()
	}
	const closeRef = useReceiptFocus(fed, () => finish())

	const onPanStart = (event: PointerEvent) => {
		panned.current = true
		pullY.stop()
		progress.stop()
		base.current = progress.get()
		// A fresh tear starts at the edge nearest the finger
		if (base.current === 0 && slipRef.current) {
			const rect = slipRef.current.getBoundingClientRect()
			side.current =
				event.clientX - rect.left < rect.width / 2 ? 'start' : 'end'
		}
	}
	const onPan = (_: PointerEvent, info: PanInfo) => {
		if (torn.current) return
		pullY.set(rubberBand(info.offset.y))
		// A tear doesn't heal: let go and pull again, and it carries on
		const p = Math.max(
			progress.get(),
			base.current + Math.max(0, info.offset.y) / TEAR_DISTANCE,
		)
		if (p >= 1) complete()
		else progress.set(p)
	}
	const onPanEnd = (_: PointerEvent, info: PanInfo) => {
		if (torn.current) return
		if (info.velocity.y > TEAR_VELOCITY) finish(0.16)
		else animate(pullY, 0, SPRING_BACK)
	}

	// The slip mounts at the top of the roll: lift it by its height before
	// paint, so its bottom sits exactly where the stub's edge was, then feed
	useLayoutEffect(() => {
		const slip = slipRef.current
		const roll = rollRef.current
		if (!order || !slip || !roll) return
		const height = slip.offsetHeight
		slip.style.clipPath = slipClip(height, seams.current.last)
		const lift = height - EDGE
		roll.style.transform = `translateY(${-lift}px)`
		const controls = animate(
			roll,
			{ y: [-lift, 0] },
			reduce ? { duration: 0 } : FEED,
		)
		controls.then(() => setFed(true))
		return () => controls.stop()
	}, [order, reduce])

	const covered = order !== null && !falling
	const canPull = fed && !reduce

	return (
		<div className='absolute inset-0 overflow-hidden rounded-sm text-foreground'>
			{menu({
				covered,
				pick: (product) => setOrder(makeOrder(product)),
				homeRef,
			})}

			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 bg-foreground transition-opacity duration-300 ease-out-strong'
				style={{ opacity: covered ? DIM / 100 : 0 }}
			/>

			<motion.div
				className='pointer-events-none absolute left-1/2 z-10 drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]'
				style={{ y: pullY, top: STUB, width: W, marginLeft: -W / 2 }}
			>
				<div ref={rollRef} className='relative'>
					<div
						ref={tailRef}
						aria-hidden='true'
						className='absolute inset-x-0 bg-white'
						style={{ top: -TAIL, height: TAIL + EDGE }}
					/>
					{order && (
						<div
							ref={slipRef}
							role='dialog'
							aria-label='Receipt'
							className='relative bg-white select-none'
						>
							<motion.div
								className={`pointer-events-auto ${canPull ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
								onPointerDown={() => {
									panned.current = false
								}}
								onPanStart={canPull ? onPanStart : undefined}
								onPan={canPull ? onPan : undefined}
								onPanEnd={canPull ? onPanEnd : undefined}
							>
								<ReceiptBody
									order={order}
									action={
										<PullButton
											ref={closeRef}
											onClick={() => {
												if (!panned.current) finish()
											}}
											// Still enabled as it falls, so focus stays on it
											// instead of dropping out of the demo
											disabled={!fed && !falling}
											reduce={!!reduce}
										/>
									}
								/>
								<div className='px-6 pb-4'>
									<Dashed />
								</div>
							</motion.div>
						</div>
					)}
					<svg
						aria-hidden='true'
						className='pointer-events-none absolute top-0 left-0 overflow-visible'
						width={W}
						height={EDGE * 2}
					>
						<path ref={gapRef} style={{ fill: DIM_COLOR }} />
					</svg>
				</div>
			</motion.div>
		</div>
	)
}

// The arrow as a thermal printer would print it: a bitmap, one dot per cell
const ARROW = [
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'...##...',
	'#..##..#',
	'##.##.##',
	'.######.',
	'..####..',
	'...##...',
]
const ARROW_DOT = 3

/** The call to pull, printed like the rest of the receipt. Click it to tear. */
function PullButton({
	onClick,
	ref,
	disabled,
	reduce,
}: {
	onClick: () => void
	ref?: Ref<HTMLButtonElement>
	disabled: boolean
	reduce: boolean
}) {
	return (
		<button
			ref={ref}
			onClick={onClick}
			disabled={disabled}
			aria-label='Tear off the receipt'
			className='flex w-full cursor-[inherit] flex-col items-center gap-3 uppercase outline-offset-4'
		>
			<span className='flex w-full items-center gap-3'>
				<span className='flex-1 border-t border-dashed border-foreground/25' />
				<span className='text-[13px] font-bold tracking-[0.3em]'>
					{reduce ? 'Tear' : 'Pull'}
				</span>
				<span className='flex-1 border-t border-dashed border-foreground/25' />
			</span>
			<svg
				aria-hidden='true'
				width={ARROW[0].length * ARROW_DOT}
				height={ARROW.length * ARROW_DOT}
				fill='currentColor'
				shapeRendering='crispEdges'
			>
				{ARROW.flatMap((row, y) =>
					[...row].map((cell, x) =>
						cell === '#' ? (
							<rect
								key={`${x}-${y}`}
								x={x * ARROW_DOT}
								y={y * ARROW_DOT}
								width={ARROW_DOT}
								height={ARROW_DOT}
							/>
						) : null,
					),
				)}
			</svg>
		</button>
	)
}
