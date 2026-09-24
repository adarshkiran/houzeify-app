# Houzeify Estimation Foundation Implementation Report

**Branch:** `cursor/s22-estimation-foundation`  
**Baseline:** `origin/main` @ `d503ccf`  
**Date:** 2026-09-25  

> Note: Roadmap Phase 9 **S22** already shipped as UX accessibility polish.  
> This work is the **Estimation Foundation** module (branch name per product request).

---

## Implemented

- ProjectSubNav **Estimates** tab → `project-estimates`
- Estimate list with honest empty/loading/error
- Create Estimate (name, pricing method, location, optional area)
- Estimate workspace overview (no fake totals; Hozie seam disabled)
- API: list / create / get under `/api/v1/projects/:projectId/estimates`
- Tables: `estimates`, `estimate_versions`, `estimate_items`, `organization_rate_entries`
- Version 1 Draft on create; BOQ unchanged and separate

## Routes

| Screen | AppScreen id |
|---|---|
| List | `project-estimates` |
| Create | `project-estimate-create` |
| Workspace | `project-estimate-workspace` |

## API

| Method | Path |
|---|---|
| GET | `/api/v1/projects/:projectId/estimates` |
| POST | `/api/v1/projects/:projectId/estimates` |
| GET | `/api/v1/projects/:projectId/estimates/:estimateId` |

Auth: company project access for read; creator/org owner/admin for create. Customers blocked (404).

## Data model

- `estimates` — org + project scoped; pricing_method; currency INR; optional customer_user_id
- `estimate_versions` — version_number + status; Version 1 Draft
- `estimate_items` — scaled money columns + rate_source / effective_date / confidence (empty for now)
- `organization_rate_entries` — future Price Book (no UI)

## Explicitly NOT implemented

- AI estimation engine / LLM calls
- Live market pricing / scraping
- Price Book UI
- Customer estimate view / share / accept
- BOQ mapping / auto takeoff
- Item calculator / fabricated totals

## Next recommended slice

**AI Estimation Advisor** — wire Hozie Q&A to structure estimates (still no fake market prices).
