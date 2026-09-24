import { useState, useEffect, useRef } from 'react'
import HIcon from '@/shared/components/HIcon'
import { useAuth } from '@/data/authState'
import { describeAuthError } from '@/data/authApi'

// ─── Ambient background — kept on the Splash → Account Created onboarding
// range only (Splash, Welcome, Login, OTP, Create Account, Account Created);
// removed from every other screen.

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
      {/* Desktop */}
      <div className="hidden lg:block absolute rounded-full" style={{ left: 176, bottom: 148, width: 392, height: 392, backgroundColor: 'var(--hz-primary)', opacity: 0.3, filter: 'blur(400px)' }} />
      <div className="hidden lg:block absolute rounded-full" style={{ right: 79, top: 42, width: 400, height: 400, backgroundColor: 'var(--hz-primary)', opacity: 0.3, filter: 'blur(400px)' }} />
      {/* Mobile */}
      <div className="lg:hidden absolute rounded-full" style={{ left: -121, bottom: -10, width: 311, height: 311, backgroundColor: 'var(--hz-primary)', opacity: 0.2, filter: 'blur(200px)' }} />
      <div className="lg:hidden absolute rounded-full" style={{ right: -105, top: 64, width: 265, height: 265, backgroundColor: 'var(--hz-primary)', opacity: 0.2, filter: 'blur(200px)' }} />
    </div>
  )
}

// ─── OTP box grid ─────────────────────────────────────────────────────────────

type OtpStage = 'idle' | 'verifying' | 'success' | 'error'

interface OtpInputProps {
  otp: string[]
  onChange: (otp: string[]) => void
  stage: OtpStage
  disabled: boolean
}

function OtpInput({ otp, onChange, stage, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const update = (index: number, digit: string) => {
    const next = [...otp]
    next[index] = digit
    onChange(next)
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1)
    update(index, d)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]; next[index] = ''; onChange(next)
      } else if (index > 0) {
        const next = [...otp]; next[index - 1] = ''; onChange(next)
        refs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = [...otp]
    text.split('').forEach((c, i) => { next[i] = c })
    onChange(next)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  const boxStyle = (index: number): string => {
    const filled = !!otp[index]
    if (stage === 'error') return 'border-[var(--hz-danger)] bg-[#FEF2F2] text-[var(--hz-danger)]'
    if (stage === 'success') return 'border-[var(--hz-success)] bg-[#F0FDF4] text-[var(--hz-success)]'
    if (filled) return 'border-[var(--hz-primary)] bg-[var(--hz-primary-soft)] text-[var(--hz-ink)]'
    return 'border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] focus:border-[var(--hz-primary)] focus:ring-2 focus:ring-[var(--hz-primary)]/10'
  }

  return (
    <div className="flex gap-2">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          disabled={disabled}
          className={[
            'flex-1 min-w-0 text-center text-[22px] sm:text-[24px] font-bold rounded-[12px] border outline-none',
            'transition-all duration-150 h-[52px] sm:h-[60px] caret-[var(--hz-primary)]',
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text',
            boxStyle(i),
          ].join(' ')}
          style={{ fontFamily: '"Geist Variable", sans-serif' }}
        />
      ))}
    </div>
  )
}

// ─── Resend timer ─────────────────────────────────────────────────────────────

function ResendTimer({ seconds, onResend, resending }: { seconds: number; onResend: () => void; resending: boolean }) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return (
    <div
      className="text-center text-[12px] text-[var(--hz-ink-subtle)]"
      style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
    >
      {seconds > 0 ? (
        <>
          Didn&apos;t receive the code?{' '}
          <span className="text-[var(--hz-border-strong)]">Resend in {pad(mm)}:{pad(ss)}</span>
        </>
      ) : (
        <>
          Didn&apos;t receive the code?{' '}
          <button
            onClick={onResend}
            disabled={resending}
            className="text-[var(--hz-primary)] font-semibold bg-transparent border-none p-0 hover:underline disabled:opacity-60 disabled:cursor-wait disabled:no-underline"
            style={{ cursor: resending ? 'wait' : 'pointer' }}
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Screen 004 — OTP Verification ───────────────────────────────────────────

export default function OtpScreen({
  phone = '98765 43210',
  onNavigate,
}: {
  phone?: string
  onNavigate: (screen: string) => void
}) {
  const { requestOtp, verifyOtp } = useAuth()
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [stage, setStage] = useState<OtpStage>('idle')
  const [timer, setTimer] = useState(28)
  const [errorMsg, setErrorMsg] = useState('')
  const [resending, setResending] = useState(false)

  const isComplete = otp.every(d => d !== '')

  // Countdown
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [timer])

  const handleOtpChange = (next: string[]) => {
    setOtp(next)
    if (stage === 'error') { setStage('idle'); setErrorMsg('') }
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    setErrorMsg('')
    try {
      // The backend remains authoritative on throttling (see
      // OTP_REQUEST_COOLDOWN_SECONDS, server/auth/) — this 28s countdown is
      // UX pacing only; a resend the backend isn't ready for yet still
      // comes back here as a normal, safe error message.
      await requestOtp(phone)
      setTimer(28)
      setOtp(Array(6).fill(''))
      setStage('idle')
    } catch (err) {
      setStage('error')
      setErrorMsg(describeAuthError(err))
    } finally {
      setResending(false)
    }
  }

  const handleVerify = async () => {
    if (!isComplete || stage === 'verifying' || stage === 'success') return
    setStage('verifying')
    setErrorMsg('')

    try {
      await verifyOtp(phone, otp.join(''))
    } catch (err) {
      setStage('error')
      setErrorMsg(describeAuthError(err))
      return
    }

    setStage('success')
    await new Promise(r => setTimeout(r, 900))
    // TABLE C: routing to 'create-account' unconditionally forced every
    // returning user through the onboarding chain on every login. 'splash'
    // now does the real routing (App.tsx's splash effect resolves the
    // authenticated user's real customer/partner profile status and lands
    // them on their real home, or on 'account-created' only if neither
    // profile exists yet).
    onNavigate('splash')
  }

  const buttonLabel = () => {
    if (stage === 'verifying') return null
    if (stage === 'success') return 'Verified ✓'
    return 'Verify & Continue →'
  }

  const buttonBg = stage === 'success' ? 'var(--hz-success)' : 'var(--hz-primary)'

  return (
    <div
      className="min-h-full flex flex-col items-center justify-center relative px-5 py-10"
      style={{ backgroundColor: 'var(--hz-surface)' }}
    >
      <AmbientBackground />

      {/* ── Authentication card ── */}
      <div
        className="relative z-10 w-full bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[24px]"
        style={{
          maxWidth: 460,
          padding: 'clamp(24px, 5vw, 48px)',
          boxShadow: '0 8px 40px rgba(36,35,38,0.07)',
          animation: 'welcomeFadeUp 0.45s ease-out both',
        }}
      >
        {/* H icon */}
        <div className="flex justify-center mb-5">
          <HIcon size={48} />
        </div>

        {/* Eyebrow */}
        <div
          className="text-center text-[12px] tracking-[0.12em] text-[var(--hz-primary)] font-semibold uppercase mb-3"
          style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          Verify Your Number
        </div>

        {/* Headline */}
        <h1
          className="text-center text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.06] tracking-[-0.02em] m-0 mb-3"
          style={{ fontFamily: '"Geist Variable", sans-serif' }}
        >
          Enter your verification code
        </h1>

        {/* Description + phone */}
        <div className="flex flex-col items-center gap-1 mb-7">
          <p
            className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 text-center"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            We sent a 6-digit code to
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-[14px] sm:text-[15px] font-semibold text-[var(--hz-ink)]"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              +91 {phone}
            </span>
            <button
              onClick={() => onNavigate('login')}
              className="text-[13px] text-[var(--hz-primary)] font-medium cursor-pointer bg-transparent border-none p-0 hover:underline transition-opacity hover:opacity-80"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              Change
            </button>
          </div>
        </div>

        {/* OTP boxes */}
        <div className="mb-4">
          <OtpInput
            otp={otp}
            onChange={handleOtpChange}
            stage={stage}
            disabled={stage === 'verifying' || stage === 'success'}
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            className="flex items-center justify-center gap-1.5 text-[var(--hz-danger)] text-[12px] mb-3"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="var(--hz-danger)" strokeWidth="1.2"/>
              <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="var(--hz-danger)" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="0.7" fill="var(--hz-danger)"/>
            </svg>
            {errorMsg}
          </div>
        )}

        {/* Resend timer */}
        <div className="mb-6">
          <ResendTimer seconds={timer} onResend={handleResend} resending={resending} />
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || stage === 'verifying' || stage === 'success'}
          className={[
            'w-full h-[52px] rounded-[12px] text-white text-[14px] font-semibold',
            'flex items-center justify-center gap-2 transition-all duration-200 mb-4',
            !isComplete && stage !== 'verifying' && stage !== 'success'
              ? 'opacity-50 cursor-not-allowed'
              : stage === 'verifying' || stage === 'success'
              ? 'cursor-default'
              : 'cursor-pointer hover:brightness-90 active:scale-[0.99]',
          ].join(' ')}
          style={{ backgroundColor: buttonBg, fontFamily: '"Inter Variable", sans-serif' }}
        >
          {stage === 'verifying' ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Verifying...
            </>
          ) : (
            buttonLabel()
          )}
        </button>

        {/* Security microcopy */}
        <p
          className="text-center text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          Your number is used to securely access your Houzeify workspace.
        </p>
      </div>

      {/* Footer signature */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 mt-8">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span
              className="text-[12px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]"
              style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
            >
              {item}
            </span>
            {i < arr.length - 1 && (
              <span
                className="text-[12px] text-[var(--hz-primary)]"
                style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
              >
                /
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
