// ─── Renovate → Project Created ──────────────────────────────────────────
// Final screen of the Renovate journey — "Your renovation project is
// ready". Same success-confirmation layout as ContractorSelectedScreen.
// "View Project" seeds the EXISTING, unmodified bids.ts store — calls its
// real createBid() then awardBid() with opportunityId = this renovation's
// real project id — so ProjectWorkspaceScreen's own getAwardedBid(projectId)
// finds it naturally with zero changes to ProjectWorkspaceScreen or
// bids.ts. No Renovate business logic (bid amount, timeline, booking)
// changes at all here.
//
// 12H-B — this is the one place in the Renovate flow that creates a real
// project, now a real backend Project (see src/data/projectState.tsx)
// rather than a client-minted id only ever registered into the local
// projects.ts store. Backend-first: the bid's opportunityId must be the
// real, server-generated project id, so project creation runs before the
// bid is seeded.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import { createBid, awardBid } from '@/data/bids'
import { formatINR } from '@/data/materials'
import { useProjects } from '@/data/projectState'
import { describeProjectError } from '@/data/projectApi'
import { RENOVATION_AREA_LABELS, type RenovationArea } from './RenovateSelectAreaScreen'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const CURRENT_USER_ID = 'user-demo-001'

const BigCheckIcon = () => (
  <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path d="M8 17.5L14 23.5L26 10.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value ?? '—'}</p>
    </div>
  )
}

function parseTimelineWeeks(timeline?: string): number {
  const match = timeline?.match(/\d+/)
  return match ? Number(match[0]) : 6
}

export default function RenovateProjectCreatedScreen({
  onNavigate,
  selectionTitle,
  selectionPrice,
  selectionTimeline,
  bookDate,
  location,
  renovationAreas,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  selectionTitle?: string
  selectionPrice?: string
  selectionTimeline?: string
  bookDate?: string
  /** The homeowner's own account/profile location — Renovation (unlike New
   *  Build) never asks for a separate site address, since a renovation
   *  happens at the home the homeowner already told Houzeify about. */
  location?: string
  /** Comma-joined RenovationArea values from Screen 03 (Select Area),
   *  carried the same way through the whole Renovate chain — the one real
   *  "scope" signal this journey has, used here purely for a human-
   *  readable summary on the persistent Project record (Projects list /
   *  Project Overview), never re-interpreted as requirements data. */
  renovationAreas?: string
}) {
  const projects = useProjects()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const projectName = selectionTitle ? `${selectionTitle} — Renovation` : 'Renovation Project'
  const price = selectionPrice ? Number(selectionPrice) : 0
  const areaLabels = (renovationAreas?.split(',').filter(Boolean) as RenovationArea[] | undefined)
    ?.map(a => RENOVATION_AREA_LABELS[a])
    .filter(Boolean)
  const scopeSummary = areaLabels && areaLabels.length > 0 ? areaLabels.join(', ') : undefined

  // 12H-B — real backend Project create (see src/data/projectState.tsx),
  // backend-first: the bid's opportunityId must be the REAL project id
  // (ProjectWorkspaceScreen's getAwardedBid(projectId) has to find it
  // under that same id), so the project is created before the bid — no
  // more client-minted id used up front. bids.ts itself is untouched.
  async function viewProject() {
    if (saving) return
    setSaving(true)
    setSaveError('')

    let project
    try {
      project = await projects.createProject({
        name: projectName,
        type: 'renovation',
        location,
        stage: 'ready-build',
        summary: scopeSummary,
      })
    } catch (err) {
      setSaving(false)
      setSaveError(describeProjectError(err))
      return
    }

    // Seed the existing Bid store (createBid → awardBid, both real,
    // untouched functions) so the existing Project Workspace's own
    // getAwardedBid(projectId) finds this renovation's selection with no
    // changes to that screen at all.
    const bid = createBid({
      opportunityId: project.id,
      userId: CURRENT_USER_ID,
      organizationId: null,
      amount: price,
      duration: parseTimelineWeeks(selectionTimeline),
      durationUnit: 'weeks',
      proposedStartDate: bookDate || null,
      proposal: `Renovation booked via Houzeify — ${selectionTitle ?? 'Renovation'}.`,
      included: '',
      exclusions: '',
      attachments: [],
    })
    awardBid(bid.id)
    setSaving(false)

    onNavigate('project-workspace', {
      project_id: project.id,
      project_name: project.name,
      project_type: 'renovation',
      project_stage: project.stage ?? 'ready-build',
      location: project.location ?? '',
      user_role: 'homeowner',
    })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>
      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-10">
        <div className="max-w-[560px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="relative w-[62px] h-[62px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1', boxShadow: '0 8px 26px rgba(243,234,255,0.10)' }}>
              <BigCheckIcon />
            </span>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Your renovation project is ready</h1>
          </div>

          <SectionCard>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Project name" value={projectName} />
              <Field label="Professional" value={selectionTitle ?? 'Assigned professional'} />
              <Field label="Price" value={formatINR(price)} />
              <Field label="Timeline" value={selectionTimeline ?? '—'} />
              <Field label="Status" value="Scheduled / Planning" />
            </div>
          </SectionCard>

          {saveError && (
            <p role="alert" className="text-[12.5px] text-center m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{saveError}</p>
          )}
          <button
            onClick={viewProject}
            disabled={saving}
            className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-60"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            {saving ? 'Saving…' : 'View Project'}
          </button>
        </div>
      </main>
    </div>
  )
}
