# Houzeify C15 Implementation Report — Construction Evidence (C15A)

**Branch:** `cursor/c15-construction-evidence`  
**Base:** `main` @ `a318621c476b42840313bea937035938b037bc8f`  
**Scope:** C15A construction photos only (no video / voice / AI / time-lapse)  
**Commit state:** Uncommitted (ready for review; no auto-commit per brief)

---

## 1. Summary

C15A replaces metadata-only `internal://` photo uploads with **real persistent object storage**. Company users upload JPEG/PNG/WebP via multipart; the server validates, stores bytes, and creates a `daily_progress_photos` row with a retrievable `local://` or `s3://` `storageRef`. Authorized company and active customers retrieve actual image bytes through a session-authenticated content endpoint. Legacy `internal://` rows are preserved and shown as unavailable.

## 2. Existing storage infrastructure discovered

Searched the repository for S3, R2, Supabase Storage, Firebase, GCS, Azure Blob, Vercel Blob, UploadThing, signed/presigned URLs, multipart, FormData, media/attachments, and `internal://`.

**Findings:**

- No cloud object-storage SDK or credentials were configured.
- `daily_progress_photos` and `project_documents` already stored **metadata** with `storageRef` values such as `internal://…` (no retrievable bytes).
- Frontend Create Daily Progress previewed files with `URL.createObjectURL` but posted JSON metadata only.
- Project Documents product surface already used honest `fileAvailable: false` for `internal://`.

## 3. Storage provider selected

**Default: local filesystem** under `MEDIA_LOCAL_ROOT` (default `.media/`).  
**Optional: S3-compatible** (`STORAGE_PROVIDER=s3`) via `@aws-sdk/client-s3` (AWS S3, Cloudflare R2, MinIO).

## 4. Why it was selected

- No provider was already wired; inventing multiple providers would violate the single-provider rule.
- Local storage gives real persistent bytes for development/test without external infra.
- S3-compatible is the production path when env credentials are supplied; same `ObjectStorage` interface, same `storageRef` scheme (`s3://<object-key>`).
- Server remains the authorization boundary; the frontend never receives storage secrets.

## 5. Environment variables required

| Variable | Purpose |
|---|---|
| `STORAGE_PROVIDER` | `local` (default) or `s3` |
| `MEDIA_LOCAL_ROOT` | Local root directory (default `.media`) |
| `S3_BUCKET` | Required when `s3` |
| `S3_REGION` | Default `auto` |
| `S3_ENDPOINT` | Optional (R2 / MinIO); enables path-style |
| `S3_ACCESS_KEY_ID` | Required when `s3` |
| `S3_SECRET_ACCESS_KEY` | Required when `s3` |

Documented in `.env.example`. Never expose these to the browser.

## 6. Database changes

**No migration.** Reused existing `daily_progress_photos` columns:

- `id`, `daily_progress_id` → project via join, uploader, MIME, size, `storage_ref`, `created_at`
- Organization/project derived from the linked daily progress + project row
- Construction stage / customer visibility come from the parent `daily_progress` row (`stage`, `visibility`)

Schema comments updated to describe C15 retrievable refs vs legacy `internal://`.

## 7. API changes

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/v1/projects/:projectId/daily-progress/:progressId/photos` | **Multipart** field `file` (JSON metadata upload removed) |
| `GET` | `/api/v1/projects/:projectId/daily-progress-photos/:photoId/content` | Authenticated byte stream |
| List/serialize | Daily progress + customer-view progress | Adds `fileAvailable`, `contentUrl` |

## 8. Upload flow

1. User selects/captures image (JPEG/PNG/WebP, ≤15 MB client check).
2. Progress entry created (existing API).
3. Frontend `FormData` upload of real bytes.
4. Server: auth → project mutation ACL → magic-byte + MIME + size validation → object `put` → DB insert with `local://` or `s3://` ref → returns DTO with `contentUrl`.

## 9. Retrieval flow

1. Client requests `contentUrl` with session cookie (`AuthenticatedImage` fetches blob).
2. Server: `requireCompanyOrCustomerRead`.
3. Customer may only read photos on `visibility=customer` progress.
4. Legacy `internal://` → `MEDIA_UNAVAILABLE` / `fileAvailable: false` (no fabricated image).

## 10. Authorization model

Preserves C13:

- Company: authenticated + active org membership / project access
- Customer: authenticated + **active** `project_customers` link
- Invited customer: denied (404)
- Unrelated company/customer: denied (404)
- Cross-project photo id tampering: denied (404)
- No trust of client org id / role / localStorage for media access

## 11. Customer visibility

- Customer Progress + Photos use customer-view published feed with real `contentUrl` when available.
- Company Progress/Photos show actual images for their authorized project progress (company Photos uses full daily-progress list).

## 12. Daily Progress integration

Photos remain children of `daily_progress`. Stage, date, uploader, and publish visibility are inherited from that entry. No parallel progress system.

## 13. Internal:// handling

- Existing `internal://` rows are **not deleted**.
- `fileAvailable: false`, `contentUrl: null`, UI label “Historical photo unavailable”.
- New uploads never mint `internal://`.

## 14. Files changed

**Server**

- `server/storage/objectStorage.ts`, `localObjectStorage.ts`, `s3ObjectStorage.ts`, `imageValidation.ts` (new)
- `server/config/env.ts`
- `server/db/schema.ts` (comments)
- `server/projects/dailyProgress.{routes,service,types,schemas,test}.ts`
- `server/projects/customerView.types.ts`
- `server/projects/constructionMedia.test.ts` (new)

**Frontend**

- `src/data/apiClient.ts`, `dailyProgressApi.ts`, `dailyProgressState.ts`, `customerViewApi.ts`
- `src/shared/components/AuthenticatedImage.tsx` (new)
- `src/partner/projects/CreateDailyProgressScreen.tsx`
- `src/user/projects/ProjectProgressScreen.tsx`, `ProjectPhotosScreen.tsx`

**Config / docs**

- `.env.example`, `.gitignore` (`.media/`)
- `package.json` / `pnpm-lock.yaml` (`@fastify/multipart`, `@aws-sdk/client-s3`)
- `HOUZEIFY_C15_IMPLEMENTATION_REPORT.md` (this file)

## 15. Dependencies added

- `@fastify/multipart` — multipart upload parsing
- `@aws-sdk/client-s3` — optional S3-compatible storage

## 16. Tests added

- `server/projects/constructionMedia.test.ts` — customer invite denial, active customer retrieve, cross-org/customer denial, cross-project tampering, outsider upload denial, unpublished denial
- `dailyProgress.test.ts` — multipart persistence, content bytes, non-image rejection, oversized rejection

## 17. Test results

Focused C15 suites:

```
constructionMedia.test.ts + dailyProgress.test.ts
ℹ tests 25
ℹ pass 25
ℹ fail 0
```

Full backend suite:

```
pnpm run server:test
ℹ tests 429
ℹ pass 429
ℹ fail 0
ℹ duration_ms ~522s
```

## 18. Build results

| Check | Result |
|---|---|
| Frontend TypeScript (`tsc --noEmit`) | Pass |
| Server TypeScript (`server:typecheck`) | Pass |
| Server build (`server:build`) | Pass |
| Vite build (`build`) | Pass |

## 19. Responsive validation

Photo grids use `grid-cols-2 sm:grid-cols-3`, touch targets ≥44px on remove/share/close, focus-visible outlines preserved. No new navigation; C14 shell (`Sidebar` / `ProjectSubNav`) unchanged.

## 20. Security validation

- Secrets only via env
- Private objects; bytes only through authenticated API
- No permanent public bucket URLs returned by default
- Server-side MIME/signature/size validation
- ACL tests cover company/customer/invited/cross-project/cross-org

## 21–25. Regression notes (C10–C14)

- **C10** Workspace hub untouched; create-daily-progress still reachable from Progress/Workspace.
- **C11** Project Overview / restored legacy fields not reintroduced.
- **C12** Workforce Team, Messages, `resolveProjectStatus` untouched.
- **C13** Active membership + customer active status + house-requirements ACL preserved; media uses same helpers.
- **C14** Responsive nav patterns preserved; photo UI follows existing touch/focus conventions.

## 26. C15B deferred work

- Video / voice / audio
- Time-lapse generation
- AI analysis / classification
- Advanced search, offline queue, resumable uploads
- Media editing, CDN, thumbnail pipeline
- Bulk migration of legacy `internal://` blobs (none exist on disk)

## 27. Known limitations

- Default local storage is single-node; multi-instance production should set `STORAGE_PROVIDER=s3` + bucket credentials.
- No automatic image resizing/thumbnails (original served for display).
- Project Documents remain metadata-only (`internal://`); out of C15A photo scope.
- Optional S3 bucket/CORS/IAM must be configured in deployment (not automatable from the repo alone).

## 28. Definition of Done

| Criterion | Status |
|---|---|
| Real construction image upload | Done |
| Persistent object storage | Done (local + optional S3) |
| Media record persisted | Done |
| Linked to project + Daily Progress | Done |
| Uploader/date/stage metadata | Done (via progress + photo row) |
| Server file + auth validation | Done |
| Customer / invited / cross-project / cross-org ACL | Done + tested |
| Secure retrieval; company + customer see real image | Done |
| No fabricated demo images | Done |
| `internal://` preserved | Done |
| C10–C14 intact (by scoped changes) | Done |
| New C15 tests pass | Done (25/25 focused; 429/429 full suite) |
| Frontend/server TS + builds | Done |

---

## Review readiness

**C15A is ready for review** on branch `cursor/c15-construction-evidence`. All server tests pass (429/429). No commit or merge was created automatically. Production deploys that need multi-node durability must configure S3-compatible env vars.
