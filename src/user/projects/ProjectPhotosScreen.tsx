import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import AuthenticatedImage from '@/shared/components/AuthenticatedImage'
import { useProjectAudience } from '@/data/customerProjectsState'
import { describeCustomerViewError, listCustomerViewProgress, type CustomerViewPhoto, type CustomerViewProgress } from '@/data/customerViewApi'
import { listDailyProgress, type DailyProgressPhoto } from '@/data/dailyProgressApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

type GalleryItem = {
  id: string
  fileName: string
  size: number
  date: string
  title: string
  stage: string | null
  fileAvailable: boolean
  contentUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fromCustomer(rows: CustomerViewProgress[]): GalleryItem[] {
  return rows.flatMap(entry =>
    entry.photos.map((photo: CustomerViewPhoto) => ({
      id: photo.id,
      fileName: photo.fileName,
      size: photo.size,
      date: entry.date,
      title: entry.title,
      stage: entry.stage,
      fileAvailable: photo.fileAvailable,
      contentUrl: photo.contentUrl,
    })),
  )
}

function fromCompany(rows: Awaited<ReturnType<typeof listDailyProgress>>): GalleryItem[] {
  return rows.flatMap(entry =>
    entry.photos.map((photo: DailyProgressPhoto) => ({
      id: photo.id,
      fileName: photo.fileName,
      size: photo.size,
      date: entry.date,
      title: entry.title,
      stage: entry.stage,
      fileAvailable: photo.fileAvailable,
      contentUrl: photo.contentUrl,
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
  const [open, setOpen] = useState<GalleryItem | null>(null)

  useEffect(() => {
    if (!projectId) return
    if (audience === 'unknown' || audience === 'invited') {
      setPhotos([])
      setStatus(audience === 'invited' ? 'loaded' : 'loading')
      return
    }
    setStatus('loading')
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
  }, [projectId, audience])

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
                    ? 'Published construction photos from your project.'
                    : 'Construction evidence from daily progress updates.'}
                </p>
              </div>
              {status === 'idle' || status === 'loading' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading photos…</p>
              ) : status === 'error' ? (
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              ) : photos.length === 0 ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No photos yet.</p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 m-0 p-0 list-none">
                  {photos.map(item => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(item)}
                        className="w-full text-left rounded-[14px] overflow-hidden bg-white cursor-pointer min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                        style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                      >
                        <AuthenticatedImage
                          contentUrl={item.fileAvailable ? item.contentUrl : null}
                          alt={item.fileName}
                          className="w-full aspect-square object-cover"
                          unavailableLabel={item.fileAvailable ? 'Photo unavailable' : 'Historical photo unavailable'}
                        />
                        <div className="p-3">
                          <p className="text-[13px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{item.fileName}</p>
                          <p className="text-[12px] text-[#68636D] m-0 mt-1">{item.date} · {item.title}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </main>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-labelledby="photo-detail-title">
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-5 min-w-0">
            <h2 id="photo-detail-title" className="text-[16px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>{open.fileName}</h2>
            <p className="text-[13px] text-[#68636D] mt-2 mb-3" style={{ fontFamily: FONT_BODY }}>
              {formatSize(open.size)} · {open.date} · {open.title}
              {open.stage ? ` · ${open.stage}` : ''}
            </p>
            <AuthenticatedImage
              contentUrl={open.fileAvailable ? open.contentUrl : null}
              alt={open.fileName}
              className="w-full max-h-[60vh] object-contain rounded-[12px] bg-[#F4F0EC]"
              unavailableLabel={open.fileAvailable ? 'Photo unavailable' : 'Historical photo unavailable'}
            />
            <button type="button" onClick={() => setOpen(null)} className="mt-4 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
