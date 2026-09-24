import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput, type ContractorListing } from '@/data/contractorDirectory'
import { getBidsForOpportunity, formatBidAmount, formatBidDuration, BID_STATUS_LABELS, type Bid, type BidDurationUnit } from '@/data/bids'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 065 — Compare Bids ──────────────────────────────────────────────
// A HOMEOWNER, decision-SUPPORT screen — compares TWO OR MORE real submitted
// bids for ONE project side by side. Reuses bids.ts (032/063/064) for bids —
// no second Bid model — and contractorDirectory.ts (060/061) for the
// submitting professionals' identities — no second profile system. Never
// awards, never ranks bids as "best", never fabricates a rating. Only
// objective, real-data facts (lowest amount, shortest duration, real
// verification) are ever surfaced.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const EmptyIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="28" height="20" rx="2.5" /><path d="M4 14h28" /><path d="M11 21h6" /></svg>
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Only used to compare durations expressed in different units on equal
// footing — plain unit-conversion arithmetic, never a scoring system.
const DAYS_PER_UNIT: Record<BidDurationUnit, number> = { days: 1, weeks: 7, months: 30 }
function approxDays(bid: Bid): number {
  return bid.duration * DAYS_PER_UNIT[bid.durationUnit]
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      {title && <h2 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function IncludedList({ text, empty }: { text: string; empty: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>{empty}</p>
  if (lines.length === 1) return <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 whitespace-pre-wrap" style={{ fontFamily: FONT_BODY }}>{lines[0]}</p>
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => (
        <span key={i} className="flex items-start gap-1.5 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[#16A34A] shrink-0">✓</span> {line}
        </span>
      ))}
    </div>
  )
}

interface EnrichedBid {
  bid: Bid
  listing: ContractorListing | undefined
  name: string
  kind: 'individual' | 'organization'
  typeLabel: string
  isLowestBid: boolean
  isShortestDuration: boolean
}

function ContractorHeader({ item, onViewProfile }: { item: EnrichedBid; onViewProfile: () => void }) {
  const initials = item.kind === 'organization' ? companyInitials(item.name) : profileInitials(item.name)
  return (
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{item.name}</p>
          {item.listing?.verificationStatus === 'verified' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
          )}
        </div>
        <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{item.typeLabel} · {item.kind === 'organization' ? 'Organization' : 'Individual'}</p>
        {item.listing?.location && (
          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--hz-ink-muted)] mt-0.5" style={{ fontFamily: FONT_BODY }}>
            <IcoMapPin /> {item.listing.location}
          </span>
        )}
        <button type="button" onClick={onViewProfile} className="mt-1 text-[11.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
          View Contractor Profile →
        </button>
      </div>
    </div>
  )
}

function AttributeBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      {children}
    </div>
  )
}

interface CompareBidsScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

type SortId = 'lowest' | 'shortest' | 'newest'

export default function CompareBidsScreen({
  role,
  userId,
  projectId,
  projectName,
  propertyType,
  location,
  organizationId,
  companyName,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  onNavigate,
}: CompareBidsScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const [sort, setSort] = useState<SortId>('lowest')
  const [mobileIndex, setMobileIndex] = useState(0)

  const directoryInput: ContractorDirectoryInput = {
    userId: userId || CURRENT_USER_ID,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations,
    verificationStatus,
    portfolioProjectCount,
    serviceDescription,
  }

  // Only bids belonging to THIS project, and only eligible (submitted)
  // bids — never rejected/accepted/withdrawn, never another project's bids.
  const eligibleBids = useMemo(
    () => (projectId ? getBidsForOpportunity(projectId).filter(b => b.status === 'submitted') : []),
    [projectId]
  )

  const enriched = useMemo<EnrichedBid[]>(() => {
    if (eligibleBids.length === 0) return []
    const minAmount = Math.min(...eligibleBids.map(b => b.amount))
    const minDays = Math.min(...eligibleBids.map(approxDays))
    return eligibleBids.map(bid => {
      const listing = getContractorListingById(bid.organizationId ?? bid.userId, directoryInput)
      const name = listing?.name ?? 'Professional'
      const kind: 'individual' | 'organization' = listing?.kind ?? (bid.organizationId ? 'organization' : 'individual')
      const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')
      return {
        bid, listing, name, kind, typeLabel,
        isLowestBid: bid.amount === minAmount,
        isShortestDuration: approxDays(bid) === minDays,
      }
    })
  }, [eligibleBids, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
    directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
    directoryInput.portfolioProjectCount, directoryInput.serviceDescription])

  const sorted = useMemo(() => {
    const list = [...enriched]
    switch (sort) {
      case 'shortest': return list.sort((a, b) => approxDays(a.bid) - approxDays(b.bid))
      case 'newest': return list.sort((a, b) => +new Date(b.bid.createdAt) - +new Date(a.bid.createdAt))
      case 'lowest':
      default: return list.sort((a, b) => a.bid.amount - b.bid.amount)
    }
  }, [enriched, sort])

  function backToBids() {
    onNavigate('bids-received', projectId ? { project_id: projectId } : undefined)
  }
  function viewBid(bidId: string) {
    onNavigate('bid-detail', { bid_id: bidId, project_id: projectId ?? '' })
  }
  function viewProfile(item: EnrichedBid) {
    onNavigate('contractor-profile', {
      professional_id: item.bid.organizationId ? '' : item.bid.userId,
      organization_id: item.bid.organizationId ?? '',
      ...(projectId ? { project_id: projectId } : {}),
    })
  }
  function chooseContractor(item: EnrichedBid) {
    onNavigate('award-contractor', { project_id: projectId ?? '', bid_id: item.bid.id })
  }

  const selectStyle = { border: '1px solid var(--hz-border)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }
  const primaryBtn = 'h-10 px-4 rounded-[12px] text-[12.5px] font-semibold text-white cursor-pointer border-0'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="bids" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={backToBids} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back to Bids
          </button>
          <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] hidden sm:flex items-center gap-1"><HIcon size={16} /></span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Compare Bids</h1>
            <p className="text-[13.5px] text-[var(--hz-ink-muted)] mt-1.5 mb-0" style={{ fontFamily: FONT_BODY }}>
              Compare contractor proposals side by side and choose the one that best fits your project.
            </p>
          </div>

          <SectionCard>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project</p>
            <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
            {propertyType && <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{propertyType}</p>}
            {location && (
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
                <IcoMapPin /> {location}
              </span>
            )}
          </SectionCard>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)' }}><EmptyIcon /></div>
              <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>No bids available.</p>
              <button type="button" onClick={() => onNavigate('find-contractors')} className={primaryBtn} style={{ backgroundColor: 'var(--hz-primary)' }}>Find Contractors</button>
            </div>
          ) : sorted.length === 1 ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)' }}><EmptyIcon /></div>
              <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Not enough bids to compare yet</p>
              <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[340px]" style={{ fontFamily: FONT_BODY }}>You need at least two submitted bids to compare proposals.</p>
              <button type="button" onClick={backToBids} className={primaryBtn} style={{ backgroundColor: 'var(--hz-primary)' }}>Back to Bids</button>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <select value={sort} onChange={e => setSort(e.target.value as SortId)} className="h-9 rounded-[10px] px-3 text-[12.5px] bg-[var(--hz-surface)] cursor-pointer" style={selectStyle}>
                  <option value="lowest">Lowest Bid</option>
                  <option value="shortest">Shortest Duration</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* ─── Desktop: comparison table ────────────────────────────── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-separate" style={{ borderSpacing: 0, minWidth: sorted.length * 240 }}>
                  <thead>
                    <tr>
                      <th className="text-left align-bottom pb-3 pr-4" style={{ width: 160 }} />
                      {sorted.map(item => (
                        <th key={item.bid.id} className="text-left align-bottom pb-3 px-3" style={{ minWidth: 230 }}>
                          <ContractorHeader item={item} onViewProfile={() => viewProfile(item)} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Status', render: (i: EnrichedBid) => <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{BID_STATUS_LABELS[i.bid.status]}</span> },
                      { label: 'Bid Amount', render: (i: EnrichedBid) => (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(i.bid.amount)}</span>
                          {i.isLowestBid && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>Lowest Bid</span>}
                        </div>
                      ) },
                      { label: 'Estimated Duration', render: (i: EnrichedBid) => (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatBidDuration(i.bid.duration, i.bid.durationUnit)}</span>
                          {i.isShortestDuration && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>Shortest Duration</span>}
                        </div>
                      ) },
                      { label: 'Proposed Start Date', render: (i: EnrichedBid) => <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{i.bid.proposedStartDate ? formatDate(i.bid.proposedStartDate) : 'Not specified'}</span> },
                      { label: 'Verification', render: (i: EnrichedBid) => i.listing?.verificationStatus === 'verified'
                        ? <span className="flex items-center gap-1 text-[12.5px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                        : <span className="text-[12.5px]" style={{ color: '#999999', fontFamily: FONT_BODY }}>Not verified</span> },
                      { label: 'Proposal', render: (i: EnrichedBid) => (
                        <div className="flex flex-col gap-1.5 max-w-[260px]">
                          <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 line-clamp-3" style={{ fontFamily: FONT_BODY }}>{i.bid.proposal || 'No proposal message provided.'}</p>
                          <button type="button" onClick={() => viewBid(i.bid.id)} className="self-start text-[12px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>View Full Bid →</button>
                        </div>
                      ) },
                      { label: "What's Included", render: (i: EnrichedBid) => <IncludedList text={i.bid.included} empty="No inclusions specified." /> },
                      { label: 'Exclusions / Notes', render: (i: EnrichedBid) => <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 whitespace-pre-wrap" style={{ fontFamily: FONT_BODY }}>{i.bid.exclusions || 'None specified'}</p> },
                    ].map(row => (
                      <tr key={row.label}>
                        <td className="align-top py-3 pr-4" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
                          <span className="text-[11.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{row.label}</span>
                        </td>
                        {sorted.map(item => (
                          <td key={item.bid.id} className="align-top py-3 px-3" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>{row.render(item)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4 pr-4" />
                      {sorted.map(item => (
                        <td key={item.bid.id} className="py-4 px-3">
                          <button type="button" onClick={() => chooseContractor(item)} className={`${primaryBtn} w-full`} style={{ backgroundColor: 'var(--hz-primary)' }}>
                            Choose Contractor →
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ─── Mobile: switchable contractor cards ──────────────────── */}
              <div className="md:hidden flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sorted.map((item, i) => (
                    <button
                      key={item.bid.id}
                      type="button"
                      onClick={() => setMobileIndex(i)}
                      className={`shrink-0 h-9 px-3.5 rounded-[10px] text-[12.5px] font-medium cursor-pointer ${mobileIndex === i ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] text-[var(--hz-ink-muted)]'}`}
                      style={{ border: mobileIndex === i ? '1px solid var(--hz-primary)' : '1px solid #CAC7C6', fontFamily: FONT_BODY }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {sorted[mobileIndex] && (
                  <SectionCard>
                    <div className="flex flex-col gap-4">
                      <ContractorHeader item={sorted[mobileIndex]} onViewProfile={() => viewProfile(sorted[mobileIndex])} />

                      <AttributeBlock label="Status">
                        <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{BID_STATUS_LABELS[sorted[mobileIndex].bid.status]}</span>
                      </AttributeBlock>

                      <AttributeBlock label="Bid Amount">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[19px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(sorted[mobileIndex].bid.amount)}</span>
                          {sorted[mobileIndex].isLowestBid && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>Lowest Bid</span>}
                        </div>
                      </AttributeBlock>

                      <AttributeBlock label="Estimated Duration">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatBidDuration(sorted[mobileIndex].bid.duration, sorted[mobileIndex].bid.durationUnit)}</span>
                          {sorted[mobileIndex].isShortestDuration && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>Shortest Duration</span>}
                        </div>
                      </AttributeBlock>

                      <AttributeBlock label="Proposed Start Date">
                        <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{sorted[mobileIndex].bid.proposedStartDate ? formatDate(sorted[mobileIndex].bid.proposedStartDate as string) : 'Not specified'}</span>
                      </AttributeBlock>

                      <AttributeBlock label="Proposal">
                        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mb-1.5" style={{ fontFamily: FONT_BODY }}>{sorted[mobileIndex].bid.proposal || 'No proposal message provided.'}</p>
                        <button type="button" onClick={() => viewBid(sorted[mobileIndex].bid.id)} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>View Full Bid →</button>
                      </AttributeBlock>

                      <AttributeBlock label="What's Included">
                        <IncludedList text={sorted[mobileIndex].bid.included} empty="No inclusions specified." />
                      </AttributeBlock>

                      <AttributeBlock label="Exclusions / Notes">
                        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 whitespace-pre-wrap" style={{ fontFamily: FONT_BODY }}>{sorted[mobileIndex].bid.exclusions || 'None specified'}</p>
                      </AttributeBlock>

                      <button type="button" onClick={() => chooseContractor(sorted[mobileIndex])} className={primaryBtn} style={{ backgroundColor: 'var(--hz-primary)' }}>
                        Choose Contractor →
                      </button>
                    </div>
                  </SectionCard>
                )}
              </div>
            </>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
