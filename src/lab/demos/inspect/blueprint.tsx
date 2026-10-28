import {
	BOX_MEASURES,
	DIMENSION_MEASURES,
	LABEL_LINE_HEIGHT,
	NOTE_MEASURES,
} from './constants'
import { DimensionLine } from './dimension'
import type { Note } from './types'

// Where a note sits relative to its (x, y): starting there, or ending there.
// Full class names, so Tailwind can find them.
const NOTE_SHIFT: Record<Note['align'], string> = {
	left: '',
	right: '-translate-x-full',
}

export function Blueprint() {
	return (
		<div className='absolute inset-0 rounded-[inherit] bg-[#1a1a18] bg-[radial-gradient(circle,rgba(236,236,234,0.08)_0.8px,transparent_1.2px)] bg-size-[8px_8px] bg-position-[4px_4px]'>
			{BOX_MEASURES.map((box) => (
				<span
					key={box.name}
					className='absolute inset-ring inset-ring-[rgba(236,236,234,0.4)]'
					style={{
						left: box.x,
						top: box.y,
						width: box.width,
						height: box.height,
						borderRadius: box.radius,
					}}
				></span>
			))}
			{DIMENSION_MEASURES.map((dimension) => (
				<DimensionLine key={dimension.name} dimension={dimension} />
			))}
			{NOTE_MEASURES.map((note) => (
				<span
					key={note.name}
					className={`absolute font-mono text-[9px] tracking-[0.06em] whitespace-nowrap text-[rgba(236,236,234,0.75)] ${NOTE_SHIFT[note.align]}`}
					style={{
						left: note.x,
						top: note.y,
						lineHeight: `${LABEL_LINE_HEIGHT}px`,
					}}
				>
					{note.text}
				</span>
			))}
		</div>
	)
}
