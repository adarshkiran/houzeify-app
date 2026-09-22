import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  homeownerProfile as defaultProfile,
  initials,
  validateAvatarFile,
  applyProfileEdits,
  splitName,
  joinName,
  type HomeownerProfile,
  type EditableProfileFields,
} from '@/data/homeownerProfile'
import { getCustomerBookingsForUser, summarizeBookingItems } from '@/data/customerBooking'
// Customer Implementation 08C — the Current Project card reads the real
// project store now, not the hardcoded currentProjectSummary fixture.
// 12H-B — the real project list now comes from useProjects() (backend-
// backed, owner-scoped — see src/data/projectState.tsx). C12 —
// resolveProjectStatus prefers canonical project.status.
import { resolveProjectStatus, type ProjectType } from '@/data/projects'
import type { Project } from '@/data/projectApi'
import { useProjects } from '@/data/projectState'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
// Customer Implementation 08D — the Saved Addresses card reads the one
// shared customer address book (same store the booking flow uses).
import { useCustomerAddress } from '@/data/customerAddress'
import { useCustomerProfile } from '@/data/customerProfileState'
import { describeCustomerProfileError } from '@/data/customerProfileApi'
import { useAuth } from '@/data/authState'
import Sidebar from '@/shared/components/Sidebar'

// Same demo-identity convention used for the (unrelated) local booking
// fixture store below — matches serviceRequest.ts's own 'user-demo-001'.
// Real user identity comes from AuthProvider/CustomerProfile now (12G-D);
// this constant is scoped to customerBooking.ts's fixture lookup only.
const DEMO_USER_ID = 'user-demo-001'

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
const IcoCheck = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l8 8M11 3L3 11"/>
  </svg>
)
const IcoCamera = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5.5a1 1 0 011-1h1.6l.9-1.5h5l.9 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V5.5z"/>
    <circle cx="8" cy="8.5" r="2.4"/>
  </svg>
)
const IcoTrash = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.6 8a1 1 0 001 .9h3.8a1 1 0 001-.9l.6-8"/>
  </svg>
)
const IcoChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l4 4-4 4"/>
  </svg>
)
const IcoShield = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2l6 2.5v4c0 4-2.5 6.7-6 7.5-3.5-.8-6-3.5-6-7.5v-4L9 2z"/><path d="M6.3 9l1.8 1.8 3.6-3.6"/>
  </svg>
)
const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="10" height="7.5" rx="1.5"/><path d="M6 8V5.5a3 3 0 016 0V8"/>
  </svg>
)
const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9S4.5 3.5 9 3.5 16.5 9 16.5 9 13.5 14.5 9 14.5 1.5 9 1.5 9z"/><circle cx="9" cy="9" r="2.3"/>
  </svg>
)
const IcoLogout = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 15.5H4a1.5 1.5 0 01-1.5-1.5V4A1.5 1.5 0 014 2.5h3"/><path d="M12 12.5l4-3.5-4-3.5"/><line x1="16" y1="9" x2="6.5" y2="9"/>
  </svg>
)
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="7.2" x2="8" y2="11"/><circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// "About me" — onboarding-only, optional. 200-300 words is a target the
// copy nudges toward, not a hard gate (short intros are still real intros)
// — so only the upper bound is actually enforced, same convention as
// SubmitBidScreen's own PROPOSAL_MAX (truncate further typing, never block
// Continue). Word count, not character count, since that's the unit the
// "200/300 words" guidance is given in.
const ABOUT_ME_MAX_WORDS = 300
function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
}
function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/)
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ')
}

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
        active ? 'bg-[#F3EAFF] text-[#722ED1]' : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
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

function SectionCard({ eyebrow, tag, children, className }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={['bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
      <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#16A34A' }}><IcoCheck /></span>
      Verified
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ profile, size = 72 }: { profile: HomeownerProfile; size?: number }) {
  if (profile.avatarUrl) {
    return <img src={profile.avatarUrl} alt={`${profile.fullName}'s profile photo`} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: '#722ED1', fontFamily: '"Google Sans Flex:Bold", sans-serif', fontSize: size * 0.32 }}
      aria-hidden="true"
    >
      {initials(profile.fullName)}
    </div>
  )
}

// ─── Notice (lightweight, for not-yet-available actions) ────────────────────

function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[12px] px-4 py-3 bg-white border border-[#E3DDD7]" style={{ boxShadow: '0 8px 30px rgba(36,35,38,0.14)' }}>
      <span style={{ color: '#722ED1' }}><IcoInfo /></span>
      <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="w-6 h-6 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
    </div>
  )
}

// ─── Profile hero ─────────────────────────────────────────────────────────────

function ProfileHero({ profile, onEdit, onUploadPhoto, onRemovePhoto, avatarError, className }: {
  profile: HomeownerProfile
  onEdit: () => void
  onUploadPhoto: (file: File) => void
  onRemovePhoto: () => void
  avatarError: string | null
  className?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={['bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <Avatar profile={profile} size={72} />
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#E3DDD7] flex items-center justify-center text-[#68636D] hover:text-[#722ED1] hover:border-[#722ED1] cursor-pointer transition-colors"
          >
            <IcoCamera />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUploadPhoto(f); e.target.value = '' }}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <span className="text-[19px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{profile.fullName}</span>
          <span className="inline-flex items-center gap-1.5 w-fit text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
            {profile.role}
          </span>
          {/* Customer Implementation 08B: no real account-created timestamp
              exists anywhere in the current onboarding flow (traced in the
              08A/08B inspection) — "Member since {date}" was always the
              hardcoded demo fixture's createdAt, never a genuine one, so it
              no longer renders rather than keep showing a fabricated date. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
            <span>{profile.location}</span>
          </div>
        </div>
      </div>
      {avatarError && <p role="alert" className="text-[12px] m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{avatarError}</p>}
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={onEdit} className="h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          Edit profile
        </button>
        {profile.avatarUrl && (
          <button onClick={onRemovePhoto} className="h-9 px-3.5 rounded-[10px] text-[12px] font-medium cursor-pointer border border-[#E3DDD7] bg-transparent hover:bg-[#F4F0EC] transition-colors inline-flex items-center gap-1.5" style={{ color: '#242326', fontFamily: FONT_BODY }}>
            <IcoTrash /> Remove photo
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Personal details ─────────────────────────────────────────────────────────

function PersonalDetails({ profile, editing, draft, onDraftChange, onSave, onCancel, saving, className }: {
  profile: HomeownerProfile
  editing: boolean
  draft: EditableProfileFields
  onDraftChange: (field: keyof EditableProfileFields, value: string) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  className?: string
}) {
  const rows: { key: keyof EditableProfileFields; label: string }[] = [
    { key: 'fullName', label: 'Full name' },
    { key: 'preferredName', label: 'Preferred name' },
    { key: 'location', label: 'Location' },
    { key: 'language', label: 'Language' },
  ]
  return (
    <SectionCard eyebrow="Personal Details" className={className}>
      <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between gap-3 py-2.5">
            <label htmlFor={editing ? `pd-${r.key}` : undefined} className="text-[13px] text-[#68636D] shrink-0" style={{ fontFamily: FONT_BODY }}>{r.label}</label>
            {editing ? (
              <input
                id={`pd-${r.key}`}
                type="text"
                value={draft[r.key]}
                onChange={e => onDraftChange(r.key, e.target.value)}
                disabled={saving}
                className="h-9 px-2.5 rounded-[8px] border border-[#E3DDD7] bg-white text-[13px] text-[#242326] text-right outline-none focus:border-[#722ED1] transition-colors w-[55%] disabled:opacity-60"
                style={{ fontFamily: FONT_BODY }}
              />
            ) : (
              <span className="text-[13px] font-medium text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{profile[r.key]}</span>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={onSave}
            disabled={saving}
            className="h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:cursor-wait inline-flex items-center gap-1.5"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            {saving && (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="h-9 px-4 rounded-[10px] text-[12px] font-medium cursor-pointer border border-[#E3DDD7] bg-transparent hover:bg-[#F4F0EC] transition-colors disabled:opacity-60"
            style={{ color: '#242326', fontFamily: FONT_BODY }}
          >
            Cancel
          </button>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Account information ──────────────────────────────────────────────────────

function AccountInformation({ profile, onChangeEmail, onChangeMobile, className }: {
  profile: HomeownerProfile
  onChangeEmail: () => void
  onChangeMobile: () => void
  className?: string
}) {
  return (
    <SectionCard eyebrow="Account Information" className={className}>
      <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Email</span>
            <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{profile.email}</span>
            {profile.emailVerified && <VerifiedBadge />}
          </div>
          <button onClick={onChangeEmail} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline shrink-0" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
            Change email
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Mobile</span>
            <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{profile.mobile}</span>
            {profile.mobileVerified && <VerifiedBadge />}
          </div>
          <button onClick={onChangeMobile} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline shrink-0" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
            Change mobile
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Role card ─────────────────────────────────────────────────────────────────

function RoleCard({ onChangeRole, className }: { onChangeRole: () => void; className?: string }) {
  return (
    <SectionCard eyebrow="Your Role" className={className}>
      <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Homeowner</span>
      <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        You're using Houzeify to plan, estimate and manage your home construction project.
      </p>
      <button onClick={onChangeRole} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
        Change role
      </button>
    </SectionCard>
  )
}

function ChangeRoleModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="role-modal-title" aria-describedby="role-modal-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="role-modal-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Change your role?</h2>
        <p id="role-modal-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Changing your role may change the tools and workspace available to you.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Continue</button>
        </div>
      </div>
    </>
  )
}

// ─── Project summary — Customer Implementation 08C ────────────────────────
// Wired to the real backend Project list (useProjects(), 12H-B), NOT the
// old hardcoded `currentProjectSummary` fixture. "Current project" = the most
// recently updated real project — the same [0]-of-sorted-list convention
// ProjectsListScreen and the dashboard use. Stage is the LIVE status
// (resolveProjectStatus + projectStageLabel), identical to
// ProjectsListScreen's own rows — never the stale value stored at project
// creation. Rows only render fields genuinely present on the Project
// record; nothing is fabricated. Honest empty state when the homeowner has
// no project yet, mirroring BookingsSummary above. Read-only — never writes
// to projects.ts, and the booking / Address systems are untouched.

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'new-build': 'New Build',
  renovation: 'Renovation',
}

function ProjectSummary({ onViewProject, className }: {
  onViewProject: (project: Project) => void
  className?: string
}) {
  // 12H-B — real, owner-scoped backend project list, sorted most-recently-
  // updated first by the backend itself — [0] is the same "current project"
  // meaning this card has always used, never "the user's only project."
  const { projects } = useProjects()
  const current = projects[0]

  if (!current) {
    return (
      <SectionCard eyebrow="Current Project" className={className}>
        <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You haven&apos;t started a project yet. Once you do, it&apos;ll show up here.
        </p>
      </SectionCard>
    )
  }

  const status = resolveProjectStatus(current.status, current.stage)
  const statusLabel = isProjectStatus(status)
    ? PROJECT_STATUS_LABELS[status]
    : (projectStageLabel(status) ?? status)
  const rows = ([
    current.type && (current.type === 'new-build' || current.type === 'renovation')
      ? { label: 'Type', value: PROJECT_TYPE_LABELS[current.type] }
      : null,
    current.location ? { label: 'Location', value: current.location } : null,
    current.propertyType ? { label: 'Property', value: current.propertyType } : null,
    { label: 'Status', value: statusLabel },
  ].filter(Boolean)) as { label: string; value: string }[]

  return (
    <SectionCard eyebrow="Current Project" className={className}>
      <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{current.name}</span>
      <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between gap-3 py-2">
            <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{r.label}</span>
            <span className="text-[13px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{r.value}</span>
          </div>
        ))}
      </div>
      <button onClick={() => onViewProject(current)} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
        View project →
      </button>
    </SectionCard>
  )
}

// ─── Service bookings — Customer Implementation 07E ────────────────────────
// The one place in Profile a homeowner reaches their priced-service booking
// history from (see the 07E inspection report §12/§20: not primary nav, not
// folded into Projects — that's construction/renovation only, a separate
// concept). Reads the SAME getCustomerBookingsForUser() store
// MyBookingsScreen itself lists from — never a duplicate summary of its own.

function BookingsSummary({ onViewBookings, className }: { onViewBookings: () => void; className?: string }) {
  const bookings = getCustomerBookingsForUser(DEMO_USER_ID)
  const mostRecent = bookings[0]
  return (
    <SectionCard eyebrow="Service Bookings" className={className}>
      {mostRecent ? (
        <>
          <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
            {bookings.length} booking{bookings.length === 1 ? '' : 's'}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{summarizeBookingItems(mostRecent)}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Most recent · {mostRecent.slot.label}</span>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You haven&apos;t booked a service yet. Once you do, it&apos;ll show up here.
        </p>
      )}
      <button onClick={onViewBookings} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
        View bookings →
      </button>
    </SectionCard>
  )
}

// ─── Saved addresses — Customer Implementation 08D ────────────────────────
// Entry point into the standalone Saved Addresses screen. Count and preview
// come straight from the one shared customer address book (useCustomerAddress)
// — the same store the booking Address screen reads — never fabricated. An
// honest empty state when every saved address has been removed.

function SavedAddresses({ onManage, className }: { onManage: () => void; className?: string }) {
  const { addresses } = useCustomerAddress()
  const hasAny = addresses.length > 0
  return (
    <SectionCard eyebrow="Saved Addresses" className={className}>
      {hasAny ? (
        <>
          <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
            {addresses.length} saved address{addresses.length === 1 ? '' : 'es'}
          </span>
          <span className="text-[13px] text-[#68636D] leading-[1.6] truncate" style={{ fontFamily: FONT_BODY }}>
            {addresses.map(a => a.label).join(' · ')}
          </span>
        </>
      ) : (
        <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You haven&apos;t saved an address yet. Add one and it&apos;ll be ready when you book a service.
        </p>
      )}
      <button onClick={onManage} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
        {hasAny ? 'Manage addresses →' : 'Add an address →'}
      </button>
    </SectionCard>
  )
}

// ─── Preferences ────────────────────────────────────────────────────────────────

function PreferenceRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between gap-3 py-2.5 cursor-pointer border-0 bg-transparent text-left">
      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{value}</span>
        <span className="text-[#9A949D]"><IcoChevronRight /></span>
      </span>
    </button>
  )
}

function Preferences({ profile, onOpenPreference, className }: { profile: HomeownerProfile; onOpenPreference: () => void; className?: string }) {
  return (
    <SectionCard eyebrow="Preferences" className={className}>
      <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
        <PreferenceRow label="Language" value={profile.language} onClick={onOpenPreference} />
        <PreferenceRow label="Units" value={profile.unitPreference === 'sq ft' ? 'Square feet' : 'Square metres'} onClick={onOpenPreference} />
        <PreferenceRow label="Currency" value={`${profile.currency} ₹`} onClick={onOpenPreference} />
        <PreferenceRow label="Notifications" value={profile.notificationsEnabled ? 'Enabled' : 'Disabled'} onClick={onOpenPreference} />
      </div>
    </SectionCard>
  )
}

// ─── Hozie personalization ──────────────────────────────────────────────────────

const HOZIE_USES = ['AI advice', 'Cost estimates', 'Material calculations', 'Plan analysis', 'Project recommendations']

function HoziePersonalization({ onManage, className }: { onManage: () => void; className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Your Hozie Experience</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Hozie uses your project information to personalize:</p>
      <div className="flex flex-wrap gap-1.5">
        {HOZIE_USES.map(u => (
          <span key={u} className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#242326]" style={{ backgroundColor: '#FFFFFF', fontFamily: FONT_BODY }}>{u}</span>
        ))}
      </div>
      <button onClick={onManage} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
        Manage AI preferences →
      </button>
    </div>
  )
}

// ─── Account actions ─────────────────────────────────────────────────────────────

const IcoCog = () => (
  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5" />
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06" />
  </svg>
)

function AccountActions({ onOpenAccountSettings, onAction, onSignOut, className }: {
  onOpenAccountSettings: () => void
  onAction: (label: string) => void
  onSignOut: () => void
  className?: string
}) {
  return (
    <SectionCard eyebrow="Account" className={className}>
      <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
        {/* Customer Implementation 08E — real destination (App.tsx's
            account-settings route, homeowner branch via role={resolvedRole}).
            The three rows below stay honest "coming soon" notices: no
            password / security / privacy controls exist anywhere in this
            codebase, and Account Settings itself shows none either. */}
        <button onClick={onOpenAccountSettings} className="w-full flex items-center justify-between gap-3 py-2.5 cursor-pointer border-0 bg-transparent text-left">
          <span className="flex items-center gap-2.5 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
            <span style={{ color: '#68636D' }}><IcoCog /></span> Account Settings
          </span>
          <span className="text-[#9A949D]"><IcoChevronRight /></span>
        </button>
        {[
          { label: 'Change password', icon: <IcoLock /> },
          { label: 'Security', icon: <IcoShield /> },
          { label: 'Privacy', icon: <IcoEye /> },
        ].map(a => (
          <button key={a.label} onClick={() => onAction(a.label)} className="w-full flex items-center justify-between gap-3 py-2.5 cursor-pointer border-0 bg-transparent text-left">
            <span className="flex items-center gap-2.5 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              <span style={{ color: '#68636D' }}>{a.icon}</span> {a.label}
            </span>
            <span className="text-[#9A949D]"><IcoChevronRight /></span>
          </button>
        ))}
      </div>
      <div className="pt-2 mt-1 border-t border-[#FFFFFF]">
        <button onClick={onSignOut} className="w-full flex items-center gap-2.5 py-2 cursor-pointer border-0 bg-transparent text-left" style={{ color: '#DC2626' }}>
          <IcoLogout />
          <span className="text-[13px] font-medium" style={{ fontFamily: FONT_BODY }}>Sign out</span>
        </button>
      </div>
    </SectionCard>
  )
}

function SignOutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="signout-title" aria-describedby="signout-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="signout-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Sign out of Houzeify?</h2>
        <p id="signout-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can sign back in anytime to access your projects.</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#DC2626', fontFamily: FONT_BODY }}>Sign out</button>
        </div>
      </div>
    </>
  )
}

// ─── Onboarding view ────────────────────────────────────────────────────────
// Reached from Homeowner Onboarding (008) as step 2 of the 4-step homeowner
// flow — a lightweight personalization step, NOT the full account/settings
// page above. Reuses the same profile model, Avatar rendering and edit
// helpers; it only ever touches name + preferred-name fields, never
// project/location/preference data that belongs to later screens.

type AddressMode = 'first' | 'full'

function OnboardingAmbientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute rounded-full" style={{ top: '-160px', right: '-160px', width: 620, height: 620, backgroundColor: 'rgba(243,234,255,0.07)', filter: 'blur(110px)' }} />
      <div className="absolute rounded-full" style={{ bottom: '-200px', left: '-160px', width: 700, height: 700, backgroundColor: 'rgba(243,234,255,0.10)', filter: 'blur(130px)' }} />
      <div className="absolute rounded-full" style={{ top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, height: 480, backgroundColor: 'rgba(243,234,255,0.10)', filter: 'blur(90px)' }} />
    </div>
  )
}

function OnboardingProfileView({
  initialFullName,
  location,
  onNavigate,
}: {
  /** Real name from Screen 008's "Your Name" field (projectData.full_name).
   *  Named distinctly from the local `fullName` derived below (firstName +
   *  lastName joined) to avoid shadowing it. */
  initialFullName?: string
  location?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // Customer Implementation 10F — prefer the real name the user just
  // entered on Screen 008; when it's genuinely absent (e.g. direct/dev
  // access to this screen), the First name / Last name fields now start
  // genuinely empty (their own existing "First name" / "Last name"
  // placeholders already handle that state honestly) rather than
  // silently pre-filling the demo fixture's "Adarsh" / "Kiran" — no
  // customer should ever see a name they didn't type sitting in an
  // editable field as if it were already theirs.
  const initial = splitName(initialFullName?.trim() ?? '')
  const [firstName, setFirstName] = useState(initial.firstName)
  const [lastName, setLastName] = useState(initial.lastName)
  const [aboutMe, setAboutMe] = useState('')
  const [addressMode, setAddressMode] = useState<AddressMode>('first')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultProfile.avatarUrl)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const customerProfile = useCustomerProfile()
  const auth = useAuth()

  const fullName = joinName(firstName, lastName)
  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0
  // 10F — no fallback to defaultProfile.fullName here either: an empty
  // fullName now reaches Avatar's initials() as '', which already
  // returns the neutral '?' (never "AK") — the same convention every
  // other customer-facing avatar in the app already uses.
  const previewProfile: HomeownerProfile = { ...defaultProfile, fullName, avatarUrl }

  function uploadPhoto(file: File) {
    const result = validateAvatarFile(file)
    if (!result.valid) { setAvatarError(result.error ?? 'Unable to use this image.'); return }
    setAvatarError(null)
    setAvatarUrl(URL.createObjectURL(file))
  }

  function handleBack() {
    onNavigate('onboarding-homeowner')
  }

  async function handleContinue() {
    setTouched(true)
    if (!canContinue || saving) return
    const preferredName = addressMode === 'first' ? firstName.trim() : fullName
    setSaving(true)
    setSaveError('')
    try {
      // Real persistence (12G-C1) — customerProfile.save() decides
      // create-vs-update on its own; location/language aren't collected on
      // this step yet (location-setup is the very next screen), so they're
      // simply omitted rather than sent as an invented value — the backend
      // model already treats them as optional/nullable for exactly this.
      await customerProfile.save({ fullName, preferredName })
    } catch (err) {
      setSaving(false)
      setSaveError(describeCustomerProfileError(err))
      return
    }
    setSaving(false)
    const updated = applyProfileEdits(defaultProfile, {
      fullName,
      preferredName,
      location: defaultProfile.location,
      language: defaultProfile.language,
    })
    onNavigate('location-setup', {
      // 12G-D — no user_id here: it was always `defaultProfile.userId`
      // (the 'user-demo-001' fixture) and nothing downstream ever read
      // projectData.user_id anyway (confirmed unused). Real user identity
      // is the authenticated session (AuthProvider), never a value
      // threaded through projectData.
      full_name: updated.fullName,
      preferred_name: updated.preferredName,
      about_me: aboutMe.trim(),
    })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>
      <OnboardingAmbientBg />

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 2 of 4</span>
        </div>
        <div className="h-[2px] bg-[#F4F0EC] w-full">
          <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '50%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 720 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Your Profile</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Tell us a little about you.
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              Your profile helps Houzeify personalize your experience and connect you with the right professionals.
            </p>
          </div>

          {/* Hozie intro */}
          <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Nice to meet you.</span>{' '}
              I&apos;ll use your profile and project preferences to make Houzeify more useful for you.
            </p>
          </div>

          {/* Avatar + form */}
          <div className="flex flex-col gap-5 rounded-[16px] bg-white border border-[#E3DDD7] p-5 sm:p-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar profile={previewProfile} size={64} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile photo"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#E3DDD7] flex items-center justify-center text-[#68636D] hover:text-[#722ED1] hover:border-[#722ED1] cursor-pointer transition-colors"
                >
                  <IcoCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = '' }}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Profile photo</span>
                <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional — JPG or PNG, up to 5 MB.</span>
              </div>
            </div>
            {avatarError && <p role="alert" className="text-[12px] m-0 -mt-2" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{avatarError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="ob-first-name" className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>First name</label>
                <input
                  id="ob-first-name"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  aria-invalid={touched && firstName.trim().length === 0}
                  className={['w-full h-[46px] px-3.5 rounded-[10px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', touched && firstName.trim().length === 0 ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>
              <div>
                <label htmlFor="ob-last-name" className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>Last name</label>
                <input
                  id="ob-last-name"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  aria-invalid={touched && lastName.trim().length === 0}
                  className={['w-full h-[46px] px-3.5 rounded-[10px] border bg-white text-[14px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', touched && lastName.trim().length === 0 ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>
            </div>
            {touched && !canContinue && (
              <p role="alert" className="text-[12px] -mt-2 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>First and last name are required.</p>
            )}

            {/* 12G-D — real identity only. Phone comes from the
                authenticated session (AuthProvider/auth.user), the one
                genuinely real value at this point in the flow — never the
                defaultProfile fixture's unrelated demo number. Email has no
                real source yet (12E auth is phone-only; a CustomerProfile
                doesn't exist until this very step's Continue creates one),
                so it's shown honestly as "Not added yet" rather than a
                fabricated address — this app has no email-collection step
                anywhere in onboarding. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <span className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>Email</span>
                <div className="h-[46px] px-3.5 rounded-[10px] border border-[#E3DDD7] bg-[#F4F0EC] flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#9A949D] truncate" style={{ fontFamily: FONT_BODY }}>{customerProfile.profile?.email || 'Not added yet'}</span>
                </div>
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>Phone number</span>
                <div className="h-[46px] px-3.5 rounded-[10px] border border-[#E3DDD7] bg-[#F4F0EC] flex items-center justify-between gap-2">
                  <span className="text-[13.5px] text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{auth.user?.phoneNumber || 'Not available'}</span>
                  {Boolean(auth.user?.phoneVerifiedAt) && <VerifiedBadge />}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#9A949D] -mt-2 m-0" style={{ fontFamily: FONT_BODY }}>Your phone is verified from your Houzeify account — no need to enter it again.</p>

            <div>
              <span className="text-[13px] font-semibold text-[#242326] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>How should we address you?</span>
              <div role="radiogroup" aria-label="How should we address you?" className="flex flex-wrap gap-2">
                {([
                  { mode: 'first' as AddressMode, label: firstName.trim() || 'First name' },
                  { mode: 'full' as AddressMode, label: fullName.trim() || 'Full name' },
                ]).map(opt => (
                  <button
                    key={opt.mode}
                    type="button"
                    role="radio"
                    aria-checked={addressMode === opt.mode}
                    onClick={() => setAddressMode(opt.mode)}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
                    style={{
                      fontFamily: FONT_BODY,
                      backgroundColor: addressMode === opt.mode ? '#F3EAFF' : '#FFFFFF',
                      borderColor: addressMode === opt.mode ? '#722ED1' : '#CAC7C6',
                      color: addressMode === opt.mode ? '#722ED1' : '#1E1E1E',
                    }}
                  >
                    {addressMode === opt.mode && <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><IcoCheck /></span>}
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>
                {/* Customer Implementation 10F — neutral "there" fallback
                    (matches the same-screen chip labels' own "First name" /
                    "Full name" placeholder convention just above) instead of
                    the fabricated "Adarsh" / "Adarsh Kiran" example name. */}
                Hozie uses this in conversation — e.g. &ldquo;Hi {(addressMode === 'first' ? firstName.trim() : fullName.trim()) || 'there'}, I found 4 contractors that match your project.&rdquo;
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>About me</span>
                <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>
              </div>
              <textarea
                value={aboutMe}
                onChange={e => setAboutMe(truncateToWords(e.target.value, ABOUT_ME_MAX_WORDS))}
                placeholder="Tell Hozie a bit about yourself and what you're hoping to build — a couple of sentences is plenty."
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                style={{ fontFamily: FONT_BODY }}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Aim for around 200–300 words.</span>
                <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{wordCount(aboutMe)}/{ABOUT_ME_MAX_WORDS} words</span>
              </div>
            </div>
          </div>

          {/* Profile summary */}
          <div className="w-full rounded-[16px] bg-white border border-[#E3DDD7] p-5 flex items-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D] sr-only">Your Profile</span>
            <Avatar profile={previewProfile} size={48} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your Profile</span>
              <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{fullName.trim() || 'Your name'}</span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                Homeowner{location && location.trim() ? ` · ${location.trim()}` : ''}
              </span>
              {!(location && location.trim()) && (
                <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Location not set — you&apos;ll complete this in the next step.</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            {saveError && (
              <p role="alert" className="text-[12px] m-0 text-center" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{saveError}</p>
            )}
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                disabled={(touched && !canContinue) || saving}
                aria-label="Continue"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[220px]',
                  'flex items-center justify-center gap-2',
                  saving ? 'cursor-wait' : 'cursor-pointer',
                  canContinue ? 'bg-[#722ED1] text-white hover:brightness-90 active:scale-[0.99]' : 'bg-[#F4F0EC] text-[#9A949D]',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Continue →'
                )}
              </button>
              <button
                onClick={handleBack}
                disabled={saving}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: FONT_BODY }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
// Dispatcher: reached via 008 Homeowner Onboarding (primaryIntent present)
// renders the lightweight onboarding step; reached via the dashboard avatar
// (no primaryIntent) renders the full account/settings page. One screen,
// one export — never a duplicated profile page.

export default function HomeownerProfileScreen({
  onboardingFlow,
  fullName,
  preferredName,
  location,
  email,
  onNavigate,
}: {
  /** Set (to 'true') only while inside the onboarding-style chain —
   *  BuildOrImproveScreen or the original Screen 007 PrimaryIntentScreen,
   *  both via projectData.onboarding_flow — and cleared again by Screen 011
   *  once that chain finishes. Deliberately NOT keyed off primaryIntent:
   *  once a homeowner has completed that chain once, primary_intent stays
   *  set in projectData for the rest of the session, which previously kept
   *  showing this onboarding view even from the ordinary Sidebar "Profile"
   *  link (dest: 'homeowner-profile', no onboardingFlow) — this flag is the
   *  fix, scoped to only the active chain. */
  onboardingFlow?: string
  /** Real name from Screen 008's "Your Name" field (projectData.full_name)
   *  — the existing canonical name field every other screen already reads.
   *  Used by BOTH branches below as of Customer Implementation 08B — the
   *  onboarding view already consumed this; FullSettingsProfileView
   *  previously ignored it in favour of the hardcoded demo fixture, which
   *  08B fixes. */
  fullName?: string
  /** projectData.preferred_name — written by this same screen's own
   *  onboarding view (see handleContinue below) once a homeowner completes
   *  it, same field 5+ other screens in App.tsx already read. */
  preferredName?: string
  location?: string
  /** projectData.email — genuinely present in projectData's shape (other
   *  screens already read it), but no homeowner-facing screen currently
   *  writes a real value into it (CreateAccountScreen's own email field is
   *  never forwarded via onNavigate) — so this is realistically always
   *  undefined today. Threaded through anyway rather than assumed absent,
   *  per the 08B brief's "only wire fields that genuinely exist" — the
   *  field genuinely exists in the app's data shape; FullSettingsProfileView
   *  below honours a real value the moment one exists, and falls back
   *  honestly until then. */
  email?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  if (onboardingFlow) {
    return <OnboardingProfileView initialFullName={fullName} location={location} onNavigate={onNavigate} />
  }
  return (
    <FullSettingsProfileView
      onNavigate={onNavigate}
      fullName={fullName}
      preferredName={preferredName}
      location={location}
      email={email}
    />
  )
}

// Honest, actionable fallbacks (Customer Implementation 08B) — never the
// hardcoded demo person. "Add your X" where the field is something the
// homeowner would naturally complete elsewhere in the app; "Not added"
// where 08B intentionally doesn't wire an edit path for it (email/phone
// changes are explicitly out of scope — see AccountInformation below).
const FALLBACK_NAME = 'Add your name'
const FALLBACK_LOCATION = 'Not added'
const FALLBACK_CONTACT = 'Not added'

/** Builds the ONE HomeownerProfile FullSettingsProfileView renders from —
 *  real onboarding values where genuinely available (traced in the 08A/08B
 *  inspection: full_name, preferred_name, city/state via `location`), an
 *  honest fallback where not. Phone has NO real capture path anywhere in
 *  this app's current onboarding flow — App.tsx's own `phone` state is
 *  itself a hardcoded demo default ('98765 43210') no screen ever
 *  overwrites with a real number, so threading it through would have
 *  quietly re-fabricated a "Verified" mobile number under a different
 *  name; mobile stays an honest fallback here for the same reason email
 *  does. Every field 08B doesn't touch (role, language, unit preference,
 *  currency, notifications, avatar, id, timestamps) still comes from the
 *  existing `defaultProfile` fixture unchanged — 08B is identity-only, not
 *  a general Profile data rewrite. */
function buildRealProfile({ fullName, preferredName, location, email }: {
  fullName?: string; preferredName?: string; location?: string; email?: string
}): HomeownerProfile {
  const resolvedFullName = fullName?.trim() || FALLBACK_NAME
  const resolvedPreferredName = preferredName?.trim()
    || (fullName?.trim() ? splitName(fullName.trim()).firstName : '')
    || resolvedFullName
  const resolvedEmail = email?.trim()
  return {
    ...defaultProfile,
    fullName: resolvedFullName,
    preferredName: resolvedPreferredName,
    location: location?.trim() || FALLBACK_LOCATION,
    email: resolvedEmail || FALLBACK_CONTACT,
    // Only ever true when a real value is actually present — never
    // inherited from the old hardcoded fixture's always-true default, so
    // this stops claiming a verification that never happened.
    emailVerified: Boolean(resolvedEmail),
    mobile: FALLBACK_CONTACT,
    mobileVerified: false,
  }
}

function FullSettingsProfileView({
  onNavigate,
  fullName,
  preferredName,
  location,
  email,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  fullName?: string
  preferredName?: string
  location?: string
  email?: string
}) {
  const customerProfile = useCustomerProfile()
  // 12G-C1 precedence: a successfully loaded backend CustomerProfile wins
  // over the legacy projectData-derived props for the identity fields it
  // actually carries; buildRealProfile(props) remains the fallback for
  // every other field (mobile, avatar, role, etc. — fields 12G-B's
  // CustomerProfile deliberately doesn't own) and for the case where the
  // backend hasn't loaded yet or genuinely has no profile.
  const [profile, setProfile] = useState<HomeownerProfile>(() => buildRealProfile({ fullName, preferredName, location, email }))
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<EditableProfileFields>({
    fullName: profile.fullName, preferredName: profile.preferredName, location: profile.location, language: profile.language,
  })
  const [savedNotice, setSavedNotice] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Reconciles local display state with the backend the moment it resolves
  // — never while `editing` (an in-progress edit must not be clobbered out
  // from under the homeowner), and never for 'not-found'/'loading'/'error'
  // (those must not blank out whatever the legacy props already showed).
  useEffect(() => {
    if (editing) return
    if (customerProfile.status === 'loaded' && customerProfile.profile) {
      const backend = customerProfile.profile
      setProfile(prev => ({
        ...prev,
        fullName: backend.fullName,
        preferredName: backend.preferredName || backend.fullName,
        location: backend.location || prev.location,
        language: backend.language || prev.language,
      }))
    } else if (customerProfile.status === 'error') {
      setNotice("Couldn't load your saved profile — showing what's available locally. Try refreshing the page.")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerProfile.status, customerProfile.profile])

  const startEdit = () => {
    setDraft({ fullName: profile.fullName, preferredName: profile.preferredName, location: profile.location, language: profile.language })
    setEditing(true)
    setSavedNotice(false)
  }
  const cancelEdit = () => setEditing(false)
  const saveEdit = async () => {
    if (saving) return
    setSaving(true)
    try {
      // Real persistence (12G-C1) — draft's 4 fields map 1:1 onto
      // CustomerProfile's fullName/preferredName/location/language; email
      // isn't in this draft (it's read-only above, see AccountInformation)
      // so it's never sent here.
      await customerProfile.save({
        fullName: draft.fullName,
        preferredName: draft.preferredName,
        location: draft.location,
        language: draft.language,
      })
    } catch (err) {
      setSaving(false)
      setNotice(describeCustomerProfileError(err))
      return // stay in editing mode with the draft intact — never pretend success
    }
    setSaving(false)
    const updated = applyProfileEdits(profile, draft)
    setProfile(updated)
    setEditing(false)
    setSavedNotice(true)
    // Customer Implementation 10E — propagate the identity fields (full
    // name + preferred name only) into the canonical projectData.full_name
    // / preferred_name that the rest of the customer app already reads
    // (Home, Services, Category Detail, AI Advisor — see App.tsx's render
    // blocks), via the SAME onNavigate mechanism every other
    // identity-setting screen already uses (e.g. OnboardingProfileView's
    // handleContinue below). Re-navigating to this same screen only merges
    // these two fields into projectData — no visible navigation occurs,
    // and no other Profile field (location, language, avatar…) is
    // propagated or touched by this call.
    onNavigate('homeowner-profile', {
      full_name: updated.fullName,
      preferred_name: updated.preferredName,
    })
  }

  const uploadPhoto = (file: File) => {
    const result = validateAvatarFile(file)
    if (!result.valid) { setAvatarError(result.error ?? 'Unable to use this image.'); return }
    setAvatarError(null)
    const url = URL.createObjectURL(file)
    setProfile(prev => ({ ...prev, avatarUrl: url, updatedAt: new Date().toISOString() }))
  }
  const removePhoto = () => setProfile(prev => ({ ...prev, avatarUrl: null, updatedAt: new Date().toISOString() }))

  const showNotice = (message: string) => setNotice(message)

  // Customer Implementation 08C — open the real project's workspace with the
  // same projectData keys ProjectsListScreen.openProject passes, instead of
  // the old blanket jump to the Create Project form.
  const viewProject = (project: Project) => onNavigate('project-workspace', {
    project_id: project.id,
    project_name: project.name,
    project_type: project.type ?? '',
    property_type: project.propertyType ?? '',
    location: project.location ?? '',
    project_stage: project.stage ?? '',
  })
  // Customer Implementation 08E — the real screens already exist and are
  // already routed in App.tsx (with role={resolvedRole}); these actions used
  // to fire a "coming soon" toast even though the screens were live.
  const openPreferences = () => onNavigate('preferences')
  const openAccountSettings = () => onNavigate('account-settings')
  const signOutConfirmed = () => { setShowSignOutModal(false); onNavigate('welcome') }
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Profile</span>
        <button onClick={startEdit} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>Edit</button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="profile" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Profile</h1>
            <button onClick={startEdit} className="h-9 px-4 rounded-[10px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] cursor-pointer bg-white hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
              Edit profile
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Page header */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Profile</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Your profile.</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
                  Manage your account information and homeowner preferences.
                </p>
              </div>

              {savedNotice && !editing && (
                <div role="status" className="flex items-center gap-2 rounded-[12px] px-4 py-3" style={{ backgroundColor: '#DCFCE7' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#16A34A' }}><IcoCheck /></span>
                  <span className="text-[13px] font-medium" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>Profile updated ✓</span>
                </div>
              )}

              {/* Two INDEPENDENT columns on lg — each is its own flex stack
                  that packs its cards with a fixed gap, so a short card on one
                  side (e.g. the Current Project empty state) never leaves a
                  gap opposite a taller card on the other. The old layout used
                  a shared row grid (lg:row-start-N + self-start), which forced
                  each row's height to the taller of the two cards and left the
                  shorter one floating with dead space beneath it. DOM order is
                  still all left-column cards then all right-column cards, which
                  is exactly the single-column mobile order. */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-6">
                  <ProfileHero
                    profile={profile}
                    onEdit={startEdit}
                    onUploadPhoto={uploadPhoto}
                    onRemovePhoto={removePhoto}
                    avatarError={avatarError}
                  />
                  <PersonalDetails
                    profile={profile}
                    editing={editing}
                    draft={draft}
                    onDraftChange={(field, value) => setDraft(prev => ({ ...prev, [field]: value }))}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    saving={saving}
                  />
                  <AccountInformation
                    profile={profile}
                    onChangeEmail={() => showNotice('Changing your email requires re-verification — this will be available soon.')}
                    onChangeMobile={() => showNotice('Changing your mobile number requires re-verification — this will be available soon.')}
                  />
                  <AccountActions onOpenAccountSettings={openAccountSettings} onAction={label => showNotice(`${label} will be available soon.`)} onSignOut={() => setShowSignOutModal(true)} />
                </div>

                <div className="flex flex-col gap-6">
                  <HoziePersonalization onManage={() => showNotice('AI preferences are managed from Settings — coming soon.')} />
                  <RoleCard onChangeRole={() => setShowRoleModal(true)} />
                  <ProjectSummary onViewProject={viewProject} />
                  <Preferences profile={profile} onOpenPreference={openPreferences} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showRoleModal && (
        <ChangeRoleModal
          onCancel={() => setShowRoleModal(false)}
          onConfirm={() => { setShowRoleModal(false); showNotice('Role changes are not available yet.') }}
        />
      )}
      {showSignOutModal && <SignOutModal onCancel={() => setShowSignOutModal(false)} onConfirm={signOutConfirmed} />}
      {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}
    </div>
  )
}
