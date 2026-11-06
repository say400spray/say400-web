import type { Video } from '../payload-types'

/** What the landing page needs to show one video. */
export interface VideoItem {
  id: number
  title: string
  caption: string | null
  orientation: 'portrait' | 'landscape'
  featured: boolean
  /** uploaded file, played inline */
  src: string | null
  poster: string | null
  /** YouTube / Vimeo player URL, loaded only after the visitor clicks play */
  embedUrl: string | null
  /** any other link (Instagram, TikTok...) opens in a new tab */
  externalUrl: string | null
  platform: string | null
}

function parseLink(url: string): { embedUrl: string | null; platform: string | null } {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { embedUrl: null, platform: null }
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')

  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const id =
      host === 'youtu.be'
        ? u.pathname.slice(1)
        : (u.searchParams.get('v') ??
          u.pathname.match(/\/(shorts|embed|live)\/([\w-]+)/)?.[2] ??
          null)
    return {
      platform: 'YouTube',
      // privacy-enhanced domain: no tracking cookies until the visitor plays
      embedUrl: id
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
        : null,
    }
  }
  if (host.endsWith('vimeo.com')) {
    const id = u.pathname.match(/(\d+)/)?.[1]
    return {
      platform: 'Vimeo',
      embedUrl: id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : null,
    }
  }
  if (host.endsWith('instagram.com')) return { platform: 'Instagram', embedUrl: null }
  if (host.endsWith('tiktok.com')) return { platform: 'TikTok', embedUrl: null }
  return { platform: null, embedUrl: null }
}

export function toVideoItem(video: Video): VideoItem {
  const poster =
    typeof video.poster === 'object' && video.poster ? (video.poster.url ?? null) : null
  const link = !video.url && video.externalUrl ? parseLink(video.externalUrl) : null
  return {
    id: video.id,
    title: video.title,
    caption: video.caption ?? null,
    orientation: video.orientation === 'landscape' ? 'landscape' : 'portrait',
    featured: Boolean(video.featured),
    src: video.url ?? null,
    poster,
    embedUrl: link?.embedUrl ?? null,
    externalUrl: link && !link.embedUrl ? (video.externalUrl ?? null) : null,
    platform: link?.platform ?? null,
  }
}
