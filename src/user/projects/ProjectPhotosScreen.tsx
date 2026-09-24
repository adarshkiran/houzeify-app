import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import AuthenticatedImage from '@/shared/components/AuthenticatedImage'
import AuthenticatedVideo from '@/shared/components/AuthenticatedVideo'
import { useProjectAudience } from '@/data/customerProjectsState'
import { describeCustomerViewError, listCustomerViewProgress, type CustomerViewPhoto, type CustomerViewProgress } from '@/data/customerViewApi'
import { deleteDailyProgressPhoto, describeDailyProgressError, listDailyProgress, type DailyProgressPhoto } from '@/data/dailyProgressApi'
import { constructionStages } from '@/data/constructionStages'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

type GalleryItem = {
  id: string
  progressId: string
  fileName: string
  size: number
  date: string
  title: string
  stage: string | null
  mediaKind: 'photo' | 'video'
  fileAvailable: boolean
  contentUrl: string | null
  visibility?: 'internal' | 'customer'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function stageLabel(stageId: string | null): string | null {
  if (!stageId) return null
  return constructionStages.find(s => s.id === stageId)?.name ?? stageId
}

function formatGroupDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const y = new Date(today)
  y.setDate(y.getDate() - 1)
  const yesterdayKey = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
  if (dateStr === todayKey) return 'Today'
  if (dateStr === yesterdayKey) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fromCustomer(rows: CustomerViewProgress[]): GalleryItem[] {
  return rows.flatMap(entry =>
    entry.photos.map((photo: CustomerViewPhoto) => ({
      id: photo.id,
      progressId: entry.id,
      fileName: photo.fileName,
      size: photo.size,
      date: entry.date,
      title: entry.title,
      stage: entry.stage,
      mediaKind: photo.mediaKind ?? (photo.mimeType?.startsWith('video/') ? 'video' : 'photo'),
      fileAvailable: photo.fileAvailable,
      contentUrl: photo.contentUrl,
      visibility: 'customer' as const,
    })),
  )
}

function fromCompany(rows: Awaited<ReturnType<typeof listDailyProgress>>): GalleryItem[] {
  return rows.flatMap(entry =>
    entry.photos.map((photo: DailyProgressPhoto) => ({
      id: photo.id,
      progressId: entry.id,
      fileName: photo.fileName,
      size: photo.size,
      date: entry.date,
      title: entry.title,
      stage: entry.stage,
      mediaKind: photo.mediaKind ?? (photo.mimeType?.startsWith('video/') ? 'video' : 'photo'),
      fileAvailable: photo.fileAvailable,
      contentUrl: photo.contentUrl,
      visibility: entry.visibility,
    })),
  )
}

export default function ProjectPhotosScreen({
  projectId,
  projectName,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const audience = useProjectAudience(projectId)
  const variant = audience === 'customer' ? 'customer' : 'company'
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [open, setOpen] = useState<GalleryItem | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return
    if (audience === 'unknown' || audience === 'invited') {
      setPhotos([])
      setStatus(audience === 'invited' ? 'loaded' : 'loading')
      return
    }
    setStatus('loading')
    setError(null)
    const load =
      audience === 'customer'
        ? listCustomerViewProgress(projectId).then(fromCustomer)
        : listDailyProgress(projectId).then(fromCompany)
    load
      .then(items => {
        setPhotos(items)
        setStatus('loaded')
      })
      .catch(err => {
        setError(audience === 'customer' ? describeCustomerViewError(err) : err instanceof Error ? err.message : 'Unable to load photos.')
        setStatus('error')
      })
  }, [projectId, audience, reloadKey])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape' || removeBusy) return
      if (confirmRemove) {
        setConfirmRemove(false)
        setRemoveError(null)
      } else {
        setOpen(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, confirmRemove, removeBusy])

  const groups = useMemo(() => {
    const map = new Map<string, GalleryItem[]>()
    for (const item of photos) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [photos])

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="photos" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav active="photos" projectId={projectId} projectName={projectName} variant={variant} onNavigate={onNavigate} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[820px] mx-auto flex flex-col gap-5 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Photos</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName ?? 'Project'}</h1>
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  {audience === 'customer'
                    ? 'Shared construction evidence from daily progress updates.'
                    : 'Construction evidence linked to daily progress — date, stage, and update title.'}
                </p>
              </div>
              {status === 'idle' || status === 'loading' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }} role="status" aria-live="polite">Loading photos…</p>
              ) : status === 'error' ? (
                <div className="rounded-[12px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                  <p className="text-[13px] text-[#991B1B] m-0" style={{ fontFamily: FONT_BODY }}>{error ?? 'Couldn’t load photos.'}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey(k => k + 1)}
                    className="min-h-11 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-white text-[#991B1B] outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              ) : audience === 'invited' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Photos are unavailable until you accept this project invitation.</p>
              ) : photos.length === 0 ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No construction photos yet.</p>
              ) : (
                <div className="flex flex-col gap-8">
                  {groups.map(([date, items]) => (
                    <section key={date} aria-labelledby={`photos-${date}`}>
                      <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
                        <h2 id={`photos-${date}`} className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                          {formatGroupDate(date)}
                        </h2>
                        <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>
                          {items.length} photo{items.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 m-0 p-0 list-none">
                        {items.map(item => {
                          const stage = stageLabel(item.stage)
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => setOpen(item)}
                                aria-label={`Open construction ${item.mediaKind === 'video' ? 'video' : 'photo'} from ${item.title}${stage ? `, ${stage}` : ''}, ${item.date}`}
                                className="w-full text-left rounded-[14px] overflow-hidden bg-white cursor-pointer min-h-11 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                                style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                              >
                                {item.mediaKind === 'video' ? (
                                  <div className="w-full aspect-square flex items-center justify-center bg-[#242326] relative">
                                    {item.fileAvailable ? (
                                      <span className="text-[12px] text-white" style={{ fontFamily: FONT_MONO }}>VIDEO</span>
                                    ) : (
                                      <span className="text-[12px] text-[#9A949D] px-2 text-center" style={{ fontFamily: FONT_BODY }}>
                                        {item.fileAvailable === false ? 'Historical video unavailable' : 'Video unavailable'}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <AuthenticatedImage
                                    contentUrl={item.fileAvailable ? item.contentUrl : null}
                                    alt={`Construction evidence: ${item.title}`}
                                    className="w-full aspect-square object-cover"
                                    unavailableLabel={item.fileAvailable ? 'Photo unavailable' : 'Historical photo unavailable'}
                                  />
                                )}
                                <div className="p-3">
                                  <p className="text-[13px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{item.title}</p>
                                  <p className="text-[12px] text-[#68636D] m-0 mt-1">
                                    {stage ?? 'Stage not set'}
                                    {item.mediaKind === 'video' ? ' · Video' : ''}
                                    {audience !== 'customer' && item.visibility === 'customer' ? ' · Shared' : ''}
                                    {audience !== 'customer' && item.visibility === 'internal' ? ' · Internal' : ''}
                                  </p>
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-detail-title"
          onClick={e => {
            if (e.target === e.currentTarget && !removeBusy) {
              setConfirmRemove(false)
              setRemoveError(null)
              setOpen(null)
            }
          }}
        >
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-5 min-w-0">
            <h2 id="photo-detail-title" className="text-[16px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>{open.title}</h2>
            <p className="text-[13px] text-[#68636D] mt-2 mb-3" style={{ fontFamily: FONT_BODY }}>
              {open.date}
              {stageLabel(open.stage) ? ` · ${stageLabel(open.stage)}` : ''}
              {` · ${formatSize(open.size)}`}
              {audience !== 'customer' && open.visibility === 'customer' ? ' · Shared with customer' : ''}
              {audience !== 'customer' && open.visibility === 'internal' ? ' · Internal' : ''}
            </p>
            {open.mediaKind === 'video' ? (
              <AuthenticatedVideo
                contentUrl={open.fileAvailable ? open.contentUrl : null}
                title={`Construction video: ${open.title}`}
                className="w-full max-h-[60vh] rounded-[12px] bg-[#242326]"
                unavailableLabel={open.fileAvailable ? 'Video unavailable' : 'Historical video unavailable'}
              />
            ) : (
              <AuthenticatedImage
                contentUrl={open.fileAvailable ? open.contentUrl : null}
                alt={`Construction evidence: ${open.title}`}
                className="w-full max-h-[60vh] object-contain rounded-[12px] bg-[#F4F0EC]"
                unavailableLabel={open.fileAvailable ? 'Photo unavailable' : 'Historical photo unavailable'}
              />
            )}
            {confirmRemove && audience !== 'customer' && projectId ? (
              <div className="mt-4 rounded-[12px] p-4" style={{ backgroundColor: '#FFF5F5', border: '1px solid #FECACA' }} role="alertdialog" aria-labelledby="photos-remove-title" aria-describedby="photos-remove-desc">
                <p id="photos-remove-title" className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Remove this evidence?
                </p>
                <p id="photos-remove-desc" className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  This construction {open.mediaKind === 'video' ? 'video' : 'photo'} will be removed from this Daily Progress record.
                </p>
                {removeError && (
                  <p className="text-[12.5px] text-[#B91C1C] m-0 mt-2" style={{ fontFamily: FONT_BODY }} role="alert">{removeError}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    disabled={removeBusy}
                    onClick={() => {
                      setConfirmRemove(false)
                      setRemoveError(null)
                    }}
                    className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] disabled:opacity-50"
                    style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={removeBusy}
                    onClick={() => {
                      setRemoveBusy(true)
                      setRemoveError(null)
                      deleteDailyProgressPhoto(projectId, open.id)
                        .then(() => {
                          setPhotos(prev => prev.filter(p => p.id !== open.id))
                          setConfirmRemove(false)
                          setOpen(null)
                        })
                        .catch(err => {
                          setRemoveError(describeDailyProgressError(err))
                        })
                        .finally(() => setRemoveBusy(false))
                    }}
                    className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C] disabled:opacity-50"
                    style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: FONT_BODY }}
                  >
                    {removeBusy ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmRemove(false)
                    setRemoveError(null)
                    setOpen(null)
                  }}
                  className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Close
                </button>
                {audience !== 'customer' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveError(null)
                      setConfirmRemove(true)
                    }}
                    className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C]"
                    style={{ border: '1px solid #FECACA', color: '#B91C1C', fontFamily: FONT_BODY }}
                    aria-label={`Remove this construction ${open.mediaKind}`}
                  >
                    Remove evidence
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
