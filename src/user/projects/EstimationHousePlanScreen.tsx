// ─── Upload House Plan + Plan Analyzer — S24 foundation ────────────────────
// Reuses projectDocuments multipart upload. Plan analysis engine is NOT
// connected — create returns status "unavailable" with honest copy. Users can
// still review/edit structured fields and save. No fabricated OCR results.

import { useEffect, useId, useRef, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { useProjects } from '@/data/projectState'
import {
  createProjectDocument,
  describeDocumentError,
  type ProjectDocumentDto,
} from '@/data/projectDocumentsApi'
import {
  ESTIMATION_HOUSE_PLAN_COPY,
  HOUSE_PLAN_ACCEPT,
  housePlanFileRejectReason,
} from '@/data/estimationHousePlanShell'
import {
  materialCalculatorSeedToNavData,
  planAnalysisToMaterialCalculatorSeed,
} from '@/data/planToMaterialCalculator'
import {
  createPlanAnalysis,
  describePlanAnalysisError,
  emptyPlanExtractedData,
  listPlanAnalyses,
  patchPlanAnalysis,
  PLAN_ANALYSIS_STATUS_LABELS,
  type PlanAnalysis,
  type PlanExtractedData,
  type PlanOpening,
  type PlanSpace,
} from '@/data/planAnalysisApi'
import { ESTIMATE_ROUTES } from '@/data/estimationFoundationShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputClass = `w-full min-h-11 h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none transition-colors ${FOCUS}`
const inputStyle = {
  border: '1px solid var(--hz-border)',
  fontFamily: FONT_BODY,
  backgroundColor: 'var(--hz-surface)',
}

type UploadPhase = 'idle' | 'uploading' | 'uploaded' | 'failed'
type AnalyzePhase = 'idle' | 'starting' | 'done' | 'failed'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export default function EstimationHousePlanScreen({
  projectId,
  projectName,
  organizationId,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  organizationId?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const { getProject, projects, status: projectsStatus } = useProjects()
  const project = projectId ? getProject(projectId) : undefined
  const displayProjectName = project?.name || projectName || '—'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileId = useId()
  const typeId = useId()
  const areaId = useId()
  const floorsId = useId()
  const notesId = useId()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [document, setDocument] = useState<ProjectDocumentDto | null>(null)

  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>('idle')
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null)
  const [draft, setDraft] = useState<PlanExtractedData>(emptyPlanExtractedData())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)
  const [listStatus, setListStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [priorAnalyses, setPriorAnalyses] = useState<PlanAnalysis[]>([])

  function navSeed(extra?: Record<string, string>): Record<string, string> | undefined {
    if (!projectId) return undefined
    const seed: Record<string, string> = { project_id: projectId }
    if (displayProjectName !== '—') seed.project_name = displayProjectName
    const org = organizationId || project?.organizationId
    if (org) seed.organization_id = org
    if (extra) Object.assign(seed, extra)
    return seed
  }

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setListStatus('loading')
    listPlanAnalyses(projectId)
      .then(rows => {
        if (cancelled) return
        setPriorAnalyses(rows)
        setListStatus('loaded')
        if (!analysis && rows[0]) {
          setAnalysis(rows[0])
          setDraft(rows[0].extractedData)
          setAnalyzePhase('done')
        }
      })
      .catch(() => {
        if (!cancelled) setListStatus('error')
      })
    return () => {
      cancelled = true
    }
    // Load once when project changes; do not re-bind when local analysis updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  function clearSelection() {
    setSelectedFile(null)
    setUploadPhase('idle')
    setUploadError(null)
    setDocument(null)
    setAnalyzePhase('idle')
    setAnalyzeError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onFilePicked(file: File | null) {
    setUploadError(null)
    setAnalyzeError(null)
    setSaveOk(false)
    if (!file) {
      clearSelection()
      return
    }
    const reject = housePlanFileRejectReason(file)
    if (reject) {
      setSelectedFile(null)
      setUploadPhase('failed')
      setUploadError(reject)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setSelectedFile(file)
    setUploadPhase('idle')
    setDocument(null)
    setAnalyzePhase('idle')
  }

  async function uploadFile() {
    if (!projectId || !selectedFile) return
    setUploadPhase('uploading')
    setUploadError(null)
    setSaveOk(false)
    try {
      const doc = await createProjectDocument(projectId, {
        category: 'plans',
        file: selectedFile,
        title: selectedFile.name.replace(/\.[^.]+$/, '') || 'House plan',
        description: 'House plan uploaded for Plan Analyzer',
      })
      setDocument(doc)
      setUploadPhase('uploaded')
    } catch (err) {
      setUploadPhase('failed')
      setUploadError(describeDocumentError(err))
    }
  }

  async function startAnalysis() {
    if (!projectId || !document) return
    setAnalyzePhase('starting')
    setAnalyzeError(null)
    setSaveOk(false)
    try {
      const row = await createPlanAnalysis(projectId, document.id)
      setAnalysis(row)
      setDraft(row.extractedData)
      setAnalyzePhase('done')
      setPriorAnalyses(prev => [row, ...prev.filter(a => a.id !== row.id)])
    } catch (err) {
      setAnalyzePhase('failed')
      setAnalyzeError(describePlanAnalysisError(err))
    }
  }

  async function saveReview() {
    if (!projectId || !analysis) return
    setSaving(true)
    setSaveError(null)
    setSaveOk(false)
    try {
      const row = await patchPlanAnalysis(projectId, analysis.id, draft)
      setAnalysis(row)
      setDraft(row.extractedData)
      setSaveOk(true)
      setPriorAnalyses(prev => prev.map(a => (a.id === row.id ? row : a)))
    } catch (err) {
      setSaveError(describePlanAnalysisError(err))
    } finally {
      setSaving(false)
    }
  }

  function patchDraft(partial: Partial<PlanExtractedData>) {
    setDraft(prev => ({ ...prev, ...partial }))
    setSaveOk(false)
  }

  function addSpace() {
    const space: PlanSpace = {
      id: newId('space'),
      name: '',
      kind: 'other',
      source: 'user',
    }
    patchDraft({ spaces: [...draft.spaces, space] })
  }

  function addOpening(kind: PlanOpening['kind']) {
    const opening: PlanOpening = {
      id: newId('open'),
      kind,
      label: '',
      source: 'user',
    }
    patchDraft({ openings: [...draft.openings, opening] })
  }

  function selectProject(id: string, name: string) {
    onNavigate('estimation-house-plan', {
      project_id: id,
      project_name: name,
      ...(organizationId ? { organization_id: organizationId } : {}),
    })
  }

  const canUpload = !!projectId && !!selectedFile && uploadPhase !== 'uploading'
  const canAnalyze = !!projectId && !!document && analyzePhase !== 'starting'

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p
              className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5"
              style={{ fontFamily: FONT_MONO }}
            >
              {ESTIMATION_HOUSE_PLAN_COPY.eyebrow}
            </p>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0"
              style={{ fontFamily: FONT_HEAD }}
            >
              {ESTIMATION_HOUSE_PLAN_COPY.title}
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1 max-w-2xl" style={{ fontFamily: FONT_BODY }}>
              {ESTIMATION_HOUSE_PLAN_COPY.subtitle}
            </p>

            <EstimationSubNav
              active="upload-plan"
              projectId={projectId}
              projectName={displayProjectName !== '—' ? displayProjectName : undefined}
              organizationId={organizationId}
              onNavigate={onNavigate}
            />

            {!projectId && (
              <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Choose a project
                </h2>
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  Plan upload and analysis need a project context.
                </p>
                {projectsStatus === 'loading' && (
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-4" role="status">
                    Loading projects…
                  </p>
                )}
                {projectsStatus === 'loaded' && projects.length === 0 && (
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-4">
                    No projects yet. Create one from Projects, then return here.
                  </p>
                )}
                <ul className="mt-4 m-0 p-0 list-none flex flex-col gap-2">
                  {projects.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`w-full text-left min-h-11 px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface-muted)] cursor-pointer ${FOCUS}`}
                        style={{ fontFamily: FONT_BODY }}
                        onClick={() => selectProject(p.id, p.name)}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {projectId && (
              <>
                <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                  <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    {displayProjectName}
                  </h2>
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                    {ESTIMATION_HOUSE_PLAN_COPY.body}
                  </p>

                  <div className="mt-5">
                    <label htmlFor={fileId} className="block text-[12.5px] font-semibold text-[var(--hz-ink)] mb-2">
                      House plan file
                    </label>
                    <input
                      ref={fileInputRef}
                      id={fileId}
                      type="file"
                      accept={HOUSE_PLAN_ACCEPT}
                      className={`block w-full text-[13px] ${FOCUS}`}
                      style={{ fontFamily: FONT_BODY }}
                      onChange={e => onFilePicked(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  {selectedFile && (
                    <div className="mt-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface-muted)] p-4">
                      <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>
                        {selectedFile.name}
                      </p>
                      <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1">
                        {formatBytes(selectedFile.size)}
                        {uploadPhase === 'uploading' ? ' · Uploading…' : null}
                        {uploadPhase === 'uploaded' && document ? ' · Uploaded' : null}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`min-h-11 px-4 rounded-[12px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-surface)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                          onClick={clearSelection}
                          disabled={uploadPhase === 'uploading'}
                        >
                          Remove
                        </button>
                        {uploadPhase !== 'uploaded' && (
                          <button
                            type="button"
                            className={`min-h-11 px-4 rounded-[12px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                            style={{
                              backgroundColor: 'var(--hz-primary)',
                              color: 'white',
                              fontFamily: FONT_BODY,
                              opacity: canUpload ? 1 : 0.6,
                            }}
                            disabled={!canUpload}
                            onClick={() => void uploadFile()}
                          >
                            {uploadPhase === 'uploading' ? 'Uploading…' : 'Upload plan'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {!selectedFile && uploadPhase === 'idle' && (
                    <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-4" role="status">
                      No plan uploaded yet.
                    </p>
                  )}

                  {uploadError && (
                    <p className="text-[13px] text-[var(--hz-danger,#b42318)] m-0 mt-3" role="alert">
                      {uploadError}
                    </p>
                  )}

                  {document && uploadPhase === 'uploaded' && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{
                          backgroundColor: 'var(--hz-primary)',
                          color: 'white',
                          fontFamily: FONT_BODY,
                          opacity: canAnalyze ? 1 : 0.6,
                        }}
                        disabled={!canAnalyze}
                        onClick={() => void startAnalysis()}
                      >
                        {analyzePhase === 'starting' ? 'Starting analysis…' : 'Start analysis'}
                      </button>
                      <button
                        type="button"
                        className={`min-h-11 px-4 rounded-[12px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                        onClick={clearSelection}
                      >
                        Replace file
                      </button>
                    </div>
                  )}

                  {analyzeError && (
                    <p className="text-[13px] text-[var(--hz-danger,#b42318)] m-0 mt-3" role="alert">
                      {analyzeError}
                    </p>
                  )}
                </section>

                {analysis && (
                  <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                        Plan Analysis
                      </h2>
                      <span
                        className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          fontFamily: FONT_BODY,
                          backgroundColor: 'var(--hz-surface-muted)',
                          color: 'var(--hz-ink-muted)',
                        }}
                      >
                        {PLAN_ANALYSIS_STATUS_LABELS[analysis.status]}
                      </span>
                    </div>

                    {analysis.engineMessage && (
                      <p
                        className="text-[13.5px] text-[var(--hz-ink)] m-0 mt-3 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface-muted)] p-3"
                        role="status"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {analysis.engineMessage}
                      </p>
                    )}

                    <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>
                      Review and edit construction information below. Fields marked user-edited are your corrections.
                      Extracted AI values appear only when the analysis engine is connected.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={typeId} className="block text-[12.5px] font-semibold mb-1.5">
                          Project type
                        </label>
                        <input
                          id={typeId}
                          className={inputClass}
                          style={inputStyle}
                          value={draft.projectType ?? ''}
                          onChange={e => patchDraft({ projectType: e.target.value || null })}
                          placeholder="e.g. G+1 residential"
                        />
                      </div>
                      <div>
                        <label htmlFor={areaId} className="block text-[12.5px] font-semibold mb-1.5">
                          Built-up area (sq.ft)
                        </label>
                        <input
                          id={areaId}
                          type="number"
                          min={0}
                          className={inputClass}
                          style={inputStyle}
                          value={draft.builtUpAreaSqft ?? ''}
                          onChange={e =>
                            patchDraft({
                              builtUpAreaSqft: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor={floorsId} className="block text-[12.5px] font-semibold mb-1.5">
                          Floors
                        </label>
                        <input
                          id={floorsId}
                          type="number"
                          min={1}
                          className={inputClass}
                          style={inputStyle}
                          value={draft.floors ?? ''}
                          onChange={e =>
                            patchDraft({
                              floors: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[14px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>
                          Rooms / spaces
                        </h3>
                        <button
                          type="button"
                          className={`min-h-9 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-surface-muted)', fontFamily: FONT_BODY }}
                          onClick={addSpace}
                        >
                          Add space
                        </button>
                      </div>
                      {draft.spaces.length === 0 ? (
                        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2">
                          No spaces yet — add rooms manually or wait for analyzer extraction.
                        </p>
                      ) : (
                        <ul className="mt-3 m-0 p-0 list-none flex flex-col gap-2">
                          {draft.spaces.map((space, idx) => (
                            <li key={space.id} className="flex flex-wrap gap-2 items-center">
                              <input
                                className={`${inputClass} flex-1 min-w-[8rem]`}
                                style={inputStyle}
                                value={space.name}
                                placeholder="Name"
                                onChange={e => {
                                  const spaces = draft.spaces.slice()
                                  spaces[idx] = { ...space, name: e.target.value, source: 'user' }
                                  patchDraft({ spaces })
                                }}
                              />
                              <input
                                className={`${inputClass} w-32`}
                                style={inputStyle}
                                value={space.kind}
                                placeholder="Kind"
                                onChange={e => {
                                  const spaces = draft.spaces.slice()
                                  spaces[idx] = { ...space, kind: e.target.value, source: 'user' }
                                  patchDraft({ spaces })
                                }}
                              />
                              <span className="text-[11px] text-[var(--hz-ink-muted)]">{space.source}</span>
                              <button
                                type="button"
                                className={`min-h-9 px-2 text-[12px] border-0 bg-transparent cursor-pointer ${FOCUS}`}
                                onClick={() =>
                                  patchDraft({ spaces: draft.spaces.filter(s => s.id !== space.id) })
                                }
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="text-[14px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>
                          Doors &amp; windows
                        </h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`min-h-9 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                            style={{ backgroundColor: 'var(--hz-surface-muted)', fontFamily: FONT_BODY }}
                            onClick={() => addOpening('door')}
                          >
                            Add door
                          </button>
                          <button
                            type="button"
                            className={`min-h-9 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                            style={{ backgroundColor: 'var(--hz-surface-muted)', fontFamily: FONT_BODY }}
                            onClick={() => addOpening('window')}
                          >
                            Add window
                          </button>
                        </div>
                      </div>
                      {draft.openings.length === 0 ? (
                        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2">No openings recorded.</p>
                      ) : (
                        <ul className="mt-3 m-0 p-0 list-none flex flex-col gap-2">
                          {draft.openings.map((opening, idx) => (
                            <li key={opening.id} className="flex flex-wrap gap-2 items-center">
                              <span className="text-[12px] text-[var(--hz-ink-muted)] w-16">{opening.kind}</span>
                              <input
                                className={`${inputClass} flex-1 min-w-[8rem]`}
                                style={inputStyle}
                                value={opening.label}
                                placeholder="Label"
                                onChange={e => {
                                  const openings = draft.openings.slice()
                                  openings[idx] = { ...opening, label: e.target.value, source: 'user' }
                                  patchDraft({ openings })
                                }}
                              />
                              <span className="text-[11px] text-[var(--hz-ink-muted)]">{opening.source}</span>
                              <button
                                type="button"
                                className={`min-h-9 px-2 text-[12px] border-0 bg-transparent cursor-pointer ${FOCUS}`}
                                onClick={() =>
                                  patchDraft({
                                    openings: draft.openings.filter(o => o.id !== opening.id),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6">
                      <label htmlFor={notesId} className="block text-[12.5px] font-semibold mb-1.5">
                        Notes / other extracted information
                      </label>
                      <textarea
                        id={notesId}
                        rows={3}
                        className={`w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] outline-none ${FOCUS}`}
                        style={inputStyle}
                        value={draft.notes ?? ''}
                        onChange={e => patchDraft({ notes: e.target.value || null })}
                        placeholder="Staircase, dimensions, or other details"
                      />
                    </div>

                    <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-4" style={{ fontFamily: FONT_BODY }}>
                      {ESTIMATION_HOUSE_PLAN_COPY.futureHandoff}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 items-center">
                      <button
                        type="button"
                        className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{
                          backgroundColor: 'var(--hz-primary)',
                          color: 'white',
                          fontFamily: FONT_BODY,
                          opacity: saving ? 0.7 : 1,
                        }}
                        disabled={saving}
                        onClick={() => void saveReview()}
                      >
                        {saving ? 'Saving…' : 'Save analysis'}
                      </button>
                      <button
                        type="button"
                        className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{
                          backgroundColor: 'var(--hz-surface-muted)',
                          color: 'var(--hz-ink)',
                          fontFamily: FONT_BODY,
                        }}
                        onClick={() => {
                          const seed = planAnalysisToMaterialCalculatorSeed(
                            {
                              id: analysis.id,
                              projectId: analysis.projectId,
                              extractedData: draft,
                            },
                            { location: project?.location || undefined },
                          )
                          onNavigate(
                            'material-calculator',
                            materialCalculatorSeedToNavData(seed, {
                              ...(navSeed({ return_screen: 'estimation-house-plan' }) ?? {}),
                              ...(project?.location ? { location: project.location } : {}),
                            }),
                          )
                        }}
                      >
                        Use in Material Calculator
                      </button>
                      <button
                        type="button"
                        className={`min-h-11 px-4 rounded-[12px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{ backgroundColor: 'var(--hz-surface-muted)', fontFamily: FONT_BODY }}
                        onClick={() => onNavigate(ESTIMATE_ROUTES.overview, navSeed())}
                      >
                        Back to Overview
                      </button>
                      {saveOk && (
                        <span className="text-[13px] text-[var(--hz-ink-muted)]" role="status">
                          Saved analysis.
                        </span>
                      )}
                    </div>
                    {saveError && (
                      <p className="text-[13px] text-[var(--hz-danger,#b42318)] m-0 mt-3" role="alert">
                        {saveError}
                      </p>
                    )}
                  </section>
                )}

                {listStatus === 'loaded' && priorAnalyses.length > 0 && !analysis && (
                  <section className="mt-6 max-w-2xl">
                    <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>
                      Previous analyses
                    </h2>
                    <ul className="mt-3 m-0 p-0 list-none flex flex-col gap-2">
                      {priorAnalyses.map(row => (
                        <li key={row.id}>
                          <button
                            type="button"
                            className={`w-full text-left min-h-11 px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)] cursor-pointer ${FOCUS}`}
                            style={{ fontFamily: FONT_BODY }}
                            onClick={() => {
                              setAnalysis(row)
                              setDraft(row.extractedData)
                              setAnalyzePhase('done')
                            }}
                          >
                            {PLAN_ANALYSIS_STATUS_LABELS[row.status]} ·{' '}
                            {new Date(row.createdAt).toLocaleString()}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
