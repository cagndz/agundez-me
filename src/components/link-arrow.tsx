import { ArrowRight } from './icons/arrow-right'
import { ArrowUpRight } from './icons/arrow-up-right'

// Each arrow starts where it "comes from": ↗ from bottom-left, → from the left.
// Full class strings (no interpolation) so Tailwind can detect them.
const restOffset = {
	external: '-translate-x-1 translate-y-1',
	internal: '-translate-x-1.5',
}

// Fades in and settles into place when its `group/link` parent is hovered or focused.
export function LinkArrow({ external = false }: { external?: boolean }) {
	const Icon = external ? ArrowUpRight : ArrowRight

	return (
		<Icon
			className={`mt-1.5 size-3.5 shrink-0 text-muted opacity-0 transition-[opacity,translate,color] duration-100 ease-out-strong group-hover/link:translate-0 group-hover/link:text-foreground group-hover/link:opacity-100 group-hover/link:duration-150 group-focus-visible/link:translate-0 group-focus-visible/link:text-foreground group-focus-visible/link:opacity-100 motion-reduce:translate-0 pointer-coarse:translate-0 pointer-coarse:opacity-50 ${restOffset[external ? 'external' : 'internal']}`}
		/>
	)
}
