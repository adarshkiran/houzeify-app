# Module 08 — Customer Transparency report

**Branch:** `module-08-customer-transparency` (worktree `.worktrees/module-08-customer-transparency`)  
**Base:** `main` `2b654b2`  
**Status:** Implemented. **Not merged.** Module 09 not started. Design-system WIP stayed on the primary checkout.

## What shipped

- Access kinds `company | customer` in `projectAccess.ts`. `getProjectForAccess` SQL is unchanged.
- `project_customers` plus `visibility` / publish columns on daily progress and documents (migration `0010_module_08_customer`).
- Company invite/get/delete and customer accept; `GET /projects?as=customer`.
- Customer-view GETs for header, progress, documents, workforce, timeline.
- Company Customer screen; customer Home / Projects List; Progress / Documents / Photos / Timeline / Workforce / Overview gated by audience.
- Customer ProjectSubNav hides BOQ / Tasks / Issues. Sidebar Progress/Documents/Timeline/Photos pass `project_id` only when exactly one active shared project.

## Tests

Backend tests added in `projectCustomer.test.ts` and `customerView.test.ts`, plus access-resolver cases.

Live `pnpm server:test` / Neon migrate from this agent session hit the sandbox (Postgres network). Run locally from the worktree:

```
pnpm exec drizzle-kit migrate
pnpm server:test
pnpm server:typecheck
pnpm exec tsc --noEmit
```

## Constraints kept

- No customer BOQ / tasks / issues routes.
- No file bytes, chat, notifications API, Live Site, Hozie.
- Typography: Google Sans Flex headings.
- One customer per company project; homeowner-owned projects are not linkable.
