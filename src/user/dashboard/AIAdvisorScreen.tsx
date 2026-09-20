import { useState, useRef, useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  isHomeownerIntent,
  projectStageLabel,
  DASHBOARD_ROUTES,
  type HomeownerDashboardState,
} from '@/data/homeownerDashboard'
import {
  type Message,
  createConversation,
  createMessage,
  getContextSummary,
  getAdvisorReply,
  SUGGESTED_QUESTIONS,
  type AdvisorAction,
} from '@/data/aiAdvisor'
import Sidebar from '@/shared/components/Sidebar'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReplyState = 'idle' | 'thinking' | 'error'

// ─── Sidebar Icons ────────────────────────────────────────────────────────────

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/><path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z"/>
    <path d="M14 12l.9 1.9 1.6.6-1.6.6-.9 1.9-.9-1.9-1.6-.6 1.6-.6.9-1.9z" strokeWidth="1.2"/>
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z"/>
  </svg>
)
const IcoBOQ = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="5" x2="15" y2="5"/>
    <circle cx="3.5" cy="9" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="9" x2="15" y2="9"/>
    <circle cx="3.5" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="13" x2="15" y2="13"/>
  </svg>
)
const IcoPlan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2"/>
    <line x1="2" y1="7.5" x2="16" y2="7.5"/>
    <line x1="7.5" y1="7.5" x2="7.5" y2="16"/>
  </svg>
)
const IcoCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <rect x="5.5" y="4.5" width="7" height="2.5" rx="0.5"/>
    <circle cx="6" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="6" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5"/>
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06"/>
  </svg>
)
const IcoBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <line x1="1.5" y1="14.5" x2="14.5" y2="14.5"/>
    <line x1="3" y1="14.5" x2="3" y2="8"/><line x1="7" y1="14.5" x2="7" y2="4"/><line x1="11" y1="14.5" x2="11" y2="7"/><line x1="13.5" y1="14.5" x2="13.5" y2="1.5"/>
  </svg>
)
const IcoList = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="3" cy="5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6" y1="5" x2="14" y2="5"/>
    <circle cx="3" cy="9" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6" y1="9" x2="14" y2="9"/>
    <circle cx="3" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6" y1="13" x2="14" y2="13"/>
  </svg>
)
const IcoCalcSm = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
    <rect x="4.5" y="3.5" width="7" height="2.5" rx="0.5"/>
    <circle cx="5.5" cy="9" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="9" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="9" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="5.5" cy="12" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="12" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="12" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoPlanSm = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="2" y="2" width="12" height="12" rx="1.5"/>
    <line x1="2" y1="6.5" x2="14" y2="6.5"/>
    <line x1="6.5" y1="6.5" x2="6.5" y2="14"/>
  </svg>
)
const IcoAttachment = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 9.5l-6.5 6.5A5 5 0 011.5 9L9 1.5a3.5 3.5 0 015 5L7 13.5a2 2 0 01-2.8-2.8L11 4"/>
  </svg>
)
const IcoSend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 2L2 7.5l5 1.5L9.5 14 14 2z" fill="white"/>
    <path d="M7 9l4-7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="7" x2="12" y2="7"/><path d="M8 3l4 4-4 4"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#722ED1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5"/>
  </svg>
)
const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L4 8l6 5"/>
  </svg>
)
const IcoHomePin = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 6.5L7 2l5.5 4.5"/>
    <path d="M3 5.5V12h8V5.5"/>
  </svg>
)

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active
          ? 'bg-[#F3EAFF] text-[#722ED1]'
          : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        {label}
      </span>
    </button>
  )
}

// ─── Sidebar — existing app-wide nav, kept as-is for consistency ─────────────

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.



// ─── AI Advisor Header — ← Back / Hozie / AI Home Advisor / + New conversation ─

function AIAdvisorHeader({ onBack, onNew }: { onBack: () => void; onNew: () => void }) {
  return (
    <header className="shrink-0 flex items-center justify-between px-4 sm:px-5 lg:px-8 bg-white border-b border-[#E3DDD7]" style={{ height: 64 }}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          aria-label="Back to your dashboard"
          className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"
        >
          <IcoBack />
        </button>
        <div className="w-10 h-10 rounded-[12px] bg-[#F3EAFF] flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 0 1px rgba(243,234,255,0.10)' }}>
          <HIcon size={26} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[15px] font-semibold text-[#242326] leading-none truncate" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Hozie</span>
          <span className="text-[11px] tracking-[0.08em] text-[#722ED1] leading-none" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>AI HOME ADVISOR</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer bg-transparent"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          <IcoPlus />
          <span className="hidden sm:inline">New conversation</span>
        </button>
      </div>
    </header>
  )
}

// ─── Context bar — real project/intent state, never invented ────────────────

function ContextBar({ primaryLabel, locationLabel, intentLabel }: { primaryLabel: string; locationLabel?: string; intentLabel: string }) {
  return (
    <div className="shrink-0 border-b border-[#E3DDD7] bg-[#FFFFFF] px-4 sm:px-5 lg:px-8 py-2.5 flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1.5 text-[12.5px] text-[#242326] font-medium" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        <IcoHomePin /> {primaryLabel}
        {locationLabel && <span className="text-[#9A949D] font-normal"> · {locationLabel}</span>}
      </span>
      <span className="text-[11.5px] font-semibold text-[#722ED1] bg-[#F3EAFF] px-2.5 py-1 rounded-full" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        {intentLabel}
      </span>
    </div>
  )
}

// ─── Suggested question ───────────────────────────────────────────────────────

function SuggestedPrompt({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3 rounded-[12px] border border-[#E3DDD7] bg-white text-[13.5px] text-[#242326] hover:bg-[#F9F5FF] hover:border-[#722ED1] cursor-pointer transition-all outline-none"
      style={{ fontFamily: '"Open Sans:Regular", sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {label}
    </button>
  )
}

// ─── Message content renderer — plain text with lightweight bullets/steps ────

function renderMessageContent(content: string): React.ReactNode {
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^-\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^-\s+/.test(lines[i])) { items.push(lines[i].replace(/^-\s+/, '')); i++ }
      blocks.push(<ul key={key++} className="m-0 pl-4 flex flex-col gap-1 list-disc">{items.map((it, idx) => <li key={idx}>{it}</li>)}</ul>)
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s+/, '')); i++ }
      blocks.push(<ol key={key++} className="m-0 pl-4 flex flex-col gap-1 list-decimal">{items.map((it, idx) => <li key={idx}>{it}</li>)}</ol>)
      continue
    }
    if (line.trim().length === 0) { i++; continue }
    blocks.push(<p key={key++} className="m-0">{line}</p>)
    i++
  }
  return <div className="flex flex-col gap-2">{blocks}</div>
}

// ─── Hozie Message ────────────────────────────────────────────────────────────

function HozieMessage({ content, actions, onAction }: {
  content: string
  actions?: AdvisorAction[]
  onAction: (action: AdvisorAction) => void
}) {
  return (
    <div className="flex gap-3 items-start" style={{ animation: 'welcomeFadeUp 0.35s ease-out both' }} role="group" aria-label="Hozie">
      <div className="w-8 h-8 rounded-[10px] bg-[#F3EAFF] flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
        <HIcon size={20} />
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex flex-col gap-1.5">
          <span className="sr-only">Hozie:</span>
          <div className="text-[15px] text-[#242326] leading-[1.7]" style={{ fontFamily: '"Google Sans Flex:Medium", sans-serif' }}>
            {renderMessageContent(content)}
          </div>
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {actions.map(a => (
              <button
                key={a.label}
                onClick={() => onAction(a)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F3EAFF] hover:border-[#722ED1] hover:text-[#722ED1] transition-all cursor-pointer bg-white"
                style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── User Message ─────────────────────────────────────────────────────────────

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end" style={{ animation: 'welcomeFadeUp 0.3s ease-out both' }}>
      <span className="sr-only">You:</span>
      <div
        className="max-w-[75%] px-4 py-3 rounded-[16px] rounded-br-[4px] text-[14px] text-[#242326] leading-[1.65] whitespace-pre-wrap"
        style={{ backgroundColor: '#F9F5FF', fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {content}
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start" aria-live="polite">
      <div className="w-8 h-8 rounded-[10px] bg-[#F3EAFF] flex items-center justify-center shrink-0 mt-0.5" style={{ animation: 'aiIconGlow 1.8s ease-in-out infinite' }} aria-hidden="true">
        <HIcon size={20} />
      </div>
      <div className="flex items-center gap-2 py-2.5 px-4 rounded-[14px] bg-white border border-[#E3DDD7]">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-[#722ED1] block" style={{ animation: `hozieStatusPulse 1.2s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
        <span className="text-[12px] text-[#722ED1] ml-1" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie is thinking...</span>
      </div>
    </div>
  )
}

// ─── Error bubble — preserves the user's message, offers retry ──────────────

function ErrorBubble({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex gap-3 items-start" role="alert">
      <div className="w-8 h-8 rounded-[10px] bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
        <HIcon size={20} />
      </div>
      <div className="flex flex-col gap-2.5 py-2.5 px-4 rounded-[14px] bg-white border border-[#E3DDD7]">
        <p className="m-0 text-[14px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          I couldn&apos;t complete that response.<br />Please try again.
        </p>
        <button
          onClick={onRetry}
          className="self-start h-8 px-3 rounded-[8px] bg-[#722ED1] text-white text-[12px] font-medium cursor-pointer hover:brightness-90 border-0"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

// ─── Chat Composer ────────────────────────────────────────────────────────────

function ChatComposer({ value, onChange, onSubmit, onAttach, disabled }: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onAttach: () => void
  disabled?: boolean
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (value.trim()) { e.preventDefault(); onSubmit() }
    }
  }
  return (
    <div className="shrink-0 flex flex-col gap-2 px-4 pb-4 pt-3 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF] to-transparent" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div
        className="flex items-end gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-4 py-2.5 focus-within:border-[#722ED1] focus-within:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: 56 }}
      >
        <div className="shrink-0 flex items-center justify-center opacity-50 h-9">
          <HIcon size={20} />
        </div>
        <textarea
          rows={1}
          placeholder="Ask Hozie anything about your home..."
          aria-label="Ask Hozie anything about your home"
          className="flex-1 bg-transparent outline-none resize-none text-[14px] text-[#242326] placeholder-[#9A949D] py-2 leading-[1.5]"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif', maxHeight: 120 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
        />
        <div className="flex items-center gap-1.5 h-9">
          <button
            onClick={onAttach}
            aria-label="Upload your house plan"
            title="Upload plan"
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#9A949D] hover:text-[#68636D] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent"
          >
            <IcoAttachment />
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            aria-label="Send message to Hozie"
            className={[
              'w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-150 border-0',
              value.trim() && !disabled
                ? 'bg-[#722ED1] cursor-pointer hover:brightness-90 active:scale-95'
                : 'bg-[#F4F0EC] cursor-not-allowed',
            ].join(' ')}
          >
            <IcoSend />
          </button>
        </div>
      </div>
      <p className="text-center text-[11.5px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Hozie can make mistakes. Review important estimates before making decisions.
      </p>
    </div>
  )
}

// ─── New conversation confirmation ────────────────────────────────────────────

function NewConversationModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ backgroundColor: 'rgba(36,35,38,0.4)' }} role="dialog" aria-modal="true" aria-labelledby="new-convo-title">
      <div className="w-full max-w-[380px] bg-white rounded-[18px] p-6 flex flex-col gap-4" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 id="new-convo-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Start a new conversation?
        </h3>
        <p className="text-[13.5px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          Starting a new conversation won&apos;t affect your projects or data.
        </p>
        <div className="flex gap-2.5 justify-end mt-1">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] bg-white text-[#68636D] text-[13px] font-medium cursor-pointer hover:bg-[#F4F0EC] transition-all"
            style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 px-4 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0"
            style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          >
            Start new
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Right Context Panel — real project state, real navigation ──────────────

function RightContextPanel({
  state, onNavigate,
}: {
  state: HomeownerDashboardState
  onNavigate: (s: string) => void
}) {
  const known = [
    state.city ? 'Location' : null,
    'Primary intent',
    state.hasProject ? 'Project details' : null,
  ].filter((x): x is string => Boolean(x))

  const tools = [
    { label: 'View Estimate', icon: <IcoBarChart />, dest: DASHBOARD_ROUTES.estimateDashboard },
    { label: 'Material Calculator', icon: <IcoCalcSm />, dest: 'material-calculator' },
    { label: 'View BOQ', icon: <IcoList />, dest: DASHBOARD_ROUTES.boqOverview },
    { label: 'Plan Analysis', icon: <IcoPlanSm />, dest: DASHBOARD_ROUTES.uploadPlan },
  ]

  return (
    <aside className="hidden xl:flex flex-col shrink-0 overflow-y-auto gap-4 p-4 border-l border-[#E3DDD7] bg-white" style={{ width: 296, scrollbarWidth: 'none' }}>
      <div className="flex flex-col gap-3">
        <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
          Project Context
        </span>
        <div className="rounded-[14px] border border-[#E3DDD7] bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E3DDD7]">
            <span className="text-[12px] tracking-[0.06em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
              {state.hasProject ? 'Current Project' : 'Status'}
            </span>
          </div>
          <div className="px-4 py-3.5 flex flex-col gap-2.5">
            <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
              {state.hasProject ? state.projectName : 'No project yet'}
            </p>
            {[
              state.hasProject && state.projectLocation ? ['Location', state.projectLocation] : null,
              state.hasProject ? ['Status', projectStageLabel(state.projectStage) ?? '—'] : null,
            ].filter((r): r is [string, string] => Boolean(r)).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{k}</span>
                <span
                  className={k === 'Status' ? 'text-[11px] text-[#722ED1] bg-[#F3EAFF] px-2 py-0.5 rounded-full font-medium' : 'text-[11px] text-[#242326]'}
                  style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Knows</span>
        <div className="flex flex-col gap-2">
          {known.map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#F3EAFF] flex items-center justify-center shrink-0"><IcoCheck /></div>
              <span className="text-[12px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E3DDD7]" />

      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Tools</span>
        <div className="flex flex-col gap-0.5">
          {tools.map(tool => (
            <button
              key={tool.label}
              onClick={() => onNavigate(tool.dest)}
              className="flex items-center gap-3 h-10 px-3 rounded-[10px] border-0 bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] cursor-pointer transition-all text-left"
            >
              <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[#9A949D]">{tool.icon}</span>
              <span className="flex-1 text-[13px]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{tool.label}</span>
              <span className="text-[#CAC7C6]"><IcoArrow /></span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────

function MobileTopBar({ onBack, onNew }: { onBack: () => void; onNew: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-3 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-1.5 min-w-0">
        <button onClick={onBack} aria-label="Back to your dashboard" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer shrink-0">
          <IcoBack />
        </button>
        <div className="w-8 h-8 rounded-[10px] bg-[#F3EAFF] flex items-center justify-center shrink-0"><HIcon size={22} /></div>
        <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Hozie</span>
      </div>
      <button onClick={onNew} aria-label="New conversation" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer shrink-0"><IcoPlus /></button>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
// Screen 013 — AI Advisor. Reuses Screen 012's intent typing, routing table
// and next-action ladder rather than a second, competing system.

export default function AIAdvisorScreen({
  onNavigate,
  primaryIntent,
  preferredName,
  fullName,
  city,
  state,
  projectName,
  projectLocation,
  projectStage,
  initialQuery,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  primaryIntent?: string
  preferredName?: string
  fullName?: string
  city?: string
  state?: string
  projectName?: string
  projectLocation?: string
  projectStage?: string
  initialQuery?: string
}) {
  const resolvedIntent = isHomeownerIntent(primaryIntent) ? primaryIntent : 'build-home'
  // Customer Implementation 09G — real onboarding identity only, same
  // resolution chain as Home (09B): preferred_name → first word of
  // full_name → neutral. Never the hardcoded homeownerProfile demo person.
  // The one place this value surfaces is getContextSummary's possessive
  // "{name}'s {project}" label in the context bar, so the neutral fallback
  // is the generic 'Homeowner' (the exact word getContextSummary already
  // uses when there is no project) rather than '' — never a fabricated name.
  const displayName = preferredName?.trim() || fullName?.trim().split(' ')[0] || 'Homeowner'

  // improve-home / home-service used to surface the most-recent RFQ
  // ServiceRequest here; that flow has been removed, so those branches carry
  // no project name / location.

  const dashboardState: HomeownerDashboardState = {
    primaryIntent: resolvedIntent,
    preferredName: displayName,
    city,
    state,
    hasProject: Boolean(projectName),
    projectName: resolvedIntent === 'build-home' ? projectName : undefined,
    projectLocation: resolvedIntent === 'build-home' ? (projectLocation ?? city) : undefined,
    projectStage: resolvedIntent === 'build-home' ? projectStage : undefined,
    hasPlan: false,
    hasEstimate: resolvedIntent === 'build-home' && Boolean(projectName),
    hasBoq: false,
    hasBids: false,
  }

  const conversationRef = useRef(createConversation('user-demo-001'))
  const [messages, setMessages] = useState<Message[]>([])
  const [actionsByMessageId, setActionsByMessageId] = useState<Record<string, AdvisorAction[]>>({})
  const [input, setInput] = useState('')
  const [replyState, setReplyState] = useState<ReplyState>('idle')
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const [showNewConvoModal, setShowNewConvoModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, replyState])

  const respondTo = (query: string) => {
    setReplyState('thinking')
    setPendingQuery(query)
    setTimeout(() => {
      try {
        const reply = getAdvisorReply(query, dashboardState)
        const replyMsg = createMessage(conversationRef.current.id, 'assistant', reply.content)
        setMessages(prev => [...prev, replyMsg])
        setActionsByMessageId(prev => ({ ...prev, [replyMsg.id]: reply.actions }))
        setReplyState('idle')
        setPendingQuery(null)
      } catch {
        setReplyState('error')
      }
    }, 1400)
  }

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || replyState === 'thinking') return
    const userMsg = createMessage(conversationRef.current.id, 'user', trimmed)
    setMessages(prev => [...prev, userMsg])
    setInput('')
    respondTo(trimmed)
  }

  // Auto-send the query typed on the dashboard's "Ask Hozie" prompt. Clears
  // it from projectData right after so revisiting this screen later (e.g.
  // via the sidebar) never silently replays a stale query.
  useEffect(() => {
    if (initialQuery && !autoSentRef.current) {
      autoSentRef.current = true
      sendMessage(initialQuery)
      onNavigate('ai-advisor', { ai_query: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const handleSubmit = () => sendMessage(input)

  const handleRetry = () => {
    if (pendingQuery) respondTo(pendingQuery)
  }

  const handleNewClick = () => {
    if (messages.length > 0) setShowNewConvoModal(true)
    else resetConversation()
  }

  function resetConversation() {
    conversationRef.current = createConversation('user-demo-001')
    setMessages([])
    setActionsByMessageId({})
    setInput('')
    setReplyState('idle')
    setPendingQuery(null)
    setShowNewConvoModal(false)
  }

  const handleAction = (action: AdvisorAction) => {
    if (!action.dest) return
    onNavigate(action.dest)
  }

  const context = getContextSummary(dashboardState)
  const suggestions = SUGGESTED_QUESTIONS[resolvedIntent]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      <MobileTopBar onBack={() => onNavigate('dashboard-home')} onNew={handleNewClick} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="advisor" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <div className="hidden md:flex flex-col">
            <AIAdvisorHeader onBack={() => onNavigate('dashboard-home')} onNew={handleNewClick} />
          </div>
          <ContextBar primaryLabel={context.primaryLabel} locationLabel={context.locationLabel} intentLabel={context.intentLabel} />

          <div className="flex flex-1 min-h-0">
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="max-w-[900px] mx-auto px-4 pt-8 pb-4 flex flex-col gap-6">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center text-center gap-5 py-6" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                      <div className="w-12 h-12 rounded-[14px] bg-[#F3EAFF] flex items-center justify-center" aria-hidden="true">
                        <HIcon size={28} />
                      </div>
                      <div className="flex flex-col gap-2 max-w-[440px]">
                        <h2 className="text-[24px] sm:text-[26px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
                          Hi, I&apos;m Hozie.
                        </h2>
                        <p className="text-[14.5px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          Your AI advisor for everything home and construction.
                        </p>
                        <p className="text-[13.5px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          Ask me about costs, plans, materials, contractors, services or your next step.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[620px] mt-2">
                        {suggestions.map(q => (
                          <SuggestedPrompt key={q} label={q} onClick={() => sendMessage(q)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map(msg => (
                    msg.role === 'assistant' ? (
                      <HozieMessage key={msg.id} content={msg.content} actions={actionsByMessageId[msg.id]} onAction={handleAction} />
                    ) : (
                      <UserMessage key={msg.id} content={msg.content} />
                    )
                  ))}

                  {replyState === 'thinking' && <TypingIndicator />}
                  {replyState === 'error' && <ErrorBubble onRetry={handleRetry} />}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <ChatComposer
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                onAttach={() => onNavigate(DASHBOARD_ROUTES.uploadPlan)}
                disabled={replyState === 'thinking'}
              />
            </div>

            <RightContextPanel state={dashboardState} onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      {showNewConvoModal && (
        <NewConversationModal onConfirm={resetConversation} onCancel={() => setShowNewConvoModal(false)} />
      )}
    </div>
  )
}
