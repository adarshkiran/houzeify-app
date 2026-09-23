// Screen 03 — shared KEEP polish shell for company rollup screens (C19–C23).
// Canvas, focus targets, empty/error/org CTAs stay consistent with Screen 02.

import HIcon from '@/shared/components/HIcon'

const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

export const COMPANY_ROLLUP_CANVAS = '#FBF9F7'

export const companyRollupPrimaryBtnClass =
  'min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A22A8]'

export const companyRollupSecondaryBtnClass =
  'min-h-11 h-11 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'

const panelClass = 'flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10'
const panelStyle = { border: '1px solid #E3DDD7' as const }

export function CompanyRollupNoOrg({
  body,
  onSetup,
}: {
  body: string
  onSetup: () => void
}) {
  return (
    <div className={panelClass} style={panelStyle}>
      <HIcon size={36} />
      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
        Organization information unavailable.
      </p>
      <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onSetup}
        className={companyRollupPrimaryBtnClass}
        style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
      >
        Set up organization
      </button>
    </div>
  )
}

export function CompanyRollupLoading({ label }: { label: string }) {
  return (
    <div className={panelClass} style={panelStyle} aria-live="polite">
      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
        {label}
      </p>
    </div>
  )
}

export function CompanyRollupError({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className={panelClass} style={panelStyle} role="alert">
      <HIcon size={36} />
      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
        {title}
      </p>
      <p className="text-[13px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={companyRollupPrimaryBtnClass}
        style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
      >
        Try again
      </button>
    </div>
  )
}

export function CompanyRollupEmptyProjects({
  body,
  onCreate,
}: {
  body: string
  onCreate: () => void
}) {
  return (
    <div className={panelClass} style={panelStyle}>
      <HIcon size={36} />
      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
        No construction projects yet.
      </p>
      <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className={companyRollupPrimaryBtnClass}
        style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
      >
        Create Project
      </button>
    </div>
  )
}
