// ─── Fastify application factory ────────────────────────────────────────────
// server/index.ts owns process lifecycle (start/stop); this file only
// constructs and configures the Fastify instance itself — config, plugins,
// routes, nothing else. `/api/v1` carries the 12D health routes, the 12E
// auth routes (`/api/v1/auth/*`), the 12G-B identity/profile routes
// (`/api/v1/customer-profile`, `/api/v1/partner-profile`,
// `/api/v1/organizations`), the 12H-B project routes (`/api/v1/projects`),
// the 12H-C house requirements routes
// (`/api/v1/projects/:projectId/requirements`), and the Module 04 daily
// progress routes (`/api/v1/projects/:projectId/daily-progress`) — no
// other domain routes exist yet.

import Fastify, { type FastifyInstance } from 'fastify'
import { authRoutes } from './auth/auth.routes.js'
import type { Env } from './config/env.js'
import { registerCookies } from './plugins/cookie.js'
import { registerCors } from './plugins/cors.js'
import { registerErrorHandler } from './errors/errorHandler.js'
import { organizationRoutes } from './organizations/organization.routes.js'
import { customerProfileRoutes } from './profiles/customerProfile.routes.js'
import { partnerProfileRoutes } from './profiles/partnerProfile.routes.js'
import { projectRoutes } from './projects/project.routes.js'
import { houseRequirementsRoutes } from './projects/houseRequirements.routes.js'
import { dailyProgressRoutes } from './projects/dailyProgress.routes.js'
import { constructionTasksRoutes } from './projects/constructionTasks.routes.js'
import { constructionIssuesRoutes } from './projects/constructionIssues.routes.js'
import { projectDocumentsRoutes } from './projects/projectDocuments.routes.js'
import { projectWorkforceRoutes } from './projects/projectWorkforce.routes.js'
import { projectBoqRoutes } from './projects/projectBoq.routes.js'
import { projectEstimatesRoutes } from './projects/projectEstimates.routes.js'
import { planAnalysisRoutes } from './projects/planAnalysis.routes.js'
import { projectCustomerRoutes } from './projects/projectCustomer.routes.js'
import { customerViewRoutes } from './projects/customerView.routes.js'
import { constructionRecordRoutes } from './projects/constructionRecord.routes.js'
import { projectActivityRoutes } from './projects/projectActivity.routes.js'
import { healthRoutes } from './routes/health.js'

export async function buildApp(env: Env): Promise<FastifyInstance> {
  const app = Fastify({
    // Fastify's own structured (pino) logger — no separate logging
    // framework introduced. Verbose in development, quieter in production.
    logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' },
  })

  registerErrorHandler(app)
  await registerCors(app, env)
  await registerCookies(app)

  await app.register(
    async v1 => {
      await v1.register(healthRoutes, { env })
      await v1.register(authRoutes, { env, prefix: '/auth' })
      await v1.register(customerProfileRoutes, { env, prefix: '/customer-profile' })
      await v1.register(partnerProfileRoutes, { env, prefix: '/partner-profile' })
      await v1.register(organizationRoutes, { env, prefix: '/organizations' })
      await v1.register(projectRoutes, { env, prefix: '/projects' })
      await v1.register(houseRequirementsRoutes, { env, prefix: '/projects' })
      await v1.register(dailyProgressRoutes, { env, prefix: '/projects' })
      await v1.register(constructionTasksRoutes, { env, prefix: '/projects' })
      await v1.register(constructionIssuesRoutes, { env, prefix: '/projects' })
      await v1.register(projectWorkforceRoutes, { env, prefix: '/projects' })
      await v1.register(projectDocumentsRoutes, { env, prefix: '/projects' })
      await v1.register(projectBoqRoutes, { env, prefix: '/projects' })
      await v1.register(projectEstimatesRoutes, { env, prefix: '/projects' })
      await v1.register(planAnalysisRoutes, { env, prefix: '/projects' })
      await v1.register(projectCustomerRoutes, { env, prefix: '/projects' })
      await v1.register(customerViewRoutes, { env, prefix: '/projects' })
      await v1.register(constructionRecordRoutes, { env, prefix: '/projects' })
      await v1.register(projectActivityRoutes, { env, prefix: '/projects' })
    },
    { prefix: '/api/v1' },
  )

  return app
}
