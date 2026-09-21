import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import { useProjectAudience } from '@/data/customerProjectsState'
import { describeCustomerViewError, listCustomerViewProgress, type CustomerViewPhoto, type CustomerViewProgress } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [progress, setProgress] = useState<CustomerViewProgress[]>([])
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<{ photo: CustomerViewPhoto; date: string } | null>(null)

  useEffect(() => {
    if (!projectId) return
    setStatus('loading')
    listCustomerViewProgress(projectId)
      .then(rows => {
        setProgress(rows)
        setStatus('loaded')
      })
      .catch(err => {
        setError(describeCustomerViewError(err))
        setStatus('error')
      })
  }, [projectId])

  const photos = progress.flatMap(entry => entry.photos.map(photo => ({ photo, date: entry.date, title: entry.title })))

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
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Published site photos. Files are not stored in Houzeify yet — you will see names and sizes only.</p>
              </div>
              {status === 'idle' || status === 'loading' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading photos…</p>
              ) : status === 'error' ? (
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              ) : photos.length === 0 ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No published photos yet.</p>
              ) : (
                <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                  {photos.map(item => (
                    <li key={item.photo.id}>
                      <button
                        type="button"
                        onClick={() => setOpen({ photo: item.photo, date: item.date })}
                        className="w-full text-left rounded-[14px] bg-white p-4 cursor-pointer min-h-11"
                        style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                      >
                        <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{item.photo.fileName}</p>
                        <p className="text-[12.5px] text-[#68636D] m-0 mt-1">{formatSize(item.photo.size)} · {item.date} · {item.title}</p>
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
          <div className="w-full max-w-[420px] rounded-[16px] bg-white p-5 min-w-0">
            <h2 id="photo-detail-title" className="text-[16px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>{open.photo.fileName}</h2>
            <p className="text-[13px] text-[#68636D] mt-2 mb-4" style={{ fontFamily: FONT_BODY }}>
              {formatSize(open.photo.size)} · {open.date}. File isn’t stored yet.
            </p>
            <button type="button" onClick={() => setOpen(null)} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
