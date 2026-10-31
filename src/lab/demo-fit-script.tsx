'use client'

import { useSyncExternalStore } from 'react'
import { applyFit } from './fit'

// Runs while the browser reads the HTML, before the first paint and before
// React hydrates, so server-rendered demos never show at full size first.
// Inline scripts wait for the page's stylesheets, so the sizes it reads are
// the final ones. After hydration, DemoFit's ResizeObserver takes over.
const script = `document.querySelectorAll('[data-demo-fit]').forEach(function (box) {
	var demo = box.firstElementChild
	if (demo) (${applyFit.toString()})(box, demo)
})`

// Nothing to subscribe to: the answer never changes after the first render
const subscribe = () => () => {}

/** Place it right after the last server-rendered DemoFit. */
export function DemoFitScript() {
	// Only the server's HTML, and its hydration, get the script. Rendered on
	// the client, after navigating here with a <Link>, a script never runs
	// (React warns about it), and DemoFit already fits the demos itself.
	const fromServer = useSyncExternalStore(
		subscribe,
		() => false,
		() => true,
	)
	if (!fromServer) return null
	return <script dangerouslySetInnerHTML={{ __html: script }} />
}
