// ─── Organization rates + price resolution service — S26 ───────────────────

import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, organizationRateEntries } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import {
  getOrganizationForMember,
  ORGANIZATION_MUTATION_ROLES,
  type OrganizationMemberRole,
} from '../organizations/organization.service.js'
import { requireProjectAccess } from '../projects/projectAccess.js'
import {
  dayBefore,
  isAiReferencePricingConnected,
  isMarketReferenceConnected,
  resolvePriceFromCandidates,
  type RateCandidate,
} from './priceResolution.js'
import {
  resolvedRateToEstimateSnapshot,
  serializeOrganizationRateEntry,
  type CreateOrganizationRateInput,
  type EstimateRateSnapshot,
  type OrganizationRateEntryDto,
  type RateSourceType,
  type ResolveRateResult,
} from './priceIntelligence.types.js'

async function requireOrgMember(env: Env, organizationId: string, userId: string) {
  const org = await getOrganizationForMember(env, organizationId, userId)
  if (!org) throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  return org
}

async function requireOrgMutation(env: Env, organizationId: string, userId: string) {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, 'active'),
      ),
    )
    .limit(1)
  const membership = rows[0]
  if (!membership || !ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }
}

function rowToCandidate(row: typeof organizationRateEntries.$inferSelect): RateCandidate {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    ratePaise: row.ratePaise,
    currency: row.currency,
    sourceType: row.sourceType as RateSourceType,
    sourceReference: row.sourceReference,
    location: row.location,
    projectId: row.projectId,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    confidence: row.confidence,
  }
}

export async function listOrganizationRates(
  env: Env,
  organizationId: string,
  userId: string,
  opts?: { name?: string; kind?: string },
): Promise<OrganizationRateEntryDto[]> {
  await requireOrgMember(env, organizationId, userId)
  const db = getDb(env)
  const conditions = [eq(organizationRateEntries.organizationId, organizationId)]
  if (opts?.name?.trim()) {
    conditions.push(sql`lower(${organizationRateEntries.name}) = ${opts.name.trim().toLowerCase()}`)
  }
  if (opts?.kind) {
    conditions.push(eq(organizationRateEntries.kind, opts.kind))
  }
  const rows = await db
    .select()
    .from(organizationRateEntries)
    .where(and(...conditions))
    .orderBy(desc(organizationRateEntries.effectiveFrom), desc(organizationRateEntries.createdAt))
  return rows.map(serializeOrganizationRateEntry)
}

export async function createOrganizationRate(
  env: Env,
  organizationId: string,
  userId: string,
  input: CreateOrganizationRateInput,
): Promise<OrganizationRateEntryDto> {
  await requireOrgMember(env, organizationId, userId)
  await requireOrgMutation(env, organizationId, userId)

  const name = input.name.trim().replace(/\s+/g, ' ')
  const unit = input.unit.trim()
  if (!name || !unit) throw new HttpError('VALIDATION_ERROR', 'Name and unit are required.', 400)
  if (!Number.isInteger(input.ratePaise) || input.ratePaise <= 0) {
    throw new HttpError('VALIDATION_ERROR', 'ratePaise must be a positive integer.', 400)
  }

  let sourceType: RateSourceType = input.sourceType ?? 'organization_price_book'
  if (input.projectId) {
    sourceType = 'project_specific'
    const project = await requireProjectAccess(env, input.projectId, userId)
    if (project.organizationId !== organizationId) {
      throw new HttpError('NOT_FOUND', 'Project not found.', 404)
    }
  }

  if (sourceType === 'market_reference' && !isMarketReferenceConnected()) {
    throw new HttpError(
      'MARKET_REFERENCE_UNAVAILABLE',
      'Market reference data is not currently connected.',
      400,
    )
  }
  if (sourceType === 'ai_reference' && !isAiReferencePricingConnected()) {
    throw new HttpError(
      'AI_REFERENCE_UNAVAILABLE',
      'AI/reference pricing is not currently connected.',
      400,
    )
  }

  const db = getDb(env)
  const location = input.location?.trim() || null
  const projectId = input.projectId ?? null

  const openSiblings = await db
    .select()
    .from(organizationRateEntries)
    .where(
      and(
        eq(organizationRateEntries.organizationId, organizationId),
        sql`lower(${organizationRateEntries.name}) = ${name.toLowerCase()}`,
        sql`lower(${organizationRateEntries.unit}) = ${unit.toLowerCase()}`,
        projectId
          ? eq(organizationRateEntries.projectId, projectId)
          : isNull(organizationRateEntries.projectId),
        location
          ? sql`lower(${organizationRateEntries.location}) = ${location.toLowerCase()}`
          : isNull(organizationRateEntries.location),
        isNull(organizationRateEntries.effectiveTo),
      ),
    )

  for (const sibling of openSiblings) {
    if (sibling.effectiveFrom < input.effectiveFrom) {
      await db
        .update(organizationRateEntries)
        .set({
          effectiveTo: dayBefore(input.effectiveFrom),
          updatedAt: new Date(),
        })
        .where(eq(organizationRateEntries.id, sibling.id))
    }
  }

  const [row] = await db
    .insert(organizationRateEntries)
    .values({
      organizationId,
      projectId,
      kind: input.kind,
      name,
      unit,
      ratePaise: input.ratePaise,
      currency: (input.currency?.trim().toUpperCase() || 'INR').slice(0, 8),
      sourceType,
      sourceReference: input.sourceReference?.trim() || null,
      location,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo ?? null,
      confidence: input.confidence ?? null,
      createdBy: userId,
    })
    .returning()

  return serializeOrganizationRateEntry(row)
}

export async function resolveOrganizationPrice(
  env: Env,
  organizationId: string,
  userId: string,
  input: {
    name: string
    unit: string
    projectId?: string
    location?: string
    asOf?: string
  },
): Promise<ResolveRateResult> {
  await requireOrgMember(env, organizationId, userId)

  let location = input.location?.trim() || null
  if (input.projectId) {
    const project = await requireProjectAccess(env, input.projectId, userId)
    if (project.organizationId !== organizationId) {
      throw new HttpError('NOT_FOUND', 'Project not found.', 404)
    }
    if (!location) location = project.location ?? null
  }

  const asOf = input.asOf?.trim() || new Date().toISOString().slice(0, 10)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationRateEntries)
    .where(eq(organizationRateEntries.organizationId, organizationId))

  return resolvePriceFromCandidates(rows.map(rowToCandidate), {
    name: input.name,
    unit: input.unit,
    projectId: input.projectId,
    location,
    asOf,
  })
}

export function snapshotResolvedRateForEstimate(resolved: ResolveRateResult): EstimateRateSnapshot | null {
  if (!resolved.found) return null
  return resolvedRateToEstimateSnapshot(resolved)
}

export function getPriceIntelligenceSourceStatus() {
  return {
    projectRates: true,
    organizationPriceBook: true,
    historicalRates: true,
    marketReference: isMarketReferenceConnected(),
    aiReference: isAiReferencePricingConnected(),
  }
}

export const PRICE_INTELLIGENCE_CATALOG = {
  materials: [
    'Cement',
    'Steel',
    'Sand',
    'Aggregate',
    'AAC Blocks',
    'Bricks',
    'Tiles',
    'Paint',
    'Doors',
    'Windows',
  ],
  labour: ['Mason', 'Helper', 'Carpenter', 'Electrician', 'Plumber', 'Painter'],
} as const
