// ─── Project Documents — store, wrapping the existing document model ────────
// UI demonstration data only — there is no backend yet.
//
// ARCHITECTURE SEARCH (done before writing this file): src/data/
// documentUpload.ts already defines the real ProjectDocument model,
// createProjectDocument() factory, validateFile(), formatFileSize() and the
// DocumentType taxonomy (floor-plan/structural-plan/elevation/...) — all
// reused verbatim below, never redefined. What does NOT already exist is a
// queryable "documents belonging to project X" STORE:
//   - UploadPlanScreen.tsx (037) keeps its documents in its own local
//     component state, scoped to boqOverview.projectId — which is
//     boqOverview.ts's hardcoded 'proj-001' (the legacy id this screen is
//     explicitly told never to reuse), not the homeowner's real project_id.
//   - SubmitBidScreen.tsx attaches documents to one Bid's `attachments`
//     array, scoped to an opportunityId, not a project-level repository.
//   - projectOpportunities.ts's `documents` field lives on one
//     ProjectOpportunity, same opportunityId space.
// None of these is a general "this project's documents" store, so this file
// adds only that missing persistence layer, matching bids.ts's own store
// conventions (in-memory array, filter-by-id read path).
//
// documentUpload.ts's own DocumentType taxonomy (floor-plan/structural-plan/
// elevation/section/electrical/plumbing/other) is plan-specific and stays
// on ProjectDocument.type exactly as-is. It does not cover a general
// project-document repository (estimates, contracts, invoices, site
// photos), so a separate, additive DocumentCategory is introduced here —
// never forced onto or conflated with the existing DocumentType field.

import { createProjectDocument, type ProjectDocument } from './documentUpload'

export type DocumentCategory =
  | 'plans'
  | 'estimates-boq'
  | 'contracts'
  | 'approvals'
  | 'invoices'
  | 'site-documents'
  | 'other'

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'plans', 'estimates-boq', 'contracts', 'approvals', 'invoices', 'site-documents', 'other',
]

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  plans: 'Plans',
  'estimates-boq': 'Estimates & BOQ',
  contracts: 'Contracts & Agreements',
  approvals: 'Approvals & Permits',
  invoices: 'Invoices & Payments',
  'site-documents': 'Site Documents',
  other: 'Other',
}

export interface ProjectDocumentRecord {
  document: ProjectDocument
  category: DocumentCategory
  /** Display title — defaults to the real file name when not provided,
   *  never a generated/invented one. */
  title: string
  description: string
  uploadedBy: string
  /** A real, live reference to the exact bytes the user selected (works
   *  for every file type, not only images like documentUpload.ts's own
   *  image-only previewUrl) — this is the seam a real storage URL replaces,
   *  never a fabricated download link. */
  fileUrl: string
}

// ─── In-memory demo store ───────────────────────────────────────────────────

const allRecords: ProjectDocumentRecord[] = []

/** Every document belonging to one project — Screen 072's own read path. */
export function getDocumentsForProject(projectId: string): ProjectDocumentRecord[] {
  return allRecords.filter(r => r.document.projectId === projectId)
}

export interface AddDocumentInput {
  file: File
  projectId: string
  category: DocumentCategory
  title?: string
  description?: string
  uploadedBy: string
}

/** Assembles and stores a new project document record — the seam a real
 *  upload API replaces. Reuses createProjectDocument() for the document
 *  record itself; only wraps it with the project-repository metadata that
 *  documentUpload.ts doesn't carry (category/title/description/uploadedBy).
 *  Marked 'ready' immediately — there is no real async upload/processing
 *  pipeline here (that simulated multi-stage flow belongs to Screen 037's
 *  plan-analysis path specifically, not a general document repository). */
export function addProjectDocument(input: AddDocumentInput): ProjectDocumentRecord {
  const document: ProjectDocument = {
    ...createProjectDocument(input.file, input.projectId),
    status: 'ready',
  }
  const record: ProjectDocumentRecord = {
    document,
    category: input.category,
    title: input.title?.trim() || input.file.name,
    description: (input.description ?? '').trim(),
    uploadedBy: input.uploadedBy,
    fileUrl: URL.createObjectURL(input.file),
  }
  allRecords.push(record)
  return record
}
