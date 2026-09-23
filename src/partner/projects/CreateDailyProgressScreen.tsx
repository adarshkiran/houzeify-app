// ─── Create Daily Progress — Houzeify 2.0 Module 04 / C15B ──────────────────
// Daily Progress → Evidence workflow. Photos are selected, reviewed, then
// uploaded only after the progress row exists (C15A API). Upload states are
// truthful — Selected / Uploading / Uploaded / Failed / Retrying — and never
// marked uploaded before the server confirms persistence.

import { useEffect, useId, useRef, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import { useDailyProgress } from '@/data/dailyProgressState'
import { describeDailyProgressError, updateDailyProgress } from '@/data/dailyProgressApi'
import { constructionStages } from '@/data/constructionStages'

const MAX_PHOTO_BYTES = 15 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

type PhotoUploadStatus = 'selected' | 'uploading' | 'uploaded' | 'failed' | 'retrying'

interface PendingPhoto {
  localId: string
  file: File
  previewUrl: string
  status: PhotoUploadStatus
  errorMessage: string | null
}

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
)

const IcoPhoto = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3.5" width="14" height="11" rx="1.5" />
    <circle cx="6.5" cy="7.5" r="1.2" />
    <path d="M2.5 12.5l3.5-3.5 2.5 2.5 3-3 4 4" />
  </svg>
)

function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function newLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function statusLabel(status: PhotoUploadStatus): string {
  switch (status) {
    case 'selected':
      return 'Selected'
    case 'uploading':
      return 'Uploading…'
    case 'uploaded':
      return 'Uploaded'
    case 'failed':
      return 'Failed'
    case 'retrying':
      return 'Retrying…'
  }
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
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(todayIso())
  const [stage, setStage] = useState(currentStage && constructionStages.some(s => s.id === currentStage) ? currentStage : constructionStages[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shareWithCustomer, setShareWithCustomer] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Once the progress row is created, retries upload against this id — never create a duplicate row. */
  const [savedProgressId, setSavedProgressId] = useState<string | null>(null)

  const busy = submitting
  const canSubmit =
    Boolean(projectId) &&
    title.trim().length >= 2 &&
    date.length > 0 &&
    !busy

  const pendingPhotosRef = useRef(pendingPhotos)
  pendingPhotosRef.current = pendingPhotos

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
    if (!fileList || busy) return
    const accepted: PendingPhoto[] = []
    const rejected: string[] = []
    for (const file of Array.from(fileList)) {
      const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type
      if (!ALLOWED_PHOTO_TYPES.has(type)) {
        rejected.push(`${file.name}: use JPEG, PNG, or WebP`)
        continue
      }
      if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name}: exceeds 15 MB`)
        continue
      }
      accepted.push({
        localId: newLocalId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'selected',
        errorMessage: null,
      })
    }
    if (rejected.length) setError(rejected.join('. '))
    else if (accepted.length) setError(null)
    if (accepted.length) setPendingPhotos(prev => [...prev, ...accepted])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePendingPhoto(localId: string) {
    if (busy) return
    setPendingPhotos(prev => {
      const target = prev.find(p => p.localId === localId)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter(p => p.localId !== localId)
    })
  }

  function setPhotoStatus(localId: string, status: PhotoUploadStatus, errorMessage: string | null = null) {
    setPendingPhotos(prev =>
      prev.map(p => (p.localId === localId ? { ...p, status, errorMessage } : p)),
    )
  }

  async function uploadPendingPhotos(progressId: string, photos: PendingPhoto[], asRetry: boolean) {
    let failures = 0
    for (const pending of photos) {
      if (pending.status === 'uploaded') continue
      setPhotoStatus(pending.localId, asRetry ? 'retrying' : 'uploading')
      try {
        await dailyProgress.addPhoto(progressId, pending.file)
        setPhotoStatus(pending.localId, 'uploaded')
      } catch (err) {
        failures += 1
        setPhotoStatus(pending.localId, 'failed', describeDailyProgressError(err))
      }
    }
    return failures
  }

  async function handleSubmit() {
    if (!canSubmit || !projectId) return
    setSubmitting(true)
    setError(null)
    try {
      let progressId = savedProgressId
      if (!progressId) {
        const entry = await dailyProgress.create({
          date,
          stage: stage || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
        })
        progressId = entry.id
        setSavedProgressId(progressId)
      }

      const toUpload = pendingPhotos.filter(p => p.status !== 'uploaded')
      const failures = await uploadPendingPhotos(progressId, toUpload, Boolean(savedProgressId))

      if (shareWithCustomer) {
        try {
          await updateDailyProgress(projectId, progressId, { visibility: 'customer' })
        } catch (err) {
          setError(
            `Progress and photos were saved, but sharing with the customer failed: ${describeDailyProgressError(err)}. You can share from the Progress screen.`,
          )
          return
        }
      }

      if (failures > 0) {
        setError(
          `Progress was saved, but ${failures} photo${failures === 1 ? '' : 's'} failed to upload. Retry failed photos or remove them, then save again.`,
        )
        return
      }

      for (const pending of pendingPhotosRef.current) {
        URL.revokeObjectURL(pending.previewUrl)
      }
      onNavigate('project-progress', { project_id: projectId })
    } catch (err) {
      setError(describeDailyProgressError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function retryFailedPhotos() {
    if (!projectId || !savedProgressId || busy) return
    const failed = pendingPhotos.filter(p => p.status === 'failed')
    if (failed.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const failures = await uploadPendingPhotos(savedProgressId, failed, true)
      if (failures > 0) {
        setError(`${failures} photo${failures === 1 ? '' : 's'} still failed. Check the files and try again.`)
        return
      }
      if (shareWithCustomer) {
        await updateDailyProgress(projectId, savedProgressId, { visibility: 'customer' }).catch(() => undefined)
      }
      for (const pending of pendingPhotosRef.current) {
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

  const failedCount = pendingPhotos.filter(p => p.status === 'failed').length
  const uploadedCount = pendingPhotos.filter(p => p.status === 'uploaded').length
  const submitLabel = (() => {
    if (!busy) {
      if (savedProgressId && failedCount > 0) return 'Retry failed photos'
      if (savedProgressId) return 'Finish saving'
      return 'Save Progress Update'
    }
    if (pendingPhotos.some(p => p.status === 'uploading' || p.status === 'retrying')) {
      return `Uploading photos… (${uploadedCount}/${pendingPhotos.length})`
    }
    return savedProgressId ? 'Saving…' : 'Creating progress…'
  })()

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
              <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                Record what happened today and attach construction photos as project evidence.
              </p>
            </div>

            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }} htmlFor="dp-date">Date</label>
                  <input id="dp-date" type="date" value={date} disabled={Boolean(savedProgressId) || busy} onChange={e => setDate(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }} />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }} htmlFor="dp-stage">Construction Stage</label>
                  <select id="dp-stage" value={stage} disabled={Boolean(savedProgressId) || busy} onChange={e => setStage(e.target.value)} className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}>
                    {constructionStages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }} htmlFor="dp-title">What happened today?</label>
                <input
                  id="dp-title"
                  type="text"
                  value={title}
                  disabled={Boolean(savedProgressId) || busy}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Foundation work completed"
                  className="w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }} htmlFor="dp-notes">
                  Notes <span className="text-[#9A949D] font-normal">Optional</span>
                </label>
                <textarea
                  id="dp-notes"
                  value={description}
                  disabled={Boolean(savedProgressId) || busy}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Any additional detail worth recording."
                  rows={4}
                  className="w-full px-3.5 py-3 rounded-[10px] text-[13.5px] outline-none resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <label className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }} htmlFor={fileInputId}>
                    Construction photos
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 min-h-11 h-11 px-4 rounded-[12px] text-[13px] font-semibold cursor-pointer bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ border: '1px solid #E3DDD7', color: '#722ED1', fontFamily: FONT_BODY }}
                  >
                    <IcoPhoto /> Add Photos
                  </button>
                </div>
                <p className="text-[12.5px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
                  Optional · JPEG, PNG, or WebP · max 15 MB each. Photos attach to this progress record as evidence.
                </p>
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  multiple
                  disabled={busy}
                  onChange={e => onFilesSelected(e.target.files)}
                  className="sr-only"
                />
                {pendingPhotos.length > 0 && (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 m-0 p-0 list-none" aria-label="Selected construction photos">
                    {pendingPhotos.map(p => (
                      <li key={p.localId} className="relative rounded-[12px] overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
                        <img
                          src={p.previewUrl}
                          alt={`Construction photo: ${p.file.name}`}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 flex items-center justify-between gap-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
                          <span className="text-[11px] text-white truncate" style={{ fontFamily: FONT_MONO }}>{statusLabel(p.status)}</span>
                          {p.status !== 'uploading' && p.status !== 'retrying' && p.status !== 'uploaded' && (
                            <button
                              type="button"
                              onClick={() => removePendingPhoto(p.localId)}
                              aria-label={`Remove construction photo ${p.file.name}`}
                              className="min-w-11 min-h-11 w-11 h-11 -mr-1 -my-1 rounded-full flex items-center justify-center cursor-pointer border-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                              style={{ backgroundColor: 'transparent', fontSize: 18 }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {p.status === 'failed' && p.errorMessage && (
                          <p className="sr-only">{p.errorMessage}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {failedCount > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={retryFailedPhotos}
                      className="h-11 px-4 rounded-[12px] text-[13px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] disabled:opacity-50"
                      style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                    >
                      Retry failed photos
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 min-h-11 cursor-pointer" style={{ fontFamily: FONT_BODY }}>
                <input
                  type="checkbox"
                  checked={shareWithCustomer}
                  disabled={busy}
                  onChange={e => setShareWithCustomer(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-[#722ED1]"
                />
                <span className="text-[13.5px] text-[#242326]">
                  Share with customer when saved
                  <span className="block text-[12.5px] text-[#9A949D] mt-0.5">
                    Customer-visible evidence only. Leave unchecked to keep this update internal.
                  </span>
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              </div>
            )}

            {savedProgressId && failedCount === 0 && uploadedCount > 0 && !busy && (
              <p className="text-[13px] text-[#15803D] m-0" style={{ fontFamily: FONT_BODY }}>
                Progress and photos are saved. You can return to Progress.
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                disabled={!canSubmit && !(savedProgressId && failedCount > 0 && !busy)}
                onClick={savedProgressId && failedCount > 0 ? retryFailedPhotos : handleSubmit}
                className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                style={{
                  backgroundColor: (canSubmit || (savedProgressId && failedCount > 0 && !busy)) ? '#722ED1' : '#E3DDD7',
                  color: (canSubmit || (savedProgressId && failedCount > 0 && !busy)) ? 'white' : '#9A949D',
                  cursor: (canSubmit || (savedProgressId && failedCount > 0 && !busy)) ? 'pointer' : 'not-allowed',
                  fontFamily: FONT_BODY,
                }}
              >
                {submitLabel}
              </button>
              <button
                type="button"
                onClick={goBack}
                disabled={busy}
                className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] disabled:opacity-50"
                style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}
              >
                {savedProgressId ? 'Back to Progress' : 'Cancel'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
