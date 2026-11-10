// The name, in the list's own face: lowercase like every row, a step up
// from it (20 on 24) and heavier, the letters drawn in a little (a
// monospaced face spaces them for code, not for a name), and nudged left
// by its side bearing so its first stroke lines up with the rows below.
// Under it, what he does, a step down, in the secondary tone: the ink at
// 75%, the least that keeps small text at 4.5:1 on the paper (WCAG AA).
export function Name() {
	return (
		<header>
			<h1 className='home-name -ml-[0.04em] text-[20px] leading-6 font-semibold tracking-[-0.03em]'>
				carlos agúndez
			</h1>
			<p className='home-sub text-[11px] leading-4 text-(--ink)/75'>
				design engineer, spain
			</p>
		</header>
	)
}
