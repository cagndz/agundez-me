import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
	pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
	// The list of notes lives on the home page.
	async redirects() {
		return [{ source: '/writing', destination: '/', permanent: true }]
	},
}

const withMDX = createMDX({
	options: {
		// Turbopack needs plugins by name (string) with serializable options.
		rehypePlugins: [['rehype-pretty-code', { theme: 'github-light-default' }]],
	},
})

export default withMDX(nextConfig)
