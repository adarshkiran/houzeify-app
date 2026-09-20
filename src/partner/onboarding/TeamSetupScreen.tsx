import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  INVITABLE_ROLE_OPTIONS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_SHORT_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  DEFAULT_INVITE_ROLE,
  MESSAGE_MAX,
  isValidInviteEmail,
  isValidInviteName,
  isDuplicateInviteEmail,
  createTeamInvitation,
  sendTeamInvitations,
  cancelTeamInvitation,
  resendTeamInvitation,
  calculateTeamSummary,
  type MemberRole,
  type TeamInvitation,
} from '@/data/teamSetup'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const ORG_ID_FALLBACK = 'org-demo-001'
const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
const OWNER_USER_ID = 'user-demo-001'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="2.5" x2="8" y2="13.5" /><line x1="2.5" y1="8" x2="13.5" y2="8" /></svg>
)
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="12" height="9" rx="1.3" /><path d="M2.5 4.5L8 9L13.5 4.5" /></svg>
)
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.7" /><path d="M13.5 8a5.5 5.5 0 0 1-9.6 3.7" /><path d="M11.3 2.8v2.2h-2.2" /><path d="M4.7 13.2V11h2.2" /></svg>
)
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5.5" /><path d="M7 4v3l2 1.5" /></svg>
)
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 2.5h2.3l1 3-1.6 1.2a8 8 0 0 0 3.6 3.6l1.2-1.6 3 1v2.3a1.3 1.3 0 0 1-1.4 1.3A11 11 0 0 1 2.2 3.9a1.3 1.3 0 0 1 1.3-1.4Z" /></svg>
)
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5l2 2L4.5 11.5H2.5v-2Z" /></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{message}</p>
}
function initialsOf(name: string, email: string): string {
  const source = name.trim() || email.trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function RoleCard({ role, selected, onSelect }: { role: MemberRole; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-0.5 rounded-[12px] p-3 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <span className={['text-[13px] font-semibold', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{ROLE_LABELS[role]}</span>
      <span className="text-[11.5px] text-[#68636D] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{ROLE_DESCRIPTIONS[role]}</span>
      {selected && <span className="absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-full bg-[#722ED1] flex items-center justify-center" aria-hidden="true"><CheckIcon size={9} /></span>}
    </button>
  )
}

function PendingInvitationCard({ invitation, onResend, onEdit, onRemove }: { invitation: TeamInvitation; onResend: () => void; onEdit: () => void; onRemove: () => void }) {
  const [justResent, setJustResent] = useState(false)
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-[#E3DDD7] bg-white p-3 flex-wrap">
      <span className="w-9 h-9 rounded-full bg-[#F3EAFF] flex items-center justify-center shrink-0 text-[12px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>
        {initialsOf(invitation.name, invitation.email)}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{invitation.name || invitation.email}</span>
        {invitation.name && <span className="text-[11.5px] text-[#9A949D] truncate" style={{ fontFamily: FONT_BODY }}>{invitation.email}</span>}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_BODY }}>{ROLE_LABELS[invitation.role]}</span>
          <span className="text-[#CAC7C6]">·</span>
          <span className="flex items-center gap-1 text-[11px] text-[#D97706]" style={{ fontFamily: FONT_BODY }}><ClockIcon /> {justResent ? 'Invitation resent' : 'Invitation pending'}</span>
        </div>
      </div>
      <button type="button" onClick={onEdit} aria-label={`Edit invitation for ${invitation.name || invitation.email}`} className="flex items-center gap-1 h-8 px-2.5 rounded-full text-[11.5px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-colors shrink-0" style={{ fontFamily: FONT_BODY }}>
        <EditIcon /> Edit
      </button>
      <button type="button" onClick={() => { onResend(); setJustResent(true); setTimeout(() => setJustResent(false), 2200) }} aria-label={`Resend invitation to ${invitation.email}`} className="flex items-center gap-1 h-8 px-2.5 rounded-full text-[11.5px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-colors shrink-0" style={{ fontFamily: FONT_BODY }}>
        <RefreshIcon /> Resend
      </button>
      <button type="button" onClick={onRemove} aria-label={`Remove invitation to ${invitation.email}`} className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDD7] bg-white text-[#9A949D] hover:text-[#DC2626] hover:border-[#DC2626] cursor-pointer shrink-0">
        <CloseIcon />
      </button>
    </div>
  )
}

function SkipTeamSetupModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
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
      <div role="dialog" aria-modal="true" aria-labelledby="skip-team-title" aria-describedby="skip-team-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="skip-team-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Skip team setup?</h2>
        <p id="skip-team-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can invite team members anytime from your organization workspace.</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Continue inviting</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>Skip</button>
        </div>
      </div>
    </>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function TeamSetupScreen({
  organizationId = ORG_ID_FALLBACK,
  companyName,
  companyOwnerName,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyOwnerName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const resolvedCompanyName = companyName || DEFAULT_COMPANY_NAME
  // 12G-D — the real primary-contact name the user entered during
  // organization creation (projectData.company_owner), never the
  // ORGANIZATION_OWNER_NAME fixture person unconditionally shown as "you"
  // in this Current Owner card before this fix.
  const resolvedOwnerName = companyOwnerName || 'Organization Owner'

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<MemberRole>(DEFAULT_INVITE_ROLE)
  const [message, setMessage] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [nameTouched, setNameTouched] = useState(false)
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')

  const summary = calculateTeamSummary(invitations)

  function resetDraft() {
    setEmail(''); setName(''); setPhone(''); setRole(DEFAULT_INVITE_ROLE); setMessage('')
    setEmailTouched(false); setEmailError(undefined); setNameTouched(false); setNameError(undefined); setEditingId(null)
  }

  /** Validates the draft, returning field-level errors — never a single
   *  combined string, so the name and email fields can show independent
   *  messages the way the rest of this form already does. */
  function validateDraft(): { email?: string; name?: string } {
    const errors: { email?: string; name?: string } = {}
    const trimmedName = name.trim()
    if (!isValidInviteName(trimmedName)) errors.name = 'Full name is required.'

    const trimmedEmail = email.trim()
    if (trimmedEmail.length === 0) errors.email = 'Email address is required.'
    else if (!isValidInviteEmail(trimmedEmail)) errors.email = 'Please enter a valid email address.'
    else if (isDuplicateInviteEmail(invitations.filter(i => i.id !== editingId), trimmedEmail)) errors.email = 'You already have a pending invitation for this email.'

    return errors
  }

  function addInvitation(): boolean {
    const errors = validateDraft()
    if (errors.email || errors.name) {
      setEmailTouched(true)
      setNameTouched(true)
      setEmailError(errors.email)
      setNameError(errors.name)
      return false
    }
    const invitation = createTeamInvitation({ organizationId, email, name, phone, role, message, invitedBy: OWNER_USER_ID })
    setInvitations(prev => [...prev.filter(i => i.id !== editingId), invitation])
    resetDraft()
    return true
  }

  function handleAddAnother() {
    addInvitation()
  }

  function handleResend(id: string) {
    setInvitations(prev => resendTeamInvitation(prev, id))
  }
  function handleRemove(id: string) {
    setInvitations(prev => cancelTeamInvitation(prev, id))
    if (editingId === id) resetDraft()
  }
  // Edits reuse the same single-draft form the rest of this screen already
  // has — no separate edit architecture. The invitation is pulled back into
  // the draft and only re-added to the list once saved again.
  function handleEdit(invitation: TeamInvitation) {
    setEmail(invitation.email)
    setName(invitation.name)
    setPhone(invitation.phone)
    setRole(invitation.role)
    setMessage(invitation.message)
    setEmailTouched(false)
    setNameTouched(false)
    setEmailError(undefined)
    setNameError(undefined)
    setEditingId(invitation.id)
  }

  function handleBack() {
    onNavigate('portfolio-setup')
  }

  function proceed(finalInvitations: TeamInvitation[]) {
    if (stage === 'submitting') return
    setStage('submitting')
    const { sentCount, invitations: sent } = sendTeamInvitations(finalInvitations)
    const finalSummary = calculateTeamSummary(sent)
    setTimeout(() => {
      onNavigate('organization-submitted', {
        organization_id: organizationId,
        invited_count: String(sentCount),
        invited_emails: sent.map(i => i.email).join(','),
        team_summary: `${finalSummary.owners} owner, ${finalSummary.admins} admin, ${finalSummary.projectManagers} project manager, ${finalSummary.teamMembers} team member, ${finalSummary.viewers} viewer`,
        company_name: resolvedCompanyName,
      })
    }, 700)
  }

  function handlePrimaryAction() {
    // If the owner has a valid, not-yet-added draft in progress, fold it
    // into the send rather than silently discarding it.
    if (hasDraftContent) {
      const errors = validateDraft()
      if (errors.email || errors.name) {
        setEmailTouched(true)
        setNameTouched(true)
        setEmailError(errors.email)
        setNameError(errors.name)
        return
      }
      const invitation = createTeamInvitation({ organizationId, email, name, phone, role, message, invitedBy: OWNER_USER_ID })
      const next = [...invitations.filter(i => i.id !== editingId), invitation]
      setInvitations(next)
      resetDraft()
      proceed(next)
      return
    }
    proceed(invitations)
  }

  const hasInvitations = invitations.length > 0
  const hasDraftContent = email.trim().length > 0 || name.trim().length > 0
  const primaryActionLabel = hasInvitations || hasDraftContent ? (editingId ? 'Save & continue →' : 'Send invitations & continue →') : 'Continue →'

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 7 of 7</span>
        </div>
        <div className="h-[2px] bg-[#F4F0EC] w-full">
          <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '100%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 pb-28 lg:pb-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1100 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Team Setup</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Build your team.
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              Invite the people who work with your organization so you can manage projects together.
            </p>
          </div>

          {/* Hozie intro */}
          <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>A great construction project is a team effort.</span>{' '}
              Invite your team now or skip this step and add people later.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Left — owner card, invite form, pending invitations */}
            <div className="flex flex-col gap-5 order-1">

              {/* Current owner */}
              <div className="flex items-center gap-3 rounded-[16px] bg-white border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="w-11 h-11 rounded-full bg-[#F3EAFF] flex items-center justify-center shrink-0 text-[13px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>
                  {initialsOf(resolvedOwnerName, '')}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{resolvedOwnerName}</span>
                    <span className="inline-flex items-center h-[18px] px-1.5 rounded-full text-[9.5px] font-semibold tracking-[0.04em] uppercase bg-[#722ED1] text-white" style={{ fontFamily: FONT_MONO }}>Owner</span>
                  </div>
                  <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{resolvedCompanyName}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] flex items-center justify-center" aria-hidden="true"><CheckIcon size={7} /></span>
                    Active
                  </span>
                  <span className="text-[10.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Full organization access</span>
                </div>
              </div>

              {/* Invite form — reused for both add and edit, per member */}
              <div className="flex flex-col gap-4 rounded-[16px] bg-white border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{editingId ? 'Edit Team Member' : 'Add Team Member'}</span>
                  {editingId && (
                    <button type="button" onClick={resetDraft} className="text-[11.5px] font-semibold text-[#68636D] cursor-pointer bg-transparent border-0 hover:underline" style={{ fontFamily: FONT_BODY }}>Cancel edit</button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Full name</FieldLabel>
                    <input
                      id="invite-name"
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); if (nameError) setNameError(undefined) }}
                      onBlur={() => setNameTouched(true)}
                      placeholder="e.g. Priya Sharma"
                      aria-invalid={nameTouched && !!nameError}
                      aria-describedby={nameTouched && nameError ? 'invite-name-error' : undefined}
                      className={['w-full h-[44px] px-3.5 rounded-[10px] border bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', nameTouched && nameError ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
                      style={{ fontFamily: FONT_BODY }}
                    />
                    {nameTouched && nameError && <FieldError id="invite-name-error" message={nameError} />}
                  </div>
                  <div>
                    <FieldLabel>Email address</FieldLabel>
                    <div className="flex items-center border rounded-[10px] bg-white h-[44px] overflow-hidden transition-colors" style={{ borderColor: emailTouched && emailError ? '#D97706' : '#CAC7C6' }}>
                      <div className="flex items-center pl-3 pr-1.5 shrink-0 text-[#9A949D]"><MailIcon /></div>
                      <input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(undefined) }}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="name@company.com"
                        aria-invalid={emailTouched && !!emailError}
                        aria-describedby={emailTouched && emailError ? 'invite-email-error' : undefined}
                        className="flex-1 h-full pr-3 text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                    {emailTouched && emailError && <FieldError id="invite-email-error" message={emailError} />}
                  </div>
                </div>

                <div>
                  <FieldLabel optional>Phone</FieldLabel>
                  <div className="flex items-center border rounded-[10px] bg-white h-[44px] overflow-hidden transition-colors border-[#E3DDD7] focus-within:border-[#722ED1]">
                    <div className="flex items-center pl-3 pr-1.5 shrink-0 text-[#9A949D]"><PhoneIcon /></div>
                    <input
                      id="invite-phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 h-full pr-3 text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                      style={{ fontFamily: FONT_BODY }}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Role</FieldLabel>
                  <div role="radiogroup" aria-label="Role" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INVITABLE_ROLE_OPTIONS.map(r => (
                      <RoleCard key={r} role={r} selected={role === r} onSelect={() => setRole(r)} />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel optional>Personal message</FieldLabel>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                    placeholder={`Welcome to ${resolvedCompanyName} on Houzeify.`}
                    rows={2}
                    maxLength={MESSAGE_MAX}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                  <div className="flex justify-end mt-1"><span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{message.length}/{MESSAGE_MAX}</span></div>
                </div>

                <button type="button" onClick={handleAddAnother} className="self-start flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0 bg-[#F3EAFF] text-[#722ED1] hover:brightness-95 transition-all" style={{ fontFamily: FONT_BODY }}>
                  {editingId ? <><CheckIcon size={11} /> Save changes</> : <><PlusIcon /> Add team member</>}
                </button>
              </div>

              {/* Pending invitations */}
              {hasInvitations ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Pending Invitations</span>
                    <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{invitations.length} added</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {invitations.map(inv => (
                      <PendingInvitationCard key={inv.id} invitation={inv} onResend={() => handleResend(inv.id)} onEdit={() => handleEdit(inv)} onRemove={() => handleRemove(inv.id)} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                  You&apos;re the only team member right now. You can add your team later from your organization settings.
                </p>
              )}

              {/* Skip note */}
              <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>
                You can invite your team later from Organization Settings.{' '}
                <button type="button" onClick={() => setShowSkipModal(true)} className="text-[#722ED1] font-semibold bg-transparent border-0 cursor-pointer hover:underline p-0" style={{ fontFamily: FONT_BODY }}>Skip for now</button>
              </p>

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-3 pt-1">
                <button
                  onClick={handlePrimaryAction}
                  disabled={stage === 'submitting'}
                  className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] disabled:opacity-70"
                  style={{ fontFamily: FONT_BODY }}
                >
                  {stage === 'submitting' ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" /><path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                      Sending invitations…
                    </>
                  ) : primaryActionLabel}
                </button>
                <button onClick={handleBack} disabled={stage === 'submitting'} className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60" style={{ fontFamily: FONT_BODY }}>
                  ← Back
                </button>
              </div>
            </div>

            {/* Right — team summary + role permissions (sticky) */}
            <div className="order-2 lg:sticky lg:top-6 flex flex-col gap-5">
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your Team</span>
                <div className="flex flex-col divide-y divide-[#CAC7C6]">
                  <SummaryRow label="Owner" value={summary.owners} />
                  <SummaryRow label="Admins" value={summary.admins} />
                  <SummaryRow label="Project Managers" value={summary.projectManagers} />
                  <SummaryRow label="Team Members" value={summary.teamMembers} />
                  <SummaryRow label="Viewers" value={summary.viewers} />
                </div>
              </div>

              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Role Permissions</span>
                <div className="flex flex-col gap-2.5">
                  {(['admin', 'project-manager', 'team-member', 'viewer'] as MemberRole[]).map(r => (
                    <div key={r} className="flex flex-col gap-0.5">
                      <span className="text-[12.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{ROLE_LABELS[r]}</span>
                      <span className="text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{ROLE_SHORT_DESCRIPTIONS[r]}</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {ROLE_PERMISSIONS[r].map(p => (
                          <span key={p} className="h-[18px] px-1.5 rounded-full text-[9.5px] font-semibold" style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#68636D' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky actions */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E3DDD7] px-5 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button onClick={handleBack} disabled={stage === 'submitting'} className="h-[48px] px-4 rounded-[12px] text-[13px] font-medium cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] disabled:opacity-60 shrink-0" style={{ fontFamily: FONT_BODY }}>
          ← Back
        </button>
        <button onClick={handlePrimaryAction} disabled={stage === 'submitting'} className="flex-1 h-[48px] text-[13.5px] font-semibold rounded-[12px] transition-all duration-200 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer disabled:opacity-70" style={{ fontFamily: FONT_BODY }}>
          {stage === 'submitting' ? 'Sending…' : primaryActionLabel}
        </button>
      </div>

      {/* Footer (desktop only) */}
      <footer className="hidden lg:flex shrink-0 justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>

      {showSkipModal && (
        <SkipTeamSetupModal onCancel={() => setShowSkipModal(false)} onConfirm={() => { setShowSkipModal(false); proceed(invitations) }} />
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}
