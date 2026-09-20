# Module 08 — Customer Transparency: Complete Specification

**Status:** Inspection + architecture + UX + data/API + screen spec. **No production code. Not implemented.**
**Baseline:** `main` at `2b654b2` (Modules 01–07 merged). Local uncommitted design-system WIP is **not** part of this module.
**Depends on:** Module 03 (projects, `getProjectForAccess`), Module 04 (Daily Progress + photo metadata), Module 06 (Site Team), Module 07 (Documents metadata; BOQ internal), `customer_profiles` (12G), session auth (12E).
**Supersedes:** `docs/superpowers/specs/2026-09-21-module-08-customer-transparency-design.md` (shorter design-phase note). This document is the binding spec.

---

## 1. Executive summary

Module 08 gives a **homeowner a controlled view of a company-owned construction project** without making them an organization member and without opening the company workspace (BOQ rates, task board, issue board, org admin).

**Minimum product:** a company links one existing Houzeify user as that project's customer; the company **publishes** selected Daily Progress (and thereby its photo *metadata*); the customer sees stage, published progress, a derived stage timeline, shared documents, and who is on the site team.

**Not in Module 08:** Live Site, time-lapse, formal reports, Hozie LLM, chat, notification backend, cloud file/photo hosting, customer BOQ, customer tasks/issues.

**Recommended decision defaults** (open only if the reviewer rejects them): one customer per company project; invite-by-email to an existing user then accept; Daily Progress `visibility` rather than a second progress table; no BOQ on the customer side; photos inherit progress visibility and stay metadata-only.

---

## 2. Existing architecture findings

Verified on `main` `2b654b2` by reading `server/db/schema.ts`, `server/app.ts`, `server/projects/project.service.ts`, `projectAccess.ts`, `constructionNav.ts`, `Sidebar.tsx`, and the Module 03–07 specs/reports.

### 2.1 Tables (17)

`users`, `sessions`, `otp_challenges`, `customer_profiles`, `partner_profiles`, `organizations`, `organization_members`, `projects`, `house_requirements`, `daily_progress`, `daily_progress_photos`, `construction_tasks`, `construction_issues`, `project_workforce_members`, `project_documents`, `boq_sections`, `boq_items`.

**No** `project_customers`, **no** `visibility` / `published_at` on progress or documents, **no** notifications table, **no** messages table.

### 2.2 Project identity

`projects.owner_id` = creating **user** (homeowner *or* the professional who created a company project). `projects.organization_id` nullable. Company projects set both. Homeowner New-Build projects typically have `organization_id` null.

### 2.3 Authorization today

`getProjectForAccess`: creator **or** any org member (any role). `canMutateAtProjectLevel`: creator **or** org `owner`/`admin`. Inaccessible id → **404**, never 403.

**Widening `getProjectForAccess` with a customer OR is forbidden.** Every Module 04–07 list uses it; a customer would inherit BOQ, tasks, and issues.

### 2.4 Constraint verification (ticket §3)

| Claim | Verdict |
|---|---|
| Homeowner/customer screens exist | **True** — Sidebar, Home Dashboard, Projects List, project sub-screens |
| Company project workspace exists | **True** — PartnerNavRail + ProjectSubNav + real screens for Progress/Tasks/Issues/Workforce/Documents/BOQ |
| Customer nav exists | **True** — `CUSTOMER_NAV_ROUTES` in `constructionNav.ts:91–99`, wired in `Sidebar.tsx:245–251` |
| Server project auth exists | **True** |
| Org membership exists | **True** — invite fields on members; **no public invite-customer API** |
| Project Customer model | **Absent** |
| Customer invitation to a *project* | **Absent** (`invitations.ts` is homeowner→contractor *bid invite*, in-memory) |
| Publish/customer-feed on Daily Progress | **Absent** — Module 04 explicitly out of scope |
| Photo/document bytes | **Absent** — `storage_ref` = `internal://…/<id>` |
| Hozie LLM | **Absent** — rule/config UI |
| Notification backend | **Absent** — `NotificationsScreen.tsx` header: no model, honest empty state |

### 2.5 Daily Progress

Columns: `id`, `project_id`, `created_by`, `date` (YYYY-MM-DD text), `stage`, `title`, `description`, timestamps. Photos: `file_name`, `mime_type`, `size`, `uploaded_by`, `storage_ref`. No publish flag.

### 2.6 Static stage taxonomy

`src/data/constructionStages.ts` — 10 ids (`pre-construction` … `final-finishing`). File still contains **illustrative** `status`/`cost` on the static objects (estimate UI). Company `projects.stage` stores one id. Customer timeline **must not** copy those illustrative statuses as if they were the project's record.

---

## 3. Existing customer experience audit

The homeowner app is a **screen-id switcher** (`App.tsx` `?screen=`), not a URL router. `ProjectProvider` lists **owner** projects, or **org** projects when `currentOrganization` is set. A homeowner never joins an org (`projectState.tsx`), so they never see company projects.

`CUSTOMER_NAV_ROUTES` already points Progress/Documents at the **same** company workspace screens. Those screens mutate when the caller is the project creator. A linked customer must not get that mutate UI, and must not see ProjectSubNav's BOQ/Tasks/Issues/Customer/Settings tabs.

`CompanyProjectsListScreen` **redirects non-professionals to Home**. The customer path is Homeowner Sidebar + project screens, not PartnerNavRail.

Home Dashboard (`HomeDashboardScreen`) is estimate/Hozie/Home Services oriented. It does not show a company construction feed.

---

## 4. Existing routes / screens (construction-relevant)

| Screen | `?screen=` | Data source | Real/Mock | Class |
|---|---|---|---|---|
| Home Dashboard | `dashboard-home` | `useProjects` + estimate stores + config | Mixed | **MODIFY** (add construction card) |
| Projects List | `projects-list` | `useProjects` (owner list) | Real API | **MODIFY** (Shared with you) |
| Project Workspace | `project-workspace` | `projectData` + bids/agreements | Mixed | **KEEP** company/homeowner-owner; customer uses Overview/Progress instead of launcher grid |
| Project Overview | `project-overview` | projectData + bids | Mixed | **MODIFY** customer-safe fields when `kind=customer` |
| Project Progress | `project-progress` | `useDailyProgress` | Real API | **MODIFY** (audience) |
| Project Documents | `project-documents` | `useProjectDocuments` / legacy store | Real for UUID | **MODIFY** (visibility + read-only) |
| Project Workforce | `project-workforce` | `useProjectWorkforce` | Real | **MODIFY** (customer read-only) |
| Project Tasks / Issues | `project-tasks`, `project-issues` | real APIs | Real | **KEEP** company; **hide** from customer nav |
| Project BOQ | `project-boq` | `useProjectBoq` | Real | **KEEP** company; **hide** from customer |
| Project Messages | `project-messages` | none (honest empty) | Empty | **KEEP** / questions stay non-chat |
| Notifications | `notifications` | none (honest empty) | Empty | **KEEP**; no backend in M08 |
| Timeline / Photos / Live Site | `project-timeline`, `project-photos`, `project-live-site` | ComingSoon | Placeholder | Timeline+Photos **MODIFY** into real customer views; Live Site **COMING SOON** (M09) |
| Company Customer tab | `project-customer` | ComingSoon | Placeholder | **NEW** real screen |
| New-Build BOQ / estimate | `boq-overview`, … | in-memory estimate | Separate product | **KEEP** / do not mix |
| Home Services * | many | booking stores | Legacy | **HIDDEN** from primary nav (already) |
| Auth / profile | login, otp, homeowner-profile | real auth + customer_profiles | Real | **KEEP** |

Home Services category screens (salon, cleaning, etc.) are **out of Module 08**; do not inventory them as construction transparency.

---

## 5. Existing backend / data audit

| API | Authz | Customer today |
|---|---|---|
| `GET/POST /projects`, `GET/PATCH /projects/:id` | owner or org | 404 if not owner/member |
| `GET /projects?organizationId=` | org member | N/A |
| Daily Progress CRUD + photos | project access; mutate owner/admin | would leak if access widened |
| Tasks / Issues | same | leak |
| Workforce | same | list OK if filtered; mutate no |
| Documents | same | leak internals |
| BOQ | same | leak money |
| `GET /customer-profile` | self only | identity, not project |

`listProjectsForUser` is owner-scoped only (`project.routes.ts`).

---

## 6. Customer–project relationship analysis

**Current:** `User --owns--> Project` (`owner_id`). Optional `Organization --has--> Project`. No customer edge.

| Question | Current | Module 08 |
|---|---|---|
| Is the homeowner always `ownerId`? | For homeowner-created projects, yes. For company projects, **no** — owner is the professional. | Unchanged |
| Can a company project have a different customer? | Not represented | **Yes** — link table |
| Multiple customers? | N/A | **One active** customer in M08 |
| Org/customer relationship? | No | No — project-scoped |
| Invitation? | Org members have invited* columns; no customer invite | **Project customer invite** |
| Implicit access? | Only via `owner_id` | Must not treat org membership as “customer” |
| Remove / expire? | N/A | Soft `removed`; no expiry clock in M08 |

**Homeowner-owned projects (`organization_id` null):** the owner already has full project access. Module 08 **does not** attach `project_customers` there. The Customer tab shows an honest empty: the owner *is* the customer. Simplified customer shell is **only** for `kind=customer` on **organization** projects.

---

## 7. Customer authorization model

### 7.1 Access kinds (extend `projectAccess.ts`, do not replace `getProjectForAccess`)

```
resolveProjectAccess(env, projectId, userId) →
  { project, kind: 'company' | 'customer' } | undefined
```

- **company:** existing `getProjectForAccess` (creator or org member).
- **customer:** `project_customers.status = 'active'` for `(project_id, user_id)` and `project.organization_id IS NOT NULL`.

`requireProjectAccess` remains company-only. Existing BOQ/tasks/issues services stay on it.

New: `requireCompanyOrCustomerRead`, `requireCustomerSelf` (invitee actions).

### 7.2 Who can what

| Action | Who |
|---|---|
| Invite / replace / unlink customer | `canMutateAtProjectLevel` (creator or org owner/admin) |
| Accept invite | The invited `user_id` only |
| View customer-view APIs | `kind=customer` (active) or `kind=company` (company may preview) |
| Mutate progress/docs/workforce/BOQ/tasks | **company mutate only** — never customer |
| Publish progress / set document visibility | company mutate (uploader **or** project mutator for documents, matching M07 edit gate) |
| See org admin, member emails, BOQ, tasks, issues | company only |
| Viewer org member | company **read** of internal records (unchanged); **cannot** invite/publish |

### 7.3 Isolation tests (conceptual)

1. Own linked project → customer-view 200.  
2. Other customer's project → 404.  
3. No session → 401.  
4. Org member → company APIs 200; not forced into customer serializer.  
5. Org viewer → cannot PUT customer / cannot publish.  
6. `removed` customer → 404.  
7. Stranger UUID → 404.

---

## 8. Customer visibility model

| Data | Company | Customer | Condition |
|---|---|---|---|
| Project name, location, property type, status, stage, timeline dates | Yes | Yes | Linked + active |
| Organization display name | Yes | Yes | Linked |
| Internal `summary` | Yes | **No** | Treated as company notes |
| Daily Progress | All | Only `visibility=customer` | Publish toggle |
| Progress photo metadata | All on that entry | Same as parent entry | No bytes |
| Tasks / Issues | Yes | **No** | M08 |
| Workforce active roster | Yes | **Yes** — name + trade only | No phones/emails |
| Documents | All active | `visibility=customer` | Default internal |
| BOQ | Yes | **No** | M08; commercially sensitive (M07 §22) |
| Reports / Live Site / Hozie | Placeholders | Placeholders | M09–11 |
| Questions / notifications backend | Empty UI | Empty UI | Later |

---

## 9. Publishing model

**Chosen:** same rows, extra columns. Not a second “customer progress” table.

`daily_progress`:

- `visibility` text NOT NULL DEFAULT `'internal'` — `'internal'` \| `'customer'`
- `published_at` timestamptz NULL
- `published_by` text NULL → `users.id`

When visibility becomes `customer`, server sets `published_at`/`published_by` if unset. Unpublish (`internal`) clears neither history fields (audit) but hides from customer-view. Re-publish updates `published_at`.

Photos have **no** own visibility. Company UI: “Share with customer” on a progress entry.

**Rejected:** mandatory review queue (over-engineered for M08). Mutators *are* the reviewers.

---

## 10. Data model proposal

### 10.1 `project_customers` (new)

| Field | Type | Null | Default | FK | Index | Purpose |
|---|---|---|---|---|---|---|
| id | text PK uuid | no | randomUUID | | PK | |
| project_id | text | no | | projects CASCADE | unique | one row per project in M08 |
| user_id | text | no | | users CASCADE | index | invitee |
| status | text | no | `invited` | | | `invited` \| `active` \| `removed` |
| invited_by | text | no | | users | | server-set |
| invited_at | timestamptz | no | now() | | | |
| accepted_at | timestamptz | yes | | | | |
| removed_at | timestamptz | yes | | | | |
| created_at / updated_at | timestamptz | no | now() | | | |

Invite replaces a `removed` row or updates the same project row. Unique `(project_id)`. Cannot link a user who is already an org member of that project (`409 ALREADY_PARTICIPANT`). Cannot link on `organization_id` null (`409 NOT_COMPANY_PROJECT`).

Email resolution: trim, lower, match `customer_profiles.email`. No match → `404 USER_NOT_FOUND` **same message** whether unknown or partner-only (no customer profile). No user create, no SMS/email send.

### 10.2 `project_documents.visibility`

text NOT NULL DEFAULT `'internal'` — `'internal'` \| `'customer'`. Additive; M07 rows stay internal.

### 10.3 `daily_progress` publish columns

See §9.

### 10.4 Not added

BOQ visibility, task/issue visibility, notifications, messages, pending-invite-without-user.

---

## 11. API proposal

Conventions: `requireAuth`; 404 never 403; `INVALID_ID` 400; `additionalProperties: false`; server-set fields omitted from bodies.

### Company — link

**PUT `/api/v1/projects/:projectId/customer`**  
Purpose: invite by email (create/replace). Auth: session. Authz: project mutate.  
Request: `{ "email": "…" }` (1–254).  
Response: `{ data: { customer: { userId, status, email, fullName, preferredName, invitedAt, acceptedAt } } }`  
Errors: 404 project; 404 USER_NOT_FOUND; 409 ALREADY_PARTICIPANT; 409 NOT_COMPANY_PROJECT.

**GET `/api/v1/projects/:projectId/customer`**  
Company read. 404 if none (including removed-only).

**DELETE `/api/v1/projects/:projectId/customer`**  
Mutate. Sets `removed`. Immediate loss of customer-view.

### Customer — accept / list

**POST `/api/v1/projects/:projectId/customer/accept`**  
Invitee with `invited`. Sets `active`, `accepted_at`. 404 otherwise.

**GET `/api/v1/projects?as=customer`**  
Mutually exclusive with `organizationId`. Returns customer-serializer projects where status is `invited` or `active` (pending shown as invitations, not full record).

### Customer-view (active customer or company preview)

Prefix: `/api/v1/projects/:projectId/customer-view`

| Method | Route | Returns |
|---|---|---|
| GET | `/` | Header: name, location, stage, status, timeline, org name, latest published progress summary |
| GET | `/progress` | Published entries + photo metadata (no fake URLs) |
| GET | `/documents` | Documents with `visibility=customer` |
| GET | `/workforce` | Active members: `displayName`, `role` only |
| GET | `/timeline` | 10 stages with derived state: `completed` / `current` / `upcoming` from `projects.stage` order + dates of published progress per stage |

Company callers may GET customer-view to preview. Customers GET company BOQ/tasks/issues → **404**.

### Existing endpoints — surgical

- Document PATCH: optional `visibility`.
- Daily Progress PATCH: optional `visibility` (mutators only).
- List progress for **company** unchanged (all entries).
- **Do not** change BOQ/tasks/issues access.

---

## 12. Screen inventory (Module 08)

| Screen | Route | Purpose | Data | API | Status |
|---|---|---|---|---|---|
| Project Customer | `project-customer` | Invite/unlink/accept status | link + profile | customer CRUD | **NEW** |
| Home Dashboard | `dashboard-home` | After login: construction card if linked/invited | header + latest | `?as=customer` + customer-view | **MODIFY** |
| Projects List | `projects-list` | Owner projects + Shared with you | two lists | owner GET + `?as=customer` | **MODIFY** |
| Customer progress | `project-progress` | Consume published progress | progress | customer-view/progress | **MODIFY** |
| Customer documents | `project-documents` | Shared files metadata | docs | customer-view/documents | **MODIFY** |
| Customer photos | `project-photos` | Gallery of published photo metadata | photos | same progress payload | **MODIFY** (replace ComingSoon) |
| Customer timeline | `project-timeline` | Stage tracker | derived | customer-view/timeline | **MODIFY** (replace ComingSoon) |
| Customer workforce snippet | `project-workforce` | Who is on site | roster | customer-view/workforce | **MODIFY** read-only when customer |
| Overview | `project-overview` | Simple project header | header | customer-view | **MODIFY** |
| ProjectSubNav | — | Hide internal tabs for customer | — | — | **MODIFY** |
| Sidebar customer items | — | Pass `project_id` when 1 linked project; else list | — | — | **MODIFY** |
| Messages / Notifications | existing | Honest empty | — | — | **KEEP** / out of scope |
| Live Site | `project-live-site` | — | — | — | **FUTURE M09** |
| Company BOQ/Tasks/Issues | existing | Internal | — | — | **KEEP** / hidden from customer |
| New-Build estimate BOQ | existing | Different product | — | — | **KEEP** |

---

## 13. Customer journey

```
Login (OTP)
  → Home Dashboard
       → if invited: “Join this project” → accept
       → if active: construction card (stage, latest published update)
       → My Projects → Shared with you → Overview
            → Progress (published)
            → Photos (metadata)
            → Timeline (stages)
            → Documents (shared)
            → Site team (names + trades)
```

**First time:** company PUT email → customer logs in → Home shows invite → accept.  
**Returning:** Home shows latest published update.  
**Multiple linked projects:** Projects List “Shared with you”; Sidebar Progress does **not** pick an arbitrary id.  
**No project:** existing Home empty/estimate CTAs; no fake construction.  
**Removed:** next fetch 404; copy “This project is no longer shared with you.”  
**Completed:** `status=completed` still readable; timeline shows all stages completed if `stage` is last id.

Company journey: Project → Customer tab → email → pending/active → publish progress → share documents.

---

## 14. Responsive strategy

Targets: **1440 / 768–1024 / 375**. No page-level overflow. `min-w-0` on content. ≥44px hit targets. Progress: desktop two-column (feed + stage), tablet stacked, mobile cards + full-screen photo *detail sheet* that states filename/size (no fake image if no bytes). Timeline: horizontal scroll on desktop, vertical stepper on mobile. Long names wrap; currency (if any later) nowrap — M08 has no customer currency. Invite form: inline desktop, sheet on 375.

Do not shrink PartnerNavRail onto the customer. Customer keeps **Sidebar**.

---

## 15. Accessibility

- Tab strip `aria-current`, timeline as `ol`/`list`.  
- Invite errors from `err.code`.  
- Never announce empty while `idle`/`loading`.  
- Contrast: secondary `#68636D`, not `#9A949D`.  
- Photo cards are not unlabeled icon-only.  
- Keyboard: accept invite, open progress cards.

---

## 16. Design-system requirements

Reuse Houzeify tokens: primary `#722ED1`, hover `#5A22A8`, Build `#F8E3BD` (stage/progress emphasis), Progress `#C6F6D5` (success/published), AI `#F3EAFF` (existing chips only), Services `#CAEBFF` unused, Canvas `#FBF9F7` only if sibling customer surfaces already use it — **project screens today sit on white; keep that**. Borders `#E3DDD7`.

**Typography:** Google Sans Flex for headings (`"Google Sans Flex:SemiBold"` / Bold), same as every existing project screen. Body and eyebrows stay Open Sans and Sometype Mono. No new typeface.

Company UI stays dense. Customer UI: one focal “latest update”, quiet surroundings, sentence case, one CTA name (“Share with customer” / “Shared”).

---

## 17. Security model

- Customer ≠ org member.  
- Email probe: one generic not-found.  
- Default-deny documents and progress.  
- No BOQ/tasks/issues.  
- No `storage_ref` presented as http(s) URL.  
- Unlink immediate.  
- Org-B isolation unchanged.  
- Do not log OTPs in frontend.

---

## 18. Module boundaries

| Module | Owns | M08 does not |
|---|---|---|
| **08** | Link, publish progress, shared docs, derived timeline, photo metadata gallery, site-team names, customer-safe home/list | |
| **09** | Live cameras, time-lapse | Live Site tab stays Coming Soon |
| **10** | Formal reports, construction record packs, possible BOQ customer summary | Reports tab Coming Soon |
| **11** | Hozie construction AI | No new AI |

---

## 19. Reuse / modify / new

**Reuse:** `projectAccess.ts` (extend), `ORGANIZATION_MUTATION_ROLES`, `constructionStages` **ids/order/names only**, Sidebar, customer_profiles, Module 04/06/07 serializers as inputs to *new* customer serializers, ComingSoonScreen for Live Site.

**Modify:** `schema.ts` + migration; daily progress + documents services/schemas; `project.routes.ts` (`as=customer`); `App.tsx`; `constructionNav.ts` copy; `ProjectSubNav`; `Sidebar`; Home Dashboard; Projects List; Progress/Documents/Workforce/Overview; `project-photos` / `project-timeline` render blocks.

**New:** `project_customers` table + `projectCustomer.*` server files; `customerView.*` server files; `src/data/projectCustomerApi.ts`, `customerViewApi.ts` + hooks; `ProjectCustomerScreen.tsx`; optional `CustomerProjectNav.tsx` if SubNav variant gets messy.

**Keep:** BOQ/tasks/issues company screens; Messages; Notifications empty; New-Build BOQ; Home Services.

---

## 20. Implementation task breakdown

See plan: `docs/superpowers/plans/2026-09-21-module-08-customer-transparency.md`. ~20 independently reviewable tasks. Order: access resolver + table → invite API → publish columns → customer-view APIs → company Customer screen → customer shell/nav → Progress/Documents/Photos/Timeline/Workforce → Home/List → tests/review.

Workflow (mandatory later): worktree → TDD backend → frontend-design on customer UI → responsive 1440/768/375 → Impeccable if binary present else documented manual a11y → whole-branch code review → 370+ new tests → live browser (company invite + second user accept + publish + customer read + 404 on BOQ).

---

## 21. Testing strategy

Backend additive on the 370 baseline:

- Invite/accept/remove/replace; isolation; already-participant; non-company project.  
- `as=customer` list invited vs active.  
- Customer-view progress filter; unpublish hides.  
- Documents default internal; customer sees only shared.  
- Workforce names only.  
- Timeline derivation from `projects.stage`.  
- Customer 404 on `/boq`, `/tasks`, `/issues`, progress POST.  
- Viewer cannot invite/publish.

Frontend: `tsc --noEmit`, Vite build. Hooks `idle|loading|loaded|error`.

---

## 22. Browser verification strategy

Two sessions (company mutator + homeowner user).

1. Company project → Customer → invite email of second user.  
2. Second user login → Home invite → accept.  
3. Company publishes one Daily Progress; shares one document.  
4. Customer: Home card, Progress, Photos metadata, Timeline, Documents (one file), Workforce.  
5. Customer ProjectSubNav: no BOQ/Tasks/Issues; opening `?screen=project-boq` 404/empty.  
6. Unlink → customer 404 copy.  
7. 1440 / 768 / 375; no page overflow.  
8. Modules 04–06 tabs still work for company (regression).

Do not use homeowner Build-flow browser ids.

---

## 23. Risks

1. **Widening `getProjectForAccess`** — catastrophic leak.  
2. **Reuse of ProjectProgressScreen** without a hard `kind` gate — customer Add Progress.  
3. **Fake photo thumbnails** from `createObjectURL` of another user’s machine.  
4. **Email enumeration** if error messages differ.  
5. **Neon latency** — loading states must last honestly.  
6. **Design-system uncommitted WIP** contaminating the module branch.  
7. **Impeccable unavailable** (M07 debt) — manual audit required.  
8. **Sidebar Progress with 0 or N projects** — wrong `project_id`.

---

## 24. Technical debt to leave

- Homeowner Build-flow non-UUID project ids (M07).  
- Hardcoded workspace launcher cards (M07).  
- No email delivery.  
- Membership status filter on org lookups (`projectAccess.ts` comment).  
- `constructionStages.ts` illustrative statuses.  
- Notifications/messages empty shells.  
- Existing services not all on `projectAccess.ts`.

---

## 25. Open decisions (defaults if approved as-is)

| # | Topic | Default |
|---|---|---|
| 1 | Invite+accept vs instant link | **Invite + accept** |
| 2 | One vs many customers | **One** |
| 3 | Customer BOQ | **None in M08** |
| 4 | Customer tasks/issues | **None** |
| 5 | Workforce on customer | **Yes, name + trade** |
| 6 | Separate progress table | **No — visibility column** |
| 7 | Homeowner-owned projects use customer shell | **No** |

---

## 26. Final recommendation

Implement Module 08 as **project_customers + publish flags + customer-view APIs + customer-safe screens**, on a branch off `main` `2b654b2`, **after this spec is approved**. Do not start Module 09–11. Do not merge. Do not mix design-system WIP.

**Ready for implementation: YES**, once the defaults in §25 are accepted (or revised in writing).
