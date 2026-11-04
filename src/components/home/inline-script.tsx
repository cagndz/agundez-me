// A script that runs as the page's HTML is read, before the first paint,
// and never on a client-side navigation: rendered in the browser it is
// plain text (which also keeps React from warning about script tags).

export function InlineScript({ html }: { html: string }) {
	return (
		<script
			type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
			suppressHydrationWarning
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
