# HOUZEIFY — C13 Authorization Hardening — IMPLEMENTATION REPORT

**Branch:** `cursor/c13-auth-hardening`  
**Base:** `main` @ `d1b6262` (C12 merge)  
**Audit:** `HOUZEIFY_C13_AUTHORIZATION_AUDIT.md`  
**Scope:** Focused MODIFY only — house-requirements org-aware ACL. No redesign.

---

## 1. Summary

C13 aligns **house-requirements** authorization with the established Table C project ACL:

| Operation | Before (PARTIAL) | After (SECURE) |
|-----------|------------------|----------------|
| GET | Creator (`ownerId`) only | `requireProjectAccess` — creator **or** active org member |
| PUT | Creator only | Access + `requireProjectMutation` — creator **or** active org owner/admin |

Unauthorized callers (inactive member, other org, customer, stranger, unauthenticated) still receive **404** / **401**. No schema migration. No UI changes. BD / C10 / C11 / C12 preserved.

---

## 2. Findings addressed

| Audit item | Action |
|------------|--------|
| PARTIAL ×2 (house-requirements GET + PUT) | **Fixed** |
| MEDIUM F03 (creator-only vs org-aware) | **Fixed** |
| MODIFY #1 (align house-requirements) | **Done** |
| MODIFY #2 (optional full projectAccess consolidation) | **Partial** — done for house-requirements only; other services already use `getProjectForAccess` |
| MODIFY #3 (optional App auth soft-gate) | **Deferred** (LOW / optional UX) |
| LOW F04 / F05 | **Deferred** (informational UX) |
| UNKNOWN no-API areas | **Deferred** |
| 6 DEFER items from audit | **Deferred** (unchanged) |

---

## 3. House-requirements authorization change

**Files:** `houseRequirements.service.ts`, `houseRequirements.routes.ts`

- Removed local `requireOwnedProject` (`projects.owner_id = caller`).
- GET → `requireProjectAccess(env, projectId, request.user.id)`.
- PUT → `requireProjectAccess` then `requireProjectMutation`.
- Renamed exports to `getHouseRequirementsForProject` / `putHouseRequirementsForProject`.
- Authorization derived only from authenticated session user + server relationships — never client `organizationId` / `ownerId` / `userId`.

Existing homeowner (no-org) creator access unchanged.

---

## 4. Partial findings addressed

Both PARTIAL endpoints were the house-requirements pair. Both now use the shared project access helpers and match documents/BOQ mutation posture (read: any active participant; write: creator or org mutator).

---

## 5. Low findings addressed / deferred

| Finding | Disposition |
|---------|-------------|
| F04 App not globally gating on `auth.status` | **DEFERRED** — optional UX; server remains authoritative |
| F05 Weak `canViewProject` UX guard | **DEFERRED** — not a server boundary |

No code changes for LOW findings.

---

## 6. Unknown areas deferred

Live Site, Reports, human Messages, dedicated Team API — **no endpoints invented**.

---

## 7. Security model preserved

- Active org membership required for company access  
- Invited customers still blocked from customer-view (untouched)  
- Cross-tenant UUID → 404  
- Customer-view serializers unchanged  
- Frontend persona still UX-only  
- BD bid stack untouched  

---

## 8. Files changed

| File | Change |
|------|--------|
| `server/projects/houseRequirements.service.ts` | Org-aware ACL via `projectAccess` |
| `server/projects/houseRequirements.routes.ts` | Use new service function names / comments |
| `server/projects/houseRequirements.test.ts` | Keep isolation suite; add C13 org-aware suite |
| `HOUZEIFY_C13_IMPLEMENTATION_REPORT.md` | This report |
| `HOUZEIFY_C13_AUTHORIZATION_AUDIT.md` | Present in worktree (audit artifact; not modified this pass) |

---

## 9. Tests added / updated

**Updated:** existing house-requirements isolation suite (still valid).

**Added:** `house requirements C13: org-aware access, inactive denied, cross-org denied`

- Active org admin: GET + PUT allowed (non-creator)  
- Active org viewer: GET allowed, PUT denied (404)  
- Suspended member: GET + PUT denied  
- Unrelated org user: denied  
- Customer: denied  
- UUID tampering: 404  
- Unauthenticated: still covered in first suite  

---

## 10. Test results

With `DATABASE_URL` loaded from the main repo env:

```
house requirements: … isolation — pass
house requirements C13: org-aware … — pass
tests 23, pass 23, fail 0, skipped 0
```

Full `server/**/*.test.ts` without DB in environment earlier: 88 pass / 0 fail / skipped DB suites (same as C12 baseline pattern).

Focused HR suite with DB: **23/23 pass**.

---

## 11. Build results

| Check | Result |
|-------|--------|
| Server `tsc --noEmit` | Pass |
| Frontend `tsc --noEmit` | Pass |
| Server `tsc` build | Pass |
| Vite build | Pass |

---

## 12. C10 / C11 regression status

- `ProjectWorkspaceScreen` / `ProjectOverviewScreen` / nav — **not modified**  
- Expected: unchanged  

---

## 13. C12 regression status

- No bids/agreements/payments reintroduced into 2.0 screens  
- Team / Messages / Progress / `resolveProjectStatus` — **not modified**  
- Dead C12 removals remain deleted  

---

## 14. BD regression status

- `bids.ts` / opportunities / invitations / BD screens — **not modified**  

---

## 15. Remaining C13 deferred items

1. Optional App `auth.status` soft-gate (LOW)  
2. Broader `projectAccess.ts` adoption across remaining local helper copies (optional; behavior already aligned)  
3. Org membership pending/`invited` product flow  
4. Customer invitation expiry  
5. Server-backed BD authorization  
6. Backends for Live Site / Reports / Messages  
7. Mass HIDE cleanup / `user-demo-001` sweep  

---

## 16. Recommended next step

1. Manual review of this branch  
2. Commit + merge C13 when approved (not done in this task)  
3. Do **not** start C14 until requested  

---

## Closing

| Question | Answer |
|----------|--------|
| Implementation status | **Complete** for approved C13 hardening scope |
| Ready for review? | **Yes** |
| Commit / merge? | **Not performed** (per instructions) |
| Branch | `cursor/c13-auth-hardening` |
| Base commit | `d1b6262` (uncommitted implementation changes) |
