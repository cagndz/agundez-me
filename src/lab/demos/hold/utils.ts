import { useId } from 'react'

/** An id an SVG url(#…) reference accepts: useId may return colons. */
export function useSvgId(prefix: string) {
	return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
}
