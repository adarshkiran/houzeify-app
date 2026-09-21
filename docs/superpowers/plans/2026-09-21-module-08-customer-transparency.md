# Module 08 — Customer Transparency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This plan is design-level.** It contains contracts, test-case lists, and verification commands — **not** production implementation code. Do not start until the spec is approved.

**Goal:** Let a company invite one existing Houzeify user as a project customer, publish selected Daily Progress, share selected documents, and let that customer read a simplified construction record — without org membership and without BOQ/tasks/issues.

**Architecture:** Do **not** widen `getProjectForAccess`. Extend `projectAccess.ts` with `company | customer` kinds. New `project_customers` table. Visibility/publish columns on `daily_progress` and `project_documents`. Dedicated `/customer-view` GETs plus invite/accept APIs. Customer UI reuses Sidebar + existing project screens with a `kind=customer` gate; company gets `ProjectCustomerScreen`.

**Tech Stack:** Fastify 5, Drizzle, PostgreSQL (Neon), AJV, `node:test` via `tsx --test`, React 19, Tailwind CSS v4.

**Spec:** [docs/superpowers/specs/2026-09-21-module-08-customer-transparency-spec.md](../specs/2026-09-21-module-08-customer-transparency-spec.md) — binding. Defaults in spec §25 apply unless the reviewer writes otherwise.

## Global Constraints

- **No production work on `main` mixed with design-system WIP.** Worktree `.worktrees/module-08-customer-transparency`, branch `module-08-customer-transparency` from `main` `2b654b2`. Symlink `.env`. Confirm **370/370** backend tests before Task 1.
- **Never** add customer to `getProjectForAccess` SQL OR. BOQ/tasks/issues stay company-only (`404`).
- **404 never 403.** `INVALID_ID` 400. AJV `additionalProperties: false`.
- **No file/photo bytes, no email/SMS send, no chat, no notification backend, no Live Site, no Hozie LLM, no customer BOQ, no Module 09–11.**
- **Typography:** Google Sans Flex for headings, matching existing screens. No new typeface.
- **Tokens:** primary `#722ED1`, hover `#5A22A8`, secondary text `#68636D`, borders `#E3DDD7`. `min-w-0`. ≥44px text actions.
- **Responsive:** 1440 / 768 / 375; no page-level overflow.
- **Hooks:** `idle|loading|loaded|error`; no empty copy while loading; mutation refetch silent; errors by `err.code`.
- **One active customer per company project.** Homeowner-owned projects (`organization_id` null) are not linkable.
- **Frontend CORS:** this clone’s Vite is **8443**; keep `CORS_ORIGINS` aligned. Confirm `lsof` cwd before live verify (M07 lesson). Dev OTP in server log, 60s cooldown.
- **Skills during implementation (not now):** TDD on backend tasks; `frontend-design` when building customer UI (preserve DS); Impeccable if available else document manual a11y; whole-branch code-review before report.

## File Structure

| File | Task | Role |
|---|---|---|
| `server/projects/projectAccess.ts` + test | 1 | `resolveProjectAccess`, customer helpers |
| `server/db/schema.ts` + migration | 2 | `project_customers`; document + progress columns |
| `server/projects/projectCustomer.*` | 3–4 | invite/get/delete/accept |
| `server/projects/dailyProgress.*` | 5 | `visibility` patch + company list unchanged |
| `server/projects/projectDocuments.*` | 6 | `visibility` on PATCH/list |
| `server/projects/customerView.*` | 7–8 | customer-view GETs |
| `server/projects/project.routes.ts` | 3 | `?as=customer` |
| `server/app.ts` | 3,7 | register routes |
| `src/data/projectCustomerApi.ts` + state | 9 | company + accept |
| `src/data/customerViewApi.ts` + state | 10 | customer reads |
| `src/user/projects/ProjectCustomerScreen.tsx` | 9 | NEW |
| `src/shared/components/ProjectSubNav.tsx` | 11 | `variant` |
| `src/shared/components/Sidebar.tsx` | 11 | project_id for single linked project |
| `src/App.tsx`, `constructionNav.ts` | 9–11 | routing/copy |
| Home Dashboard, ProjectsList, Progress, Documents, Photos, Timeline, Workforce, Overview | 12–18 | customer-safe UI |
| `docs/superpowers/reports/2026-09-21-module-08-customer-transparency-report.md` | 20 | final report |

---

### Task 1: Access resolver (TDD)

**Objective:** Distinguish company vs customer without changing `getProjectForAccess`.

**Inspect:** `projectAccess.ts`, `project.service.ts` `getProjectForAccess`, `projectAccess.test.ts`.

**Modify:** `projectAccess.ts`, `projectAccess.test.ts` only. Existing services stay on `requireProjectAccess` until later tasks opt in.

**Contract:**

- `resolveProjectAccess(env, projectId, userId)` → `{ project, kind: 'company' | 'customer' } | undefined`
- `kind=company` iff current getProjectForAccess would return the row
- `kind=customer` iff active `project_customers` row (table may be empty until Task 2 — tests for customer kind land in Task 3; Task 1 tests company path + that getProjectForAccess **behavior is unchanged**)
- `requireCompanyRead` = current requireProjectAccess
- Customer hitting requireProjectAccess still 404

**Tests first (must fail only for new exports if table missing — if table absent, implement company-only resolver first):** creator/org member → company; outsider undefined; getProjectForAccess regression (same 8 cases as existing helper tests).

**Acceptance:** 370 + new helper tests green. `getProjectForAccess` SQL unchanged.

**Commit** when green.

---

### Task 2: Schema + migration

**Objective:** Additive tables/columns per spec §10.

**Create:** Drizzle columns; `npx drizzle-kit generate`; review SQL; `pnpm server:migrate`.

**Fields:** `project_customers` as spec; `project_documents.visibility` default `internal`; `daily_progress.visibility` default `internal`, `published_at`, `published_by`.

**Tests:** none yet beyond migrate on Neon.

**Acceptance:** migrate applies on empty and on DB that already has M07 documents/progress. Defaults backfill internal.

**Commit.**

---

### Task 3: Invite / get / delete (TDD)

**Objective:** Company mutators manage the link.

**Create:** `projectCustomer.{types,schemas,service,routes,test}.ts`. Register in `app.ts`.

**Inspect:** `projectAccess.test.ts` harness, `customerProfile` email field.

**Contract:** spec §11 PUT/GET/DELETE. Email lookup lowercased on `customer_profiles.email`. Generic `USER_NOT_FOUND`. `409 ALREADY_PARTICIPANT`, `409 NOT_COMPANY_PROJECT`. DELETE soft-removes.

**Tests first:** invite happy path status `invited`; get; replace; delete → customer 404; viewer cannot PUT; outsider 404; org member as email 409; homeowner-owned project 409; partner-only user same 404 message as unknown email.

**Acceptance:** tests green. No email send.

**Commit.**

---

### Task 4: Accept + list `?as=customer` (TDD)

**Objective:** Invitee can accept; list invitations/projects.

**Modify:** `projectCustomer.service` + `project.routes.ts` GET `/` query `as=customer` exclusive with `organizationId`.

**Contract:** POST accept; GET list serializer (invited vs active). Invalid combo query → 400.

**Tests:** only invitee accepts; other user 404; after accept kind=customer; list includes invited; after remove absent; `organizationId` + `as=customer` 400.

**Commit.**

---

### Task 5: Publish Daily Progress (TDD)

**Objective:** Mutators set visibility; company list still returns all.

**Modify:** `dailyProgress.schemas.ts`, `.service.ts`, `.types.ts`, `.test.ts`.

**Contract:** PATCH `{ visibility: 'internal'|'customer' }`. On first share set published_at/by. Unpublish hides from customer-view (Task 7) but company GET still shows the row with visibility field. Viewer cannot patch visibility.

**Tests:** default internal; owner/admin publish; viewer 404; published_at set once.

**Commit.**

---

### Task 6: Document visibility (TDD)

**Objective:** Default internal; mutator/uploader can share.

**Modify:** documents schemas/service/types/tests.

**Tests:** M07-shaped create has visibility internal; PATCH customer; list company includes both; customer-view (Task 7) only shared.

**Commit.**

---

### Task 7: Customer-view progress + header (TDD)

**Objective:** Safe GETs.

**Create:** `customerView.{types,schemas,service,routes,test}.ts`. Register.

**GET** `/projects/:id/customer-view` and `/customer-view/progress`.

**Rules:** active customer or company read; invited (not accepted) → 404 on view (only accept + list). Progress filter visibility=customer. Photo metadata: fileName, mimeType, size — **no http URL**. Header omits `summary`.

**Tests:** isolation; invited cannot GET view; company can preview; unpublished omitted; BOQ still 404 for customer.

**Commit.**

---

### Task 8: Customer-view documents, workforce, timeline (TDD)

**GET** `/customer-view/documents`, `/workforce`, `/timeline`.

**Timeline:** map `constructionStages` order; `projects.stage` = current; stages with order < current → completed; > current → upcoming; do **not** use static file’s demo `status`.

**Workforce:** active only; `{ displayName, role }`.

**Tests:** document filter; workforce no email; timeline current id; customer 404 on `/tasks` `/issues` `/boq`.

**Commit.**

---

### Task 9: Company Customer screen

**Objective:** Replace ComingSoon for `project-customer`.

**Create:** `ProjectCustomerScreen.tsx`, `projectCustomerApi.ts`, hook.

**Modify:** `App.tsx`, `constructionNav.ts` copy (no “communication history”).

**UX:** empty + Link (mutators); email form; pending/active; Unlink confirm; homeowner-owned honest empty. `describeCustomerError`. frontend-design: one focal form.

**Browser:** company admin invite on UUID project; viewer no CTA.

**Commit.**

---

### Task 10: Customer view client layer

**Create:** `customerViewApi.ts` + `useCustomerView` / `useCustomerProgress` (or one hook with resources). `useProjects` additive fetch `as=customer` for homeowners only — **do not** merge into org list.

**Tests:** none required beyond tsc; optional unit of mapper.

**Commit.**

---

### Task 11: Nav gates

**Modify:** `ProjectSubNav` `variant: 'company' | 'customer'`. Customer tabs: Overview, Progress, Timeline, Photos, Documents, Workforce only.

**Sidebar:** if exactly one `active` customer project, Progress/Documents/Timeline/Photos pass that `project_id`; if 0 or many, those items go to `projects-list`.

**App.tsx:** pass variant from access kind (company default).

**Browser:** customer session must not show BOQ tab.

**Commit.**

---

### Task 12: Home Dashboard construction card

**Modify:** `HomeDashboardScreen.tsx` — if invited, accept CTA; if active, stage + latest published title + “View progress”. No fake photos. Keep estimate/Hozie blocks.

**Browser:** 375 and 1440.

**Commit.**

---

### Task 13: Projects List “Shared with you”

**Modify:** `ProjectsListScreen.tsx`.

**Browser:** owner section unchanged; shared section opens Overview with `project_id`.

**Commit.**

---

### Task 14: Progress screen audience

**Modify:** `ProjectProgressScreen.tsx` — if customer: no Add; load customer-view; “Shared with you” vs internal. If company: existing + Share with customer on entries (mutators).

**Risk:** homeowner who **owns** the project remains company-kind via ownerId — they keep Add. Linked customer must not.

**Browser:** publish as company; see as customer; unpublish disappears for customer.

**Commit.**

---

### Task 15: Documents audience

**Modify:** `ProjectDocumentsScreen.tsx` — company visibility chip + toggle; customer read-only shared list; no upload.

**Browser:** share one doc; customer sees one; internal hidden.

**Commit.**

---

### Task 16: Photos screen

**Modify:** `App.tsx` so `project-photos` is not ComingSoon. New small screen **or** thin wrapper listing published photo metadata grouped by date. Honest “File isn’t stored yet”. No `createObjectURL` of another session.

**Browser:** 375 sheet for a photo row (filename, size, date).

**Commit.**

---

### Task 17: Timeline screen

**Replace ComingSoon** for `project-timeline` with derived stepper from customer-view/timeline (company may use the same read-only stepper for M08 — **do not** build a company Gantt).

**Do not** display `constructionStages[].status` from the static file.

**Browser:** current stage emphasized; 375 vertical.

**Commit.**

---

### Task 18: Workforce + Overview customer

**Modify:** Workforce hide add/remove when customer; Overview hide bid/payment internals when customer — show location, stage, org name.

**Browser:** customer names + trades only.

**Commit.**

---

### Task 19: Whole-branch quality

**Run:** `pnpm server:test` (370 + new), `pnpm server:typecheck`, `pnpm exec tsc --noEmit`, `pnpm build`.

**frontend-design** pass on Customer + Home card + Photos/Timeline.

**Impeccable** if present; else record limitation.

**Code review:** whole branch regex: no getProjectForAccess widening; no BOQ customer route; no Module 09 cameras.

**Fix** blocking findings.

**Commit** fixes separately.

---

### Task 20: Live verification + report

**Browser checklist:** spec §22. Two users. Also company Tasks/Issues/Progress/Workforce still load (M04–06 regression).

**Write:** `docs/superpowers/reports/2026-09-21-module-08-customer-transparency-report.md`.

**Do not merge. Do not start Module 09.**

---

## Out of scope (never in this plan)

Live Site, reports, Hozie, chat, notifications API, cloud storage, customer BOQ, multi-customer households, email invites to non-users, design-system leftover-hex sweep.
