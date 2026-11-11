// The pending voice notes. Each one is written as its transcript; the
// timing of every word, the waveform and the length all come from the
// words, so the highlight and the bars agree.

export type Word = { text: string; start: number; end: number }

export type Note = {
	id: string
	name: string
	initials: string
	chat: string
	received: string
	// The avatar's gradient: a light bloom top left, a deep pool bottom
	// right, over a base. Three tones of one hue, never two hues.
	tint: { light: string; base: string; deep: string }
	words: Word[]
	duration: number // seconds
	bars: number[] // 0–1, ten per second
}

const BARS_PER_SECOND = 10

const RAW = [
	{
		id: 'jordi',
		tint: { light: '#ffd9b8', base: '#d9774f', deep: '#9c3f2a' },
		name: 'Jordi',
		initials: 'J',
		chat: 'Jordi Vidal',
		received: '9:41',
		text: 'Hey! The client loved the second option. They only want the logo a bit bigger, and the green slightly warmer. Can you send it by Friday?',
	},
	{
		id: 'marta',
		tint: { light: '#f1d3ef', base: '#9b6fc4', deep: '#553a8f' },
		name: 'Marta',
		initials: 'M',
		chat: 'Marta Ruiz',
		received: '10:02',
		text: 'Okay, so I talked to the venue. We can have the terrace until midnight, but they need the final number of guests by Thursday.',
	},
	{
		id: 'pau',
		tint: { light: '#d8ecc9', base: '#5c9a82', deep: '#2b5f5c' },
		name: 'Pau',
		initials: 'P',
		chat: 'Climbing Saturday',
		received: '10:15',
		text: 'Rain all morning, so let’s move it to the gym. Eleven o’clock, and I’ll bring the spare shoes.',
	},
	{
		id: 'lucia',
		tint: { light: '#d6e6f7', base: '#5f86c4', deep: '#2f4a8a' },
		name: 'Lucía',
		initials: 'L',
		chat: 'Family',
		received: '12:04',
		text: 'Grandma wants to know if you’re coming on Sunday. She’s making the lemon cake, so don’t be late this time!',
	},
]

// Deterministic pseudo-random: server and browser build the same notes
function seeded(seed: number) {
	let s = seed
	return () => {
		s = (s * 16807) % 2147483647
		return (s - 1) / 2147483646
	}
}

const round = (n: number) => Math.round(n * 100) / 100

function time(text: string, seed: number) {
	const rand = seeded(seed)
	const words: Word[] = []
	let t = 0.35
	for (const text_ of text.split(' ')) {
		const letters = text_.replace(/[^\p{L}]/gu, '').length
		const length = (0.12 + 0.052 * letters) * (0.85 + 0.3 * rand())
		words.push({ text: text_, start: round(t), end: round(t + length) })
		t += length + 0.05
		if (/[,;]$/.test(text_)) t += 0.24
		if (/[.!?]$/.test(text_)) t += 0.42
	}
	return { words, duration: round(t + 0.15) }
}

// Syllable bursts inside words, near-silence between them
function waveform(words: Word[], duration: number, seed: number) {
	const rand = seeded(seed)
	const count = Math.ceil(duration * BARS_PER_SECOND)
	const bars: number[] = []
	let w = 0
	for (let i = 0; i < count; i++) {
		const at = (i + 0.5) / BARS_PER_SECOND
		while (w < words.length - 1 && at > words[w].end) w++
		const word = words[w]
		if (at < word.start || at > word.end) {
			bars.push(0.06)
			continue
		}
		const letters = word.text.replace(/[^\p{L}]/gu, '').length
		const syllables = Math.max(1, Math.round(letters / 3))
		const phase = ((at - word.start) / (word.end - word.start)) * syllables
		const burst = Math.abs(Math.sin(Math.PI * phase))
		bars.push(round(0.35 + 0.65 * burst * (0.65 + 0.35 * rand())))
	}
	return bars
}

export const NOTES: Note[] = RAW.map(({ text, ...note }, i) => {
	const { words, duration } = time(text, i * 7919 + 17)
	return {
		...note,
		words,
		duration,
		bars: waveform(words, duration, i * 104729 + 3),
	}
})

export function formatTime(seconds: number) {
	const s = Math.max(0, Math.ceil(seconds - 0.05))
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** The bars squeezed or stretched to a fixed count, keeping each span's peak. */
export function resample(bars: number[], count: number) {
	return Array.from({ length: count }, (_, i) => {
		const from = Math.floor((i / count) * bars.length)
		const to = Math.max(from + 1, Math.floor(((i + 1) / count) * bars.length))
		let peak = 0
		for (let j = from; j < to; j++) peak = Math.max(peak, bars[j])
		return peak
	})
}

/** How many words have started by this time. */
export function spokenAt(words: Word[], at: number) {
	let n = 0
	while (n < words.length && words[n].start <= at) n++
	return n
}
