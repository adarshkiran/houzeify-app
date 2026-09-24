import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  validateFile,
  checkImageResolution,
  createProjectDocument,
  isPreviewableImage,
  isPdf,
  formatFileSize,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILES,
  type ProjectDocument,
  type DocumentType,
} from '@/data/documentUpload'
import { boqOverview } from '@/data/boqOverview'
import { boqActiveVersion } from '@/data/boqVersionHistory'
import Sidebar from '@/shared/components/Sidebar'

// ─── Sidebar & shell icons (kept local — matches existing screen convention) ──

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/><path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z"/>
    <path d="M14 12l.9 1.9 1.6.6-1.6.6-.9 1.9-.9-1.9-1.6-.6 1.6-.6.9-1.9z" strokeWidth="1.2"/>
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z"/>
  </svg>
)
const IcoEstimates = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <line x1="6" y1="6.5" x2="12" y2="6.5"/><line x1="6" y1="9.5" x2="12" y2="9.5"/><line x1="6" y1="12.5" x2="10" y2="12.5"/>
  </svg>
)
const IcoBOQ = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="5" x2="15" y2="5"/>
    <circle cx="3.5" cy="9" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="9" x2="15" y2="9"/>
    <circle cx="3.5" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="13" x2="15" y2="13"/>
  </svg>
)
const IcoPlan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2"/>
    <line x1="2" y1="7.5" x2="16" y2="7.5"/>
    <line x1="7.5" y1="7.5" x2="7.5" y2="16"/>
  </svg>
)
const IcoCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <rect x="5.5" y="4.5" width="7" height="2.5" rx="0.5"/>
    <circle cx="6" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="6" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoReports = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="15.5" x2="15" y2="15.5"/>
    <line x1="4" y1="15.5" x2="4" y2="9"/>
    <line x1="7.5" y1="15.5" x2="7.5" y2="5"/>
    <line x1="11" y1="15.5" x2="11" y2="8"/>
    <line x1="14.5" y1="15.5" x2="14.5" y2="3"/>
  </svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5"/>
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06"/>
  </svg>
)
const IcoUploadCloud = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 20a5 5 0 01-1-9.9A6 6 0 0118.9 8 5.5 5.5 0 0121 20H8z"/>
    <path d="M14 12v8M11 15l3-3 3 3"/>
  </svg>
)
const IcoFile = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"/><path d="M12 2.5V6h3"/>
  </svg>
)
const IcoFileCad = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"/><path d="M12 2.5V6h3"/>
    <path d="M6.5 13.5l1.8-3.2 1.4 2 1.3-2.4 1.5 3.6" strokeWidth="1.1"/>
  </svg>
)
const IcoImage = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="3.5" width="15" height="13" rx="1.5"/><circle cx="7" cy="8" r="1.3"/><path d="M3 14.5l4-4 3 3 3.5-4.5L17.5 14"/>
  </svg>
)
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l8 8M11 3L3 11"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoWarning = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L15 14H1L8 2z"/><line x1="8" y1="6.5" x2="8" y2="9.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2l6 2.5v4c0 4-2.5 6.7-6 7.5-3.5-.8-6-3.5-6-7.5v-4L9 2z"/><path d="M6.3 9l1.8 1.8 3.6-3.6"/>
  </svg>
)
const IcoRoomLayout = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/><line x1="10" y1="2.5" x2="10" y2="10.5"/><line x1="2.5" y1="10.5" x2="17.5" y2="10.5"/><line x1="10" y1="10.5" x2="10" y2="17.5"/>
  </svg>
)
const IcoRuler = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6.5" width="15" height="7" rx="1.2" transform="rotate(-8 10 10)"/>
    <line x1="6" y1="7.5" x2="6.6" y2="9.3" strokeWidth="1.1"/><line x1="9" y1="7" x2="9.6" y2="8.8" strokeWidth="1.1"/><line x1="12" y1="6.6" x2="12.6" y2="8.4" strokeWidth="1.1"/>
  </svg>
)
const IcoAreaScan = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6V3.5H5M15 3.5h2.5V6M17.5 14v2.5H15M5 16.5H2.5V14"/>
    <rect x="6" y="6" width="8" height="8" rx="1"/>
  </svg>
)
const IcoScope = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="1" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="19" y2="10"/>
  </svg>
)

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-transparent text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.



// ─── Shared bits ────────────────────────────────────────────────────────────

function SectionCard({ eyebrow, tag, children }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

function fileIconFor(doc: ProjectDocument) {
  if (isPreviewableImage(doc.mimeType)) return <IcoImage />
  if (isPdf(doc.mimeType, doc.name)) return <IcoFile />
  return <IcoFileCad />
}

// ─── Dropzone ────────────────────────────────────────────────────────────────

function UploadDropzone({ compact, isDragging, onDrop, onDragState, onFiles, inputRef }: {
  compact: boolean
  isDragging: boolean
  onDrop: (e: React.DragEvent) => void
  onDragState: (v: boolean) => void
  onFiles: (files: FileList | null) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload your floor plan — drag and drop a file here or press Enter to choose a file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDragEnter={e => { e.preventDefault(); onDragState(true) }}
      onDragOver={e => e.preventDefault()}
      onDragLeave={e => { e.preventDefault(); onDragState(false) }}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-colors outline-none"
      style={{
        minHeight: compact ? 180 : 320,
        borderRadius: 20,
        border: `1px dashed ${isDragging ? 'var(--hz-primary)' : 'var(--hz-border-strong)'}`,
        backgroundColor: isDragging ? 'var(--hz-primary-wash)' : 'var(--hz-surface)',
        padding: '32px 20px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORTED_EXTENSIONS.map(e => `.${e}`).join(',')}
        className="sr-only"
        onChange={e => { onFiles(e.target.files); e.target.value = '' }}
      />
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>
        <IcoUploadCloud />
      </span>
      <span className="text-[10px] uppercase tracking-[0.10em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Upload Your Floor Plan</span>
      <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
        {isDragging ? 'Drop your plan here' : 'Drag and drop your file here'}
      </span>
      <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>or</span>
      <button
        onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
        className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
        style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
      >
        Choose file
      </button>
      <div className="flex flex-col gap-0.5 pt-1">
        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Supported: PDF, JPG, PNG, DWG, DXF</span>
        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Maximum: {MAX_FILE_SIZE_MB} MB per file</span>
      </div>
    </div>
  )
}

// ─── File card ───────────────────────────────────────────────────────────────

function FileCard({ doc, progress, onRemove, onTypeChange }: {
  doc: ProjectDocument
  progress: number
  onRemove: () => void
  onTypeChange: (t: DocumentType) => void
}) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[14px] border border-[var(--hz-border)] p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>
          {fileIconFor(doc)}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-[var(--hz-ink)] block truncate" style={{ fontFamily: FONT_BODY }}>{doc.name}</span>
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>
            {formatFileSize(doc.size)}{doc.pageCount ? ` · ${doc.pageCount} page${doc.pageCount > 1 ? 's' : ''}` : ''}
          </span>
        </div>
        <button onClick={onRemove} aria-label={`Remove ${doc.name}`} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent transition-colors shrink-0">
          <IcoClose />
        </button>
      </div>

      {doc.status === 'uploading' && (
        <div className="flex flex-col gap-1.5" role="status" aria-label={`Uploading ${doc.name}, ${progress}% complete`}>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hz-surface)' }}>
            <div className="h-full rounded-full transition-all duration-150" style={{ width: `${progress}%`, backgroundColor: 'var(--hz-primary)' }} />
          </div>
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Uploading… {progress}%</span>
        </div>
      )}

      {doc.status === 'validating' && (
        <span className="text-[11px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>Checking file…</span>
      )}

      {doc.status === 'ready' && (
        <>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }} role="status">
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-success)' }}><IcoCheck /></span> Plan uploaded ✓
          </div>
          {doc.errorMessage && (
            <div role="alert" className="flex items-start gap-1.5 text-[11px]" style={{ color: '#D97706', fontFamily: FONT_BODY }}>
              <span className="shrink-0 mt-[1px]"><IcoWarning /></span> {doc.errorMessage}
            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Document type</span>
            <select
              value={doc.type}
              onChange={e => onTypeChange(e.target.value as DocumentType)}
              className="h-9 px-2.5 rounded-[8px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[12px] text-[var(--hz-ink)] cursor-pointer outline-none focus:border-[var(--hz-primary)] transition-colors"
              style={{ fontFamily: FONT_BODY }}
            >
              {DOCUMENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>)}
            </select>
          </label>
        </>
      )}

      {doc.status === 'error' && (
        <div role="alert" className="flex items-start gap-1.5 text-[12px]" style={{ color: 'var(--hz-danger)', fontFamily: FONT_BODY }}>
          <span className="shrink-0 mt-[1px]"><IcoWarning /></span> {doc.errorMessage ?? 'Unable to upload this file.'}
        </div>
      )}
    </div>
  )
}

// ─── Rejected file banner ───────────────────────────────────────────────────

function RejectedFileBanner({ name, error, onDismiss }: { name: string; error: string; onDismiss: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[12px] p-3.5" style={{ backgroundColor: '#FEE2E2' }}>
      <span className="shrink-0 mt-0.5" style={{ color: 'var(--hz-danger)' }}><IcoWarning /></span>
      <div className="flex-1 min-w-0">
        <span className="text-[12px] font-semibold text-[#991B1B] block truncate" style={{ fontFamily: FONT_BODY }}>{name}</span>
        <span className="text-[12px] text-[#991B1B]" style={{ fontFamily: FONT_BODY }}>{error}</span>
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" className="w-6 h-6 rounded-full flex items-center justify-center text-[#991B1B] hover:bg-[#FCA5A5] cursor-pointer border-0 bg-transparent transition-colors shrink-0">
        <IcoClose />
      </button>
    </div>
  )
}

// ─── Plan preview ────────────────────────────────────────────────────────────

function PlanPreview({ doc }: { doc: ProjectDocument }) {
  return (
    <SectionCard eyebrow="Plan Preview">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[160px] h-[160px] shrink-0 rounded-[12px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
          {isPreviewableImage(doc.mimeType) && doc.previewUrl ? (
            <img src={doc.previewUrl} alt={`Preview of ${doc.name}`} className="w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2" style={{ color: 'var(--hz-ink-subtle)' }}>
              <span style={{ transform: 'scale(1.6)' }}>{fileIconFor(doc)}</span>
              <span className="text-[10px] uppercase tracking-[0.06em]" style={{ fontFamily: FONT_MONO }}>
                {isPdf(doc.mimeType, doc.name) ? 'PDF' : 'CAD File'}
              </span>
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{doc.name}</span>
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
            {doc.pageCount ? `${doc.pageCount} pages · ` : ''}{formatFileSize(doc.size)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Detected</span>
            <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{DOCUMENT_TYPE_LABELS[doc.type]} · likely</span>
          </div>
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] w-fit" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-success)' }} aria-hidden="true" /> Ready for analysis
          </span>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── What Hozie can analyse ──────────────────────────────────────────────────

const ANALYSE_ITEMS = [
  { icon: <IcoRoomLayout />, title: 'Rooms & Layout', desc: 'Identify rooms, spaces and approximate areas.' },
  { icon: <IcoRuler />, title: 'Dimensions', desc: 'Read available dimensions and measurements.' },
  { icon: <IcoAreaScan />, title: 'Built-Up Area', desc: 'Cross-check estimated project area.' },
  { icon: <IcoScope />, title: 'Construction Scope', desc: 'Use plan information to improve BOQ and estimate assumptions.' },
]

function WhatHozieCanAnalyse() {
  return (
    <SectionCard eyebrow="What Hozie Can Analyse">
      <div className="grid grid-cols-2 gap-3">
        {ANALYSE_ITEMS.map(item => (
          <div key={item.title} className="flex flex-col gap-1.5 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
            <span style={{ color: 'var(--hz-primary)' }}>{item.icon}</span>
            <span className="text-[12px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="text-[11px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{item.desc}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Hozie does its best with what's readable — it won't always extract every detail perfectly.</p>
    </SectionCard>
  )
}

// ─── Upload tips ─────────────────────────────────────────────────────────────

const TIPS = [
  'Upload the original PDF where possible',
  'Keep dimensions and labels readable',
  'Include scale information if available',
  'Upload multiple drawings if available',
  'Avoid cropped or blurry screenshots',
]

function UploadTips({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <SectionCard eyebrow="For Best Results">
      <ul className="flex flex-col gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
        {TIPS.map(t => (
          <li key={t} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
            <span aria-hidden="true" style={{ color: 'var(--hz-success)' }}>✓</span> {t}
          </li>
        ))}
      </ul>
      <button onClick={onOpenModal} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
        What makes a good plan?
      </button>
    </SectionCard>
  )
}

function TipsModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tips-modal-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="tips-modal-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>What makes a good plan?</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors shrink-0"><IcoClose /></button>
        </div>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Hozie reads plans best when they're clear and complete. A few things that help:
        </p>
        <ul className="flex flex-col gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
          {TIPS.map(t => (
            <li key={t} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              <span aria-hidden="true" style={{ color: 'var(--hz-success)' }}>✓</span> {t}
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Even a phone photo of a printed plan can help — just try to keep it flat, well-lit and in focus.
        </p>
      </div>
    </>
  )
}

// ─── Project connection ─────────────────────────────────────────────────────

const UPDATE_ITEMS = ['Built-up area', 'Room information', 'Construction scope', 'BOQ quantities', 'Material estimates']

function ProjectConnection() {
  return (
    <SectionCard eyebrow="This Plan Will Update">
      <div className="flex flex-wrap gap-1.5">
        {UPDATE_ITEMS.map(i => (
          <span key={i} className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>{i}</span>
        ))}
      </div>
      <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Your existing estimate will not change automatically. Hozie will first show the analysis results and proposed changes.
      </p>
    </SectionCard>
  )
}

// ─── Hozie card ──────────────────────────────────────────────────────────────

function HozieCanHelp({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Can Help</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "Upload your plan and I'll identify the information I can read, flag anything uncertain, and show you what could change in your estimate."
      </p>
      <button onClick={onAskHozie} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Ask Hozie →</button>
    </div>
  )
}

// ─── Privacy ─────────────────────────────────────────────────────────────────

function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="shrink-0 mt-0.5" style={{ color: 'var(--hz-ink-muted)' }}><IcoShield /></span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Your Plans Are Private</span>
        <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Your uploaded drawings are associated with your project and are not shared with contractors unless you choose to share them.
        </p>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function simulateProgress(onTick: (pct: number) => void): Promise<void> {
  return new Promise(resolve => {
    let pct = 0
    const interval = setInterval(() => {
      pct += 18 + Math.random() * 14
      if (pct >= 100) {
        onTick(100)
        clearInterval(interval)
        resolve()
      } else {
        onTick(Math.round(pct))
      }
    }, 140)
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function UploadPlanScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  projectId,
  flow,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  /** Real id from projectData.project_id (Screen 035's CreateProjectScreen),
   *  if one already exists in this session. Always preferred over
   *  boqOverview.projectId ('proj-001', an unrelated hardcoded demo
   *  constant) — that demo id is only ever used when no real project
   *  exists yet (e.g. this screen reached directly via dev switcher). */
  projectId?: string
  /** 'new-build' when reached from House Requirements (Flow 04) — this
   *  screen's continue action then goes to Review Requirements instead of
   *  its original AI plan-analysis destination, and documents become
   *  optional (this flow's own Review Requirements screen already shows
   *  "None yet" gracefully). Absent for every other entry path (e.g.
   *  CreateProjectScreen's own separate "I have a plan" shortcut), which
   *  keeps its exact original behavior. */
  flow?: string
}) {
  const isNewBuild = flow === 'new-build'
  const [docs, setDocs] = useState<ProjectDocument[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [rejected, setRejected] = useState<{ id: string; name: string; error: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showTipsModal, setShowTipsModal] = useState(false)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const docsRef = useRef<ProjectDocument[]>([])
  docsRef.current = docs

  const updateDoc = (id: string, patch: Partial<ProjectDocument>) => {
    setDocs(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)))
  }

  const processFile = async (file: File) => {
    if (docsRef.current.length >= MAX_FILES) {
      setLimitNotice(`You can upload up to ${MAX_FILES} files at a time.`)
      return
    }
    const validation = validateFile(file)
    if (!validation.valid) {
      setRejected(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, name: file.name, error: validation.error! }])
      return
    }
    const doc = createProjectDocument(file, projectId || boqOverview.projectId)
    docsRef.current = [...docsRef.current, doc]
    setDocs(prev => [...prev, doc])
    setProgress(prev => ({ ...prev, [doc.id]: 0 }))

    await simulateProgress(pct => setProgress(prev => ({ ...prev, [doc.id]: pct })))
    updateDoc(doc.id, { status: 'validating' })
    await sleep(400)
    const resolutionWarning = await checkImageResolution(file)
    updateDoc(doc.id, { status: 'ready', errorMessage: resolutionWarning ?? undefined })
  }

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return
    Array.from(fileList).forEach(f => { void processFile(f) })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    onFilesSelected(e.dataTransfer.files)
  }

  const removeDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    docsRef.current = docsRef.current.filter(d => d.id !== id)
    setProgress(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  const dismissRejected = (id: string) => setRejected(prev => prev.filter(r => r.id !== id))

  const readyDocs = docs.filter(d => d.status === 'ready')
  const canAnalyze = readyDocs.length > 0
  const hasFiles = docs.length > 0

  const cancelAll = () => {
    setDocs([])
    docsRef.current = []
    setProgress({})
    setRejected([])
    setLimitNotice(null)
  }

  const analyzePlan = () => {
    if (isNewBuild) {
      onNavigate('review-requirements', { project_id: projectId ?? boqOverview.projectId })
      return
    }
    if (!canAnalyze) return
    const primary = readyDocs[0]
    onNavigate('plan-analysis-loading', {
      document_id: primary.id,
      document_name: primary.name,
      document_mime_type: primary.mimeType,
      document_page_count: primary.pageCount ? String(primary.pageCount) : '',
      document_size: String(primary.size),
      document_preview_url: primary.previewUrl ?? '',
      project_id: primary.projectId,
    })
  }
  const continueDisabled = isNewBuild ? false : !canAnalyze
  const continueLabel = isNewBuild ? 'Continue →' : 'Analyze plan →'

  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
  })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Upload Plan</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>V{boqActiveVersion.versionNumber}</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="plan" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Upload Plan</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>
              Estimate V2 · BOQ V{boqActiveVersion.versionNumber}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28 lg:pb-8">

              <div className="flex flex-col gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Plan Analysis</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Let's look at your plan.</h1>
                <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Upload your floor plan and Hozie will analyse the layout, dimensions, rooms and construction information to improve your estimate.
                </p>
                <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location} · 2,600 sq ft</span>
              </div>

              {rejected.length > 0 && (
                <div className="flex flex-col gap-2">
                  {rejected.map(r => <RejectedFileBanner key={r.id} name={r.name} error={r.error} onDismiss={() => dismissRejected(r.id)} />)}
                </div>
              )}
              {limitNotice && (
                <div role="alert" className="flex items-start gap-2 rounded-[12px] p-3.5" style={{ backgroundColor: '#FEF3C7' }}>
                  <span className="shrink-0" style={{ color: '#D97706' }}><IcoWarning /></span>
                  <span className="text-[12px] text-[#D97706]" style={{ fontFamily: FONT_BODY }}>{limitNotice}</span>
                </div>
              )}

              {!hasFiles ? (
                <>
                  <div className="w-full max-w-[720px]" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
                    <UploadDropzone compact={false} isDragging={isDragging} onDrop={onDrop} onDragState={setIsDragging} onFiles={onFilesSelected} inputRef={inputRef} />
                  </div>
                  <div className="flex flex-col gap-6 max-w-[720px] w-full">
                    <WhatHozieCanAnalyse />
                    <UploadTips onOpenModal={() => setShowTipsModal(true)} />
                    <ProjectConnection />
                    <HozieCanHelp onAskHozie={askHozie} />
                    <PrivacyNotice />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        {docs.map(doc => (
                          <FileCard
                            key={doc.id}
                            doc={doc}
                            progress={progress[doc.id] ?? 0}
                            onRemove={() => removeDoc(doc.id)}
                            onTypeChange={t => updateDoc(doc.id, { type: t })}
                          />
                        ))}
                      </div>
                      {docs.length < MAX_FILES && (
                        <UploadDropzone compact isDragging={isDragging} onDrop={onDrop} onDragState={setIsDragging} onFiles={onFilesSelected} inputRef={inputRef} />
                      )}
                      {readyDocs[0] && <PlanPreview doc={readyDocs[0]} />}
                    </div>

                    <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
                      <WhatHozieCanAnalyse />
                      <UploadTips onOpenModal={() => setShowTipsModal(true)} />
                      <ProjectConnection />
                      <HozieCanHelp onAskHozie={askHozie} />
                      <PrivacyNotice />
                    </div>
                  </div>
                </>
              )}

              {/* Actions (in-flow on desktop; mirrored sticky bar on mobile) */}
              <div className="hidden lg:flex items-center justify-end gap-2.5" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
                {hasFiles && (
                  <button onClick={cancelAll} className="h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
                    Cancel
                  </button>
                )}
                <button
                  onClick={analyzePlan}
                  disabled={continueDisabled}
                  className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                >
                  {continueLabel}
                </button>
              </div>
            </div>
          </main>

          {/* Sticky actions (mobile) */}
          <div className="lg:hidden sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
            {hasFiles && (
              <button onClick={cancelAll} className="h-11 px-5 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors shrink-0" style={{ fontFamily: FONT_BODY }}>
                Cancel
              </button>
            )}
            <button
              onClick={analyzePlan}
              disabled={continueDisabled}
              className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>

      {showTipsModal && <TipsModal onClose={() => setShowTipsModal(false)} />}
    </div>
  )
}
