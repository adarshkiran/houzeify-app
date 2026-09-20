// ─── Payments — typed data model + service ──────────────────────────────────
// UI demonstration data only — there is no backend or real payment gateway
// here; this is the seam a real payments API replaces, same convention as
// bids.ts/agreements.ts. Repo-wide search before writing this file found
// zero existing Payment model anywhere (only a document-category label
// string, same as agreements.ts's finding) — CheckoutScreen.tsx is a real,
// separate screen but for Home Services bookings only, with no reusable
// data module of its own to extend for a construction advance payment.

export type PaymentStatus = 'pending' | 'completed'

export interface Payment {
  id: string
  projectId: string
  agreementId: string
  amount: number
  status: PaymentStatus
  method: string
  referenceId: string
  createdAt: string
  paidAt: string | null
}

export interface CreatePaymentInput {
  projectId: string
  agreementId: string
  amount: number
  method: string
}

const allPayments: Payment[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `payment-${Date.now()}-${counter}`
}
function nextReferenceId(): string {
  return `HZF-PAY-${Date.now().toString(36).toUpperCase()}`
}

/** Creates a payment record, always status 'pending' — mirrors bids.ts's
 *  createBid()'s "always starts at the not-yet-final status" convention. */
export function createPayment(input: CreatePaymentInput): Payment {
  const payment: Payment = {
    id: nextId(),
    projectId: input.projectId,
    agreementId: input.agreementId,
    amount: input.amount,
    status: 'pending',
    method: input.method,
    referenceId: nextReferenceId(),
    createdAt: new Date().toISOString(),
    paidAt: null,
  }
  allPayments.push(payment)
  return payment
}

/** Marks a payment completed — the seam a real gateway webhook/redirect
 *  replaces. For development/testing this is the mock success path; there
 *  is no real gateway integrated here to call instead. */
export function completePayment(paymentId: string): Payment | undefined {
  const payment = allPayments.find(p => p.id === paymentId)
  if (!payment) return undefined
  payment.status = 'completed'
  payment.paidAt = new Date().toISOString()
  return payment
}

export function getPaymentsForProject(projectId: string): Payment[] {
  return allPayments.filter(p => p.projectId === projectId)
}
