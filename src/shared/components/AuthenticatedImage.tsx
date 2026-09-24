// ─── Authenticated media image — C15 ─────────────────────────────────────────
// Construction photos are private. <img src> cannot attach the session cookie
// to a cross-origin API host reliably in all setups, so we fetch with
// credentials and render a blob URL. Legacy / unavailable media shows a
// truthful placeholder — never fabricated demo imagery.

import { useEffect, useState } from 'react'
import { apiUrl } from '@/data/apiClient'

const FONT_BODY = '"Inter Variable", sans-serif'

export default function AuthenticatedImage({
  contentUrl,
  alt,
  className,
  unavailableLabel = 'Photo unavailable',
}: {
  contentUrl: string | null | undefined
  alt: string
  className?: string
  unavailableLabel?: string
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (!contentUrl) {
      setStatus('error')
      setObjectUrl(null)
      return
    }
    let cancelled = false
    let createdUrl: string | null = null
    setStatus('loading')
    setObjectUrl(null)
    fetch(apiUrl(contentUrl), { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error('unavailable')
        const blob = await res.blob()
        createdUrl = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(createdUrl)
          return
        }
        setObjectUrl(createdUrl)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [contentUrl])

  if (!contentUrl || status === 'error') {
    return (
      <div
        className={`flex items-center justify-center bg-[#F4F0EC] text-[#9A949D] text-[12px] ${className ?? ''}`}
        style={{ fontFamily: FONT_BODY }}
        role="img"
        aria-label={unavailableLabel}
      >
        {unavailableLabel}
      </div>
    )
  }

  if (status === 'loading' || status === 'idle' || !objectUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-[#F4F0EC] text-[#9A949D] text-[12px] animate-pulse ${className ?? ''}`}
        style={{ fontFamily: FONT_BODY }}
        aria-busy="true"
      >
        Loading…
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} />
}
