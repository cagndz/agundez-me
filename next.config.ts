import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
	pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
	options: {
		// Turbopack needs plugins by name (string) with serializable options.
		rehypePlugins: [['rehype-pretty-code', { theme: 'vitesse-light' }]],
	},
})

export default withMDX(nextConfig)
