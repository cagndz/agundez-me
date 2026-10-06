// Grid size. Odd numbers so the label can be centered on a middle cell.
export const COLS = 49
export const ROWS = 13
export const TOTAL = COLS * ROWS

// Width of the soft edge, as a fraction of the progress (0 to 1).
// Higher = more dots are half-lit at the same time.
export const SOFTNESS = 0.2

// How scattered the lighting order is: 0 = left to right (a wave), 1 = pure random.
export const NOISE = 0.3
// Same seed = same pattern on the server and in the browser.
export const SEED = 7

// Letters as 5x7 bitmaps. X = dark dot.
export const GLYPHS: Record<string, string[]> = {
	H: ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
	O: ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
	L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
	D: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
	N: ['X...X', 'XX..X', 'X.X.X', 'X.X.X', 'X..XX', 'X...X', 'X...X'],
	E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
}

// Turns a word into a list of TOTAL booleans: true = this dot is part of a letter.
// Dots fill column by column (grid-flow-col), so index = column * ROWS + row.
export function buildInk(word: string) {
	const ink = new Array<boolean>(TOTAL).fill(false)
	const letterWidth = 5
	const letterGap = 1
	const wordWidth = word.length * letterWidth + (word.length - 1) * letterGap
	const startColumn = Math.floor((COLS - wordWidth) / 2)
	const startRow = Math.floor((ROWS - 7) / 2)
	;[...word].forEach((letter, letterIndex) => {
		GLYPHS[letter].forEach((line, row) => {
			;[...line].forEach((char, col) => {
				if (char !== 'X') return
				const column =
					startColumn + letterIndex * (letterWidth + letterGap) + col
				ink[column * ROWS + startRow + row] = true
			})
		})
	})
	return ink
}

export const INK_IDLE = buildInk('HOLD')
export const INK_CONFIRMED = buildInk('DONE')

// Small seeded random number generator (mulberry32).
function createRandom(seed: number) {
	let a = seed
	return () => {
		let t = (a += 0x6d2b79f5)
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// For every dot, when it lights up along the hold: 0 (first) to 1 (last).
export function buildOrder() {
	const random = createRandom(SEED)
	const scored = Array.from({ length: TOTAL }, (_, i) => {
		const column = Math.floor(i / ROWS)
		const bias = column / (COLS - 1)
		return { i, score: (1 - NOISE) * bias + NOISE * random() }
	})
	scored.sort((a, b) => a.score - b.score)
	const order = new Array<number>(TOTAL)
	scored.forEach(({ i }, rank) => {
		order[i] = rank / (TOTAL - 1)
	})
	return order
}

export const ORDER = buildOrder()
