// ─── Atmospheric Background ─────────────────────────────────────────────────
// The Houzeify atmospheric blur-gradient system — two large, solid-purple,
// heavily Gaussian-blurred circles at opposite corners, never competing with
// the interface. This is the shared implementation every per-screen
// "AmbientBackground" div-pair duplicates; nothing else duplicates this
// technique elsewhere.
//
// Converted from the approved reference SVG's cx/cy/r + feGaussianBlur to
// CSS position + `filter: blur()` on a solid circle: desktop opacity 0.3 /
// blur 400px, mobile opacity 0.2 / blur 200px, switching at the `lg`
// breakpoint — the same breakpoint this codebase already uses to tell
// mobile and desktop layouts apart.
//
// Decorative only: aria-hidden, pointer-events-none, absolutely positioned
// behind content (zIndex 0) — never interferes with text, controls, or
// focus states.

export type AtmosphericVariant = 'global' | 'ai' | 'build' | 'services' | 'progress' | 'dark'

export default function AtmosphericBackground({ variant: _variant = 'global' }: { variant?: AtmosphericVariant }) {
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
