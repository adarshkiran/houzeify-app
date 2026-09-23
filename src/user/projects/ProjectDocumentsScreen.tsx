import { useEffect, useId, useMemo, useState, useRef } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { validateFile, formatFileSize, isPdf, isCad, isPreviewableImage } from '@/data/documentUpload'
import {
  getDocumentsForProject,
  addProjectDocument,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type ProjectDocumentRecord,
  type DocumentCategory,
} from '@/data/projectDocumentsStore'
import { useProjectDocuments } from '@/data/projectDocumentsState'
import { describeDocumentError, type ProjectDocumentDto, type UpdateProjectDocumentInput } from '@/data/projectDocumentsApi'
import { ApiError, apiUrl } from '@/data/apiClient'
import { isServerProjectId } from '@/data/projectIds'
import { useAuth } from '@/data/authState'
import { useProjectAudience } from '@/data/customerProjectsState'
import { listCustomerViewDocuments, type CustomerViewDocument } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 072 — Project Documents ─────────────────────────────────────────
// A HOMEOWNER screen reached from 068/069/070/071. Project-scoped document
// repository — NOT 037 (Upload Plan), 047-051 (BOQ), or 095 (Conversation
// Detail). Reuses documentUpload.ts's real ProjectDocument model,
// createProjectDocument() factory, validateFile() and formatFileSize()
// verbatim (see projectDocumentsStore.ts's own header comment for the full
// architecture search — no reusable project-scoped document STORE existed
// before it, only this file's small addition). Documents are only ever
// what a real upload through this screen's own form has produced — nothing
// pulled from another project, another opportunity, or fabricated.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoSearch = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" /></svg>
)
const IcoDocuments = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoPdf = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoImage = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="14" height="14" rx="2" /><circle cx="6.5" cy="6.5" r="1.5" /><path d="M16 12l-4-4-8 8" /></svg>
)
const IcoFile = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /></svg>
)

function fileIconFor(mimeType: string, name: string) {
  if (isPdf(mimeType, name)) return <IcoPdf />
  if (isPreviewableImage(mimeType)) return <IcoImage />
  if (isCad(name)) return <IcoFile />
  return <IcoFile />
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

type FilterTab = 'all' | DocumentCategory

interface ProjectDocumentsScreenProps {
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

// Module 07 — the default export only decides which mode to render. A real
// server project id (UUID, isServerProjectId) gets the API-backed screen; any
// other id (homeowner New-Build projects use client-local ids) keeps the
// original in-memory experience exactly as it was (LegacyDocuments, below).
// Hooks live unconditionally inside each sub-component, never across the
// branch.
export default function ProjectDocumentsScreen({
  role,
  userId,
  projectId,
  projectName,
  location,
  fullName,
  preferredName,
  onNavigate,
}: ProjectDocumentsScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional
  // must be able to open one of their organization's real projects here
  // too, not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])
  if (!canViewProject) return null

  const hasProject = Boolean(projectId && projectName)

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button
            type="button"
            onClick={() => onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)}
            className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  if (isServerProjectId(projectId)) {
    return (
      <ServerDocuments
        userId={userId}
        projectId={projectId as string}
        projectName={projectName as string}
        location={location}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <LegacyDocuments
      projectId={projectId as string}
      projectName={projectName as string}
      location={location}
      fullName={fullName}
      preferredName={preferredName}
      onNavigate={onNavigate}
    />
  )
}

// ─── Legacy (client-local project) mode — unchanged in-memory behavior ──────
function LegacyDocuments({
  projectId,
  projectName,
  location,
  fullName,
  preferredName,
  onNavigate,
}: {
  projectId: string
  projectName: string
  location?: string
  fullName?: string
  preferredName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // 12G-D — real projectData identity only (bridged from CustomerProfile);
  // no hardcoded homeownerProfile fixture fallback.
  const ownerName = fullName || preferredName || 'Homeowner'

  const [docsVersion, setDocsVersion] = useState(0)
  const records = useMemo(
    () => (projectId ? getDocumentsForProject(projectId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, docsVersion]
  )

  const [filter, setFilter] = useState<FilterTab>('all')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<DocumentCategory>('other')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileError, setFileError] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'
  const inputClass = 'w-full h-10 px-3 rounded-[10px] text-[13.5px] outline-none'
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }

  const counts: Record<FilterTab, number> = {
    all: records.length,
    plans: 0, 'estimates-boq': 0, contracts: 0, approvals: 0, invoices: 0, 'site-documents': 0, other: 0,
  }
  for (const r of records) counts[r.category] += 1
  const activeCategories = DOCUMENT_CATEGORIES.filter(c => counts[c] > 0)

  const q = query.trim().toLowerCase()
  const visible = records
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => !q || r.title.toLowerCase().includes(q) || r.document.name.toLowerCase().includes(q))

  function resetForm() {
    setCategory('other')
    setTitle('')
    setDescription('')
    setFileError(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !projectId) return
    for (const file of Array.from(fileList)) {
      const result = validateFile(file)
      if (!result.valid) {
        setFileError(result.error)
        return
      }
    }
    try {
      for (const file of Array.from(fileList)) {
        addProjectDocument({
          file,
          projectId,
          category,
          title: fileList.length === 1 ? title : undefined,
          description,
          uploadedBy: ownerName,
        })
      }
      setDocsVersion(v => v + 1)
      resetForm()
      setShowForm(false)
    } catch {
      setFileError("Couldn't upload this document.")
    }
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    ...activeCategories.map(c => ({ id: c as FilterTab, label: DOCUMENT_CATEGORY_LABELS[c] })),
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <ProjectSubNav active="documents" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6 min-w-0">
          {/* Module 07 — these client-local projects have no server record, so
              say plainly where their documents live. */}
          <div
            role="note"
            className="rounded-[12px] px-4 py-3 text-[13px] m-0"
            style={{ border: '1px solid #E3DDD7', backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_BODY }}
          >
            These documents are kept in this browser only and aren&apos;t saved to the project record.
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Documents</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Plans, estimates, agreements and other project files.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowForm(s => !s); setFileError(undefined) }}
              className={selectClass}
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
            >
              Upload Document →
            </button>
          </div>

          {/* Upload form */}
          {showForm && (
            <SectionCard title="Upload Document">
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={e => handleFilesSelected(e.target.files)}
                  className="text-[13px]"
                  style={{ fontFamily: FONT_BODY }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Document title (optional)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  <select className={inputClass} style={inputStyle} value={category} onChange={e => setCategory(e.target.value as DocumentCategory)}>
                    {DOCUMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="w-full px-3 py-2 rounded-[10px] text-[13.5px] outline-none resize-none"
                  style={{ ...inputStyle, height: 64 }}
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                {fileError && (
                  <p className="text-[12.5px] text-[#DC2626] m-0" style={{ fontFamily: FONT_BODY }}>{fileError}</p>
                )}
                <p className="text-[11.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                  Choose a file above to upload it to this project.
                </p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                    Cancel
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Search + filters */}
          {records.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68636D]"><IcoSearch /></span>
                <input
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  placeholder="Search documents…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className="h-8 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0"
                    style={{
                      fontFamily: FONT_BODY,
                      backgroundColor: filter === tab.id ? '#722ED1' : '#CAC7C6',
                      color: filter === tab.id ? 'white' : '#808080',
                    }}
                  >
                    {tab.label} {counts[tab.id]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document list */}
          {records.length === 0 ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoDocuments />
                </span>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No documents yet</p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                  Upload plans, estimates, agreements and other project files to keep everything organized in one place.
                </p>
                <button type="button" onClick={() => setShowForm(true)} className={`${selectClass} mt-2`} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                  Upload Document
                </button>
              </div>
            </SectionCard>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map(record => (
                <DocumentCard key={record.document.id} record={record} />
              ))}
              {visible.length === 0 && (
                <SectionCard>
                  <p className="text-[13px] text-[#68636D] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No documents match this search.</p>
                </SectionCard>
              )}
            </div>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ record }: { record: ProjectDocumentRecord }) {
  const { document, category, description, uploadedBy, fileUrl } = record
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[#722ED1]" style={{ backgroundColor: '#F3EAFF' }}>
            {fileIconFor(document.mimeType, document.name)}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{record.title}</p>
            {description && (
              <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                {DOCUMENT_CATEGORY_LABELS[category].toUpperCase()}
              </span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(document.size)}</span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Uploaded {formatDate(document.uploadedAt)}</span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>by {uploadedBy}</span>
            </div>
          </div>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[12.5px] font-semibold text-[#722ED1] hover:underline shrink-0"
          style={{ fontFamily: FONT_BODY }}
        >
          View →
        </a>
      </div>
    </div>
  )
}

// ─── Server (real project) mode — Module 07 ─────────────────────────────────
// Metadata only: the backend stores a document's details (title, category,
// file name, type, size), never its bytes, so no card ever offers View or
// Download and no blob URL is ever built here (spec §14). The selected File is
// read for name/type/size at "Add document" time and then discarded.
//
// Identity: same convention as ProjectWorkforceScreen.tsx — "You" for the
// signed-in user's own id, "Member <first 8 chars>" otherwise; the backend
// never joins a display name.

function memberLabel(candidateUserId: string, currentUserId: string): string {
  return candidateUserId === currentUserId ? 'You' : `Member ${candidateUserId.slice(0, 8)}`
}

// Card copy shows the extension ("PDF", "DWG") and falls back to the mime
// subtype when a file name has none.
function fileTypeLabel(fileName: string, mimeType: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot > 0 && dot < fileName.length - 1) return fileName.slice(dot + 1).toUpperCase()
  const sub = mimeType.split('/')[1]
  return sub ? sub.toUpperCase() : 'FILE'
}

function titleFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  const base = dot > 0 ? fileName.slice(0, dot) : fileName
  return base.slice(0, 200)
}

// Visible keyboard focus for every server-mode control. Matches the ring used
// by EntitlementUpgradePrompt, in the app's brand purple.
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'

// Bare text actions: a >= 44 px tap target without changing how they look.
const TEXT_ACTION = `inline-flex items-center min-h-[44px] cursor-pointer border-0 bg-transparent px-1 rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed ${FOCUS_RING}`

const NOTICE_MS = 4000

function ServerCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function ServerDocuments({
  userId,
  projectId,
  projectName,
  location,
  onNavigate,
}: {
  userId?: string
  projectId: string
  projectName: string
  location?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const auth = useAuth()
  const currentUserId = auth.user?.id || userId || CURRENT_USER_ID
  const audience = useProjectAudience(projectId)
  const isCustomer = audience === 'customer'
  const [sharedDocs, setSharedDocs] = useState<CustomerViewDocument[]>([])

  useEffect(() => {
    if (!isCustomer) return
    listCustomerViewDocuments(projectId).then(setSharedDocs).catch(() => setSharedDocs([]))
  }, [isCustomer, projectId])

  const { status, documents, error, addDocument, updateDocument, archiveDocument, refetch } = useProjectDocuments(isCustomer ? undefined : projectId)
  const isLoading = status === 'idle' || status === 'loading'

  const [filter, setFilter] = useState<FilterTab>('all')
  const [query, setQuery] = useState('')

  // Add flow: pick a file -> review (title/category/description) -> confirm.
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<DocumentCategory>('other')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Brief, non-blocking confirmation ("Document added", "Details saved",
  // "Document archived") that clears itself; the timer dies with the screen.
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
    }
  }, [])

  const uid = useId()
  const fileId = `${uid}-file`
  const titleId = `${uid}-title`
  const categoryId = `${uid}-category`
  const descriptionId = `${uid}-description`

  const btnClass = `h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 ${FOCUS_RING}`
  const inputClass = `w-full h-11 px-3 rounded-[10px] text-[13.5px] ${FOCUS_RING}`
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }
  const labelClass = 'block text-[12.5px] font-semibold text-[#242326] mb-1.5'

  function showNotice(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => {
      setNotice(null)
      noticeTimer.current = null
    }, NOTICE_MS)
  }

  function resetForm() {
    setSelectedFile(null)
    setCategory('other')
    setTitle('')
    setDescription('')
    setFileError(null)
    setFormError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  function openForm() {
    setShowForm(true)
    setFormError(null)
  }

  // Selecting a file uploads nothing — it only validates and opens the review.
  function handleFileSelected(fileList: FileList | null) {
    setFormError(null)
    const file = fileList && fileList.length > 0 ? fileList[0] : null
    if (!file) {
      setSelectedFile(null)
      setFileError(null)
      return
    }
    const result = validateFile(file)
    // The server caps stored file names at 255 characters.
    const tooLong = result.valid && file.name.length > 255
    if (!result.valid || tooLong) {
      setSelectedFile(null)
      setFileError(
        tooLong
          ? 'That file name is too long. Rename it to under 255 characters and try again.'
          : result.error ?? "This file can't be added.",
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setFileError(null)
    setSelectedFile(file)
    setTitle(titleFromFileName(file.name))
  }

  async function handleSubmit() {
    if (!selectedFile || isSubmitting) return
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setFormError('Give the document a title.')
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    try {
      await addDocument({
        file: selectedFile,
        category,
        title: trimmedTitle,
        description: description.trim() || undefined,
      })
      closeForm()
      showNotice('Document added')
    } catch (err) {
      // The hook lets mutation errors propagate by convention; this catch is
      // the screen's own, keeping the form open so the user can correct and
      // retry. describeDocumentError's NOT_FOUND copy is about changing or
      // archiving an existing document, so creation words it separately.
      if (err instanceof ApiError && err.code === 'NOT_FOUND') {
        setFormError("This project isn't available to you any more, so the document wasn't added.")
      } else {
        setFormError(describeDocumentError(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const counts: Record<FilterTab, number> = {
    all: documents.length,
    plans: 0, 'estimates-boq': 0, contracts: 0, approvals: 0, invoices: 0, 'site-documents': 0, other: 0,
  }
  for (const d of documents) counts[d.category] += 1
  const activeCategories = DOCUMENT_CATEGORIES.filter(c => counts[c] > 0)
  // A category chip disappears once its last document does; never leave the
  // list filtered by a chip that no longer exists.
  const activeFilter: FilterTab = filter === 'all' || counts[filter] > 0 ? filter : 'all'

  const q = query.trim().toLowerCase()
  const visible = documents
    .filter(d => activeFilter === 'all' || d.category === activeFilter)
    .filter(d => !q || d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q))

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    ...activeCategories.map(c => ({ id: c as FilterTab, label: DOCUMENT_CATEGORY_LABELS[c] })),
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <ProjectSubNav active="documents" projectId={projectId} projectName={projectName} variant={isCustomer ? 'customer' : 'company'} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Documents</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Plans, estimates, agreements and other project files.</p>
            </div>
            {/* Disabled mid-submit so it can't close (and wipe) or reopen the
                form while a create request is in flight. */}
            {!isCustomer && (
            <button
              type="button"
              onClick={() => (showForm ? closeForm() : openForm())}
              disabled={isSubmitting}
              className={btnClass}
              style={{
                backgroundColor: '#722ED1',
                color: 'white',
                fontFamily: FONT_BODY,
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Add document
            </button>
            )}
          </div>

          {/* Persistent live region so screen readers announce the
              confirmation; visually hidden (and out of the layout gap) while
              there is nothing to say. */}
          <div role="status" aria-live="polite" className={notice ? '' : 'sr-only'}>
            {notice && (
              <p
                className="rounded-[12px] px-4 py-2.5 text-[13px] font-semibold m-0"
                style={{ backgroundColor: '#C6F6D5', border: '1px solid #9FE0B3', color: '#14532D', fontFamily: FONT_BODY }}
              >
                {notice}
              </p>
            )}
          </div>

          {/* Add document — choose a file, review its details, then confirm */}
          {showForm && (
            <ServerCard title="Add document">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor={fileId} className={labelClass} style={{ fontFamily: FONT_BODY }}>File</label>
                  <input
                    id={fileId}
                    ref={fileInputRef}
                    type="file"
                    onChange={e => handleFileSelected(e.target.files)}
                    disabled={isSubmitting}
                    className={`text-[13px] max-w-full rounded-[6px] ${FOCUS_RING}`}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {fileError && (
                    <p role="alert" className="text-[12.5px] text-[#DC2626] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>{fileError}</p>
                  )}
                </div>

                {selectedFile ? (
                  <>
                    <div className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 min-w-0" style={{ backgroundColor: '#F4F0EC' }}>
                      <span className="text-[#722ED1] shrink-0">{fileIconFor(selectedFile.type, selectedFile.name)}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_BODY }}>{selectedFile.name}</p>
                        <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label htmlFor={titleId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Title</label>
                        <input
                          id={titleId}
                          className={inputClass}
                          style={inputStyle}
                          maxLength={200}
                          value={title}
                          onChange={e => { setTitle(e.target.value); setFormError(null) }}
                        />
                      </div>
                      <div className="min-w-0">
                        <label htmlFor={categoryId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Category</label>
                        <select
                          id={categoryId}
                          className={inputClass}
                          style={inputStyle}
                          value={category}
                          onChange={e => setCategory(e.target.value as DocumentCategory)}
                        >
                          {DOCUMENT_CATEGORIES.map(c => (
                            <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={descriptionId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Description (optional)</label>
                      <textarea
                        id={descriptionId}
                        className={`w-full px-3 py-2 rounded-[10px] text-[13.5px] resize-none ${FOCUS_RING}`}
                        style={{ ...inputStyle, height: 72 }}
                        maxLength={2000}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>
                    <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                      For now Houzeify saves this document&apos;s details only. The file itself isn&apos;t stored yet.
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                    Choose a file (PDF, JPG, PNG, DWG or DXF, up to 25 MB), then review its details before adding it.
                  </p>
                )}

                {formError && (
                  <p role="alert" className="text-[12.5px] text-[#DC2626] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{formError}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedFile || isSubmitting}
                    className={btnClass}
                    style={{
                      backgroundColor: '#722ED1',
                      color: 'white',
                      fontFamily: FONT_BODY,
                      opacity: !selectedFile || isSubmitting ? 0.5 : 1,
                      cursor: !selectedFile || isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Adding…' : 'Add document'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={isSubmitting}
                    className={`${TEXT_ACTION} text-[13px] font-medium text-[#68636D] hover:text-[#242326]`}
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </ServerCard>
          )}

          {error && (
            <div role="alert" className="rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <p className="text-[13px] text-[#B91C1C] m-0 min-w-0 break-words" style={{ fontFamily: FONT_BODY }}>{error}</p>
              <button
                type="button"
                onClick={() => { void refetch() }}
                className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#B91C1C] hover:underline`}
                style={{ fontFamily: FONT_BODY }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Search + filters */}
          {!isLoading && documents.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68636D]"><IcoSearch /></span>
                <input
                  aria-label="Search documents"
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  placeholder="Search documents…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-x-2 gap-y-3 flex-wrap">
                {filterTabs.map(tab => (
                  // h-8 pill; the ::after pseudo-element stretches the hit
                  // area to 44 px without changing how the chip looks.
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    aria-pressed={activeFilter === tab.id}
                    className={`relative h-8 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0 after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1.5 ${FOCUS_RING}`}
                    style={{
                      fontFamily: FONT_BODY,
                      backgroundColor: activeFilter === tab.id ? '#722ED1' : '#F4F0EC',
                      color: activeFilter === tab.id ? 'white' : '#68636D',
                    }}
                  >
                    {tab.label} {counts[tab.id]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document list */}
          {isCustomer ? (
            <div className="flex flex-col gap-3">
              {sharedDocs.length === 0 ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No documents have been shared with you yet.</p>
              ) : sharedDocs.map(doc => (
                <div key={doc.id} className="rounded-[14px] bg-white p-4" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[14px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>{doc.title}</p>
                  <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                    {doc.fileName}{doc.fileAvailable ? '' : ' · File isn’t stored yet'}
                  </p>
                  {doc.fileAvailable && doc.contentUrl && (
                    <a
                      href={apiUrl(doc.contentUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#722ED1] hover:underline mt-2`}
                      style={{ fontFamily: FONT_BODY }}
                      aria-label={`Open shared document ${doc.title}`}
                    >
                      Open file
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <ServerCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoDocuments />
                </span>
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading documents…</p>
              </div>
            </ServerCard>
          ) : documents.length === 0 ? (
            // A failed load already shows the error banner above; don't also
            // claim the repository is empty when we simply couldn't read it.
            status === 'error' ? null : (
              <ServerCard>
                <div className="flex flex-col items-center text-center gap-2 py-6">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
                    <IcoDocuments />
                  </span>
                  <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No documents yet.</p>
                  <p className="text-[13px] text-[#68636D] m-0 max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
                    Add plans, agreements, and approvals so the whole team works from the same set.
                  </p>
                  <button type="button" onClick={openForm} disabled={isSubmitting} className={`${btnClass} mt-2`} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY, opacity: isSubmitting ? 0.5 : 1 }}>
                    Add document
                  </button>
                </div>
              </ServerCard>
            )
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map(doc => (
                <ServerDocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUserId={currentUserId}
                  onUpdate={updateDocument}
                  onArchive={archiveDocument}
                  onNotice={showNotice}
                  onStale={refetch}
                />
              ))}
              {visible.length === 0 && (
                <ServerCard>
                  <p className="text-[13px] text-[#68636D] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No documents match this search.</p>
                </ServerCard>
              )}
            </div>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}

type CardMode = 'view' | 'edit' | 'archive'

function ServerDocumentCard({
  doc,
  currentUserId,
  onUpdate,
  onArchive,
  onNotice,
  onStale,
}: {
  doc: ProjectDocumentDto
  currentUserId: string
  onUpdate: (id: string, patch: UpdateProjectDocumentInput) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onNotice: (message: string) => void
  onStale: () => Promise<void>
}) {
  const [mode, setMode] = useState<CardMode>('view')
  const [editTitle, setEditTitle] = useState(doc.title)
  const [editCategory, setEditCategory] = useState<DocumentCategory>(doc.category)
  const [editDescription, setEditDescription] = useState(doc.description ?? '')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)

  // Return keyboard focus to the button that opened the editor / confirmation
  // once it closes (those buttons are unmounted while a panel is open).
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const archiveButtonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusTo = useRef<'edit' | 'archive' | null>(null)
  useEffect(() => {
    if (mode !== 'view' || !restoreFocusTo.current) return
    const target = restoreFocusTo.current === 'edit' ? editButtonRef.current : archiveButtonRef.current
    restoreFocusTo.current = null
    target?.focus()
  }, [mode])

  const uid = useId()
  const titleId = `${uid}-title`
  const categoryId = `${uid}-category`
  const descriptionId = `${uid}-description`
  const confirmId = `${uid}-confirm`

  const inputClass = `w-full h-11 px-3 rounded-[10px] text-[13.5px] ${FOCUS_RING}`
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }
  const labelClass = 'block text-[12.5px] font-semibold text-[#242326] mb-1.5'
  const primaryBtn = `h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 disabled:cursor-not-allowed aria-disabled:cursor-not-allowed ${FOCUS_RING}`

  // Some files carry their name as the title (the default when adding); only
  // repeat the file name when it tells the reader something the title doesn't.
  const showFileName = doc.fileName !== doc.title && titleFromFileName(doc.fileName) !== doc.title

  function openEdit() {
    setEditTitle(doc.title)
    setEditCategory(doc.category)
    setEditDescription(doc.description ?? '')
    setActionError(null)
    setMode('edit')
  }

  function openArchive() {
    setActionError(null)
    setMode('archive')
  }

  function closePanel() {
    if (isBusy) return
    restoreFocusTo.current = mode === 'edit' ? 'edit' : 'archive'
    setActionError(null)
    setMode('view')
  }

  async function saveEdit() {
    if (isBusy) return
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setActionError('Give the document a title.')
      return
    }
    // Only send what changed; nothing changed -> just close.
    const patch: UpdateProjectDocumentInput = {}
    if (trimmedTitle !== doc.title) patch.title = trimmedTitle
    const trimmedDescription = editDescription.trim()
    if (trimmedDescription !== (doc.description ?? '').trim()) patch.description = trimmedDescription
    if (editCategory !== doc.category) patch.category = editCategory
    if (Object.keys(patch).length === 0) {
      closePanel()
      return
    }
    setIsBusy(true)
    setActionError(null)
    try {
      // The hook refetches silently on success, so the card re-renders with
      // the saved values; the editor stays open if this throws.
      await onUpdate(doc.id, patch)
      restoreFocusTo.current = 'edit'
      setMode('view')
      onNotice('Details saved')
    } catch (err) {
      setActionError(describeDocumentError(err))
      // A stale card (its row is gone): refetch so it drops from the list.
      if (err instanceof ApiError && err.code === 'NOT_FOUND') void onStale()
    } finally {
      setIsBusy(false)
    }
  }

  async function confirmArchive() {
    if (isBusy) return
    setIsBusy(true)
    setActionError(null)
    try {
      // On success the refetch drops this card from the list.
      await onArchive(doc.id)
      setMode('view')
      onNotice('Document archived')
    } catch (err) {
      setActionError(describeDocumentError(err))
      // A stale card (its row is gone): refetch so it drops from the list.
      if (err instanceof ApiError && err.code === 'NOT_FOUND') void onStale()
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[#722ED1]" style={{ backgroundColor: '#F3EAFF' }}>
          {fileIconFor(doc.mimeType, doc.fileName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{doc.title}</p>
          {showFileName && (
            <p className="text-[12px] text-[#68636D] m-0 mt-0.5 min-w-0 truncate" title={doc.fileName} style={{ fontFamily: FONT_BODY }}>{doc.fileName}</p>
          )}
          {doc.description && (
            <p className="text-[12.5px] text-[#68636D] m-0 mt-1 break-words" style={{ fontFamily: FONT_BODY }}>{doc.description}</p>
          )}
          <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
              {DOCUMENT_CATEGORY_LABELS[doc.category].toUpperCase()}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em]"
              style={{
                backgroundColor: doc.visibility === 'customer' ? '#C6F6D5' : '#F3EAFF',
                color: '#242326',
                fontFamily: FONT_MONO,
              }}
            >
              {doc.visibility === 'customer' ? 'SHARED' : 'INTERNAL'}
            </span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{fileTypeLabel(doc.fileName, doc.mimeType)}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(doc.size)}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Added {formatDate(doc.createdAt)}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>by {memberLabel(doc.uploadedBy, currentUserId)}</span>
          </div>
          {!doc.fileAvailable && (
            <p className="text-[12px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>File isn&apos;t stored yet</p>
          )}
        </div>
      </div>

      {mode === 'view' && (
        <div className="flex items-center flex-wrap gap-x-4 mt-2 sm:pl-[52px]">
          {doc.fileAvailable && doc.contentUrl && (
            <a
              href={apiUrl(doc.contentUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#722ED1] hover:underline`}
              style={{ fontFamily: FONT_BODY }}
              aria-label={`Open document file ${doc.title}`}
            >
              Open file
            </a>
          )}
          <button
            type="button"
            disabled={shareBusy}
            onClick={() => {
              const next = doc.visibility === 'customer' ? 'internal' : 'customer'
              setShareBusy(true)
              setActionError(null)
              onUpdate(doc.id, { visibility: next })
                .then(() => onNotice(next === 'customer' ? 'Shared with customer' : 'Marked internal'))
                .catch(err => {
                  setActionError(describeDocumentError(err))
                  if (err instanceof ApiError && err.code === 'NOT_FOUND') void onStale()
                })
                .finally(() => setShareBusy(false))
            }}
            className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#242326] hover:underline disabled:opacity-50`}
            style={{ fontFamily: FONT_BODY }}
            aria-label={doc.visibility === 'customer' ? `Stop sharing ${doc.title} with customer` : `Share ${doc.title} with customer`}
          >
            {shareBusy ? 'Updating…' : doc.visibility === 'customer' ? 'Shared' : 'Share with customer'}
          </button>
          <button
            ref={editButtonRef}
            type="button"
            onClick={openEdit}
            className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#722ED1] hover:underline`}
            style={{ fontFamily: FONT_BODY }}
          >
            Edit details
          </button>
          <button
            ref={archiveButtonRef}
            type="button"
            onClick={openArchive}
            className={`${TEXT_ACTION} text-[12.5px] font-semibold text-[#68636D] hover:text-[#242326] hover:underline`}
            style={{ fontFamily: FONT_BODY }}
          >
            Archive
          </button>
        </div>
      )}

      {mode === 'view' && actionError && (
        <p role="alert" className="text-[12.5px] text-[#DC2626] m-0 mt-2 sm:pl-[52px] break-words" style={{ fontFamily: FONT_BODY }}>{actionError}</p>
      )}

      {mode === 'edit' && (
        <form
          className="flex flex-col gap-4 mt-4 pt-4"
          style={{ borderTop: '1px solid #F4F0EC' }}
          aria-label={`Edit details for ${doc.title}`}
          onSubmit={e => { e.preventDefault(); void saveEdit() }}
          onKeyDown={e => { if (e.key === 'Escape' && !(e.target instanceof HTMLSelectElement)) closePanel() }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label htmlFor={titleId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Title</label>
              <input
                id={titleId}
                autoFocus
                className={inputClass}
                style={inputStyle}
                maxLength={200}
                value={editTitle}
                onChange={e => { setEditTitle(e.target.value); setActionError(null) }}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor={categoryId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Category</label>
              <select
                id={categoryId}
                className={inputClass}
                style={inputStyle}
                value={editCategory}
                onChange={e => setEditCategory(e.target.value as DocumentCategory)}
              >
                {DOCUMENT_CATEGORIES.map(c => (
                  <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={descriptionId} className={labelClass} style={{ fontFamily: FONT_BODY }}>Description (optional)</label>
            <textarea
              id={descriptionId}
              className={`w-full px-3 py-2 rounded-[10px] text-[13.5px] resize-none ${FOCUS_RING}`}
              style={{ ...inputStyle, height: 72 }}
              maxLength={2000}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
          </div>
          {actionError && (
            <p role="alert" className="text-[12.5px] text-[#DC2626] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{actionError}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              aria-disabled={isBusy}
              className={primaryBtn}
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY, opacity: isBusy ? 0.5 : 1 }}
            >
              {isBusy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={closePanel}
              aria-disabled={isBusy}
              className={`${TEXT_ACTION} text-[13px] font-medium text-[#68636D] hover:text-[#242326]`}
              style={{ fontFamily: FONT_BODY }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'archive' && (
        <div
          role="group"
          aria-labelledby={confirmId}
          className="flex flex-col gap-3 mt-4 pt-4"
          style={{ borderTop: '1px solid #F4F0EC' }}
          onKeyDown={e => { if (e.key === 'Escape' && !(e.target instanceof HTMLSelectElement)) closePanel() }}
        >
          <p id={confirmId} className="text-[13px] text-[#242326] m-0" style={{ fontFamily: FONT_BODY }}>
            Archive this document? It will be hidden from the project.
          </p>
          {actionError && (
            <p role="alert" className="text-[12.5px] text-[#DC2626] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{actionError}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => { void confirmArchive() }}
              aria-disabled={isBusy}
              className={primaryBtn}
              style={{ backgroundColor: '#B91C1C', color: 'white', fontFamily: FONT_BODY, opacity: isBusy ? 0.5 : 1 }}
            >
              {isBusy ? 'Archiving…' : 'Archive'}
            </button>
            <button
              type="button"
              autoFocus
              onClick={closePanel}
              aria-disabled={isBusy}
              className={`${TEXT_ACTION} text-[13px] font-medium text-[#68636D] hover:text-[#242326]`}
              style={{ fontFamily: FONT_BODY }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
