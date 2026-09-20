// ─── Phone normalization — single source of truth ───────────────────────────
// Every user lookup and OTP challenge operation must go through
// normalizePhoneNumber() so formatting differences (+91 98765 43210 vs
// 9876543210 vs +919876543210) never create two identities for one real
// phone number — the users table's own unique index also enforces this at
// the database level as a second line of defense.
//
// India-first by design (Houzeify is launching in India): only 10-digit
// Indian mobile numbers (starting 6-9) are accepted right now. Kept in this
// one isolated function specifically so international support can be added
// later without touching auth.service.ts, routes, or anything else that
// calls this function.

export class InvalidPhoneNumberError extends Error {
  readonly statusCode = 400
  readonly code = 'INVALID_PHONE'

  constructor(message: string) {
    super(message)
    this.name = 'InvalidPhoneNumberError'
  }
}

const INDIA_MOBILE_REGEX = /^[6-9]\d{9}$/

/** Returns the canonical `+91XXXXXXXXXX` form, or throws
 *  InvalidPhoneNumberError for anything that isn't a valid 10-digit Indian
 *  mobile number in any common input format. */
export function normalizePhoneNumber(raw: unknown): string {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new InvalidPhoneNumberError('Phone number is required.')
  }

  const digitsOnly = raw.replace(/\D/g, '')

  let national: string
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    national = digitsOnly.slice(2)
  } else if (digitsOnly.length === 10) {
    national = digitsOnly
  } else {
    throw new InvalidPhoneNumberError('Enter a valid 10-digit Indian mobile number.')
  }

  if (!INDIA_MOBILE_REGEX.test(national)) {
    throw new InvalidPhoneNumberError('Enter a valid 10-digit Indian mobile number.')
  }

  return `+91${national}`
}
