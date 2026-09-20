import { useEffect, useMemo, useState, useRef } from 'react'
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


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
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
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
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
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function ProjectDocumentsScreen({
  role,
  userId: _userId,
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

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button type="button" onClick={goToWorkspace} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back to Workspace
          </button>
        </div>
      </div>
    )
  }

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
        <div className="flex flex-col flex-1 min-h-0">

      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToWorkspace} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Project Workspace
          </button>
        </div>
      </header>

      <ProjectSubNav active="documents" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6">
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
                <p className="text-[11.5px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A949D]"><IcoSearch /></span>
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
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoDocuments />
                </span>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No documents yet</p>
                <p className="text-[13px] text-[#9A949D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
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
                  <p className="text-[13px] text-[#9A949D] m-0 text-center py-4" style={{ fontFamily: FONT_BODY }}>No documents match this search.</p>
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
              <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(document.size)}</span>
              <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Uploaded {formatDate(document.uploadedAt)}</span>
              <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>by {uploadedBy}</span>
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
