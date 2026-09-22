// ─── Create Daily Progress — Houzeify 2.0 Module 04 ─────────────────────────
// Reached from ProjectProgressScreen's "Add Progress Update". Collects
// exactly the fields the real backend supports (server/projects/
// dailyProgress.schemas.ts) — date (defaults to today), construction
// stage (defaults to the project's own current Project.stage, reusing
// constructionStages.ts's existing taxonomy — never a new one), title,
// description, and photo evidence. Photos are attached as METADATA ONLY
// after the progress entry itself is created — this codebase has no real
// file storage anywhere (see documentUpload.ts's own header comment); the
// selected files are only ever previewed client-side via
// URL.createObjectURL, never uploaded as bytes. Reuses the same Sidebar +
// ProjectSubNav shell every other project screen already uses, for
// consistency — no new nav pattern introduced.

import { useEffect, useRef, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import { useDailyProgress } from '@/data/dailyProgressState'
import { describeDailyProgressError } from '@/data/dailyProgressApi'
import { constructionStages } from '@/data/constructionStages'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

// Finding 6 fix (Task 9 round 1) — must build the date string from LOCAL
// date parts, not toISOString() (which is UTC). ProjectProgressScreen.tsx's
// feed bucketing (feedBucketKey()) and date formatting both parse this
// string as local time (`${dateStr}T00:00:00`); for a UTC+5:30 user,
// toISOString().slice(0, 10) between local midnight and 5:30am would yield
// yesterday's UTC date, defaulting a brand-new entry into "Yesterday" in
// the very feed it was just created from.
function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface PendingPhoto {
  file: File
  previewUrl: string
}

export default function CreateDailyProgressScreen({
  projectId,
  projectName,
  currentStage,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  currentStage?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const dailyProgress = useDailyProgress(projectId)

  const [date, setDate] = useState(todayIso())
  const [stage, setStage] = useState(currentStage && constructionStages.some(s => s.id === currentStage) ? currentStage : constructionStages[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = Boolean(projectId) && title.trim().length >= 2 && date.length > 0 && !submitting

  // Keep a ref of the latest pendingPhotos so the unmount cleanup below can
  // revoke whatever is still pending without re-running (and re-revoking
  // still-in-use URLs) on every add/remove.
  const pendingPhotosRef = useRef(pendingPhotos)
  pendingPhotosRef.current = pendingPhotos

  // Revoke any pending photo preview URLs on unmount so navigating away never
  // leaks object URLs, regardless of which exit path was taken. Revoking a
  // URL that was already revoked by handleSubmit/goBack/removePendingPhoto
  // is a harmless no-op.
  useEffect(() => {
    return () => {
      for (const pending of pendingPhotosRef.current) {
        URL.revokeObjectURL(pending.previewUrl)
      }
    }
  }, [])

  function goBack() {
    for (const pending of pendingPhotos) {
      URL.revokeObjectURL(pending.previewUrl)
    }
    onNavigate('project-progress', projectId ? { project_id: projectId } : undefined)
  }

  function onFilesSelected(fileList: FileList | null) {
    if (!fileList) return
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    const next = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
    setPendingPhotos(prev => [...prev, ...next])
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit() {
    if (!canSubmit || !projectId) return
    setSubmitting(true)
    setError(null)
    try {
      const entry = await dailyProgress.create({
        date,
        stage: stage || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
      })
      for (const pending of pendingPhotos) {
        await dailyProgress.addPhoto(entry.id, {
          fileName: pending.file.name,
          mimeType: pending.file.type,
          size: pending.file.size,
        })
      }
      for (const pending of pendingPhotos) {
        URL.revokeObjectURL(pending.previewUrl)
      }
      onNavigate('project-progress', { project_id: projectId })
    } catch (err) {
      setError(describeDailyProgressError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!projectId) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <Sidebar active="projects" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
          <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 min-h-[44px] text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
              style={{ fontFamily: FONT_BODY }}
            >
              <IcoBack /> Progress
            </button>
          </div>
        </header>

        <ProjectSubNav active="progress" projectId={projectId} projectName={projectName} onNavigate={onNavigate} showWorkspaceHeader={false} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-[620px] mx-auto flex flex-col gap-6">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Daily Progress</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Add progress update</h1>
              {projectName && <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{projectName}</p>}
            </div>

            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }} />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>Construction Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}>
                    {constructionStages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>What happened today?</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Foundation work completed"
                  className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                  Notes <span className="text-[#9A949D] font-normal">Optional</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Any additional detail worth recording."
                  rows={4}
                  className="w-full px-3.5 py-3 rounded-[10px] text-[13.5px] outline-none resize-none"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                  Photos <span className="text-[#9A949D] font-normal">Optional</span>
                </label>
                <input type="file" accept="image/*" multiple onChange={e => onFilesSelected(e.target.files)} className="text-[13px]" style={{ fontFamily: FONT_BODY }} />
                {pendingPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {pendingPhotos.map((p, i) => (
                      <div key={p.previewUrl} className="relative rounded-[10px] overflow-hidden aspect-square" style={{ border: '1px solid #E3DDD7' }}>
                        <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingPhoto(i)}
                          aria-label={`Remove ${p.file.name}`}
                          className="absolute top-1 right-1 min-w-11 min-h-11 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-white"
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 16 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold border-0"
                style={{
                  backgroundColor: canSubmit ? '#722ED1' : '#E3DDD7',
                  color: canSubmit ? 'white' : '#9A949D',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_BODY,
                }}
              >
                {submitting ? 'Saving…' : 'Save Progress Update'}
              </button>
              <button type="button" onClick={goBack} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white" style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}>
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
