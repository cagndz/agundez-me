import { applyFit } from './fit'

// Runs while the browser reads the HTML, before the first paint and before
// React hydrates, so server-rendered demos never show at full size first.
// Inline scripts wait for the page's stylesheets, so the sizes it reads are
// the final ones. After hydration, DemoFit's ResizeObserver takes over.
const script = `document.querySelectorAll('[data-demo-fit]').forEach(function (box) {
	var demo = box.firstElementChild
	if (demo) (${applyFit.toString()})(box, demo)
})`

/** Place it right after the last server-rendered DemoFit. */
export function DemoFitScript() {
	return <script dangerouslySetInnerHTML={{ __html: script }} />
}
