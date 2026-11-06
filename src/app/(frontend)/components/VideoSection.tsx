'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { readConsent } from '@/lib/consent'
import type { VideoItem } from '@/lib/videos'

/** Muted previews only autoplay when the visitor is fine with motion and data. */
function canAutoplayPreviews(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !connection?.saveData
}

function PlayIcon() {
  return (
    <span aria-hidden className="play-button">
      <svg viewBox="0 0 24 24">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
      </svg>
    </span>
  )
}

/** One video thumbnail; uploaded videos play a silent loop while on screen. */
function VideoCard({
  video,
  large,
  onOpen,
}: {
  video: VideoItem
  large?: boolean
  onOpen: () => void
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !canAutoplayPreviews()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => undefined)
        else el.pause()
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const content = (
    <>
      {video.src ? (
        <video
          className="video-media"
          loop
          muted
          playsInline
          poster={video.poster ?? undefined}
          preload="metadata"
          ref={ref}
          // #t= shows the first frame when there is no poster
          src={video.poster ? video.src : `${video.src}#t=0.1`}
        />
      ) : video.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="video-media" src={video.poster} />
      ) : (
        <span className="video-media video-placeholder">{video.platform ?? 'Video'}</span>
      )}
      <span className="video-shade" />
      <PlayIcon />
      <span className="video-info">
        {video.platform && !video.src && <span className="video-platform">{video.platform}</span>}
        <span className="video-title">{video.title}</span>
        {video.caption && <span className="video-caption">{video.caption}</span>}
      </span>
    </>
  )

  const className = `video-card video-${large ? 'featured' : video.orientation}`

  // links we cannot embed (Instagram, TikTok) open on their own site
  if (video.externalUrl) {
    return (
      <a
        className={className}
        data-spotlight
        href={video.externalUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    )
  }
  return (
    <button
      aria-label={`Play video: ${video.title}`}
      className={className}
      data-spotlight
      onClick={onOpen}
      type="button"
    >
      {content}
    </button>
  )
}

/** Full-screen player. Third-party players (YouTube, Vimeo) load only after an explicit click. */
function VideoModal({
  videos,
  index,
  onClose,
  onMove,
}: {
  videos: VideoItem[]
  index: number | null
  onClose: () => void
  onMove: (delta: number) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [embedAllowed, setEmbedAllowed] = useState(false)
  const video = index == null ? null : videos[index]

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (video && !el.open) el.showModal()
    if (!video && el.open) el.close()
  }, [video])

  useEffect(() => {
    setEmbedAllowed(Boolean(readConsent()?.marketing))
  }, [index])

  useEffect(() => {
    if (!video) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onMove(1)
      if (e.key === 'ArrowLeft') onMove(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [video, onMove])

  return (
    <dialog
      aria-label={video?.title ?? 'Video'}
      className="video-modal"
      onClick={(e) => e.target === dialog.current && onClose()}
      onClose={onClose}
      ref={dialog}
    >
      {video && (
        <div className={`video-modal-inner video-modal-${video.orientation}`}>
          {video.src ? (
            <video
              autoPlay
              className="video-modal-media"
              controls
              key={video.id}
              playsInline
              poster={video.poster ?? undefined}
              src={video.src}
            />
          ) : video.embedUrl && embedAllowed ? (
            <iframe
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="video-modal-media"
              key={video.id}
              src={video.embedUrl}
              title={video.title}
            />
          ) : (
            <div className="video-modal-media video-consent">
              <p>
                This video is hosted on {video.platform}, which may set its own cookies when it
                plays.
              </p>
              <button className="btn btn-gold" onClick={() => setEmbedAllowed(true)} type="button">
                Play video
              </button>
            </div>
          )}
          <p className="video-modal-title">{video.title}</p>
        </div>
      )}
      <button
        aria-label="Close video"
        className="video-modal-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      {videos.length > 1 && (
        <>
          <button
            aria-label="Previous video"
            className="video-modal-nav prev"
            onClick={() => onMove(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Next video"
            className="video-modal-nav next"
            onClick={() => onMove(1)}
            type="button"
          >
            ›
          </button>
        </>
      )}
    </dialog>
  )
}

export function VideoSection({ videos }: { videos: VideoItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ left: false, right: false })

  const featured = videos.find((v) => v.featured) ?? null
  const others = videos.filter((v) => v !== featured)
  // the modal steps through only the videos it can play here
  const playable = videos.filter((v) => !v.externalUrl)

  const openVideo = (video: VideoItem) => setOpen(playable.indexOf(video))
  const move = useCallback(
    (delta: number) =>
      setOpen((i) => (i == null ? i : (i + delta + playable.length) % playable.length)),
    [playable.length],
  )

  const updateArrows = useCallback(() => {
    const el = rail.current
    if (!el) return
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [updateArrows])

  const scrollRail = (direction: number) => {
    const el = rail.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <>
      {featured && (
        <div className="video-featured-wrap" data-reveal>
          <VideoCard large onOpen={() => openVideo(featured)} video={featured} />
        </div>
      )}

      {others.length > 0 && (
        <div className="video-rail-wrap" data-reveal>
          <div
            className={`video-rail ${canScroll.left ? 'fade-left' : ''} ${canScroll.right ? 'fade-right' : ''}`}
            onScroll={updateArrows}
            ref={rail}
          >
            {others.map((video) => (
              <VideoCard key={video.id} onOpen={() => openVideo(video)} video={video} />
            ))}
          </div>
          {(canScroll.left || canScroll.right) && (
            <div className="video-rail-arrows">
              <button
                aria-label="Previous videos"
                disabled={!canScroll.left}
                onClick={() => scrollRail(-1)}
                type="button"
              >
                ←
              </button>
              <button
                aria-label="More videos"
                disabled={!canScroll.right}
                onClick={() => scrollRail(1)}
                type="button"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      <VideoModal index={open} onClose={() => setOpen(null)} onMove={move} videos={playable} />
    </>
  )
}
