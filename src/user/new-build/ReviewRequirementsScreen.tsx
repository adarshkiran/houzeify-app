// ─── Review Requirements — Flow 04 (New Build) ──────────────────────────────
// Reached from Upload Plans / Documents. Shows a complete, read-only review
// of everything collected on House Requirements + whatever was uploaded,
// before generating an estimate — reuses ProjectOverviewScreen's own
// SectionCard/Field summary pattern rather than a new one. Every section
// has a real "Edit" link back to where that data actually lives; nothing
// here is itself editable.

import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import { getHouseRequirementsForProject, BUILDING_TYPE_LABELS, FINISH_LEVEL_LABELS, SPECIAL_REQUIREMENT_LABELS } from '@/data/houseRequirements'
import { getDocumentsForProject } from '@/data/projectDocumentsStore'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

function SectionCard({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
          {action}
        </div>
      )}
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
function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[12px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
      Edit →
    </button>
  )
}

function formatINR(amount: number | null): string | undefined {
  return amount != null ? `₹${amount.toLocaleString('en-IN')}` : undefined
}

export default function ReviewRequirementsScreen({
  onNavigate,
  projectId,
  projectName,
  propertyType,
  location,
  hasHousePlan,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  /** Real value from Screen 008's "Do you already have a house plan?"
   *  question — only 'yes' means Upload Plan was actually shown on the way
   *  here, so only then does "Back" return to it. */
  hasHousePlan?: string
}) {
  const req = projectId ? getHouseRequirementsForProject(projectId) : undefined
  const documents = projectId ? getDocumentsForProject(projectId) : []

  function handleContinue() {
    onNavigate('estimate-loading', { project_stage: 'requirements-completed' })
  }

  if (!req) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <HIcon size={36} />
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Requirements not found.</p>
        <button type="button" onClick={() => onNavigate('house-requirements')} className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
          Add House Requirements
        </button>
      </div>
    )
  }

  const rooms = [
    req.hasLivingRoom && 'Living Room', req.hasDiningArea && 'Dining Area', req.hasKitchen && 'Kitchen',
    req.hasUtilityArea && 'Utility Area', req.hasBalcony && 'Balcony', req.hasStaircase && 'Staircase', req.hasTerrace && 'Terrace',
  ].filter((v): v is string => Boolean(v)).join(', ')

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="flex h-14 md:h-[64px] shrink-0 items-center justify-between px-4 md:px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[16px] md:text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Review Requirements</h1>
            <button onClick={() => onNavigate(hasHousePlan === 'yes' ? 'upload-plan' : 'house-requirements')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>Back</button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1040px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>New Build</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Review your requirements</h2>
                <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Confirm everything below before we generate your construction estimate.</p>
              </div>

              {/* Two-column body — 6-7 stacked cards made for a very long
                  single-column scroll on anything wider than mobile.
                  Splitting into two independently-stacking columns (not an
                  interleaved CSS grid) roughly balances the two halves by
                  height while keeping mobile's stacked order identical to
                  before (lg:flex-row only applies at that breakpoint). No
                  card content changed. */}
              <div className="flex flex-col gap-5 lg:flex-row lg:gap-8 lg:items-start">
                <div className="flex flex-col gap-5 lg:flex-1 lg:min-w-0">
                  <SectionCard title="Project" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Project Name" value={projectName} />
                      <Field label="Building Type" value={BUILDING_TYPE_LABELS[req.buildingType]} />
                      <Field label="Location" value={location} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Site" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Plot Area" value={req.plotArea ? `${req.plotArea.toLocaleString('en-IN')} sq ft` : undefined} />
                      <Field label="Plot Dimensions" value={req.plotDimensions || undefined} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Construction" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Built-up Area" value={`${req.builtUpArea.toLocaleString('en-IN')} sq ft`} />
                      <Field label="Floors" value={req.floors} />
                      <Field label="BHK" value={req.bhk ? `${req.bhk} BHK` : undefined} />
                      <Field label="Bedrooms" value={req.bedrooms?.toString()} />
                      <Field label="Bathrooms" value={req.bathrooms?.toString()} />
                      <Field label="Parking" value={req.parking != null ? `${req.parking} vehicle${req.parking === 1 ? '' : 's'}` : undefined} />
                      <div className="col-span-2"><Field label="Spaces" value={rooms || undefined} /></div>
                    </div>
                  </SectionCard>
                </div>

                <div className="flex flex-col gap-5 lg:flex-1 lg:min-w-0">
                  <SectionCard title="Finish" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                    <Field label="Finish Level" value={FINISH_LEVEL_LABELS[req.finishLevel]} />
                  </SectionCard>

                  {req.specialRequirements.length > 0 && (
                    <SectionCard title="Special Features" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                      <div className="flex flex-wrap gap-2">
                        {req.specialRequirements.map(r => (
                          <span key={r} className="px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_BODY }}>
                            {SPECIAL_REQUIREMENT_LABELS[r]}
                          </span>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  <SectionCard title="Budget & Timeline" action={<EditLink onClick={() => onNavigate('house-requirements')} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expected Budget" value={formatINR(req.budgetExpected)} />
                      <Field label="Budget Range" value={req.budgetMin || req.budgetMax ? `${formatINR(req.budgetMin) ?? '—'} – ${formatINR(req.budgetMax) ?? '—'}` : undefined} />
                      <Field label="Preferred Start" value={req.timelineStart || undefined} />
                      <Field label="Expected Completion" value={req.timelineCompletion || undefined} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Documents" action={<EditLink onClick={() => onNavigate('upload-plan')} />}>
                    <Field label="Uploaded" value={documents.length > 0 ? `${documents.length} document${documents.length === 1 ? '' : 's'}` : 'None yet'} />
                  </SectionCard>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold text-white cursor-pointer border-0 hover:brightness-90 transition-all w-full sm:w-auto sm:min-w-[260px] self-start"
                style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
              >
                Generate Estimate →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
