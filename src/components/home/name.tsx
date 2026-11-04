import { Unbounded } from 'next/font/google'

// The name's face: a wide grotesque with round shoulders and a
// single-storey "g". The rest of the page is in Geist Mono, from the site.
const unbounded = Unbounded({
	subsets: ['latin'],
	weight: '700',
	display: 'swap',
})

// The name in two lowercase lines, as large as the page's scale allows:
// 55 on a phone up to 233, 6.6% of the screen's width between, and never
// wider than the screen ("agúndez" is 5.17 ems wide in Unbounded at this
// tracking, so its size is capped at the width over 5.5).

const NAME_SIZE = 'min(233px, max(55px, 6.6vw), calc((100vw - 48px) / 5.5))'

export function Name({
	as: Tag = 'h1',
}: {
	// The page's heading, or a picture of it (the intro's copy)
	as?: 'h1' | 'div'
}) {
	return (
		<Tag
			aria-label={Tag === 'h1' ? 'Carlos Agúndez' : undefined}
			aria-hidden={Tag === 'div' ? true : undefined}
			style={{ fontSize: NAME_SIZE }}
			className={`${unbounded.className} leading-[0.9] font-bold tracking-[-0.04em]`}
		>
			{['carlos', 'agúndez'].map((line) => (
				<span key={line} aria-hidden='true' className='block'>
					{line}
				</span>
			))}
		</Tag>
	)
}
