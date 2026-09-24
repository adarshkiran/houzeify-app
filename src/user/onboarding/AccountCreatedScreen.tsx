import HIcon from '@/shared/components/HIcon'
import { roleForIntent, nextScreenForIntent } from '@/data/primaryIntent'

// ─── Ambient background ───────────────────────────────────────────────────────

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

// ─── Success badge ────────────────────────────────────────────────────────────

function SuccessBadge() {
  return (
    <div
      className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border-[2.5px] border-white"
      style={{
        width: 26,
        height: 26,
        backgroundColor: 'var(--hz-success)',
        animation: 'successBadgePop 0.38s cubic-bezier(0.34,1.56,0.64,1) 0.60s both',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path
          d="M2.2 5.5L4.4 7.7L8.8 3.3"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ─── H icon with glow ─────────────────────────────────────────────────────────

function IconWithGlow({ size }: { size: number }) {
  return (
    <div
      className="relative"
      style={{ animation: 'successIconReveal 0.4s ease-out 0.28s both' }}
    >
      {/* Soft lavender glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: '-70%',
          background: 'radial-gradient(circle at center, var(--hz-primary-soft) 0%, transparent 68%)',
          filter: 'blur(12px)',
        }}
      />
      <HIcon size={size} shadow />
      <SuccessBadge />
    </div>
  )
}

// ─── Screen 006 — Account Created ────────────────────────────────────────────

export default function AccountCreatedScreen({
  onNavigate,
  fullName,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  fullName?: string
}) {
  return (
    <div
      className="min-h-full flex flex-col items-center justify-between relative px-5 py-10"
      style={{ backgroundColor: 'var(--hz-surface)' }}
    >
      <AmbientBackground />

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Central success group ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 text-center max-w-[440px] w-full">

        {/* H icon with glow + badge */}
        <div className="mb-2">
          <IconWithGlow size={72} />
        </div>

        {/* Eyebrow */}
        <div
          className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold"
          style={{
            fontFamily: '"Sometype Mono:SemiBold", monospace',
            animation: 'welcomeFadeUp 0.4s ease-out 0.42s both',
          }}
        >
          Account Created
        </div>

        {/* Headline */}
        <h1
          className="text-[34px] sm:text-[48px] font-semibold text-[var(--hz-ink)] leading-[1.04] tracking-[-0.025em] m-0"
          style={{
            fontFamily: '"Geist Variable", sans-serif',
            animation: 'welcomeFadeUp 0.4s ease-out 0.50s both',
          }}
        >
          You&apos;re all set.
        </h1>

        {/* Description */}
        <p
          className="text-[15px] sm:text-[16px] text-[var(--hz-ink-muted)] leading-[1.7] m-0 max-w-[320px]"
          style={{
            fontFamily: '"Inter Variable", sans-serif',
            animation: 'welcomeFadeUp 0.4s ease-out 0.56s both',
          }}
        >
          Your Houzeify workspace is ready.<br />
          Let&apos;s set up your experience.
        </p>

        {/* Success status pill */}
        <div
          className="flex items-center gap-2"
          style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.62s both' }}
        >
          <div
            className="flex items-center justify-center size-[18px] rounded-full shrink-0"
            style={{ backgroundColor: 'rgba(22,163,74,0.12)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="var(--hz-success)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span
            className="text-[13px] font-medium text-[var(--hz-primary)]"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Account created successfully
          </span>
        </div>

        {/* CTA button */}
        <div
          className="flex flex-col items-center gap-3 w-full"
          style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.70s both' }}
        >
          {/* Profile & Location now live here, right after signup — once,
              for every new customer, regardless of which journey they pick
              afterward (Build New, Improve My Home, Home Services). Reuses
              the existing onboarding-style Profile/Location screens
              (homeowner-profile / location-setup) via the same
              onboarding_flow flag PrimaryIntentScreen/BuildOrImproveScreen
              already use — no new screens. "Skip" bypasses straight to
              Customer Home for anyone who'd rather fill this in later
              (Screens 007-011 stay fully intact as existing routes for any
              journey that still needs them, e.g. Screen 007's own "Build a
              New Home" card). */}
          <button
            onClick={() => onNavigate('homeowner-profile', { onboarding_flow: 'true', full_name: fullName ?? '' })}
            className="h-[52px] bg-[var(--hz-primary)] text-white text-[14px] font-semibold rounded-[12px] cursor-pointer transition-all duration-200 hover:brightness-90 active:scale-[0.99] flex items-center justify-center w-full sm:w-[260px]"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Go to Houzeify →
          </button>

          <button
            onClick={() => onNavigate('dashboard-home')}
            className="text-[13px] text-[var(--hz-ink-subtle)] bg-transparent border-none cursor-pointer hover:text-[var(--hz-ink-muted)] transition-colors duration-200"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Skip
          </button>

          {/* Flow 05 — Partner Authentication & Entry: the only place a
              brand-new signup could reach the professional path
              (PrimaryIntentScreen's own "I'm a Construction Professional"
              card) was orphaned once this screen started sending every new
              signup straight into the homeowner Profile/Location chain
              above. This is the smallest fix — a secondary link, not a new
              screen or a detour inserted into the homeowner path — that
              sets role the exact same way selecting that card would
              (roleForIntent/nextScreenForIntent, both untouched, reused
              as-is) and goes straight to the real, already-working
              Professional Type → Account Type → Partner Dashboard chain. */}
          <button
            onClick={() => onNavigate(nextScreenForIntent('professional'), { role: roleForIntent('professional') })}
            className="text-[12.5px] text-[var(--hz-primary)] font-medium bg-transparent border-none cursor-pointer hover:underline transition-colors duration-200"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            I&apos;m a professional / business →
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Footer signature ── */}
      <div
        className="relative z-10 flex items-center justify-center gap-2.5"
        style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.80s both' }}
      >
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
