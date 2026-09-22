# HOUZEIFY — C13 Company / Customer Authorization — AUDIT

**Type:** Audit only. No source, routes, schema, APIs, UI, commits, or pushes were changed.  
**Baseline:** `main` @ `d1b62622ae26b7cc18dd0f06a7fb77a55c65a526` (C12 merge).  
**C12 implementation:** `daf99d9`.  
**Architecture preserved:** Table C server role/membership; C10/C11 Workspace/Overview/audience isolation; C12 status/workforce migrations; BD bid stack PROTECT.

Labels for endpoints: **SECURE** | **GAP** | **PARTIAL** | **UNKNOWN**  
Severity: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW** | **INFORMATIONAL**  
Change class: **KEEP** | **MODIFY** | **MIGRATE** | **REMOVE** | **DEFER**

---

## 1. Executive Summary

Company and customer project authorization is **server-authoritative** and generally **correct** at HEAD `d1b6262`.

- Session identity comes from the HTTP-only `houzeify_session` cookie → `request.user.id`. Persona `homeowner`/`professional` is **UX only** and is not trusted by project APIs.
- Company project access requires project creator **or** `organization_members.status = 'active'` for that project’s organization (`getProjectForAccess`).
- Customer project data access requires `project_customers.status = 'active'` (`resolveProjectAccess`). **Invited** customers cannot call customer-view APIs (404).
- Cross-company and cross-customer probes with a known project UUID consistently return **404**, not 403.
- Customer-view responses omit owner/org IDs, storage refs, emails, and unpublished progress/documents.
- **No CRITICAL or HIGH authorization bypasses** were found on the audited API surface.

The main product inconsistency (not a cross-tenant leak): **house requirements** still authorize by **project creator only**, not org membership — classified **PARTIAL**.

Frontend `canViewProject` / ambient `project_id` are **not** security boundaries; unauthorized API calls fail server-side.

**C13 implementation can safely begin** as a focused hardening/consistency pass (house-requirements org alignment, optional shared-helper consolidation, UX auth-gate polish) — **not** as a redesign of Table C / C10–C12 architecture.

---

## 2. Current Architecture

```
Browser
  └─ credentials: 'include'
       └─ Cookie: houzeify_session (httpOnly)
            └─ requireAuth → request.user { id, … }
                 ├─ Company path: getProjectForAccess / requireProjectMutation
                 │     ownerId == userId  OR  active org membership on project.organizationId
                 ├─ Customer path: resolveProjectAccess
                 │     active project_customers row for (projectId, userId)
                 └─ Customer-safe reads: customer-view serializers (published fields only)
```

Frontend parallel (non-authoritative):

```
projectData.role / resolveUserRole / sessionStorage persona
  + useProjectAudience (which client list contains project id)
  + canViewProject (homeowner|professional)
       → UX routing / empty states only
```

---

## 3. Authentication → Identity → Authorization Flow

| Step | Mechanism | Authoritative? | Evidence |
|------|-----------|----------------|----------|
| Login | OTP → set `houzeify_session` | Server | `server/auth/session.ts`, auth routes |
| Who am I? | `GET /auth/me` + in-memory `authState` | Server identity; client cache | `authState.tsx`, `session.ts` |
| Persona | `resolveUserRole(role, intent, professionalType)` | **No** (UI) | `primaryIntent.ts:76-87`, `App.tsx` |
| Organization | `useOrganizations` / `listOrganizationsForUser` | Server lists active memberships | `organization.service.ts` |
| Company project | `getProjectForAccess` | **Yes** | `project.service.ts:123-138` |
| Customer project | `project_customers.status='active'` | **Yes** | `projectAccess.ts:31-50` |

`requireAuth` explicitly performs **identity only** — no role check (`session.ts` comments). Project/org ACL is applied in service helpers.

---

## 4. Company Access Model

**Who can read a company project (GET /projects/:id and company-scoped resources)?**

1. The project’s `ownerId` (creator), **or**
2. Any **active** member of `project.organizationId` (any org role, including viewer).

**Who can mutate at project level** (patch project, invite customer, BOQ mutate, visibility changes, etc.)?

1. Creator, **or**
2. Active org member with role in `ORGANIZATION_MUTATION_ROLES` (`owner`, `admin`).

**Inactive / suspended / removed org members:** `findMembership` and joins require `status: 'active'` → **no access** (tests cover this).

**Client-supplied `organizationId`:** verified via `findMembership` before create/list; non-member → 404. Patch schema does not allow reassignment of `organizationId`.

---

## 5. Customer Access Model

**Relationship:** `project_customers` row linking `userId` ↔ `projectId` with status `invited` | `active` | (soft-removed).

| Status | List `?as=customer` | Customer-view APIs | Company APIs |
|--------|---------------------|--------------------|--------------|
| invited | Yes (redacted fields) | **No** (404) | **No** |
| active | Yes (fuller shared fields) | **Yes** (published data) | **No** |
| none / other customer | No | **No** | **No** |

Accept: `POST /projects/:projectId/customer/accept` only for the invitee’s own `invited` row → sets `active`.

UI “Project not available yet” (C11) for invited Overview is consistent with server denial of customer-view until accept — **server boundary verified**, not UI-only.

---

## 6. Organization Membership Audit

| Check | Result | Evidence |
|-------|--------|----------|
| Active-only access lookup | **Yes** | `findMembership` filters `status:'active'` |
| Inactive member → company projects | **Denied** | Join in `getProjectForAccess`; tests |
| Org invite pending flow | **Unused** — adds go straight to `active` | `organization.service.ts` comments ~256-260 |
| Mutator roles | `owner`, `admin` | `ORGANIZATION_MUTATION_ROLES` |
| Bypass of active check | **Not found** on project/org access paths | Same filter in project joins / projectAccess |

**KEEP** active-membership enforcement. Org “invited” status is dead product surface — **INFORMATIONAL / DEFER** cleanup, not a tenant leak.

---

## 7. Project Authorization Audit

| Source of project id | Trusted alone? | Server behavior |
|----------------------|----------------|-----------------|
| URL / path `:projectId` | **No** | Access helpers always take `request.user.id` |
| Query `organizationId` | **No** | Membership required |
| Body `organizationId` on create | **No** | Membership required |
| Ambient `projectData` / navigate | **No** | Shell only; APIs 404 if unauthorized |
| localStorage project id | **Not used** for auth | — |

Possessing a UUID does **not** grant access.

---

## 8. Customer Invitation Audit

| Stage | Endpoint / storage | Access |
|-------|-------------------|--------|
| Create invite | `PUT /:projectId/customer` (company mutator) | Creates/updates link `status=invited` |
| Pending | listed via `GET /projects?as=customer` | Redacted project summary; **no** customer-view |
| Accept | `POST /:projectId/customer/accept` | Invitee only; → `active` |
| Active | customer-view + list | Published customer-safe data |
| Remove | `DELETE /:projectId/customer` | Soft-remove; access ends |

Rejected/expired invitation statuses: no separate expired workflow found — removal/non-active simply fails access checks. **KEEP** current model; optional expiry is **DEFER** product work.

---

## 9. Customer Data Isolation Audit

`getCustomerView` / customer-view serializers:

| Included | Excluded (evidence) |
|----------|---------------------|
| name, location, propertyType, stage, status, timelines | `ownerId`, `organizationId` |
| organizationName | Internal member emails / userIds on workforce |
| latest published progress summary | Internal-only progress (`visibility != customer`) |
| customer documents (no `storageRef`) | BOQ, unpaid/internal docs |
| workforce `{ displayName, role }` | Bid / payment / agreement data |

Company users **may** also call customer-view (same helper) — they already have fuller company APIs; this is not a customer→company leak.

**No evidence** of bid/payment/contractor marketplace fields in customer-view responses.

---

## 10. Company-Only Endpoint Audit

Company-only (customers get 404): tasks, issues, workforce CRUD, documents company list/mutate, daily-progress company API, BOQ, project customer admin GET/PUT/DELETE, GET/PATCH project (full record), org members.

**Server enforced: YES** via `getProjectForAccess` / mutation helpers. Covered by `customerView.test.ts` denial cases for BOQ and related.

Frontend Team/Messages have no separate “team API” — Team reads workforce; Messages is empty-state only (C12).

---

## 11. Customer-Only Endpoint Audit

Customer-oriented:

- `GET /projects?as=customer`
- `POST /:projectId/customer/accept`
- `GET /:projectId/customer-view/*`

Company users can read customer-view if they have company access (intentional preview of shared surface). They cannot “accept” another user’s invite. They cannot list another customer’s projects via `as=customer` (scoped to `request.user.id`).

**Inappropriate company manipulation of customer-only resources:** not found beyond legitimate company admin of the invite row.

---

## 12. Role Manipulation Audit

| Pattern | Security impact |
|---------|-----------------|
| `sessionStorage` persona fields | UX only — not sent as project auth |
| `resolveUserRole` / `projectData.role` | UX only |
| `?role=` URL | **Not found** |
| Dev `?screen=` | Bypasses **client** guards only when enabled |
| Client `organizationId` | Re-verified server-side |
| Client assignee/userId on tasks | `isAuthorizedProjectParticipant` |

**Do not classify UX persona as a vulnerability.** Server does not trust it for project ACL.

`App.tsx` does not hard-gate all screens on `auth.status` — unauthenticated users may see shells until APIs 401. **LOW / INFORMATIONAL** UX gap; server still authoritative.

---

## 13. Project ID Tampering Audit

All audited `/:projectId/...` routes use `requireAuth` + project access helpers. Unauthorized UUID → **404**.

Resources checked: progress, tasks, issues, workforce, documents, BOQ, customer, customer-view, requirements (owner-only), project GET/PATCH.

**No GAP** for UUID tampering on these endpoints.

---

## 14. Organization ID Tampering Audit

| API | Trust client org id? |
|-----|----------------------|
| `GET /projects?organizationId=` | No — membership |
| `POST /projects` with `organizationId` | No — membership |
| `GET/PATCH /organizations/:id` | No — membership |
| Member mutations | Actor must be mutator |

**SECURE.**

---

## 15. Customer ID Tampering Audit

| API | Check |
|-----|-------|
| Accept invite | Matches authenticated user + invited row |
| List customer projects | `userId = request.user.id` |
| Customer-view | Active link for authenticated user |
| Task assignee | Must be authorized project participant |

**SECURE** for audited paths. No endpoint found that accepts arbitrary `customerId` to read another customer’s project without checks.

---

## 16. Authorization Matrix

| Resource / Operation | Company Active | Company Inactive | Customer Active | Customer Invited | Unrelated | Server Enforced? | Evidence |
|----------------------|----------------|------------------|-----------------|------------------|-----------|------------------|----------|
| Project GET | YES | NO | NO | NO | NO | YES | `getProjectForAccess` |
| Project PATCH | Creator/admin | NO | NO | NO | NO | YES | `updateProject` |
| Overview (company APIs) | YES | NO | via CV | NO | NO | YES | Overview uses CV / project APIs |
| Overview (customer-view) | YES* | NO | YES | NO | NO | YES | `requireCompanyOrCustomerRead` |
| Workspace | YES | NO | NO† | NO | NO | YES | Company APIs |
| Progress (company daily-progress) | YES | NO | NO | NO | NO | YES | dailyProgress service |
| Progress (customer published) | YES* | NO | YES | NO | NO | YES | customer-view/progress |
| Daily Progress mutate | Participant rules | NO | NO | NO | NO | YES | |
| Tasks / Issues | YES | NO | NO | NO | NO | YES | |
| Workforce | YES | NO | NO (company API) | NO | NO | YES | CV workforce for active customer |
| Team (UI → workforce) | YES | NO | YES (CV) | NO | NO | YES | C12 |
| Messages | N/A (no API) | — | — | — | — | N/A | Client empty state |
| Documents (company) | YES | NO | NO | NO | NO | YES | |
| Documents (customer published) | YES* | NO | YES | NO | NO | YES | |
| BOQ | YES | NO | NO | NO | NO | YES | |
| Customer invite admin | Mutator | NO | NO | NO | NO | YES | |
| Reports | N/A (no API) | — | — | — | — | UNKNOWN | Coming Soon / no backend |
| Live Site | N/A (no API) | — | — | — | — | UNKNOWN | Coming Soon / no backend |
| Project Settings | PATCH rules | NO | NO | NO | NO | YES | |
| Organization Members | Active member list; mutator writes | NO | NO | NO | NO | YES | |
| Customer View | YES* | NO | YES | NO | NO | YES | |
| House Requirements | Creator only | NO | NO | NO | NO | **PARTIAL** | Owner ≠ org member |

\*Company active members can call customer-view.  
†Customer Workspace is not the company workspace API surface.

---

## 17. Endpoint Inventory

### Auth / profiles (context)

| Endpoint | Method | Audience | Authz | Class |
|----------|--------|----------|-------|-------|
| `/auth/me` | GET | Authenticated | Session | SECURE |
| `/auth/logout` | POST | Any | Session clear | SECURE |
| Customer/Partner profile CRUD | GET/POST/PATCH | Self | `request.user.id` | SECURE |

### Organizations (8) — all **SECURE**

`GET/POST /organizations`, `GET/PATCH /organizations/:id`, members list/add/patch/delete — active membership + mutator roles as documented in §6.

### Projects core — **SECURE**

| Endpoint | Method | Helper | Class |
|----------|--------|--------|-------|
| `/projects` | GET | owner list / org list / `as=customer` | SECURE |
| `/projects` | POST | membership if org | SECURE |
| `/projects/:id` | GET | `getProjectForAccess` | SECURE |
| `/projects/:id` | PATCH | creator or org mutator | SECURE |

### Project customer — **SECURE**

PUT/GET/DELETE `/:id/customer`, POST `/:id/customer/accept`.

### Customer-view (5) — **SECURE**

`customer-view`, `…/progress`, `…/documents`, `…/workforce`, `…/timeline`.

### Company operations — **SECURE**

Documents (4), Tasks (4), Issues (4), Workforce (4), Daily progress (5), BOQ (~7).

### House requirements (2) — **PARTIAL**

`GET/PUT /:id/requirements` — `requireOwnedProject` (creator only).

### No backend (product Coming Soon / client-only)

Live Site, Reports, human Messages, dedicated Team API — **UNKNOWN** as “endpoint class” (no attack surface beyond existing APIs).

**Counts (project/org/customer-view/company ops + house req):**

| Class | Count |
|-------|------:|
| SECURE | **54** |
| GAP | **0** |
| PARTIAL | **2** (house requirements GET+PUT) |
| UNKNOWN | **0** on implemented APIs; **4** product areas with no API (Messages/Live Site/Reports/Team-API) noted separately |

---

## 18. Frontend vs Server Authorization

| Guard | Type | Backed by server? |
|-------|------|-------------------|
| `canViewProject` | UX | No |
| `resolveUserRole` / sessionStorage | UX | No |
| `useProjectAudience` | UX routing to correct API | Server still enforces |
| PartnerNav / Sidebar hiding | UX | No |
| `requireAuth` + access helpers | Security | **Yes** |

Missing frontend auth gate ≠ vulnerability when APIs return 401/404.

---

## 19. Business Development Authorization

BD bids/opportunities/invitations remain **in-memory client stores** (`bids.ts`, etc.) — **separate** from Module 03+ project/org ACL.

- Not used by C12-migrated Team/Messages/Progress/status.
- BD screens use persona UX; no session-backed project ACL for marketplace bids.
- **PROTECT** — do not redesign in C13.
- **INFORMATIONAL:** BD is not server-authorized like construction projects; treat as product/demo boundary, not Table C regression.

---

## 20. C12 Regression Check

| Check | Status |
|-------|--------|
| `ChooseRoleScreen` deleted | Pass |
| `UpdateProgressScreen` deleted | Pass |
| `projectProgress.ts` deleted | Pass |
| Team uses workforce / customer-view workforce | Pass |
| Messages has no `getAwardedBid` | Pass |
| Progress uses `Project.status` | Pass |
| `resolveProjectStatus` no bids/agreements/payments | Pass |
| Overview / Workspace untouched by C13 audit | N/A (audit-only) |

---

## 21. Security Findings

| ID | Severity | Finding | Notes |
|----|----------|---------|-------|
| F01 | — | No CRITICAL findings | |
| F02 | — | No HIGH findings | Cross-tenant UUID access blocked |
| F03 | MEDIUM | House requirements creator-only vs org access elsewhere | Not a stranger leak; blocks legitimate org admins; **PARTIAL** |
| F04 | LOW | App does not globally gate screens on `auth.status` | UX; APIs still 401 |
| F05 | LOW | `canViewProject` almost always true for onboarded personas | UX only |
| F06 | INFORMATIONAL | Org membership `invited` unused (immediate active) | Product simplification |
| F07 | INFORMATIONAL | Broad create rights for any active org role on some resources | By design; mutate-of-others tighter |
| F08 | INFORMATIONAL | Shared `projectAccess.ts` not yet adopted by every service file | Local copies still call same `getProjectForAccess` / active filter — consistency risk if they diverge later |
| F09 | INFORMATIONAL | BD in-memory auth model | Separate from construction ACL |

---

## 22. KEEP

- Table C session + active membership model  
- `getProjectForAccess` / `resolveProjectAccess` / mutation roles  
- Customer invite → accept → active lifecycle  
- Customer-view field redaction  
- 404 non-enumeration  
- C10/C11 Overview/Workspace audience patterns  
- C12 Team/Messages/Progress/status migrations  
- BD bid modules (PROTECT)  
- Hozie  

---

## 23. MODIFY (recommended for C13 implementation — not done here)

1. Align **house requirements** authorization with `getProjectForAccess` / project mutation rules (org-aware), without weakening stranger denial.  
2. Optionally wire remaining services onto shared `projectAccess.ts` helpers to prevent future drift (F08).  
3. Optional UX: soft-gate authenticated routes on `auth.status` (F04) — **not** a substitute for server checks.

---

## 24. MIGRATE

None required for security correctness. House-requirements org alignment is better labeled **MODIFY** than a data-model migrate.

---

## 25. REMOVE

None. Do not remove BD, HS implementation, or Table C helpers.

---

## 26. DEFER

- Org membership pending/`invited` product flow  
- Customer invitation expiry  
- Server-backed BD authorization  
- Backend for Live Site / Reports / human Messages  
- Mass HIDE cleanup (C12 deferred)  
- Global `user-demo-001` cleanup  

---

## 27. Protected Areas

- Auth session cookie model  
- Organization membership active filter  
- Project access helpers  
- Customer-view serializers  
- BD bid architecture  
- Hozie  
- Project Overview / Workspace  
- constructionNav / ProjectSubNav / PartnerNavRail (unless a MODIFY explicitly requires a narrow change)

---

## 28. Recommended C13 Implementation Sequence

1. Confirm this audit on `main` @ `d1b6262`.  
2. **MODIFY** house-requirements auth to org-aware access (with tests for: creator, active org admin, inactive member, customer, stranger).  
3. Optionally consolidate services onto `projectAccess.ts` (no behavior change).  
4. Optional frontend auth soft-gate (UX).  
5. Add/extend authorization regression tests if gaps appear during MODIFY.  
6. Do **not** redesign customer invite, BD, or Overview/Workspace.

---

## 29. Validation / Test Plan (for future C13 implementation)

1. Existing suites: `projectAccess`, `customerView`, `organization`, workforce/tasks/issues/documents/boq/daily-progress.  
2. New/extended: house-requirements org member access + denial cases.  
3. Manual: Company A cannot GET Company B project UUID; Customer A cannot customer-view Customer B; invited cannot customer-view until accept; inactive org member denied.  
4. Confirm C12 screens still free of bid status bridges.  
5. Confirm BD screens still load (in-memory).

---

## Closing Counts

| Metric | Value |
|--------|------:|
| HEAD | `d1b62622ae26b7cc18dd0f06a7fb77a55c65a526` |
| SECURE endpoints (implemented project/org/customer ops) | **54** |
| GAP | **0** |
| PARTIAL | **2** |
| UNKNOWN (no API product areas) | **4** noted (not endpoint gaps) |
| CRITICAL findings | **0** |
| HIGH | **0** |
| MEDIUM | **1** (F03) |
| LOW | **2** (F04, F05) |
| INFORMATIONAL | **4** (F06–F09) |
| KEEP | **12** (areas) |
| MODIFY | **3** |
| MIGRATE | **0** |
| REMOVE | **0** |
| DEFER | **6** |
| C13 implementation can safely begin? | **Yes** |

---

*End of audit. Only this document was added; no existing source files were modified.*
