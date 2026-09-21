// ─── Update Progress — professional-facing ──────────────────────────────────
// Reached from the Professional Dashboard's "Active Projects" section
// (ProfessionalDashboardScreen.tsx). Lets the professional currently
// assigned to a project (an accepted Bid — see bids.ts's own
// getBidsForProfessional()) record a real stage/status/percentage update,
// which the homeowner then sees on the read-only Project Progress screen
// (074 — ProjectProgressScreen.tsx). This is the one screen in the codebase
// that calls projectProgress.ts's createProgressUpdate() — that module's own
// header comment already reserved this exact seam ("createProgressUpdate()
// is reserved for a future contractor-side 'record progress' screen").
//
// Never fabricates a stage list of its own: the quick-pick chips reuse the
// real, existing constructionStages.ts names (Pre-Construction → Final
// Finishing) — the same canonical stage vocabulary already shown elsewhere
// in the app — with a "Custom" chip falling back to free text for any job
// that doesn't fit that construction-specific list (a renovation or home
// service, say).

import { useState } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { constructionStages } from '@/data/constructionStages'
import {
  createProgressUpdate,
  getProgressUpdatesForProject,
  formatProgressDate,
  PROGRESS_STAGE_STATUS_LABELS,
  type ProgressStageStatus,
} from '@/data/projectProgress'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

const STATUS_OPTIONS: ProgressStageStatus[] = ['not-started', 'in-progress', 'completed']
const STAGE_NAMES = constructionStages.map(s => s.name)

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{title}</span>
      {children}
    </div>
  )
}

function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onToggle}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? '#F3EAFF' : '#FFFFFF',
        borderColor: selected ? '#722ED1' : '#CAC7C6',
        color: selected ? '#722ED1' : '#1E1E1E',
      }}
    >
      {selected && <span className="flex items-center justify-center shrink-0 w-[14px] h-[14px] rounded-full bg-[#722ED1] text-white" aria-hidden="true"><CheckIcon /></span>}
      {label}
    </button>
  )
}

export default function UpdateProgressScreen({
  onNavigate,
  projectId,
  projectName,
  companyName,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
  companyName?: string
}) {
  const [stage, setStage] = useState<string | null>(null)
  const [customStage, setCustomStage] = useState('')
  const [usingCustomStage, setUsingCustomStage] = useState(false)
  const [status, setStatus] = useState<ProgressStageStatus | null>(null)
  const [progressPct, setProgressPct] = useState('')
  const [note, setNote] = useState('')
  const [justPosted, setJustPosted] = useState(false)

  // Re-read on every render (no local mirror) so a just-posted update shows
  // up immediately — same "always read through the module, never cache"
  // convention ProjectProgressScreen itself follows.
  const history = projectId ? getProgressUpdatesForProject(projectId).slice().reverse() : []

  const resolvedStage = usingCustomStage ? customStage.trim() : stage
  const pctNumber = progressPct.trim() ? Number(progressPct) : null
  const pctValid = pctNumber === null || (Number.isFinite(pctNumber) && pctNumber >= 0 && pctNumber <= 100)
  const canPost = Boolean(projectId) && Boolean(resolvedStage) && status !== null && pctValid

  function handleBack() {
    onNavigate('professional-dashboard')
  }

  function handlePost() {
    if (!canPost || !projectId || !resolvedStage || !status) return
    createProgressUpdate({
      projectId,
      stage: resolvedStage,
      status,
      progressPercentage: pctNumber,
      note,
      updatedBy: companyName || 'Professional',
    })
    setStage(null)
    setCustomStage('')
    setUsingCustomStage(false)
    setStatus(null)
    setProgressPct('')
    setNote('')
    setJustPosted(true)
    setTimeout(() => setJustPosted(false), 3000)
  }

  if (!projectId) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
        <button type="button" onClick={handleBack} className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white border-b border-[#E3DDD7]">
        <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full overflow-y-auto">
        <div className="w-full flex flex-col gap-6" style={{ maxWidth: 720, margin: '0 auto' }}>

          <button type="button" onClick={handleBack} className="self-start text-[12.5px] font-semibold text-[#68636D] cursor-pointer bg-transparent border-0 hover:text-[#242326] hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
            ← Back to Dashboard
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Update Progress</span>
            <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Project'}</h1>
            <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Record a stage update so the homeowner can see how work is progressing.</p>
          </div>

          {justPosted && (
            <div className="flex items-center gap-2 rounded-[12px] px-4 py-3" style={{ backgroundColor: '#DCFCE7' }}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#16A34A] text-white shrink-0"><CheckIcon /></span>
              <p className="text-[13px] font-semibold m-0" style={{ color: '#16A34A', fontFamily: FONT_HEAD }}>Update posted — the homeowner will see this on their Project Progress screen.</p>
            </div>
          )}

          <SectionCard title="Post an update">
            <div>
              <FieldLabel>Stage</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {STAGE_NAMES.map(name => (
                  <Chip key={name} label={name} selected={!usingCustomStage && stage === name} onToggle={() => { setUsingCustomStage(false); setStage(name) }} />
                ))}
                <Chip label="Custom" selected={usingCustomStage} onToggle={() => setUsingCustomStage(true)} />
              </div>
              {usingCustomStage && (
                <input
                  type="text"
                  value={customStage}
                  onChange={e => setCustomStage(e.target.value)}
                  placeholder="e.g. Modular kitchen install"
                  className="mt-2.5 w-full h-11 px-3.5 rounded-[10px] border text-[13.5px] outline-none"
                  style={{ borderColor: '#CAC7C6', fontFamily: FONT_BODY }}
                />
              )}
            </div>

            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <Chip key={s} label={PROGRESS_STAGE_STATUS_LABELS[s]} selected={status === s} onToggle={() => setStatus(s)} />
                ))}
              </div>
            </div>

            <div>
              <FieldLabel optional>Overall progress (%)</FieldLabel>
              <input
                type="number"
                min={0}
                max={100}
                value={progressPct}
                onChange={e => setProgressPct(e.target.value)}
                placeholder="e.g. 35"
                className="w-full sm:w-40 h-11 px-3.5 rounded-[10px] border text-[13.5px] outline-none"
                style={{ borderColor: pctValid ? '#CAC7C6' : '#D97706', fontFamily: FONT_BODY }}
              />
              {!pctValid && <p className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>Enter a number between 0 and 100.</p>}
            </div>

            <div>
              <FieldLabel optional>Note</FieldLabel>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Anything the homeowner should know about this update…"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13.5px] outline-none resize-none"
                style={{ borderColor: '#CAC7C6', fontFamily: FONT_BODY }}
              />
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={!canPost}
              className="h-[48px] rounded-[12px] text-[14px] font-semibold cursor-pointer border-0 transition-all"
              style={{
                backgroundColor: canPost ? '#722ED1' : '#F4F0EC',
                color: canPost ? '#FFFFFF' : '#9A949D',
                fontFamily: FONT_BODY,
                cursor: canPost ? 'pointer' : 'not-allowed',
              }}
            >
              Post Update
            </button>
          </SectionCard>

          <SectionCard title="Progress History">
            {history.length > 0 ? (
              <div className="flex flex-col gap-3">
                {history.map(update => (
                  <div key={update.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: '1px solid #F4F0EC' }}>
                    <div>
                      <p className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                        {update.stage} — {PROGRESS_STAGE_STATUS_LABELS[update.status]}
                        {update.progressPercentage !== null ? ` (${update.progressPercentage}%)` : ''}
                      </p>
                      {update.note && <p className="text-[12.5px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{update.note}</p>}
                      <p className="text-[12px] text-[#9A949D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{update.updatedBy}</p>
                    </div>
                    <p className="text-[12px] text-[#9A949D] m-0 shrink-0" style={{ fontFamily: FONT_BODY }}>{formatProgressDate(update.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No updates posted yet — your first update will appear here.</p>
            )}
          </SectionCard>
        </div>
      </main>
    </div>
  )
}
