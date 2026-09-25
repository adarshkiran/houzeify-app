// ─── Price Intelligence — S26 foundation screen ────────────────────────────

import { useEffect, useId, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { useProjects } from '@/data/projectState'
import {
  PRICE_INTELLIGENCE_COPY,
  RATE_RESOLUTION_PRIORITY_LABELS,
} from '@/data/priceIntelligenceShell'
import {
  createOrganizationRate,
  describePriceIntelligenceError,
  formatRateInr,
  getPriceIntelligenceStatus,
  listOrganizationRates,
  resolveOrganizationRate,
  type OrganizationRateEntry,
  type PriceIntelligenceStatus,
  type ResolveRateResult,
} from '@/data/priceIntelligenceApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputClass = `w-full min-h-11 h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none ${FOCUS}`
const inputStyle = {
  border: '1px solid var(--hz-border)',
  fontFamily: FONT_BODY,
  backgroundColor: 'var(--hz-surface)',
}

export default function PriceIntelligenceScreen({
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
  const orgId = organizationId || project?.organizationId || undefined
  const displayName = project?.name || projectName

  const [status, setStatus] = useState<PriceIntelligenceStatus | null>(null)
  const [rates, setRates] = useState<OrganizationRateEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lookupName, setLookupName] = useState('Cement')
  const [lookupUnit, setLookupUnit] = useState('bags')
  const [resolved, setResolved] = useState<ResolveRateResult | null>(null)
  const [resolving, setResolving] = useState(false)

  const [addName, setAddName] = useState('Cement')
  const [addUnit, setAddUnit] = useState('bags')
  const [addRateRupees, setAddRateRupees] = useState('')
  const [addEffectiveFrom, setAddEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [addLocation, setAddLocation] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addOk, setAddOk] = useState(false)

  const nameId = useId()
  const unitId = useId()
  const rateId = useId()
  const dateId = useId()

  async function refresh(organization: string) {
    setLoadError(null)
    try {
      const [st, list] = await Promise.all([
        getPriceIntelligenceStatus(organization),
        listOrganizationRates(organization),
      ])
      setStatus(st)
      setRates(list)
    } catch (err) {
      setLoadError(describePriceIntelligenceError(err))
    }
  }

  useEffect(() => {
    if (!orgId) return
    void refresh(orgId)
  }, [orgId])

  async function runLookup() {
    if (!orgId) return
    setResolving(true)
    setResolved(null)
    try {
      const result = await resolveOrganizationRate(orgId, {
        name: lookupName,
        unit: lookupUnit,
        projectId,
        location: project?.location || undefined,
      })
      setResolved(result)
    } catch (err) {
      setLoadError(describePriceIntelligenceError(err))
    } finally {
      setResolving(false)
    }
  }

  async function addRate() {
    if (!orgId) return
    const rupees = Number(addRateRupees)
    if (!Number.isFinite(rupees) || rupees <= 0) {
      setAddError('Enter a positive rate in rupees.')
      return
    }
    setAdding(true)
    setAddError(null)
    setAddOk(false)
    try {
      await createOrganizationRate(orgId, {
        kind: 'material',
        name: addName,
        unit: addUnit,
        ratePaise: Math.round(rupees * 100),
        effectiveFrom: addEffectiveFrom,
        location: addLocation.trim() || undefined,
        sourceType: 'organization_price_book',
      })
      setAddOk(true)
      setAddRateRupees('')
      await refresh(orgId)
    } catch (err) {
      setAddError(describePriceIntelligenceError(err))
    } finally {
      setAdding(false)
    }
  }

  function selectProject(id: string, name: string) {
    onNavigate('estimation-price-intelligence', {
      project_id: id,
      project_name: name,
      ...(organizationId ? { organization_id: organizationId } : {}),
    })
  }

  const historyForLookup = rates
    .filter(
      r =>
        r.name.toLowerCase() === lookupName.trim().toLowerCase() &&
        r.unit.toLowerCase() === lookupUnit.trim().toLowerCase(),
    )
    .slice()
    .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1))

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={orgId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              {PRICE_INTELLIGENCE_COPY.eyebrow}
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              {PRICE_INTELLIGENCE_COPY.title}
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1 max-w-2xl" style={{ fontFamily: FONT_BODY }}>
              {PRICE_INTELLIGENCE_COPY.subtitle}
            </p>

            <EstimationSubNav
              active="price-intelligence"
              projectId={projectId}
              projectName={displayName}
              organizationId={orgId}
              onNavigate={onNavigate}
            />

            {!orgId && (
              <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Choose a project</h2>
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2">Price Intelligence needs an organization context via a company project.</p>
                {projectsStatus === 'loading' && <p className="mt-4 text-[14px]" role="status">Loading projects…</p>}
                <ul className="mt-4 m-0 p-0 list-none flex flex-col gap-2">
                  {projects.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`w-full text-left min-h-11 px-4 rounded-[12px] border border-[var(--hz-border)] cursor-pointer ${FOCUS}`}
                        style={{ fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface-muted)' }}
                        onClick={() => selectProject(p.id, p.name)}
                      >
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {orgId && (
              <>
                {loadError && (
                  <p className="mt-4 text-[13px] text-[var(--hz-danger,#b42318)]" role="alert">{loadError}</p>
                )}

                <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-3xl">
                  <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Price sources</h2>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                    {PRICE_INTELLIGENCE_COPY.body}
                  </p>
                  <ul className="mt-4 m-0 p-0 list-none grid sm:grid-cols-2 gap-2">
                    {[
                      ['Project Rates', status?.sources.projectRates],
                      ['Organization Price Book', status?.sources.organizationPriceBook],
                      ['Historical Rates', status?.sources.historicalRates],
                      ['Market Reference', status?.sources.marketReference],
                      ['AI / Reference', status?.sources.aiReference],
                    ].map(([label, on]) => (
                      <li
                        key={String(label)}
                        className="rounded-[12px] border border-[var(--hz-border)] px-3 py-2.5 text-[13px]"
                        style={{ fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface-muted)' }}
                      >
                        <span className="font-semibold text-[var(--hz-ink)]">{label}</span>
                        <span className="block text-[12px] text-[var(--hz-ink-muted)] mt-0.5">
                          {on ? 'Available' : label === 'Market Reference' ? PRICE_INTELLIGENCE_COPY.marketUnavailable : label === 'AI / Reference' ? PRICE_INTELLIGENCE_COPY.aiUnavailable : 'Unavailable'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <p className="text-[12px] font-semibold m-0 mb-1.5" style={{ fontFamily: FONT_BODY }}>Resolution priority</p>
                    <ol className="m-0 pl-5 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                      {RATE_RESOLUTION_PRIORITY_LABELS.map(label => (
                        <li key={label}>{label}</li>
                      ))}
                    </ol>
                  </div>
                </section>

                <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-3xl">
                  <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Price lookup</h2>
                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor={nameId} className="block text-[12.5px] font-semibold mb-1.5">Item</label>
                      <input id={nameId} className={inputClass} style={inputStyle} value={lookupName} onChange={e => setLookupName(e.target.value)} list="pi-catalog" />
                      <datalist id="pi-catalog">
                        {(status?.catalog.materials ?? []).map(m => (
                          <option key={m} value={m} />
                        ))}
                        {(status?.catalog.labour ?? []).map(m => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label htmlFor={unitId} className="block text-[12.5px] font-semibold mb-1.5">Unit</label>
                      <input id={unitId} className={inputClass} style={inputStyle} value={lookupUnit} onChange={e => setLookupUnit(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className={`w-full min-h-11 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                        style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                        disabled={resolving}
                        onClick={() => void runLookup()}
                      >
                        {resolving ? 'Resolving…' : 'Resolve rate'}
                      </button>
                    </div>
                  </div>

                  {resolved && resolved.found && (
                    <div className="mt-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface-muted)] p-4" role="status">
                      <p className="m-0 text-[18px] font-semibold" style={{ fontFamily: FONT_HEAD }}>
                        {formatRateInr(resolved.ratePaise)} <span className="text-[13px] font-normal text-[var(--hz-ink-muted)]">/ {resolved.unit}</span>
                      </p>
                      <p className="m-0 mt-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
                        Source: {resolved.sourceLabel}
                        {resolved.location ? ` · ${resolved.location}` : ' · Global organization rate'}
                      </p>
                      <p className="m-0 mt-1 text-[12.5px] text-[var(--hz-ink-muted)]">
                        Effective from {resolved.effectiveFrom}
                        {resolved.effectiveTo ? ` to ${resolved.effectiveTo}` : ''}
                      </p>
                    </div>
                  )}
                  {resolved && !resolved.found && (
                    <p className="mt-4 text-[13.5px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>
                      {PRICE_INTELLIGENCE_COPY.emptyLookup}
                    </p>
                  )}

                  {historyForLookup.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-[14px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Rate history — {lookupName}</h3>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-left text-[13px]" style={{ fontFamily: FONT_BODY }}>
                          <thead>
                            <tr className="text-[var(--hz-ink-muted)]">
                              <th className="py-2 pr-3 font-semibold">Effective</th>
                              <th className="py-2 pr-3 font-semibold">Rate</th>
                              <th className="py-2 pr-3 font-semibold">Source</th>
                              <th className="py-2 font-semibold">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyForLookup.map(row => (
                              <tr key={row.id} className="border-t border-[var(--hz-border)]">
                                <td className="py-2 pr-3">
                                  {row.effectiveFrom}
                                  {row.effectiveTo ? ` → ${row.effectiveTo}` : ' → open'}
                                </td>
                                <td className="py-2 pr-3">{formatRateInr(row.ratePaise)} / {row.unit}</td>
                                <td className="py-2 pr-3">{row.sourceType.replace(/_/g, ' ')}</td>
                                <td className="py-2">{row.location || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

                <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-3xl">
                  <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Add organization rate</h2>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2">
                    Minimal Price Book entry for testing. Adding a newer rate closes the previous open-ended rate — history is preserved.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12.5px] font-semibold mb-1.5">Item</label>
                      <input className={inputClass} style={inputStyle} value={addName} onChange={e => setAddName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-semibold mb-1.5">Unit</label>
                      <input className={inputClass} style={inputStyle} value={addUnit} onChange={e => setAddUnit(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor={rateId} className="block text-[12.5px] font-semibold mb-1.5">Rate (₹)</label>
                      <input id={rateId} type="number" min={0} step="0.01" className={inputClass} style={inputStyle} value={addRateRupees} onChange={e => setAddRateRupees(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor={dateId} className="block text-[12.5px] font-semibold mb-1.5">Effective from</label>
                      <input id={dateId} type="date" className={inputClass} style={inputStyle} value={addEffectiveFrom} onChange={e => setAddEffectiveFrom(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[12.5px] font-semibold mb-1.5">Location (optional)</label>
                      <input className={inputClass} style={inputStyle} value={addLocation} onChange={e => setAddLocation(e.target.value)} placeholder="Leave blank for organization global" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`mt-4 min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                    style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY, opacity: adding ? 0.7 : 1 }}
                    disabled={adding}
                    onClick={() => void addRate()}
                  >
                    {adding ? 'Saving…' : 'Save rate'}
                  </button>
                  {addOk && <span className="ml-3 text-[13px] text-[var(--hz-ink-muted)]" role="status">Saved.</span>}
                  {addError && <p className="mt-2 text-[13px] text-[var(--hz-danger,#b42318)]" role="alert">{addError}</p>}
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
