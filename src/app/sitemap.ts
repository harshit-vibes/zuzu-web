import type { MetadataRoute } from 'next'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1, idle_timeout: 20 })

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courseRows = await sql`
    SELECT slug FROM nodes
    WHERE type = 'group' AND parent_id IS NULL
    ORDER BY ordering
  `
  return [
    { url: 'https://zuzu.codes', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://zuzu.codes/learn', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...courseRows.map(r => ({
      url: `https://zuzu.codes/learn/${r.slug}`,
      lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9,
    })),
  ]
}
