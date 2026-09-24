import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjectBoq } from '@/data/projectBoqState'
import { ApiError } from '@/data/apiClient'
import { describeBoqError, type BoqItemDto, type BoqSectionDto } from '@/data/projectBoqApi'
import { formatInr, formatQuantity, stageLabel } from '@/data/boqFormat'
import { isServerProjectId } from '@/data/projectIds'
import BoqItemEditor, {
  valuesFromItem,
  type BoqEditorDraft,
  type BoqEditorPayload,
  type BoqItemFormValues,
} from '@/user/projects/boq/BoqItemEditor'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Project Bill of Quantities — Module 07 ─────────────────────────────────
// A PROJECT-WORKSPACE screen (ProjectSubNav → Bill of Quantities), reached for
// both homeowners and professionals. Deliberately distinct from the homeowner
// New-Build BOQ flow (boq-overview / detailed-boq / ...), which is
// estimate-authoring — this is the project's own record of what it is built
// from.
//
// Layout contract (spec §18): no page-level horizontal overflow at 375 / 768 /
// 1280. Items render three ways; exactly ONE is mounted, chosen by
// matchMedia (`useBoqLayout`) so the single item editor never exists twice:
//   desktop  (>= 1024)  full <table>: Item / Stage / Qty / Unit / Rate / Amount
//   tablet   (768–1023) condensed <table>: Item / Quantity+unit / Rate / Amount
//   mobile   (< 768)    no table — stacked, tap-to-expand cards; the item
//                       editor is a full-screen sheet
// Money and quantities are `whitespace-nowrap tabular-nums`; names and
// descriptions wrap or truncate inside `min-w-0` boxes.
//
// Editing: every change is awaited here, errors are mapped by describeBoqError
// (on the error `code`) and shown inline where the user acted; editors stay
// open with their inputs on failure. After a save the list re-renders from the
// server's refetched BOQ — never from the form's amount preview. Only one
// editor / confirmation / rename is open at a time (a single `panel` state).

interface ProjectBoqScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  location?: string
  fullName?: string
  preferredName?: string
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

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoSearch = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
)
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    className="shrink-0"
    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
  >
    <path d="M6 3l5 5-5 5" />
  </svg>
)
const IcoBoq = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="2" width="12" height="14" rx="1.5" /><path d="M6 6h6M6 9h6M6 12h3.5" /></svg>
)

// Visible keyboard focus in the app's brand purple (same idea as the
// Documents screen's FOCUS_RING).
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'

// ≥44px text actions (same recipe as the Documents screen).
const TEXT_ACTION = `inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer border-0 bg-transparent px-1 rounded-[6px] ${FOCUS_RING}`

const NUM = 'whitespace-nowrap tabular-nums'

const NOTICE_MS = 4000

function plural(n: number, singular: string): string {
  return `${n} ${singular}${n === 1 ? '' : 's'}`
}

// ─── Layout (one of three item renderings is mounted) ───────────────────────
type Layout = 'mobile' | 'tablet' | 'desktop'

function readLayout(): Layout {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop'
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
  return window.matchMedia('(min-width: 768px)').matches ? 'tablet' : 'mobile'
}

function useBoqLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(readLayout)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const queries = [window.matchMedia('(min-width: 1024px)'), window.matchMedia('(min-width: 768px)')]
    const update = () => setLayout(readLayout())
    queries.forEach(q => q.addEventListener('change', update))
    update()
    return () => queries.forEach(q => q.removeEventListener('change', update))
  }, [])
  return layout
}

// ─── What is open right now (one at a time) ─────────────────────────────────
type Panel =
  | { kind: 'add-item'; sectionId: string; values: BoqItemFormValues; title: string; nonce: number; trigger: string }
  | { kind: 'edit-item'; itemId: string; nonce: number }
  | { kind: 'delete-item'; itemId: string }
  | { kind: 'add-section' }
  | { kind: 'rename-section'; sectionId: string }
  | { kind: 'delete-section'; sectionId: string }

/** Everything the section / item renderings need from the screen. */
interface BoqUi {
  /** A change is in flight. */
  busy: boolean
  panel: Panel | null
  /** Error from the open confirmation (item / section delete). */
  panelError: string | null
  /** The single item editor when it is shown inline (null on mobile, where the screen shows the sheet). */
  editorNode: React.ReactNode
  onAddItem: (section: BoqSectionDto) => void
  onEditItem: (item: BoqItemDto) => void
  onDuplicateItem: (item: BoqItemDto) => void
  onAskDeleteItem: (item: BoqItemDto) => void
  onConfirmDeleteItem: (item: BoqItemDto) => void
  onRenameSection: (section: BoqSectionDto) => void
  onSubmitRename: (section: BoqSectionDto, name: string) => Promise<string | null>
  onAskDeleteSection: (section: BoqSectionDto) => void
  onConfirmDeleteSection: (section: BoqSectionDto) => void
  /** Close the open panel (ignored while a change is in flight); focus goes to the first of `focusKeys` that exists. */
  onClosePanel: (...focusKeys: string[]) => void
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      {children}
    </div>
  )
}

function CardMessage({
  title,
  children,
  status,
  action,
}: {
  title?: string
  children: React.ReactNode
  status?: boolean
  action?: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-2 py-6" role={status ? 'status' : undefined}>
        <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
          <IcoBoq />
        </span>
        {title && <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{title}</p>}
        <p className="text-[13px] text-[#68636D] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>{children}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </Card>
  )
}

const PRIMARY_BTN = `h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 text-white bg-[#722ED1] hover:bg-[#5A22A8] cursor-pointer ${FOCUS_RING}`
const SECONDARY_BTN = `h-11 px-5 rounded-[12px] text-[13.5px] font-semibold bg-white text-[#722ED1] hover:bg-[#F3EAFF] cursor-pointer ${FOCUS_RING}`

// Default export: role gate + "project not found" guard, then dispatch. Hooks
// live only inside the sub-components (never across an early return).
export default function ProjectBoqScreen({
  role,
  projectId,
  projectName,
  location,
  onNavigate,
}: ProjectBoqScreenProps) {
  // Same rule as the sibling project screens: a company's professional can
  // open one of their organization's projects, not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])
  if (!canViewProject) return null

  const hasProject = Boolean(projectId && projectName)

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FBF9F7' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button
            type="button"
            onClick={() => onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)}
            className={`h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 ${FOCUS_RING}`}
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  if (!isServerProjectId(projectId)) {
    return (
      <BoqShell projectId={projectId as string} projectName={projectName as string} location={location} onNavigate={onNavigate}>
        <CardMessage>The Bill of Quantities is available for projects created in your company workspace.</CardMessage>
      </BoqShell>
    )
  }

  return (
    <ServerBoq
      key={projectId}
      projectId={projectId as string}
      projectName={projectName as string}
      location={location}
      onNavigate={onNavigate}
    />
  )
}

// ─── Shell — sidebar, back bar, sub-nav, header ─────────────────────────────
function BoqShell({
  projectId,
  projectName,
  location,
  onNavigate,
  children,
}: {
  projectId: string
  projectName: string
  location?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FBF9F7' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

          <ProjectSubNav active="boq" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
            <div className="max-w-[1000px] mx-auto flex flex-col gap-6 min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Bill of Quantities</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
                {location && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5 min-w-0" style={{ fontFamily: FONT_BODY }}>
                    <IcoMapPin /> <span className="min-w-0 break-words">{location}</span>
                  </span>
                )}
                <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  What this project is built from — sections, quantities and amounts.
                </p>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ─── Small inline forms / confirmations ─────────────────────────────────────
function ErrorLine({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="text-[12.5px] text-[#DC2626] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{children}</p>
  )
}

/** A short inline confirmation. `hideConfirm` turns it into a plain message
 *  with a Close button (a blocked action — nothing is sent to the server). */
function InlineConfirm({
  message,
  alertMessage,
  confirmLabel,
  busyLabel,
  busy,
  error,
  hideConfirm,
  onConfirm,
  onCancel,
}: {
  message: string
  alertMessage?: boolean
  confirmLabel: string
  busyLabel: string
  busy: boolean
  error: string | null
  hideConfirm?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const messageId = useId()
  return (
    <div
      role="group"
      aria-labelledby={messageId}
      className="flex flex-col gap-3 min-w-0"
      onKeyDown={e => {
        if (e.key === 'Escape' && !busy) {
          e.stopPropagation()
          onCancel()
        }
      }}
    >
      <p
        id={messageId}
        role={alertMessage ? 'alert' : undefined}
        className="text-[13px] text-[#242326] m-0 break-words"
        style={{ fontFamily: FONT_BODY }}
      >
        {message}
      </p>
      {error && <ErrorLine>{error}</ErrorLine>}
      <div className="flex items-center gap-2 flex-wrap">
        {!hideConfirm && (
          <button
            type="button"
            aria-disabled={busy}
            onClick={() => { if (!busy) onConfirm() }}
            className={`h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 text-white bg-[#B91C1C] ${busy ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#991B1B]'} ${FOCUS_RING}`}
            style={{ fontFamily: FONT_BODY, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        )}
        <button
          type="button"
          autoFocus
          aria-disabled={busy}
          onClick={() => { if (!busy) onCancel() }}
          className={`${TEXT_ACTION} px-3 text-[13px] font-medium text-[#68636D] hover:text-[#242326] ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ fontFamily: FONT_BODY }}
        >
          {hideConfirm ? 'Close' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

/** One-field form for a section name — used to add and to rename. */
function SectionNameForm({
  label,
  initialName,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  label: string
  initialName: string
  submitLabel: string
  /** Resolves to an error message (form stays open) or null (done). */
  onSubmit: (name: string) => Promise<string | null>
  onCancel: () => void
}) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const uid = useId()
  const inputId = `${uid}-name`
  const errorId = `${uid}-error`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busyRef.current) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a section name.')
      document.getElementById(inputId)?.focus()
      return
    }
    busyRef.current = true
    setBusy(true)
    setError(null)
    try {
      const message = await onSubmit(trimmed)
      if (message) setError(message)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={e => {
        if (e.key === 'Escape' && !busyRef.current) {
          e.stopPropagation()
          onCancel()
        }
      }}
      className="flex flex-col gap-3 min-w-0"
    >
      <div className="min-w-0">
        <label htmlFor={inputId} className="block text-[12.5px] font-semibold text-[#242326] mb-1.5" style={{ fontFamily: FONT_BODY }}>{label}</label>
        <input
          id={inputId}
          autoFocus
          type="text"
          autoComplete="off"
          required
          maxLength={120} // server sectionNameSchema (server/projects/projectBoq.schemas.ts) caps section names at 120
          value={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={e => { setName(e.target.value); setError(null) }}
          className={`w-full h-11 px-3 rounded-[10px] text-[16px] sm:text-[13.5px] text-[#242326] ${FOCUS_RING}`}
          style={{ border: `1px solid ${error ? '#DC2626' : '#E3DDD7'}`, fontFamily: FONT_BODY, backgroundColor: 'white' }}
        />
      </div>
      {error && <ErrorLine id={errorId}>{error}</ErrorLine>}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="submit"
          aria-disabled={busy}
          className={`h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 text-white bg-[#722ED1] ${busy ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#5A22A8]'} ${FOCUS_RING}`}
          style={{ fontFamily: FONT_BODY, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          aria-disabled={busy}
          onClick={() => { if (!busy) onCancel() }}
          className={`${TEXT_ACTION} px-3 text-[13px] font-medium text-[#68636D] hover:text-[#242326] ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ fontFamily: FONT_BODY }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function LoadErrorBanner({ message, retrying, onRetry }: { message: string; retrying: boolean; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
      <p className="text-[13px] text-[#B91C1C] m-0 min-w-0 break-words" style={{ fontFamily: FONT_BODY }}>{message}</p>
      {/* aria-disabled (not disabled) so the button keeps keyboard focus while retrying. */}
      <button
        type="button"
        aria-disabled={retrying}
        onClick={() => { if (!retrying) onRetry() }}
        className={`inline-flex items-center min-h-[44px] border-0 bg-transparent px-1 rounded-[6px] text-[12.5px] font-semibold text-[#B91C1C] ${retrying ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:underline'} ${FOCUS_RING}`}
        style={{ fontFamily: FONT_BODY }}
      >
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  )
}

function blankValues(sectionId: string): BoqItemFormValues {
  return { sectionId, name: '', description: '', stage: '', quantity: '', unit: '', rate: '' }
}

function notEmptyMessage(itemCount: number): string {
  return itemCount > 0 ? `Move or delete its ${plural(itemCount, 'item')} first.` : "Move or delete this section's items first."
}

type MutationOutcome = { ok: true } | { ok: false; message: string; code: string }

// ─── Server (real project) mode ─────────────────────────────────────────────
function ServerBoq({
  projectId,
  projectName,
  location,
  onNavigate,
}: {
  projectId: string
  projectName: string
  location?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const {
    status,
    boq,
    error,
    hasLoaded,
    addSection,
    renameSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    refetch,
    refresh,
  } = useProjectBoq(projectId)
  const layout = useBoqLayout()
  // `boq` is an empty BoqDto until the first load resolves — always gate on
  // status before showing anything (including empty copy).
  const isLoading = status === 'idle' || status === 'loading'

  const [query, setQuery] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const uid = useId()
  const inputClass = `w-full h-11 px-3 rounded-[10px] text-[13.5px] text-[#242326] ${FOCUS_RING}`
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }

  // ── Panels, notices, focus ────────────────────────────────────────────────
  const [panel, setPanel] = useState<Panel | null>(null)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const nonceRef = useRef(0)
  // Typed state of the open item editor, owned here (keyed by panel identity)
  // so it survives the editor being remounted in another layout slot.
  const draftRef = useRef<BoqEditorDraft | null>(null)

  // Brief, non-blocking confirmation ("Item added", …) that clears itself.
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
    }
  }, [])
  function showNotice(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => {
      setNotice(null)
      noticeTimer.current = null
    }, NOTICE_MS)
  }
  // A change that can't continue (the item or section is gone / not ours).
  const [pageAlert, setPageAlert] = useState<string | null>(null)

  // Keyboard focus returns to a trigger via `data-boq-focus`, after the DOM
  // for the closed panel has been committed (the trigger may have been
  // unmounted while the panel was open).
  const [focusRequest, setFocusRequest] = useState<{ keys: string[]; n: number } | null>(null)
  const focusCounter = useRef(0)
  const requestFocus = useCallback((keys: string[]) => {
    setFocusRequest({ keys, n: ++focusCounter.current })
  }, [])
  useEffect(() => {
    if (!focusRequest) return
    for (const key of focusRequest.keys) {
      const el = document.querySelector<HTMLElement>(`[data-boq-focus="${key.replace(/["\\]/g, '')}"]`)
      if (el) {
        el.focus()
        break
      }
    }
    setFocusRequest(null)
  }, [focusRequest])

  // ── Load error / retry (keeps the last-good BOQ on screen) ────────────────
  const [retrying, setRetrying] = useState(false)
  const retryingRef = useRef(false)
  async function retry() {
    if (retryingRef.current) return
    retryingRef.current = true
    setRetrying(true)
    try {
      // A BOQ that was loaded before is reloaded silently (it stays visible);
      // a first load that failed goes back through the normal loading state.
      await (hasLoaded ? refresh() : refetch())
    } finally {
      retryingRef.current = false
      setRetrying(false)
    }
  }
  // The banner follows the load status. During a FIRST-load retry the status
  // flips to 'loading', so it stays mounted (keeping the focused button) while
  // retrying; `retrying` otherwise only drives the button label.
  const bannerVisible = status === 'error' || (retrying && status === 'loading')
  // Keep the last real error text so a retry never shows the generic fallback.
  const lastErrorRef = useRef<string | null>(null)
  if (error) lastErrorRef.current = error
  const wasBannerVisible = useRef(false)
  useEffect(() => {
    // The banner (and its focused button) just went away after a successful
    // retry: park keyboard focus on the summary instead of the page top.
    if (wasBannerVisible.current && !bannerVisible && status === 'loaded' && document.activeElement === document.body) {
      requestFocus(['summary'])
    }
    wasBannerVisible.current = bannerVisible
  }, [bannerVisible, status, requestFocus])

  // ── Derived data ──────────────────────────────────────────────────────────
  const q = query.trim().toLowerCase()
  // A filter that points at a section that no longer exists falls back to all.
  const activeSection =
    sectionFilter === 'all' || boq.sections.some(s => s.id === sectionFilter) ? sectionFilter : 'all'
  const forceOpen = Boolean(q) || activeSection !== 'all'

  function findItem(id: string): BoqItemDto | null {
    for (const section of boq.sections) {
      const item = section.items.find(it => it.id === id)
      if (item) return item
    }
    return null
  }

  // A panel whose target vanished (removed elsewhere, then refetched) is
  // simply not shown; the effect below clears the stale state.
  let activePanel: Panel | null = panel
  let panelItem: BoqItemDto | null = null
  if (panel && (panel.kind === 'edit-item' || panel.kind === 'delete-item')) {
    panelItem = findItem(panel.itemId)
    if (!panelItem) activePanel = null
  } else if (panel && (panel.kind === 'rename-section' || panel.kind === 'delete-section')) {
    if (!boq.sections.some(s => s.id === panel.sectionId)) activePanel = null
  } else if (panel && panel.kind === 'add-item') {
    if (!boq.sections.some(s => s.id === panel.sectionId)) activePanel = null
  }
  const panelStale = panel !== null && activePanel === null
  useEffect(() => {
    if (panelStale && status === 'loaded') {
      draftRef.current = null
      setPanel(null)
    }
  }, [panelStale, status])

  const panelSectionId: string | null =
    activePanel === null
      ? null
      : activePanel.kind === 'add-item' || activePanel.kind === 'rename-section' || activePanel.kind === 'delete-section'
        ? activePanel.sectionId
        : activePanel.kind === 'edit-item' || activePanel.kind === 'delete-item'
          ? (panelItem?.sectionId ?? null)
          : null
  const panelItemId =
    activePanel && (activePanel.kind === 'edit-item' || activePanel.kind === 'delete-item') ? activePanel.itemId : null

  const groups = boq.sections
    .filter(s => activeSection === 'all' || s.id === activeSection)
    .map(section => ({
      section,
      items: q
        ? section.items.filter(
            it =>
              it.name.toLowerCase().includes(q) ||
              (it.description ?? '').toLowerCase().includes(q) ||
              it.id === panelItemId,
          )
        : section.items,
    }))
    // While searching, sections with no matching item are noise (unless one
    // of their items / the section itself has something open).
    .filter(g => !q || g.items.length > 0 || g.section.id === panelSectionId)

  function toggleSection(id: string) {
    setCollapsed(c => ({ ...c, [id]: !c[id] }))
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  // `create` marks an add (section / item): a NOT_FOUND there can only mean
  // the project isn't ours to change, not a stale row.
  async function mutate(
    action: () => Promise<void>,
    { sectionItemCount = 0, create = false }: { sectionItemCount?: number; create?: boolean } = {},
  ): Promise<MutationOutcome> {
    if (pendingRef.current) {
      return { ok: false, message: 'Another change is still saving. Try again in a moment.', code: 'BUSY' }
    }
    pendingRef.current = true
    setPending(true)
    setPageAlert(null)
    try {
      await action()
      return { ok: true }
    } catch (err) {
      const code = err instanceof ApiError ? err.code : ''
      // A stale row / section: reload quietly so it drops out of the list.
      if (code === 'NOT_FOUND' || code === 'INVALID_SECTION') void refresh()
      const message =
        code === 'SECTION_NOT_EMPTY'
          ? notEmptyMessage(sectionItemCount)
          : code === 'NOT_FOUND' && create
            ? "You don't have permission to change this Bill of Quantities."
            : describeBoqError(err)
      return { ok: false, message, code }
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  function openPanel(next: Panel) {
    if (pendingRef.current) return
    draftRef.current = null
    setPanelError(null)
    setPanel(next)
  }

  function closePanel(...focusKeys: string[]) {
    if (pendingRef.current) return
    draftRef.current = null
    setPanel(null)
    setPanelError(null)
    if (focusKeys.length > 0) requestFocus(focusKeys)
  }

  /** Close after a finished change (the in-flight guard is already released). */
  function finishPanel(message: string, ...focusKeys: string[]) {
    draftRef.current = null
    setPanel(null)
    setPanelError(null)
    showNotice(message)
    if (focusKeys.length > 0) requestFocus(focusKeys)
  }

  /** The target is gone or not ours: close, and say so at page level. */
  function abandonPanel(message: string, ...focusKeys: string[]) {
    draftRef.current = null
    setPanel(null)
    setPanelError(null)
    setPageAlert(message)
    if (focusKeys.length > 0) requestFocus(focusKeys)
  }

  function openAddItem(sectionId: string, trigger: string, values?: BoqItemFormValues, title = 'Add item') {
    openPanel({ kind: 'add-item', sectionId, values: values ?? blankValues(sectionId), title, nonce: ++nonceRef.current, trigger })
  }

  // "Add item" at the top: the section the filter points at, else the first.
  function openAddItemTop() {
    const target = activeSection !== 'all' ? activeSection : boq.sections[0]?.id
    if (target) openAddItem(target, 'add-top')
  }

  async function submitAddSection(name: string): Promise<string | null> {
    const result = await mutate(() => addSection(name), { create: true })
    if (result.ok) {
      finishPanel('Section added', 'add-section')
      return null
    }
    return result.message
  }

  async function submitRename(section: BoqSectionDto, name: string): Promise<string | null> {
    if (name === section.name) {
      closePanel(`rename-${section.id}`)
      return null
    }
    const result = await mutate(() => renameSection(section.id, name))
    if (result.ok) {
      finishPanel('Section renamed', `rename-${section.id}`)
      return null
    }
    if (result.code === 'NOT_FOUND') {
      abandonPanel(result.message, 'add-section')
      return null
    }
    return result.message
  }

  async function confirmDeleteSection(section: BoqSectionDto) {
    if (section.itemCount > 0) {
      setPanelError(notEmptyMessage(section.itemCount))
      return
    }
    const result = await mutate(() => deleteSection(section.id), { sectionItemCount: section.itemCount })
    if (result.ok) {
      finishPanel('Section deleted', 'add-section')
    } else if (result.code === 'NOT_FOUND') {
      abandonPanel(result.message, 'add-section')
    } else {
      setPanelError(result.message)
    }
  }

  async function confirmDeleteItem(item: BoqItemDto) {
    const result = await mutate(() => deleteItem(item.id))
    if (result.ok) {
      finishPanel('Item deleted', `section-${item.sectionId}`)
    } else if (result.code === 'NOT_FOUND') {
      abandonPanel(result.message, `section-${item.sectionId}`)
    } else {
      setPanelError(result.message)
    }
  }

  async function submitEditor(payload: BoqEditorPayload): Promise<string | null> {
    const current = activePanel
    if (!current) return null
    if (payload.kind === 'create' && current.kind === 'add-item') {
      const target = payload.input.sectionId
      const result = await mutate(() => addItem(payload.input), { create: true })
      if (result.ok) {
        // Make sure the new row is visible: leave a search / other-section
        // filter that would hide it, and open its section.
        if (q) setQuery('')
        if (activeSection !== 'all' && activeSection !== target) setSectionFilter('all')
        setCollapsed(c => ({ ...c, [target]: false }))
        finishPanel('Item added', current.trigger, `section-${target}`)
        return null
      }
      return result.message
    }
    if (payload.kind === 'update' && current.kind === 'edit-item') {
      const item = panelItem
      const result = await mutate(() => updateItem(current.itemId, payload.patch))
      if (result.ok) {
        const moved = payload.patch.sectionId
        if (moved) setCollapsed(c => ({ ...c, [moved]: false }))
        finishPanel('Item saved', `edit-${current.itemId}`, `section-${moved ?? item?.sectionId ?? ''}`)
        return null
      }
      if (result.code === 'NOT_FOUND') {
        abandonPanel(result.message, `section-${item?.sectionId ?? ''}`)
        return null
      }
      return result.message
    }
    return null
  }

  // ── The single item editor ────────────────────────────────────────────────
  const sectionOptions = boq.sections.map(s => ({ id: s.id, name: s.name }))
  let editorNode: React.ReactNode = null
  if (activePanel?.kind === 'add-item') {
    const trigger = activePanel.trigger
    const sectionId = activePanel.sectionId
    editorNode = (
      <BoqItemEditor
        key={`add-${activePanel.nonce}`}
        draftKey={`add-${activePanel.nonce}`}
        draftRef={draftRef}
        mode="add"
        presentation={layout === 'mobile' ? 'sheet' : 'inline'}
        title={activePanel.title}
        sections={sectionOptions}
        initialValues={activePanel.values}
        onSubmit={submitEditor}
        onCancel={() => closePanel(trigger, `section-${sectionId}`)}
      />
    )
  } else if (activePanel?.kind === 'edit-item' && panelItem) {
    const item = panelItem
    editorNode = (
      <BoqItemEditor
        key={`edit-${activePanel.nonce}`}
        draftKey={`edit-${activePanel.nonce}`}
        draftRef={draftRef}
        mode="edit"
        presentation={layout === 'mobile' ? 'sheet' : 'inline'}
        sections={sectionOptions}
        item={item}
        initialValues={valuesFromItem(item)}
        onSubmit={submitEditor}
        onCancel={() => closePanel(`edit-${item.id}`, `section-${item.sectionId}`)}
      />
    )
  }

  const ui: BoqUi = {
    busy: pending,
    panel: activePanel,
    panelError,
    editorNode: layout === 'mobile' ? null : editorNode,
    onAddItem: section => openAddItem(section.id, `add-${section.id}`),
    onEditItem: item => openPanel({ kind: 'edit-item', itemId: item.id, nonce: ++nonceRef.current }),
    onDuplicateItem: item => openAddItem(item.sectionId, `dup-${item.id}`, valuesFromItem(item), 'Duplicate item'),
    onAskDeleteItem: item => openPanel({ kind: 'delete-item', itemId: item.id }),
    onConfirmDeleteItem: item => { void confirmDeleteItem(item) },
    onRenameSection: section => openPanel({ kind: 'rename-section', sectionId: section.id }),
    onSubmitRename: submitRename,
    onAskDeleteSection: section => openPanel({ kind: 'delete-section', sectionId: section.id }),
    onConfirmDeleteSection: section => { void confirmDeleteSection(section) },
    onClosePanel: closePanel,
  }

  // ── Content ───────────────────────────────────────────────────────────────
  const banner = bannerVisible ? (
    <LoadErrorBanner
      message={error ?? lastErrorRef.current ?? 'Unable to load the Bill of Quantities right now.'}
      retrying={retrying}
      onRetry={() => { void retry() }}
    />
  ) : null

  const addSectionButton = (
    <button
      type="button"
      data-boq-focus="add-section"
      onClick={() => openPanel({ kind: 'add-section' })}
      className={SECONDARY_BTN}
      style={{ border: '1px solid #722ED1', fontFamily: FONT_BODY }}
    >
      Add section
    </button>
  )
  const addSectionForm =
    activePanel?.kind === 'add-section' ? (
      <Card>
        <SectionNameForm
          label="Section name"
          initialName=""
          submitLabel="Add section"
          onSubmit={submitAddSection}
          onCancel={() => closePanel('add-section')}
        />
      </Card>
    ) : null

  // Only a BOQ that has loaded (now, or before a failed refetch) is shown.
  const canShowData = hasLoaded && (status === 'loaded' || status === 'error')

  let content: React.ReactNode
  if (!canShowData && bannerVisible) {
    // A failed FIRST load: only the banner — never also claim the BOQ is empty.
    content = banner
  } else if (isLoading && !canShowData) {
    content = <CardMessage status>Loading Bill of Quantities…</CardMessage>
  } else if (boq.sections.length === 0) {
    content = (
      <>
        {banner}
        <CardMessage
          action={activePanel?.kind === 'add-section' ? null : <button type="button" data-boq-focus="add-section" onClick={() => openPanel({ kind: 'add-section' })} className={PRIMARY_BTN} style={{ fontFamily: FONT_BODY }}>Add section</button>}
        >
          No quantities yet. Start with a section — for example Excavation or Brickwork — then add its items.
        </CardMessage>
        {addSectionForm}
      </>
    )
  } else {
    content = (
      <>
        {banner}

        {/* The one memorable element: the project total on the Build tint. */}
        <section
          aria-label="Project total"
          tabIndex={-1}
          data-boq-focus="summary"
          className={`rounded-[16px] p-5 sm:p-6 min-w-0 ${FOCUS_RING}`}
          style={{ backgroundColor: '#F8E3BD' }}
        >
          <p className="text-[11px] tracking-[0.08em] uppercase text-[#242326] m-0" style={{ fontFamily: FONT_MONO }}>Project total</p>
          <p
            className={`m-0 mt-2 text-[#242326] leading-[1.1] max-w-full text-[clamp(1.5rem,7vw,2.5rem)] ${NUM}`}
            style={{ fontFamily: FONT_HEAD }}
          >
            {formatInr(boq.totals.total)}
          </p>
          <p className="text-[13px] text-[#242326] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
            {plural(boq.totals.sectionCount, 'section')} · {plural(boq.totals.itemCount, 'item')}
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-boq-focus="add-top"
            onClick={openAddItemTop}
            className={PRIMARY_BTN}
            style={{ fontFamily: FONT_BODY }}
          >
            Add item
          </button>
          {addSectionButton}
        </div>

        {addSectionForm}

        {boq.totals.itemCount > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 min-w-0">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68636D] pointer-events-none"><IcoSearch /></span>
              <input
                type="search"
                aria-label="Search items"
                className={inputClass}
                style={{ ...inputStyle, paddingLeft: 32 }}
                placeholder="Search items…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by section"
              className={`${inputClass} sm:w-[220px] sm:shrink-0 min-w-0 max-w-full cursor-pointer`}
              style={inputStyle}
              value={activeSection}
              onChange={e => setSectionFilter(e.target.value)}
            >
              <option value="all">All sections</option>
              {boq.sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {groups.length === 0 ? (
          <Card>
            <p className="text-[13px] text-[#68636D] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No items match this search.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4 min-w-0">
            {groups.map(({ section, items }) => (
              <SectionGroup
                key={section.id}
                idBase={`${uid}-${section.id}`}
                section={section}
                items={items}
                filtering={Boolean(q)}
                // A search / section filter forces matches open; so does an
                // open editor or confirmation inside the section.
                open={!collapsed[section.id] || forceOpen || section.id === panelSectionId}
                onToggle={() => toggleSection(section.id)}
                layout={layout}
                ui={ui}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <BoqShell projectId={projectId} projectName={projectName} location={location} onNavigate={onNavigate}>
      {/* Persistent live region so screen readers announce the confirmation;
          visually hidden (and out of the layout gap) while there is nothing
          to say. */}
      <div role="status" aria-live="polite" className={notice ? '' : 'sr-only'}>
        {notice && (
          <p
            className="rounded-[12px] px-4 py-2.5 text-[13px] font-semibold m-0"
            style={{ backgroundColor: '#C6F6D5', color: '#14532D', fontFamily: FONT_BODY }}
          >
            {notice}
          </p>
        )}
      </div>
      {pageAlert && (
        <div role="alert" className="rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <p className="text-[13px] text-[#B91C1C] m-0 min-w-0 break-words" style={{ fontFamily: FONT_BODY }}>{pageAlert}</p>
          <button
            type="button"
            onClick={() => setPageAlert(null)}
            className={`inline-flex items-center min-h-[44px] cursor-pointer border-0 bg-transparent px-1 rounded-[6px] text-[12.5px] font-semibold text-[#B91C1C] hover:underline ${FOCUS_RING}`}
            style={{ fontFamily: FONT_BODY }}
          >
            Dismiss
          </button>
        </div>
      )}
      {content}
      {/* Mobile: the editor is a full-screen sheet (portalled by the editor). */}
      {layout === 'mobile' ? editorNode : null}
    </BoqShell>
  )
}

// ─── One collapsible section ────────────────────────────────────────────────
function SectionGroup({
  idBase,
  section,
  items,
  filtering,
  open,
  onToggle,
  layout,
  ui,
}: {
  idBase: string
  section: BoqSectionDto
  items: BoqItemDto[]
  filtering: boolean
  open: boolean
  onToggle: () => void
  layout: Layout
  ui: BoqUi
}) {
  const bodyId = `${idBase}-body`
  const countLabel = filtering
    ? `${items.length} of ${plural(section.itemCount, 'item')}`
    : plural(section.itemCount, 'item')

  const renaming = ui.panel?.kind === 'rename-section' && ui.panel.sectionId === section.id
  const deletingSection = ui.panel?.kind === 'delete-section' && ui.panel.sectionId === section.id
  const addingHere = ui.panel?.kind === 'add-item' && ui.panel.sectionId === section.id

  const sectionAction = `${TEXT_ACTION} text-[12.5px] font-semibold`

  return (
    <div className="rounded-[16px] bg-white min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      {renaming ? (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F4F0EC' }}>
          <SectionNameForm
            label="Section name"
            initialName={section.name}
            submitLabel="Save name"
            onSubmit={name => ui.onSubmitRename(section, name)}
            onCancel={() => ui.onClosePanel(`rename-${section.id}`, `section-${section.id}`)}
          />
        </div>
      ) : (
        <button
          type="button"
          data-boq-focus={`section-${section.id}`}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
          className={`w-full min-h-[44px] flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-0 bg-transparent rounded-[16px] text-[#242326] ${FOCUS_RING}`}
        >
          <span className="text-[#68636D]"><IcoChevron open={open} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-[#242326] break-words" style={{ fontFamily: FONT_HEAD }}>{section.name}</span>
            <span className="block text-[12px] text-[#68636D] mt-0.5" style={{ fontFamily: FONT_BODY }}>{countLabel}</span>
          </span>
          <span className={`shrink-0 text-[14.5px] font-semibold text-[#242326] ${NUM}`} style={{ fontFamily: FONT_HEAD }}>
            {formatInr(section.subtotal)}
          </span>
        </button>
      )}

      {open && (
        <div id={bodyId} className="min-w-0" style={{ borderTop: '1px solid #F4F0EC' }}>
          <div className="flex flex-wrap items-center gap-x-3 px-3 pt-1" style={{ fontFamily: FONT_BODY }}>
            <button
              type="button"
              data-boq-focus={`add-${section.id}`}
              aria-label={`Add item to ${section.name}`}
              onClick={() => ui.onAddItem(section)}
              className={`${sectionAction} text-[#722ED1] hover:underline`}
            >
              Add item
            </button>
            <button
              type="button"
              data-boq-focus={`rename-${section.id}`}
              aria-label={`Rename section ${section.name}`}
              onClick={() => ui.onRenameSection(section)}
              className={`${sectionAction} text-[#68636D] hover:text-[#242326] hover:underline`}
            >
              Rename
            </button>
            <button
              type="button"
              data-boq-focus={`delsec-${section.id}`}
              aria-label={`Delete section ${section.name}`}
              onClick={() => ui.onAskDeleteSection(section)}
              className={`${sectionAction} text-[#68636D] hover:text-[#242326] hover:underline`}
            >
              Delete section
            </button>
          </div>

          {deletingSection && (
            <div className="px-4 pb-3 pt-1">
              {section.itemCount > 0 ? (
                <InlineConfirm
                  message={notEmptyMessage(section.itemCount)}
                  alertMessage
                  hideConfirm
                  confirmLabel=""
                  busyLabel=""
                  busy={false}
                  error={null}
                  onConfirm={() => {}}
                  onCancel={() => ui.onClosePanel(`delsec-${section.id}`, `section-${section.id}`)}
                />
              ) : (
                <InlineConfirm
                  message={`Delete the section "${section.name}"? This can't be undone.`}
                  confirmLabel="Delete section"
                  busyLabel="Deleting…"
                  busy={ui.busy}
                  error={ui.panelError}
                  onConfirm={() => ui.onConfirmDeleteSection(section)}
                  onCancel={() => ui.onClosePanel(`delsec-${section.id}`, `section-${section.id}`)}
                />
              )}
            </div>
          )}

          {addingHere && ui.editorNode && <div className="px-3 pb-3 pt-1">{ui.editorNode}</div>}

          {items.length === 0 ? (
            <p className="text-[13px] text-[#68636D] m-0 px-4 py-5" style={{ fontFamily: FONT_BODY }}>No items in this section yet.</p>
          ) : layout === 'desktop' ? (
            <DesktopTable sectionName={section.name} items={items} ui={ui} />
          ) : layout === 'tablet' ? (
            <TabletTable sectionName={section.name} items={items} ui={ui} />
          ) : (
            <ul className="list-none m-0 p-3 flex flex-col gap-2">
              {items.map(item => (
                <MobileItemCard key={item.id} item={item} ui={ui} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Per-item actions + confirmation (all three layouts) ────────────────────
function ItemActions({ item, ui }: { item: BoqItemDto; ui: BoqUi }) {
  const action = `${TEXT_ACTION} text-[12.5px] font-semibold`
  return (
    <div className="flex flex-wrap items-center gap-x-2 -ml-1" style={{ fontFamily: FONT_BODY }}>
      <button
        type="button"
        data-boq-focus={`edit-${item.id}`}
        aria-label={`Edit ${item.name}`}
        onClick={() => ui.onEditItem(item)}
        className={`${action} text-[#722ED1] hover:underline`}
      >
        Edit
      </button>
      <button
        type="button"
        data-boq-focus={`dup-${item.id}`}
        aria-label={`Duplicate ${item.name}`}
        onClick={() => ui.onDuplicateItem(item)}
        className={`${action} text-[#68636D] hover:text-[#242326] hover:underline`}
      >
        Duplicate
      </button>
      <button
        type="button"
        data-boq-focus={`del-${item.id}`}
        aria-label={`Delete ${item.name}`}
        onClick={() => ui.onAskDeleteItem(item)}
        className={`${action} text-[#68636D] hover:text-[#242326] hover:underline`}
      >
        Delete
      </button>
    </div>
  )
}

function ItemDeleteConfirm({ item, ui }: { item: BoqItemDto; ui: BoqUi }) {
  return (
    <InlineConfirm
      message="Delete this item? This can't be undone."
      confirmLabel="Delete item"
      busyLabel="Deleting…"
      busy={ui.busy}
      error={ui.panelError}
      onConfirm={() => ui.onConfirmDeleteItem(item)}
      onCancel={() => ui.onClosePanel(`del-${item.id}`, `section-${item.sectionId}`)}
    />
  )
}

const isEditing = (ui: BoqUi, item: BoqItemDto) => ui.panel?.kind === 'edit-item' && ui.panel.itemId === item.id
const isConfirming = (ui: BoqUi, item: BoqItemDto) => ui.panel?.kind === 'delete-item' && ui.panel.itemId === item.id

// ─── Table shared bits ──────────────────────────────────────────────────────
const TH = 'text-[11px] tracking-[0.06em] uppercase text-[#68636D] font-normal px-3 py-2.5 whitespace-nowrap'
const TD = 'px-3 py-3 align-top text-[13px] text-[#242326]'
const ROW_BORDER = { borderTop: '1px solid #F4F0EC' }

// The item column soaks up the remaining width (`w-full max-w-0`) so names
// wrap / descriptions truncate instead of pushing money columns off-screen.
const ITEM_COL = 'w-full max-w-0'

/** The full-width row that hosts the inline editor / a delete confirmation. */
function SpanRow({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <tr style={ROW_BORDER}>
      <td colSpan={cols} className="px-3 py-3">{children}</td>
    </tr>
  )
}

// ─── Desktop (>= 1024): full table ──────────────────────────────────────────
function DesktopTable({ sectionName, items, ui }: { sectionName: string; items: BoqItemDto[]; ui: BoqUi }) {
  return (
    <table className="w-full border-collapse" style={{ fontFamily: FONT_BODY }}>
      <caption className="sr-only">Items in {sectionName}</caption>
      <thead>
        <tr>
          <th scope="col" className={`${TH} text-left`} style={{ fontFamily: FONT_MONO }}>Item</th>
          <th scope="col" className={`${TH} text-left`} style={{ fontFamily: FONT_MONO }}>Stage</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Quantity</th>
          <th scope="col" className={`${TH} text-left`} style={{ fontFamily: FONT_MONO }}>Unit</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Rate</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          if (isEditing(ui, item) && ui.editorNode) {
            return <SpanRow key={item.id} cols={6}>{ui.editorNode}</SpanRow>
          }
          return (
            <FragmentRows key={item.id} confirm={isConfirming(ui, item) ? <SpanRow cols={6}><ItemDeleteConfirm item={item} ui={ui} /></SpanRow> : null}>
              <tr style={ROW_BORDER}>
                <td className={`${TD} ${ITEM_COL}`}>
                  <span className="block font-semibold break-words" style={{ fontFamily: FONT_HEAD }}>{item.name}</span>
                  {item.description && (
                    <span className="block text-[12px] text-[#68636D] mt-0.5 truncate" title={item.description}>{item.description}</span>
                  )}
                  <ItemActions item={item} ui={ui} />
                </td>
                <td className={`${TD} text-[#68636D] whitespace-nowrap`}>{stageLabel(item.stage) || '—'}</td>
                <td className={`${TD} text-right ${NUM}`}>{formatQuantity(item.quantity)}</td>
                <td className={`${TD} max-w-[120px] break-words`}>{item.unit}</td>
                <td className={`${TD} text-right ${NUM}`}>{formatInr(item.rate)}</td>
                <td className={`${TD} text-right font-semibold ${NUM}`}>{formatInr(item.amount)}</td>
              </tr>
            </FragmentRows>
          )
        })}
      </tbody>
    </table>
  )
}

/** An item row followed by its (optional) confirmation row. */
function FragmentRows({ children, confirm }: { children: React.ReactNode; confirm: React.ReactNode }) {
  return (
    <>
      {children}
      {confirm}
    </>
  )
}

// ─── Tablet (768–1023): condensed table, stage folds into the item cell ─────
function TabletTable({ sectionName, items, ui }: { sectionName: string; items: BoqItemDto[]; ui: BoqUi }) {
  return (
    <table className="w-full border-collapse" style={{ fontFamily: FONT_BODY }}>
      <caption className="sr-only">Items in {sectionName}</caption>
      <thead>
        <tr>
          <th scope="col" className={`${TH} text-left`} style={{ fontFamily: FONT_MONO }}>Item</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Quantity</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Rate</th>
          <th scope="col" className={`${TH} text-right`} style={{ fontFamily: FONT_MONO }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          if (isEditing(ui, item) && ui.editorNode) {
            return <SpanRow key={item.id} cols={4}>{ui.editorNode}</SpanRow>
          }
          const secondLine = [stageLabel(item.stage), item.description].filter(Boolean).join(' · ')
          return (
            <FragmentRows key={item.id} confirm={isConfirming(ui, item) ? <SpanRow cols={4}><ItemDeleteConfirm item={item} ui={ui} /></SpanRow> : null}>
              <tr style={ROW_BORDER}>
                <td className={`${TD} ${ITEM_COL}`}>
                  <span className="block font-semibold break-words" style={{ fontFamily: FONT_HEAD }}>{item.name}</span>
                  {secondLine && (
                    <span className="block text-[12px] text-[#68636D] mt-0.5 truncate" title={secondLine}>{secondLine}</span>
                  )}
                  <ItemActions item={item} ui={ui} />
                </td>
                <td className={`${TD} text-right`}>
                  <span className={`block ${NUM}`}>{formatQuantity(item.quantity)}</span>
                  <span className="block text-[12px] text-[#68636D] mt-0.5 ml-auto max-w-[88px] break-words">{item.unit}</span>
                </td>
                <td className={`${TD} text-right ${NUM}`}>{formatInr(item.rate)}</td>
                <td className={`${TD} text-right font-semibold ${NUM}`}>{formatInr(item.amount)}</td>
              </tr>
            </FragmentRows>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Mobile (< 768): stacked, tap-to-expand card ────────────────────────────
function MobileItemCard({ item, ui }: { item: BoqItemDto; ui: BoqUi }) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const stage = stageLabel(item.stage)
  // A delete confirmation lives in the expanded area, so it keeps it open.
  const confirming = isConfirming(ui, item)
  const shown = open || confirming

  return (
    <li className="rounded-[12px] min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      <button
        type="button"
        aria-expanded={shown}
        aria-controls={detailsId}
        onClick={() => setOpen(o => !o)}
        className={`w-full min-h-[44px] flex items-start gap-2 px-3 py-3 text-left cursor-pointer border-0 bg-transparent rounded-[12px] text-[#242326] ${FOCUS_RING}`}
      >
        <span className="min-w-0 flex-1 flex flex-col gap-1.5">
          <span className="block text-[14px] font-semibold text-[#242326] break-words" style={{ fontFamily: FONT_HEAD }}>{item.name}</span>
          <span className="block text-[12.5px] text-[#68636D] break-words" style={{ fontFamily: FONT_BODY }}>
            <span className={NUM}>{formatQuantity(item.quantity)}</span>{' '}
            <span className="break-words">{item.unit}</span>
            {' × '}
            <span className={NUM}>{formatInr(item.rate)}</span>
          </span>
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] tracking-[0.06em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Amount</span>
            <span className={`text-[16px] font-semibold text-[#242326] ${NUM}`} style={{ fontFamily: FONT_HEAD }}>{formatInr(item.amount)}</span>
          </span>
        </span>
        <span className="text-[#68636D] mt-0.5"><IcoChevron open={shown} /></span>
      </button>

      {shown && (
        <div id={detailsId} className="px-3 pb-3 pt-3 flex flex-col gap-2 min-w-0" style={{ borderTop: '1px solid #F4F0EC', fontFamily: FONT_BODY }}>
          <p className="text-[12.5px] text-[#242326] m-0 break-words">
            <span className="text-[#68636D]">Stage: </span>{stage || '—'}
          </p>
          <p className="text-[12.5px] text-[#242326] m-0 break-words">
            <span className="text-[#68636D]">Description: </span>{item.description || '—'}
          </p>
          {confirming ? <ItemDeleteConfirm item={item} ui={ui} /> : <ItemActions item={item} ui={ui} />}
        </div>
      )}
    </li>
  )
}
