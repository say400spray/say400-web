import { revalidateTag, unstable_cache } from 'next/cache'
import type { CollectionConfig, GlobalConfig } from 'payload'

/** Everything editable in the admin: products, reviews, pages, videos, media, settings. */
export const CONTENT_TAG = 'cms'
/** Free sample requests (the "x of 500 left" counter). */
export const SAMPLES_TAG = 'samples'

/**
 * Runs a public content query once and serves the result from Vercel's data cache, so pages
 * stay fast without asking the database on every visit. Saving in the admin clears the cache
 * (see refreshContent), and an hour is the longest anything can be stale.
 * Only for data that is the same for every visitor: never pass anything customer-specific.
 */
export function cached<T>(key: (string | number)[], query: () => Promise<T>, tags = [CONTENT_TAG]) {
  return unstable_cache(query, key.map(String), { tags, revalidate: 3600 })()
}

/** Clears cached content, so the site shows a change on the next visit. */
export function refreshContent(tag = CONTENT_TAG) {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch {
    // outside a Next.js request (seed scripts, migrations) there is no cache to clear
  }
}

const refreshHook =
  (tag: string) =>
  ({ doc }: { doc: unknown }) => {
    refreshContent(tag)
    return doc
  }

/** A collection whose saves and deletes clear the cached content shown on the site. */
export function refreshesCollection(config: CollectionConfig, tag = CONTENT_TAG): CollectionConfig {
  const hooks = config.hooks ?? {}
  return {
    ...config,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), refreshHook(tag)],
      afterDelete: [...(hooks.afterDelete ?? []), refreshHook(tag)],
    },
  }
}

/** A global (settings) whose saves clear the cached content shown on the site. */
export function refreshesGlobal(config: GlobalConfig): GlobalConfig {
  const hooks = config.hooks ?? {}
  return {
    ...config,
    hooks: { ...hooks, afterChange: [...(hooks.afterChange ?? []), refreshHook(CONTENT_TAG)] },
  }
}
