// ─── Renovate → Upload photos/plans ──────────────────────────────────────
// Screen 06 of the Renovate journey — "Show us your space". Same dropzone
// visual pattern and real validateFile() as UploadPlanScreen (037) — this
// screen accepts a broader real-world mix (photos/videos/floor plans/
// existing designs/measurements) than that screen's own plan-specific
// DocumentType taxonomy, so files are tracked with a lighter local record
// here rather than forcing them through documentUpload.ts's floor-plan-
// specific types; validateFile() itself (the real, shared file-size/
// extension check) is reused as-is.

import { useRef, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { validateFile, MAX_FILE_SIZE_MB } from '@/data/documentUpload'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const TOTAL_STEPS = 9

const IcoUploadCloud = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 15.5a3.5 3.5 0 01-.5-6.96A4.5 4.5 0 0114.5 7a3.5 3.5 0 010 7h-1" />
    <path d="M10 7.5v6.5M7.5 10.5L10 8l2.5 2.5" />
  </svg>
)
const IcoCamera = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a1.5 1.5 0 011.5-1.5h2l1-2h5l1 2h2A1.5 1.5 0 0117 7v8a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 15V7z" />
    <circle cx="10" cy="11" r="3" />
  </svg>
)
const IcoImage = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" /><circle cx="7" cy="8" r="1.3" /><path d="M17 13l-4-4-4.5 4.5-2-2-4 4" />
  </svg>
)
const IcoPlan = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5" /><path d="M2.5 8h15M8 8v9" />
  </svg>
)
const IcoFile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoClose = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
)

interface UploadedFile {
  id: string
  name: string
  sizeLabel: string
}

let uploadCounter = 0

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateUploadScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const planInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const accepted: UploadedFile[] = []
    for (const file of Array.from(fileList)) {
      const result = validateFile(file)
      if (!result.valid) {
        setError(result.error ?? 'One of those files could not be uploaded.')
        continue
      }
      uploadCounter += 1
      accepted.push({ id: `renovate-upload-${uploadCounter}`, name: file.name, sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} MB` })
    }
    if (accepted.length) {
      setError(null)
      setFiles(prev => [...prev, ...accepted])
    }
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function handleContinue() {
    onNavigate('renovate-review', { renovation_photos_count: String(files.length) })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-budget-timeline')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-budget-timeline')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[var(--hz-surface-muted)] w-full shrink-0">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: `${(5 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 5 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Show us your space</h2>
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Photos, videos, floor plans, existing designs or measurements — anything that helps us understand your space.</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="Upload photos or plans — drag and drop files here"
                onClick={() => photoInputRef.current?.click()}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); photoInputRef.current?.click() } }}
                onDragEnter={e => { e.preventDefault(); setIsDragging(true) }}
                onDragOver={e => e.preventDefault()}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
                className="flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-colors outline-none max-w-[640px]"
                style={{ minHeight: 260, borderRadius: 20, border: `1px dashed ${isDragging ? 'var(--hz-primary)' : '#CAC7C6'}`, backgroundColor: isDragging ? '#F9F5FF' : 'var(--hz-surface)', padding: '32px 20px' }}
              >
                <input ref={photoInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
                <input ref={planInputRef} type="file" multiple accept=".pdf,.dwg,.dxf,image/*" className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

                <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><IcoUploadCloud /></span>
                <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                  {isDragging ? 'Drop your files here' : 'Drag and drop your files here'}
                </span>
                <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>or</span>
                <div className="flex flex-wrap items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                    <IcoCamera /> Take Photo
                  </button>
                  <button onClick={() => photoInputRef.current?.click()} className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-surface-muted)] transition-all bg-[var(--hz-surface)]" style={{ fontFamily: FONT_BODY }}>
                    <IcoImage /> Upload Photos
                  </button>
                  <button onClick={() => planInputRef.current?.click()} className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-surface-muted)] transition-all bg-[var(--hz-surface)]" style={{ fontFamily: FONT_BODY }}>
                    <IcoPlan /> Upload Plan
                  </button>
                </div>
                <span className="text-[11px] text-[var(--hz-ink-subtle)] pt-1" style={{ fontFamily: FONT_BODY }}>Maximum {MAX_FILE_SIZE_MB} MB per file</span>
              </div>

              {error && <p className="text-[12.5px] text-[#B91C1C] m-0 max-w-[640px]" style={{ fontFamily: FONT_BODY }}>{error}</p>}

              {files.length > 0 && (
                <div className="flex flex-col gap-2 max-w-[640px]">
                  <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{files.length} file{files.length > 1 ? 's' : ''} uploaded</span>
                  {files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 rounded-[12px] border border-[var(--hz-border)] px-4 py-3">
                      <span className="text-[var(--hz-primary)] shrink-0"><IcoFile /></span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{f.name}</span>
                        <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{f.sizeLabel}</span>
                      </div>
                      <button onClick={() => removeFile(f.id)} aria-label={`Remove ${f.name}`} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] transition-all border-0 bg-transparent cursor-pointer shrink-0">
                        <IcoClose />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4">
                <button
                  onClick={handleContinue}
                  className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px] bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Continue →
                </button>
                <button
                  onClick={handleContinue}
                  className="text-[13px] font-semibold text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
