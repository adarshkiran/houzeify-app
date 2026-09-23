# Houzeify C15D Implementation Report — Media Lifecycle & Storage Cleanup

**Branch:** `cursor/c15d-media-lifecycle`  
**Base:** `main` @ `a120100`  
**Scope:** Safe DB ↔ storage lifecycle for construction evidence (photos + videos)

---

## 1. Implementation Summary

C15D closes the C15B/C15C gap where Daily Progress deletion cascaded media **rows** but left local/S3 objects behind.

- Reuses C15A `ObjectStorage` (`put` / `get` / `delete`) for both photo and video evidence.
- Granular evidence removal: `DELETE …/daily-progress-photos/:photoId` (authorized company mutation only).
- Daily Progress deletion loads trusted `storageRef`s **before** FK cascade, deletes storage objects, then deletes the progress row.
- Upload rollback cleanup logs failures instead of swallowing them silently.
- Company Progress / Photos lightbox: deliberate **Remove evidence** confirmation (no bulk delete).
- Historical orphan scan / “delete everything not in DB”: **deferred** (documented).

---

## 2. Lifecycle Model

**Chosen: Model A — hard delete with storage-first cleanup**

```text
Authorize
   ↓
Load media row (trusted storageRef from DB)
   ↓
Delete storage object (idempotent if already absent)
   ↓
Delete DB media row (or Daily Progress → cascade)
```

Rationale:

- No soft-delete column / job runner exists today; introducing one would expand scope.
- Storage and Postgres are not one transaction — storage is deleted **before** DB so a failed storage delete keeps the DB row (retryable). Missing objects after a trusted ref are treated as already cleaned.
- `internal://` refs skip physical delete (legacy placeholders).

---

## 3. Storage Changes

| Provider | Change |
|---|---|
| Interface | `deleteObject` returns `'deleted' \| 'already_absent'`; real errors throw |
| Local | Stronger path safety (absolute keys, `..`, null bytes, root escape); ENOENT → already_absent |
| S3 | Delete uses server bucket/credentials only; NoSuchKey → already_absent; other errors throw |
| Helper | `deleteTrustedStorageRef(env, storageRef)` — never accepts client keys |

---

## 4. Database Changes

**None** (schema comment only). Same `daily_progress_photos` FK cascade after storage cleanup.

---

## 5. API Changes

| Route | Behavior |
|---|---|
| `DELETE /api/v1/projects/:projectId/daily-progress-photos/:photoId` | **New** — remove one evidence item + storage |
| `DELETE …/daily-progress/:progressId` | **Extended** — cleanup associated storage objects before DB delete |

No client-supplied `objectKey` / path / bucket.

---

## 6. Authorization

Same mutation gate as photo upload (creator or active org mutation role):

| Actor | Result |
|---|---|
| Authorized company (mutation) | ALLOW |
| Customer | DENY (404) |
| Invited customer | DENY |
| Unauthenticated | DENY (401) |
| Cross-project | DENY (404) |
| Cross-org | DENY (404) |

Customer visibility model unchanged.

---

## 7. Failure Handling

| Failure | Behavior |
|---|---|
| Storage delete fails | DB row kept; `STORAGE_DELETE_FAILED` (502); structured log; retryable |
| Storage OK, DB already gone | Treated as success (idempotent) |
| Upload put OK, DB insert fails | Attempt `deleteObject`; log if cleanup fails |
| Progress delete mid-cleanup failure | Progress **not** deleted; partial storage deletes are idempotent on retry |

---

## 8. Orphan Handling

| Capability | Status |
|---|---|
| Cleanup on media DELETE | **Implemented** |
| Cleanup on Daily Progress DELETE | **Implemented** |
| Cleanup on upload rollback | **Implemented** (with failure logging) |
| Historical orphan scan / bulk reconcile | **Deferred** — no unsafe “delete everything not in DB” |

---

## 9. Tests

```text
Focused server tests: 39/39 pass
  constructionMedia + dailyProgress + mediaLifecycle + mediaValidation
Frontend TypeScript: PASS
Server TypeScript: PASS
Server build: PASS
Vite build: PASS
```

---

## 10. Browser Validation

```text
Browser validation: Not available
```

---

## 11. Deployment

**No new environment variables.**

Ensure app process can delete under `MEDIA_LOCAL_ROOT` / S3 bucket with existing credentials.

---

## 12. Known Limitations

- Historical orphans created **before** C15D are not auto-scanned.
- No background retry queue — rely on API retry + structured logs.
- No dedicated audit table (structured `c15d-media-lifecycle` console logs only).
- C15C 100 MB `toBuffer()` upload model unchanged.
- Second DELETE of the same media id returns 404 (REST not-found), which is consistent and safe.
- Project-level cascade (deleting a whole project) still depends on DB cascades; C15D focused on Daily Progress + granular media paths.

---

## 13. Acceptance Checklist

- [x] C15A storage reused; one lifecycle for photo + video  
- [x] Authorized granular delete + Progress delete storage cleanup  
- [x] ACL: company / customer / invited / cross-project / cross-org / unauth  
- [x] Path-safe local delete; trusted S3 refs only  
- [x] Idempotent missing-object handling; failures not swallowed  
- [x] Upload rollback cleanup improved  
- [x] Orphan scan deferred (documented); no bulk delete UI  
- [x] Confirmation UI; `internal://` preserved  
- [x] Tests + builds pass; unmerged pending review  
