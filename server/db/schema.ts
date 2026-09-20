// ─── Drizzle schema — 12E authentication + 12G-B identity/profile foundation ─
// 12E tables: users, sessions, otp_challenges — FROZEN, unchanged below.
// 12G-B adds the first persistent profile/organization layer approved in
// 12G-A's audit: customer_profiles, partner_profiles, organizations,
// organization_members. No subscription/project/payment/verification/etc.
// tables belong here yet. See server/README.md for the full rationale.
//
// Identifiers are application-generated UUIDs (node:crypto randomUUID) via
// $defaultFn rather than Postgres's gen_random_uuid(), so no database
// extension needs to be enabled on whatever Postgres provider is used.

import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

// ─── users ───────────────────────────────────────────────────────────────
// A user is only an identity: phone number + verification timestamp.
// Deliberately NO role/profile/name/address/company fields — those belong
// to later profile/organization phases (see 12E ticket, "IMPORTANT: USER
// ROLE"). NO password, NO OTP value ever stored here.
export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    // As the user/provider supplied it (for display).
    phoneNumber: text('phone_number').notNull(),
    // Canonical E.164-style form — the only column uniqueness and lookups
    // are enforced against. See server/auth/phone.ts.
    phoneNumberNormalized: text('phone_number_normalized').notNull(),
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // Enforced at the database level, not just in application code — one
    // normalized phone number can back at most one user row.
    uniqueIndex('users_phone_number_normalized_unique').on(table.phoneNumberNormalized),
  ],
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert

// ─── sessions ────────────────────────────────────────────────────────────
// The raw session token NEVER reaches this table — only a sha256 hash of
// it (see server/auth/session.ts). Revoked/expired rows must never
// authenticate; that check happens in application code on every read.
export const sessions = pgTable(
  'sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  table => [
    uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
)

export type SessionRow = typeof sessions.$inferSelect
export type NewSessionRow = typeof sessions.$inferInsert

// ─── otp_challenges ──────────────────────────────────────────────────────
// One-time challenge model. otpHash is `<saltHex>:<derivedHex>` from
// scrypt (see server/auth/otp.ts) — never a plaintext OTP. A challenge
// becomes unusable after successful verification (consumedAt set),
// expiration (expiresAt passed), or exceeding maxAttempts.
export const otpChallenges = pgTable(
  'otp_challenges',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    phoneNumberNormalized: text('phone_number_normalized').notNull(),
    otpHash: text('otp_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // Locating "the active challenge for phone X" and enforcing the
    // request cooldown are both single-phone lookups ordered by recency.
    index('otp_challenges_phone_number_normalized_idx').on(table.phoneNumberNormalized),
    index('otp_challenges_expires_at_idx').on(table.expiresAt),
  ],
)

export type OtpChallengeRow = typeof otpChallenges.$inferSelect
export type NewOtpChallengeRow = typeof otpChallenges.$inferInsert

// ─── customer_profiles ──────────────────────────────────────────────────
// 12G-A audit: maps to HomeownerProfile (src/data/homeownerProfile.ts),
// minus phone (owned by `users`) and minus role/accountType/organizationId
// (product/onboarding state, not profile identity — per the approved
// model, `users` never gets a role column). At most one per user — a
// homeowner-shaped identity is optional, not implied by having an account.
export const customerProfiles = pgTable(
  'customer_profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    preferredName: text('preferred_name'),
    email: text('email'),
    location: text('location'),
    language: text('language'),
    unitPreference: text('unit_preference'),
    currencyPreference: text('currency_preference'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // At most one customer profile per user.
    uniqueIndex('customer_profiles_user_id_unique').on(table.userId),
  ],
)

export type CustomerProfileRow = typeof customerProfiles.$inferSelect
export type NewCustomerProfileRow = typeof customerProfiles.$inferInsert

// ─── partner_profiles ───────────────────────────────────────────────────
// 12G-A audit: maps to ProfessionalProfile (src/data/professionalProfile.ts)
// — the one frontend model with real (in-memory) CRUD semantics already.
// `professionalType` preserves the existing 9-value taxonomy from
// src/data/professionalType.ts exactly (validated at the API layer, see
// partnerProfile.schemas.ts) — never a new taxonomy. `organizationId` is
// deliberately NOT a column here (approved model: organization membership
// lives only in organization_members, never duplicated onto the profile).
export const partnerProfiles = pgTable(
  'partner_profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    professionalType: text('professional_type').notNull(),
    professionalTypeOther: text('professional_type_other'),
    specialization: text('specialization'),
    fullName: text('full_name').notNull(),
    displayName: text('display_name'),
    about: text('about'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    yearsOfExperience: text('years_of_experience'),
    // Native Postgres text[] — the simplest compatible representation for
    // ProfessionalProfile.languages (string[] | null) already established
    // in the frontend model; avoids a second child table for a short,
    // unordered string list.
    languages: text('languages').array(),
    accountType: text('account_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // At most one partner profile per user — this is what makes the
    // approved "one User, both profiles" model precise: a second,
    // independent 0..1 relationship, not a union with customer_profiles.
    uniqueIndex('partner_profiles_user_id_unique').on(table.userId),
  ],
)

export type PartnerProfileRow = typeof partnerProfiles.$inferSelect
export type NewPartnerProfileRow = typeof partnerProfiles.$inferInsert

// ─── organizations ───────────────────────────────────────────────────────
// 12G-A audit concluded Organization (src/data/organization.ts) and
// CompanyInformation (src/data/companyInformation.ts) represent ONE
// conceptual business entity, not two — this is that single canonical
// table. Deliberately NOT included (documented, not omitted by oversight):
//   - `slug`, `status` (Organization) — cosmetic/lifecycle fields with no
//     real behavior anywhere yet; add when something actually reads them.
//   - `type` as a closed enum — Organization.OrganizationType (5 values)
//     and CompanyInformation.CompanyType (6 values, mostly different) are
//     two incompatible frontend taxonomies for the same slot. Rather than
//     guessing which one is "right", `type` is a plain nullable string
//     here, unconstrained at the DB level — reconciling the two taxonomies
//     is a frontend-wiring-phase decision, not a foundation-phase guess.
//   - `companyOwnerId`/`companyOwnerName`, `primaryContactName` — all
//     redundant with `ownerId` (resolved via a users/profile join) or
//     genuinely new "who to contact" nuance deferred to the frontend
//     migration phase, not load-bearing for the identity foundation itself.
//   - `yearEstablished`, `description` — optional business metadata with
//     no consumer yet; straightforward additive columns for later.
export const organizations = pgTable(
  'organizations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    // The authenticated user who created this organization — set only from
    // request.user.id server-side, never client-supplied (see
    // organization.service.ts). onDelete: 'restrict' — deleting an owning
    // user while they still own an organization is refused outright rather
    // than silently deleting the organization or leaving it ownerless;
    // this phase implements no ownership-transfer flow, so "refuse" is the
    // only safe choice until one exists.
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    type: text('type'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    location: text('location'),
    logoUrl: text('logo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [index('organizations_owner_id_idx').on(table.ownerId)],
)

export type OrganizationRow = typeof organizations.$inferSelect
export type NewOrganizationRow = typeof organizations.$inferInsert

// ─── organization_members ────────────────────────────────────────────────
// 12G-A audit found TWO incompatible, unused OrganizationMember
// definitions (src/data/organization.ts and src/data/teamSetup.ts) — this
// is the one canonical table replacing both. Role vocabulary adopts
// teamSetup.ts's richer set (never conflicts with anything: neither
// frontend definition backs real transactional data today, per the
// audit). Status vocabulary likewise adopts teamSetup.ts's set verbatim.
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 'owner' | 'admin' | 'project-manager' | 'team-member' | 'viewer'
    role: text('role').notNull(),
    // 'invited' | 'active' | 'suspended' | 'removed'
    status: text('status').notNull(),
    // Who invited this member, if anyone (the owner's own row has none).
    // onDelete: 'set null' — if the inviting user is later deleted, the
    // membership itself stays intact; only the "who invited them" trail
    // is cleared, never cascaded into deleting other people's membership.
    invitedBy: text('invited_by').references(() => users.id, { onDelete: 'set null' }),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // One user can belong to many organizations, but at most once each.
    uniqueIndex('organization_members_org_user_unique').on(table.organizationId, table.userId),
    index('organization_members_organization_id_idx').on(table.organizationId),
    index('organization_members_user_id_idx').on(table.userId),
  ],
)

export type OrganizationMemberRow = typeof organizationMembers.$inferSelect
export type NewOrganizationMemberRow = typeof organizationMembers.$inferInsert

// ─── projects ────────────────────────────────────────────────────────────
// 12H-A audit: maps to Project (src/data/projects.ts), which today has NO
// owner field at all — `ownerId` here is the one load-bearing addition this
// table makes over the frontend shape, set only from request.user.id
// server-side (see project.service.ts), never client-supplied. `type`
// stays a plain nullable string ('new-build' | 'renovation' in practice,
// per projects.ts's own ProjectType) rather than a DB enum, matching this
// schema's existing convention (see `organizations.type`'s own rationale)
// and because the frontend itself never enforces it as a closed union at
// the storage layer either. `stage` mirrors the frontend's own
// creation-time snapshot semantics exactly — resolveProjectStatus()'s LIVE
// status derivation (from bids/agreements/payments) stays entirely a
// frontend concern in this phase, never persisted here. onDelete:
// 'cascade' (not 'restrict' like organizations) — a project has no
// membership/ownership-transfer concept the way an organization does, so
// deleting its owning user should genuinely delete their projects, the
// same convention customer_profiles/partner_profiles/sessions already use.
//
// Houzeify 2.0 Module 03 — `organizationId` added, deliberately NULLABLE.
// Real inspection at migration time found 5 existing projects, all created
// through the homeowner New-Build/Renovation flows, none owned by a user
// who owns either of the 2 existing organizations — there is no confident
// backfill, so every existing row gets `organization_id = NULL` and stays
// exactly that: a project with a creator (`ownerId`) but no company. A
// project created from the new company/professional workspace sets both
// `ownerId` (the authenticated professional who created it — creator, not
// company) and `organizationId` (the company it belongs to); a homeowner's
// own project continues to set only `ownerId`, `organizationId` staying
// null, unchanged from today. onDelete: 'set null' (not 'cascade', and not
// organizations' own 'restrict') — deleting an organization should not
// destroy its projects' construction record, only detach them; this is a
// weaker relationship than ownerId's, which is why it fails safe by
// nulling rather than either deleting the project or blocking the delete.
//
// `status` and `timelineStart`/`timelineCompletion` added alongside it,
// same migration — genuinely missing, needed for the new company Create
// Project flow's Schedule section (§08), and non-destructive for the same
// reason (nullable, no backfill). `status` is a lifecycle state (planning/
// active/on-hold/completed/archived in practice) — a different axis from
// `stage`, which already exists and stays exactly what it always was: for
// a homeowner project, a pre-construction readiness snapshot ('requirements
// -completed', 'ready-build', ...); for a new company-created project, a
// real construction-phase id from constructionStages.ts's existing static
// taxonomy ('pre-construction', 'foundation', ...) — reusing that taxonomy,
// never a new stage enum. No DB enum for `status` either, same established
// convention as `type`/`stage`. `timelineStart`/`timelineCompletion` are
// plain text, matching house_requirements' own identically-named columns
// exactly (same convention: a frontend date-picker string, not a native
// Postgres date).
export const projects = pgTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    type: text('type'),
    location: text('location'),
    propertyType: text('property_type'),
    stage: text('stage'),
    status: text('status'),
    timelineStart: text('timeline_start'),
    timelineCompletion: text('timeline_completion'),
    summary: text('summary'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('projects_owner_id_idx').on(table.ownerId),
    // Backs the "list this owner's projects, most recently updated first"
    // query — the exact ordering ProjectsListScreen/getAllProjects() (and
    // the Home/Profile "most recent project" shortcut) already expect.
    index('projects_owner_id_updated_at_idx').on(table.ownerId, table.updatedAt),
    // Module 03 — same pair of indexes, mirrored for the new
    // organization-scoped "list this company's projects" query.
    index('projects_organization_id_idx').on(table.organizationId),
    index('projects_organization_id_updated_at_idx').on(table.organizationId, table.updatedAt),
  ],
)

export type ProjectRow = typeof projects.$inferSelect
export type NewProjectRow = typeof projects.$inferInsert

// ─── house_requirements ──────────────────────────────────────────────────
// 12H-C: maps to HouseRequirements (src/data/houseRequirements.ts) exactly
// — every field that module's own HouseRequirementsInput collects, no more,
// no less. Strictly 1:1 with a Project (uniqueIndex on project_id below),
// matching the frontend store's own "create-or-replace, never accumulate"
// semantics precisely — never versioned, unlike estimate_versions will be.
// No independent ownerId: ownership flows through project_id -> projects.
// owner_id, exactly like organization_members flows through
// organization_id -> organizations.owner_id. onDelete: 'cascade' — House
// Requirements have no meaning without their owning Project, so deleting
// the project deletes its requirements; there is no ownership-transfer
// concern here at all (unlike organizations), so cascade is unconditionally
// correct, not just the smaller-risk default.
//
// Types: plain integer for every count/area/budget field (this app never
// collects paise/decimal sq ft — every one of these is parsed via
// Number(<text input>) on the frontend today), boolean for the room flags,
// text[] for specialRequirements (same convention as partner_profiles.
// languages), plain text (no DB enum) for buildingType/floors/finishLevel —
// matching this schema's established "no native Postgres enum" rule
// (see organizations.type's own rationale); validated only at the Fastify
// schema layer against houseRequirements.ts's own existing option lists.
export const houseRequirements = pgTable(
  'house_requirements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    buildingType: text('building_type').notNull(),
    plotArea: integer('plot_area'),
    plotDimensions: text('plot_dimensions'),
    siteConditions: text('site_conditions'),
    builtUpArea: integer('built_up_area').notNull(),
    floors: text('floors').notNull(),
    bhk: text('bhk'),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    hasLivingRoom: boolean('has_living_room').notNull().default(true),
    hasDiningArea: boolean('has_dining_area').notNull().default(true),
    hasKitchen: boolean('has_kitchen').notNull().default(true),
    hasUtilityArea: boolean('has_utility_area').notNull().default(false),
    hasBalcony: boolean('has_balcony').notNull().default(false),
    hasStaircase: boolean('has_staircase').notNull().default(false),
    hasTerrace: boolean('has_terrace').notNull().default(false),
    parking: integer('parking'),
    finishLevel: text('finish_level').notNull(),
    specialRequirements: text('special_requirements').array(),
    budgetExpected: integer('budget_expected'),
    budgetMin: integer('budget_min'),
    budgetMax: integer('budget_max'),
    timelineStart: text('timeline_start'),
    timelineCompletion: text('timeline_completion'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    // Enforces the 1:1 relationship at the database level, not just in
    // application code — also the index the PUT upsert's ON CONFLICT
    // target relies on.
    uniqueIndex('house_requirements_project_id_unique').on(table.projectId),
  ],
)

export type HouseRequirementsRow = typeof houseRequirements.$inferSelect
export type NewHouseRequirementsRow = typeof houseRequirements.$inferInsert

// ─── daily_progress ──────────────────────────────────────────────────────
// Houzeify 2.0 Module 04 — a real, project-scoped record of "what happened
// on this project on a given day." `createdBy` is the authenticated user
// who logged it (not necessarily the project's own ownerId — any
// organization member with project access may create one; see
// dailyProgress.service.ts). `date` is a strict "YYYY-MM-DD" string,
// validated at the Fastify schema layer (dailyProgress.schemas.ts) —
// deliberately not a native Postgres date column, matching
// house_requirements.timeline_start's own established convention, but
// still format-validated (unlike that field) since future timelines/
// reports/AI summaries need a reliably parseable date. `stage` mirrors
// projects.stage's own no-DB-enum convention — validated against
// constructionStages.ts's existing 10-stage taxonomy at the schema layer,
// never a new taxonomy. onDelete: 'cascade' on project_id — a project's
// progress history has no meaning without its project, same convention
// house_requirements already uses.
export const dailyProgress = pgTable(
  'daily_progress',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    stage: text('stage'),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('daily_progress_project_id_idx').on(table.projectId),
    // Backs "this project's progress, most recent date first" — the
    // feed's own natural ordering.
    index('daily_progress_project_id_date_idx').on(table.projectId, table.date),
  ],
)

export type DailyProgressRow = typeof dailyProgress.$inferSelect
export type NewDailyProgressRow = typeof dailyProgress.$inferInsert

// ─── daily_progress_photos ───────────────────────────────────────────────
// Evidence metadata only — see documentUpload.ts's own header comment and
// this module's spec: no real file/blob storage exists anywhere in this
// codebase yet. `storageRef` is a placeholder reference
// (`internal://daily-progress-photos/<id>`), server-generated from this
// row's own id (dailyProgress.service.ts) — never a client-supplied
// value, and never named `storageUrl`, since it is not a real, retrievable
// URL. Mirrors businessVerification.ts's VerificationDocument precedent
// with corrected, honest naming.
export const dailyProgressPhotos = pgTable(
  'daily_progress_photos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    dailyProgressId: text('daily_progress_id')
      .notNull()
      .references(() => dailyProgress.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storageRef: text('storage_ref').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [index('daily_progress_photos_daily_progress_id_idx').on(table.dailyProgressId)],
)

export type DailyProgressPhotoRow = typeof dailyProgressPhotos.$inferSelect
export type NewDailyProgressPhotoRow = typeof dailyProgressPhotos.$inferInsert

// ─── construction_tasks ──────────────────────────────────────────────────
// Module 05 — planned/assigned work for a project. Mirrors daily_progress's
// shape exactly: text PK via randomUUID(), FK cascade to projects/users,
// project-scoped indexes. `status`/`priority` are plain text (no DB enum,
// same established convention as projects.stage/type) — validated at the
// Fastify schema layer, see constructionTasks.schemas.ts. `assignee_id` is
// `on delete set null` — deleting a user un-assigns their tasks rather than
// deleting the task or blocking the user's own deletion.
export const constructionTasks = pgTable(
  'construction_tasks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    stage: text('stage'),
    status: text('status').notNull().default('todo'),
    priority: text('priority'),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    dueDate: text('due_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('construction_tasks_project_id_idx').on(table.projectId),
    index('construction_tasks_project_id_status_idx').on(table.projectId, table.status),
  ],
)

export type ConstructionTaskRow = typeof constructionTasks.$inferSelect
export type NewConstructionTaskRow = typeof constructionTasks.$inferInsert

// ─── construction_issues ─────────────────────────────────────────────────
// Module 05 — problems/blockers/defects/observations for a project.
// `resolved_at` is SERVER-SET ONLY (constructionIssues.service.ts sets it
// exactly when a patch transitions status to 'resolved') — never a request
// body property on any schema, so there is nothing for a client to even
// attempt to pass through.
export const constructionIssues = pgTable(
  'construction_issues',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    reportedBy: text('reported_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    stage: text('stage'),
    status: text('status').notNull().default('open'),
    priority: text('priority'),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('construction_issues_project_id_idx').on(table.projectId),
    index('construction_issues_project_id_status_idx').on(table.projectId, table.status),
  ],
)

export type ConstructionIssueRow = typeof constructionIssues.$inferSelect
export type NewConstructionIssueRow = typeof constructionIssues.$inferInsert

// ─── project_workforce_members ──────────────────────────────────────────
// Module 06 — records which organization members are assigned to work on
// a specific project, with what trade/role, and whether the assignment is
// currently active. Deliberately NOT a new identity system: every row
// points at an existing users row, validated at the service layer to be
// an authorized participant of the project (org member or the project's
// own creator) — the exact same check construction_tasks/issues already
// use for assigneeId. A construction site's non-login labour force is
// explicitly out of scope (see spec §5).
export const projectWorkforceMembers = pgTable(
  'project_workforce_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Free-text trade/role label (e.g. 'Site Supervisor', 'Electrician').
    // No DB enum — same convention as projects.type/stage.
    role: text('role').notNull(),
    // 'active' | 'removed' — soft-removal only, never a hard delete, so
    // assignment history survives for a future Reports module.
    status: text('status').notNull().default('active'),
    addedBy: text('added_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    removedAt: timestamp('removed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => [
    index('project_workforce_members_project_id_idx').on(table.projectId),
    index('project_workforce_members_project_id_status_idx').on(table.projectId, table.status),
    // A user can only have ONE active assignment per project — re-adding
    // someone who was removed creates a new row rather than reactivating
    // the old one, preserving the removal in history.
    uniqueIndex('project_workforce_members_active_unique')
      .on(table.projectId, table.userId)
      .where(sql`${table.status} = 'active'`),
  ],
)

export type ProjectWorkforceMemberRow = typeof projectWorkforceMembers.$inferSelect
export type NewProjectWorkforceMemberRow = typeof projectWorkforceMembers.$inferInsert
