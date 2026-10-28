import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllPosts } from '@/lib/writing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getAllPosts()

	return [
		{ url: SITE_URL, lastModified: posts[0]?.meta.date },
		{ url: `${SITE_URL}/lab` },
		...posts.map(({ slug, meta }) => ({
			url: `${SITE_URL}/writing/${slug}`,
			lastModified: meta.date,
		})),
	]
}
