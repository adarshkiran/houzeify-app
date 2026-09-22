// Local QA accounts for Module 08 live testing. Idempotent.
// Run: node --import tsx server/scripts/seedModule08TestAccounts.ts
// Login uses OTP from `pnpm server:dev` logs — there is no password.

import { eq } from 'drizzle-orm'
import { loadEnv } from '../config/env.js'
import { closeDb, getDb } from '../db/client.js'
import { organizations, users } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { createOrganization } from '../organizations/organization.service.js'
import { createCustomerProfile, updateCustomerProfile } from '../profiles/customerProfile.service.js'
import { createPartnerProfile } from '../profiles/partnerProfile.service.js'
import { createProject, listProjectsForOrganization } from '../projects/project.service.js'

export const M08_HOMEOWNER_PHONE = '9000000001'
export const M08_COMPANY_PHONE = '9000000002'
export const M08_HOMEOWNER_EMAIL = 'm08.homeowner@houzeify.test'
const ORG_NAME = 'M08 Test Builders'
const PROJECT_NAME = 'M08 Test Villa'

async function ensureUser(phoneNational: string) {
  const env = loadEnv()
  const db = getDb(env)
  const normalized = `+91${phoneNational}`
  const existing = await db.select().from(users).where(eq(users.phoneNumberNormalized, normalized)).limit(1)
  if (existing[0]) return existing[0]
  const created = await db
    .insert(users)
    .values({
      phoneNumber: normalized,
      phoneNumberNormalized: normalized,
      phoneVerifiedAt: new Date(),
    })
    .returning()
  const row = created[0]
  if (!row) throw new Error(`Failed to create user for ${normalized}`)
  return row
}

async function main() {
  const env = loadEnv()
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Copy .env and try again.')
  }

  const homeowner = await ensureUser(M08_HOMEOWNER_PHONE)
  try {
    await createCustomerProfile(env, homeowner.id, {
      fullName: 'Asha Homeowner',
      preferredName: 'Asha',
      email: M08_HOMEOWNER_EMAIL,
      location: 'Bengaluru',
    })
  } catch (err) {
    if (!(err instanceof HttpError && err.code === 'CUSTOMER_PROFILE_EXISTS')) throw err
    await updateCustomerProfile(env, homeowner.id, {
      fullName: 'Asha Homeowner',
      preferredName: 'Asha',
      email: M08_HOMEOWNER_EMAIL,
      location: 'Bengaluru',
    })
  }

  const professional = await ensureUser(M08_COMPANY_PHONE)
  try {
    await createPartnerProfile(env, professional.id, {
      professionalType: 'builder-construction-company',
      fullName: 'Vikram Builder',
      displayName: 'Vikram',
      accountType: 'organization',
      contactEmail: 'm08.company@houzeify.test',
    })
  } catch (err) {
    if (!(err instanceof HttpError && err.code === 'PARTNER_PROFILE_EXISTS')) throw err
  }

  const db = getDb(env)
  const orgs = await db.select().from(organizations).where(eq(organizations.ownerId, professional.id))
  let org = orgs.find(o => o.name === ORG_NAME)
  if (!org) {
    org = await createOrganization(env, professional.id, {
      name: ORG_NAME,
      type: 'construction-company',
      location: 'Bengaluru',
    })
  }

  const existingProjects = await listProjectsForOrganization(env, org.id, professional.id)
  let project = existingProjects.find(p => p.name === PROJECT_NAME)
  if (!project) {
    project = await createProject(env, professional.id, {
      name: PROJECT_NAME,
      organizationId: org.id,
      type: 'new-build',
      location: 'Whitefield, Bengaluru',
      propertyType: 'Villa',
      stage: 'foundation',
      status: 'active',
    })
  }

  console.log(
    JSON.stringify(
      {
        homeowner: {
          phone: M08_HOMEOWNER_PHONE,
          email: M08_HOMEOWNER_EMAIL,
          name: 'Asha Homeowner',
          userId: homeowner.id,
          afterOtp: 'Choose Build a New Home (homeowner).',
        },
        company: {
          phone: M08_COMPANY_PHONE,
          name: 'Vikram Builder',
          organization: org.name,
          organizationId: org.id,
          project: project.name,
          projectId: project.id,
          afterOtp: 'Choose I am a Construction Professional.',
        },
        inviteEmail: M08_HOMEOWNER_EMAIL,
        otp: 'Request OTP on login; copy the code from the pnpm server:dev log ([DEV-ONLY OTP]).',
      },
      null,
      2,
    ),
  )

  await closeDb()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
