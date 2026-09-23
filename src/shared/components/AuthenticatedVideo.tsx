// ─── Authenticated media video — C15C ───────────────────────────────────────
// Same cookieed fetch + blob URL pattern as AuthenticatedImage.

import { useEffect, useState } from 'react'
import { apiUrl } from '@/data/apiClient'

const FONT_BODY = '"Open Sans:Regular", sans-serif'

export default function AuthenticatedVideo({
  contentUrl,
  title,
  className,
  unavailableLabel = 'Video unavailable',
  controls = true,
}: {
  contentUrl: string | null | undefined
  title: string
  className?: string
  unavailableLabel?: string
  controls?: boolean
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
        Loading video…
      </div>
    )
  }

  return (
    <video
      src={objectUrl}
      controls={controls}
      playsInline
      preload="metadata"
      className={className}
      aria-label={title}
      title={title}
    >
      Your browser does not support video playback.
    </video>
  )
}
