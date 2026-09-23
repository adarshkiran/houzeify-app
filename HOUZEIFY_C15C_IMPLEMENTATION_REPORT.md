# Houzeify C15C Implementation Report — Construction Video Persistence

**Branch:** `cursor/c15c-construction-video`  
**Base:** `main` @ `409f92c` (Merge C15A + C15B)  
**Scope:** Short construction videos on the existing C15A media model + C15B Daily Progress workflow

---

## 1. Implementation Summary

C15C extends Construction Evidence so authorized company users can attach **real short site videos** to Daily Progress, and authorized customers can play videos that were shared via the existing progress visibility model.

- Same `daily_progress_photos` table — MIME type distinguishes photo vs video (`mediaKind` derived).
- Same multipart upload route and authenticated content GET.
- Same C15A object storage (`local` / `s3`) and orphan-cleanup on DB insert failure.
- Create Daily Progress: **Add Photos** / **Add Video**, native `<video>` preview before upload, truthful Selected / Uploading / Uploaded / Failed / Retry states.
- Progress + Photos: VIDEO badge tiles; lightbox uses `AuthenticatedVideo` (cookieed fetch → blob URL).
- No new media table, provider, navigation, AI, time-lapse, or resumable upload system.

---

## 2. Architecture

C15C is an extension of one Construction Evidence system:

```text
Daily Progress
      ↓
Add Photos / Add Video
      ↓
POST …/daily-progress/:id/photos (multipart)
      ↓
validateConstructionEvidenceBuffer (photo | video)
      ↓
ObjectStorage.putObject → daily_progress_photos row
      ↓
GET …/daily-progress-photos/:id/content (ACL)
      ↓
Progress / Photos (AuthenticatedImage | AuthenticatedVideo)
```

Customer visibility remains progress-level: `visibility: internal | customer` (C15B). Videos are not auto-shared.

---

## 3. Storage

Reuses C15A `getObjectStorage(env)`:

| Provider | Env | Behavior |
|---|---|---|
| `local` | `STORAGE_PROVIDER=local`, `MEDIA_LOCAL_ROOT` | Files under local root; refs `local://…` |
| `s3` | `STORAGE_PROVIDER=s3`, `S3_*` | S3-compatible put/get/delete; refs `s3://…` |

Video object keys use a `video/` segment under the existing daily-progress path:

```text
media/<org>/<projectId>/daily-progress/<progressId>/video/<id>.<ext>
```

Photos continue to use `photo/`. No new environment variables.

---

## 4. Media Model

Existing `daily_progress_photos` rows represent both kinds:

| Field | Video use |
|---|---|
| `mime_type` | `video/mp4`, `video/webm`, `video/quicktime` |
| `storage_ref` | `local://…` or `s3://…` |
| `daily_progress_id` | FK to progress (cascade on progress delete — unchanged C15B behavior) |
| API `mediaKind` | Derived: `mime.startsWith('video/') ? 'video' : 'photo'` |

No `construction_videos` / competing table.

---

## 5. API Changes

**No new endpoints.** Extended behavior on existing routes:

| Route | Change |
|---|---|
| `POST …/daily-progress/:progressId/photos` | Accepts photo **or** video multipart; multipart `fileSize` raised to **100 MB** (video max); still one file per request |
| `GET …/daily-progress-photos/:photoId/content` | Serves video bytes with correct `Content-Type` under same ACL |
| List/serialize progress & customer view | Adds `mediaKind` on each evidence item |

Authorization unchanged from C15A/C15B (company project access; customer only for customer-visible progress evidence).

---

## 6. UI Changes

### Company — Create Daily Progress

- Evidence section: **Add Photos** + **Add Video**
- Video: file picker → client size/type check → `<video>` preview (or clear fallback) → remove
- Submit still creates progress **once**, then uploads pending evidence; retries never duplicate progress
- Partial failures keep failed items + Retry

### Customer / company Progress & Photos

- Mixed photo/video grids; VIDEO label on tiles (no byte prefetch for video thumbs)
- Lightbox: `AuthenticatedVideo` with native controls (play/pause/seek/volume/fullscreen where supported)
- Metadata: date, stage, progress title (same as C15B photos)

---

## 7. Validation

| Rule | Value |
|---|---|
| Photo max | **15 MB** (unchanged) |
| Video max | **100 MB** |
| Video duration | **Not enforced** (no server-side duration probe in C15C) |
| Video MIME | `video/mp4`, `video/webm`, `video/quicktime` |
| Detection | Magic bytes: ISO BMFF `ftyp` / WebM EBML; claimed MIME cross-checked |
| Multipart limit | `MAX_CONSTRUCTION_EVIDENCE_BYTES` = 100 MB |

**Architectural note:** Upload still uses in-memory `file.toBuffer()`. 100 MB is the chosen safe ceiling for this multipart path without introducing resumable uploads. Deployments should ensure reverse proxies allow ≥100 MB request bodies for this route.

---

## 8. Security

| Scenario | Result |
|---|---|
| Active company member upload/retrieve | ALLOW |
| Inactive/suspended member | DENY (existing membership gate) |
| Customer upload | DENY (404) |
| Unauthenticated upload/retrieve | DENY |
| Active customer + customer-visible video | ALLOW |
| Active customer + internal-only progress | DENY / hidden |
| Invited (not accepted) customer | DENY |
| Cross-project / cross-org | DENY |
| Raw `local://` / `s3://` / storage credentials to client | Never exposed; only authenticated content URLs |

---

## 9. Tests

```text
Server tests (constructionMedia + dailyProgress + mediaValidation): 33/33 pass
  constructionMedia + dailyProgress: 29/29
  mediaValidation unit: 4/4
Frontend TypeScript: PASS
Server TypeScript: PASS
Server build: PASS
Vite build: PASS
```

C15A/C15B regressions covered in the same suites (photo upload/retrieve, customer ACL, oversized photo, linkage, unauthenticated deny).

---

## 10. Browser

```text
Browser validation: Not available
```

Automated API/security tests cover upload, persistence, and ACL. Manual UI playthrough deferred.

---

## 11. Deployment

**No new environment variables.**

Reuse:

- `STORAGE_PROVIDER` (`local` | `s3`)
- `MEDIA_LOCAL_ROOT` (local)
- `S3_*` (s3)

Ensure proxy/body limits allow **100 MB** multipart uploads for Daily Progress evidence.

---

## 12. Database Changes

**None** (schema comment only: photos + short videos). Same FK cascade: deleting Daily Progress deletes associated evidence **metadata** rows; object reaping remains a future policy (documented C15B limitation, unchanged for video).

---

## 13. Known Limitations

- Video duration is not validated server-side.
- Full video buffers load into memory during upload (100 MB cap).
- Progress delete still cascades evidence rows without deleting storage objects (same as C15B photos).
- QuickTime playback depends on browser support; unsupported cases show unavailable / fallback UI.
- Gallery tiles for video show a VIDEO badge rather than a decoded frame thumbnail (avoids prefetching large blobs).
- Browser E2E not run in this environment.

---

## 14. Future Work (out of scope)

- Time-lapse compilation, AI analysis, live streaming, trimming/editing
- Resumable / multipart chunked uploads for larger files
- Evidence retention policy independent of Daily Progress deletion
- Server-side duration / codec probing

---

## 15. Acceptance Checklist

- [x] C15A storage reused  
- [x] C15B Daily Progress workflow reused  
- [x] Video select / validate / preview / truthful upload states  
- [x] Persist object + DB + project + Daily Progress link  
- [x] Customer visibility via C15B sharing  
- [x] Company / customer / invited / cross-project / cross-org / unauth ACL  
- [x] No public storage URLs; photos + `internal://` intact  
- [x] No duplicate media system / no new nav  
- [x] Tests + builds pass  
- [x] Report present; branch unmerged pending review  
