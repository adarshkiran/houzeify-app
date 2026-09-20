// ─── OTP delivery provider boundary ──────────────────────────────────────
// auth.service.ts depends only on this abstraction, never on MSG91
// directly — a future second provider (or a queue in front of one) is an
// additive change here, not a rewrite of the auth service.

import type { FastifyBaseLogger } from 'fastify'
import type { Env } from '../../config/env.js'
import { createDevOtpProvider } from './devOtpProvider.js'
import { createMsg91OtpProvider } from './msg91OtpProvider.js'

export interface OtpProvider {
  /** Deliver `otp` (plaintext) to `phoneNumberNormalized`. Must reject
   *  (never resolve) if delivery cannot be confirmed accepted by the
   *  provider — callers must never treat a resolved promise as anything
   *  less than "handed to the SMS provider". */
  sendOtp(phoneNumberNormalized: string, otp: string): Promise<void>
}

class OtpProviderNotConfiguredError extends Error {
  readonly statusCode = 502
  readonly code = 'OTP_PROVIDER_ERROR'
  constructor() {
    super('No OTP delivery provider is configured for this environment.')
    this.name = 'OtpProviderNotConfiguredError'
  }
}

/** Selects the OTP transport for this process, once, at startup:
 *  - MSG91 configured (MSG91_AUTH_KEY + MSG91_TEMPLATE_ID) -> real SMS,
 *    in every environment.
 *  - Not configured AND NODE_ENV === 'development' -> the dev-only,
 *    log-only provider (see devOtpProvider.ts) — never selected outside
 *    development.
 *  - Not configured anywhere else (test/production) -> a provider that
 *    always rejects. This backend never fakes a successful OTP send. */
export function createOtpProvider(env: Env, logger: FastifyBaseLogger): OtpProvider {
  if (env.MSG91_AUTH_KEY && env.MSG91_TEMPLATE_ID) {
    return createMsg91OtpProvider(env)
  }
  if (env.NODE_ENV === 'development') {
    return createDevOtpProvider(logger)
  }
  return {
    async sendOtp() {
      throw new OtpProviderNotConfiguredError()
    },
  }
}
