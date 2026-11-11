'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
	AnimatePresence,
	LayoutGroup,
	motion,
	useReducedMotion,
	useSpring,
	type Variants,
} from 'motion/react'
import {
	DETAILS,
	DETAILS_IN,
	DETAILS_OUT,
	DROP,
	FACE,
	FADE,
	GAP,
	INSTANT,
	LINE,
	LINES,
	MORPH,
	CUT,
	FAN,
	OVERLAP,
	PAD,
	PLAY,
	RADIUS,
	RING,
	RING_GAP,
	RING_ROOM,
	RING_WIDTH,
	ROW,
	SEEK,
	SHADOW,
	SHIFT,
	SIZE,
	SPAN,
	STRIP,
	SWAP_IN,
	SWAP_OUT,
	WIDTH,
} from './constants'
import { useDismiss, useQueue } from './hooks'
import { formatTime } from './notes'
import { Avatar, CheckIcon, NextIcon, PauseIcon, PlayIcon } from './parts'
import { Scrubber } from './scrubber'
import { Transcript } from './transcript'

// Voice notes from every chat, stacked in one island instead of scattered
// across conversations. Idle, it's a play button and the faces waiting.
// Tap a face (or play) and the island grows down out of that same row:
// who's talking, what they're saying lit word by word, a waveform to
// scrub. The row stays put the whole time, a ring marking who's playing,
// and each new person comes in from their side of it. Tap anywhere else,
// or Escape, and it pauses and folds back up into the row.

const RATES = [1, 1.5, 2]

// The notch: everything but a circle at (--cut-x, middle) of radius --cut-r
const NOTCH =
	'radial-gradient(circle at calc(var(--cut-x) * 1px) 50%, transparent calc(var(--cut-r) * 1px), #000 calc(var(--cut-r) * 1px + 0.5px))'

export function Voice() {
	const reduceMotion = useReducedMotion()
	const q = useQueue()
	// The faces in the row while it's open: whoever was pending when it
	// opened. Heard ones stay, dimmed, so nobody shifts under your finger;
	// they leave when it folds.
	const [session, setSession] = useState<string[] | null>(null)
	const [fanned, setFanned] = useState(false)
	const expanded = session !== null && !q.done
	const island = useRef<HTMLDivElement>(null)
	const group = useId()

	useDismiss(expanded, island, () => {
		q.pause()
		setSession(null)
	})

	// The playhead the eye follows: the clock through a spring, so seeks
	// glide. A new note or a drag jumps instead. Offset by note (SPAN).
	const shown = useSpring(0, SEEK)
	const dragging = useRef(false)
	const lastIndex = useRef(q.index)
	const offset = q.index * SPAN
	useEffect(() => {
		const at = q.index * SPAN + q.time
		if (lastIndex.current !== q.index || dragging.current || reduceMotion) {
			shown.jump(at)
		} else shown.set(at)
		lastIndex.current = q.index
	}, [q.index, q.time, reduceMotion, shown])

	function open(index?: number) {
		setSession(q.pending.map((n) => n.id))
		if (index === undefined) q.play()
		else q.playAt(index)
	}

	function onPlay() {
		if (!expanded) open()
		else if (q.playing) q.pause()
		else q.play()
	}

	function onFace(index: number) {
		if (!expanded) open(index)
		else if (index !== q.index) q.playAt(index)
		else if (q.playing) q.pause()
		else q.play()
	}

	const row = expanded
		? q.notes.filter((n) => session.includes(n.id))
		: q.pending
	const morph = reduceMotion ? INSTANT : MORPH

	// Space before the face at position k in the row: stacked, fanned, or
	// with room for the ring when the face before it (or it) is playing
	function gapBefore(k: number) {
		const base = fanned ? FAN : OVERLAP
		const isCurrent = (n: (typeof row)[number] | undefined) =>
			n !== undefined && expanded && q.notes.indexOf(n) === q.index
		if (isCurrent(row[k - 1])) return Math.max(base, FAN) + RING_ROOM
		if (fanned && isCurrent(row[k])) return FAN + RING_ROOM
		return base
	}

	return (
		<LayoutGroup id={group}>
			<div
				className='flex justify-center font-sans normal-case **:outline-[#f4f4f2]'
				style={SIZE}
			>
				<motion.div
					ref={island}
					layout
					transition={morph}
					className='self-start overflow-hidden bg-foreground text-[#f4f4f2]'
					style={{
						borderRadius: RADIUS,
						boxShadow: SHADOW,
						width: expanded ? WIDTH : 'auto',
					}}
				>
					{/* The row: the same idle and open, so the island grows out of it.
					    Open, it settles to the left edge, the play button snug in the
					    corner (8px all round, the radius minus its own) */}
					<motion.div
						layout='position'
						transition={morph}
						className={`flex items-center gap-3 px-2 ${expanded ? 'justify-start' : 'justify-center'}`}
						style={{ height: ROW }}
					>
						{q.done ? (
							<button
								type='button'
								onClick={() => {
									q.reset()
									setSession(null)
								}}
								className='flex h-10 cursor-pointer items-center gap-2.5 rounded-full pr-4 text-[14px] font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:-outline-offset-2'
							>
								<span className='grid size-10 place-items-center rounded-full bg-[#f4f4f2]/10'>
									<CheckIcon />
								</span>
								All caught up
							</button>
						) : (
							<>
								<motion.button
									layout='position'
									transition={morph}
									type='button'
									onClick={onPlay}
									aria-label={
										expanded
											? q.playing
												? 'Pause'
												: 'Play'
											: `Play ${q.pending.length} voice notes`
									}
									whileTap={{ scale: 0.94 }}
									className='grid shrink-0 cursor-pointer place-items-center rounded-full bg-[#f4f4f2] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2'
									style={{ width: PLAY, height: PLAY }}
								>
									{expanded && q.playing ? (
										<PauseIcon size={14} />
									) : (
										<PlayIcon size={14} />
									)}
								</motion.button>

								<div
									className='flex items-center'
									onPointerEnter={(e) =>
										e.pointerType === 'mouse' && setFanned(true)
									}
									onPointerLeave={() => setFanned(false)}
									onFocus={() => setFanned(true)}
									onBlur={(e) => {
										if (!e.currentTarget.contains(e.relatedTarget))
											setFanned(false)
									}}
								>
									<AnimatePresence initial={false} mode='popLayout'>
										{row.map((note, k) => {
											const index = q.notes.indexOf(note)
											const current = expanded && index === q.index
											const heard = q.heard.includes(note.id) && !current
											const veil = !expanded || current ? 0 : heard ? 0.7 : 0.45
											const next = row[k + 1]
											const nextIsCurrent =
												next !== undefined &&
												expanded &&
												q.notes.indexOf(next) === q.index
											// The notch the next face cuts into this one, in this
											// face's own coordinates. No next face: nothing to cut.
											const cutX =
												next === undefined
													? FACE * 4
													: FACE + gapBefore(k + 1) + FACE / 2
											const cutR =
												FACE / 2 + CUT + (nextIsCurrent ? RING_ROOM : 0)
											return (
												<motion.button
													key={note.id}
													layout
													type='button'
													onClick={() => onFace(index)}
													aria-label={
														current
															? `${note.name}, ${q.playing ? 'pause' : 'play'}`
															: `Play ${note.name}’s voice note`
													}
													aria-current={current ? 'true' : undefined}
													initial={{ opacity: 0, scale: 0.6 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.5 }}
													whileTap={{ scale: 0.92 }}
													transition={{ layout: morph, default: FADE }}
													className='group/face relative cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4'
													style={{
														zIndex: k + 1,
														marginLeft: k === 0 ? 0 : gapBefore(k),
													}}
												>
													<motion.span
														className='relative block rounded-full'
														initial={false}
														animate={{ '--cut-x': cutX, '--cut-r': cutR }}
														transition={morph}
														style={{
															maskImage: NOTCH,
															WebkitMaskImage: NOTCH,
														}}
													>
														<Avatar note={note} size={FACE} />
														{/* Dimmed with a veil, lifted on hover */}
														<span
															aria-hidden='true'
															className='pointer-events-none absolute inset-0 rounded-full bg-foreground opacity-(--veil) transition-opacity duration-200 ease-out-strong group-hover/face:opacity-0'
															style={{ '--veil': veil } as React.CSSProperties}
														/>
													</motion.span>
													{current && (
														<motion.span
															layoutId='ring'
															aria-hidden='true'
															initial={{ opacity: 0, scale: 0.85 }}
															animate={{ opacity: 1, scale: 1 }}
															transition={reduceMotion ? INSTANT : RING}
															className='pointer-events-none absolute rounded-full border-[#f4f4f2]'
															style={{
																inset: -(RING_GAP + RING_WIDTH),
																borderWidth: RING_WIDTH,
															}}
														/>
													)}
												</motion.button>
											)
										})}
									</AnimatePresence>
								</div>
							</>
						)}
					</motion.div>

					{/* The details, grown down out of the row */}
					<AnimatePresence initial={false} mode='popLayout'>
						{expanded && (
							<motion.div
								key='details'
								layout='position'
								initial={{ opacity: 0, y: -DROP }}
								animate={{
									opacity: 1,
									y: 0,
									transition: reduceMotion ? INSTANT : DETAILS_IN,
								}}
								exit={{
									opacity: 0,
									y: -DROP / 2,
									transition: reduceMotion ? INSTANT : DETAILS_OUT,
								}}
								className='flex flex-col'
								style={{
									width: WIDTH,
									height: DETAILS,
									padding: `4px ${PAD}px ${PAD}px`,
									gap: GAP,
								}}
							>
								{/* Who's talking */}
								<div className='relative' style={{ height: STRIP }}>
									<Swap id={q.current.id} direction={q.direction}>
										<div className='flex h-full items-baseline gap-2 pt-1.5 pr-14'>
											<p className='shrink-0 text-[15px] font-medium'>
												{q.current.name}
											</p>
											<p className='truncate text-[12px] text-[#f4f4f2]/45'>
												{q.current.chat === q.current.name ||
												q.current.chat.startsWith(q.current.name)
													? q.current.received
													: `${q.current.chat} · ${q.current.received}`}
											</p>
										</div>
									</Swap>
									<button
										type='button'
										onClick={() =>
											q.setRate(
												RATES[(RATES.indexOf(q.rate) + 1) % RATES.length],
											)
										}
										aria-label={`Playback speed ${q.rate}×`}
										className='absolute top-0 right-0 h-8 min-w-10 cursor-pointer rounded-full px-2 font-mono text-[11px] text-[#f4f4f2]/50 tabular-nums transition-colors duration-150 ease-out-strong hover:bg-[#f4f4f2]/8 hover:text-[#f4f4f2] focus-visible:outline-2 focus-visible:-outline-offset-2'
									>
										{q.rate}×
									</button>
								</div>

								{/* What they're saying */}
								<div className='relative' style={{ height: LINE * LINES }}>
									<Swap id={q.current.id} direction={q.direction}>
										<Transcript
											note={q.current}
											shown={shown}
											offset={offset}
										/>
									</Swap>
								</div>

								{/* Where in it */}
								<div
									className='flex items-center gap-3'
									style={{ height: STRIP }}
								>
									<div className='relative h-8 flex-1'>
										<Swap id={q.current.id} direction={q.direction}>
											<Scrubber
												note={q.current}
												time={q.time}
												shown={shown}
												offset={offset}
												draggingRef={dragging}
												onSeek={q.seek}
											/>
										</Swap>
									</div>
									<span className='w-9 shrink-0 text-right font-mono text-[11px] text-[#f4f4f2]/45 tabular-nums'>
										-{formatTime(q.current.duration - q.time)}
									</span>
									<button
										type='button'
										onClick={q.next}
										aria-label={q.upNext ? `Next: ${q.upNext.name}` : 'Finish'}
										className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#f4f4f2]/60 transition-colors duration-150 ease-out-strong hover:bg-[#f4f4f2]/8 hover:text-[#f4f4f2] focus-visible:outline-2 focus-visible:-outline-offset-2 active:scale-[0.94]'
									>
										<NextIcon />
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</LayoutGroup>
	)
}

/**
 * One person's content handing over to the next, in a box that keeps its
 * size. The new one slides in from their side of the row.
 */
function Swap({
	id,
	direction,
	children,
}: {
	id: string
	direction: 1 | -1
	children: React.ReactNode
}) {
	const reduceMotion = useReducedMotion()
	const shift = reduceMotion ? 0 : SHIFT
	const variants: Variants = {
		enter: (d: number) => ({ opacity: 0, x: d * shift, filter: 'blur(2px)' }),
		center: {
			opacity: 1,
			x: 0,
			filter: 'blur(0px)',
			transition: reduceMotion ? INSTANT : SWAP_IN,
		},
		exit: (d: number) => ({
			opacity: 0,
			x: -d * shift,
			filter: 'blur(2px)',
			transition: reduceMotion ? INSTANT : SWAP_OUT,
		}),
	}
	return (
		<AnimatePresence initial={false} custom={direction}>
			<motion.div
				key={id}
				custom={direction}
				variants={variants}
				initial='enter'
				animate='center'
				exit='exit'
				className='absolute inset-0'
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
