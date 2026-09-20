// ─── Create Construction Project — Houzeify 2.0 Module 03 ───────────────────
// The one canonical construction-project creation experience for the
// company workspace — reached from CompanyProjectsListScreen's "Create
// Project" (empty state and header). Collects only fields the real backend
// project model already supports (server/projects/project.schemas.ts) —
// nothing invented. Project Type reuses the existing 2-value taxonomy
// (src/data/projects.ts's ProjectType: 'new-build' | 'renovation') rather
// than introducing a broader construction-category taxonomy — deliberately
// NOT expanded in this module (see the Module 03 report's own note on this).
// Construction Stage reuses constructionStages.ts's existing 10-stage
// taxonomy as the project's initial `stage` value — never a second stage
// model. Location stays a single free-text field, matching every other
// location field in this codebase (Organization.location, Project.location
// itself, House Requirements' own site fields) — never split into city/
// state/PIN, which nothing else in this app does either.
//
// organizationId is never collected here — useProjects().create() already
// defaults it from the active organization (src/data/projectState.tsx),
// and the server re-verifies membership regardless of anything the client
// sends.

import { useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { useProjects } from '@/data/projectState'
import { describeProjectError } from '@/data/projectApi'
import { constructionStages } from '@/data/constructionStages'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const PROJECT_TYPE_OPTIONS: { id: 'new-build' | 'renovation'; label: string; description: string }[] = [
  { id: 'new-build', label: 'New Construction', description: 'Building a new structure from the ground up.' },
  { id: 'renovation', label: 'Renovation', description: 'Renovating, remodeling or extending an existing structure.' },
]

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
      {children}
      {optional && <span className="text-[#9A949D] font-normal ml-1">Optional</span>}
    </label>
  )
}

const inputClass = 'w-full h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none transition-colors'
const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY }

export default function CreateConstructionProjectScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const organizations = useOrganizations()
  const projects = useProjects()
  const currentOrganization = organizations.currentOrganization

  const [name, setName] = useState('')
  const [type, setType] = useState<'new-build' | 'renovation'>('new-build')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(currentOrganization?.location ?? '')
  const [timelineStart, setTimelineStart] = useState('')
  const [timelineCompletion, setTimelineCompletion] = useState('')
  const [stage, setStage] = useState(constructionStages[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2 && !submitting

  function goBack() {
    onNavigate('company-projects')
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const project = await projects.createProject({
        name: name.trim(),
        type,
        location: location.trim() || undefined,
        summary: description.trim() || undefined,
        timelineStart: timelineStart.trim() || undefined,
        timelineCompletion: timelineCompletion.trim() || undefined,
        stage: stage || undefined,
        status: 'planning',
      })
      onNavigate('project-workspace', {
        project_id: project.id,
        project_name: project.name,
        project_type: project.type ?? '',
        location: project.location ?? '',
        project_stage: project.stage ?? '',
        project_status: project.status ?? '',
        timeline_start: project.timelineStart ?? '',
        timeline_completion: project.timelineCompletion ?? '',
        summary: project.summary ?? '',
        organization_id: project.organizationId ?? '',
        company_name: currentOrganization?.name ?? '',
      })
    } catch (err) {
      setError(describeProjectError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
          <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              <IcoBack /> Projects
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-[640px] mx-auto flex flex-col gap-6">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>New Construction Project</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Create a project</h1>
              {currentOrganization && (
                <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>For {currentOrganization.name}</p>
              )}
            </div>

            {/* Project Information */}
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Project Information</p>
              <div>
                <FieldLabel>Project Name</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Whitefield Residency"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <FieldLabel optional>Description</FieldLabel>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Briefly describe the scope of this project."
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-[10px] text-[13.5px] outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Construction Type */}
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Construction Type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_TYPE_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setType(option.id)}
                    className="text-left rounded-[12px] p-3.5 cursor-pointer transition-colors"
                    style={{
                      border: type === option.id ? '1.5px solid #722ED1' : '1px solid #E3DDD7',
                      backgroundColor: type === option.id ? '#F9F5FF' : '#FFFFFF',
                    }}
                  >
                    <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{option.label}</p>
                    <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{option.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-1">
                <FieldLabel optional>Current Construction Stage</FieldLabel>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                >
                  {constructionStages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Location</p>
              <div>
                <FieldLabel optional>Project Address / Location</FieldLabel>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Whitefield, Bengaluru"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-[16px] bg-white p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>Schedule</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel optional>Planned Start Date</FieldLabel>
                  <input type="date" value={timelineStart} onChange={e => setTimelineStart(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel optional>Planned Completion Date</FieldLabel>
                  <input type="date" value={timelineCompletion} onChange={e => setTimelineCompletion(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
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
                {submitting ? 'Creating…' : 'Create Project'}
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
