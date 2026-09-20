// ─── MSG91 OTP provider — the only file that knows about MSG91's API ──────
// 12C selected MSG91 for India OTP delivery. Send OTP API (v5), confirmed
// via MSG91's current docs at implementation time:
//   POST https://control.msg91.com/api/v5/otp
//     ?template_id=...&mobile=<countrycode><number>&otp=<our own OTP>
//   header: authkey: <MSG91_AUTH_KEY>
// We always pass our own `otp` value (never let MSG91 generate one) — this
// backend is the only place that ever hashes/verifies/expires the code, so
// the value it stores and the value it sends must be the same one.

import type { Env } from '../../config/env.js'
import type { OtpProvider } from './otpProvider.js'

const MSG91_OTP_URL = 'https://control.msg91.com/api/v5/otp'

export class Msg91ConfigurationError extends Error {
  readonly statusCode = 502
  readonly code = 'OTP_PROVIDER_ERROR'
  constructor(message: string) {
    super(message)
    this.name = 'Msg91ConfigurationError'
  }
}

export class Msg91DeliveryError extends Error {
  readonly statusCode = 502
  readonly code = 'OTP_PROVIDER_ERROR'
  constructor(message: string) {
    super(message)
    this.name = 'Msg91DeliveryError'
  }
}

interface Msg91Config {
  authKey: string
  templateId: string
  senderId: string | undefined
}

export function createMsg91OtpProvider(env: Env): OtpProvider {
  return {
    async sendOtp(phoneNumberNormalized, otp) {
      const config = requireMsg91Config(env)

      // MSG91 expects the number as <countrycode><number>, no leading "+".
      const mobile = phoneNumberNormalized.replace(/^\+/, '')

      const url = new URL(MSG91_OTP_URL)
      url.searchParams.set('template_id', config.templateId)
      url.searchParams.set('mobile', mobile)
      url.searchParams.set('otp', otp)
      url.searchParams.set('otp_length', String(otp.length))
      if (config.senderId) url.searchParams.set('sender', config.senderId)

      let response: Response
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { authkey: config.authKey, 'Content-Type': 'application/json' },
        })
      } catch (err) {
        // Never log the OTP. err here is a network-level failure only.
        throw new Msg91DeliveryError(`MSG91 request failed: ${err instanceof Error ? err.message : 'unknown error'}`)
      }

      if (!response.ok) {
        throw new Msg91DeliveryError(`MSG91 responded with HTTP ${response.status}`)
      }

      const body = (await response.json().catch(() => null)) as { type?: string; message?: string } | null
      if (!body || body.type !== 'success') {
        throw new Msg91DeliveryError(`MSG91 did not report success${body?.message ? `: ${body.message}` : ''}`)
      }
    },
  }
}

function requireMsg91Config(env: Env): Msg91Config {
  if (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID) {
    throw new Msg91ConfigurationError('MSG91 is not configured (MSG91_AUTH_KEY / MSG91_TEMPLATE_ID missing).')
  }
  return { authKey: env.MSG91_AUTH_KEY, templateId: env.MSG91_TEMPLATE_ID, senderId: env.MSG91_SENDER_ID }
}
