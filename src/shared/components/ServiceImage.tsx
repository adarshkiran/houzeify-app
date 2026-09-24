// ─── Service Image ──────────────────────────────────────────────────────────
// The one shared image container for the image-led marketplace surfaces
// (Customer Home's primary actions, Popular Services, Featured Services).
//
// No real service photography exists in this project yet, and this batch is
// explicitly UI-only — no image-generation API, no external image URLs, no
// invented stock photos. So today this always renders its icon-on-gradient
// placeholder. `src` exists purely as the future integration point: once the
// Houzeify AI Image System (or any real asset pipeline) supplies a real
// photo URL, this same component starts rendering it — object-cover, same
// rounded container, same aspect ratio, no other call site changes.
//
// Never renders text inside the image itself (captions/titles stay as real,
// selectable text in the parent card) — only a decorative icon.

import type { ReactNode } from 'react'

const ACCENT_STYLES = {
  purple: { background: 'linear-gradient(135deg, var(--hz-primary-soft) 0%, var(--hz-primary-wash) 100%)', icon: 'var(--hz-primary)' },
  // Service/cleaning marketplace accent — used only where a card is
  // specifically a service action (e.g. Customer Home's "Home Services"
  // primary card), never applied broadly across the dashboard.
  orange: { background: 'linear-gradient(135deg, #FFE8D9 0%, #FFF3EA 100%)', icon: '#FF5500' },
} as const

export default function ServiceImage({
  icon,
  alt,
  src,
  className = '',
  accent = 'purple',
}: {
  /** Decorative icon shown while no real photo exists — never a text label. */
  icon: ReactNode
  /** Accessible description of what this image will depict once populated. */
  alt: string
  /** Future real photo URL — omitted today everywhere in the app. */
  src?: string
  /** Sizing/aspect-ratio/rounding — supplied by the call site so every
   *  surface can pick its own consistent ratio (square chips, 4:3 hero
   *  cards, etc.) through one shared implementation. */
  className?: string
  /** Brand purple (default) everywhere, or the service accent for the one
   *  card that is specifically a service action. */
  accent?: keyof typeof ACCENT_STYLES
}) {
  const style = ACCENT_STYLES[accent]
  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center ${className}`}
      style={{ background: style.background }}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : alt}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span style={{ color: style.icon, opacity: 0.55 }}>{icon}</span>
      )}
    </div>
  )
}
