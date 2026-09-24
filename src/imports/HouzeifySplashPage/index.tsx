// ─── Ambient background — same soft glow pattern as OtpScreen's own
// AmbientBackground, copied here per this codebase's established per-screen
// local-duplicate convention (never a shared import). Replaces the previous
// single lime/purple glow + blueprint image background entirely.
function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
      {/* Desktop */}
      <div className="hidden lg:block absolute rounded-full" style={{ left: 176, bottom: 148, width: 392, height: 392, backgroundColor: '#722ED1', opacity: 0.3, filter: 'blur(400px)' }} />
      <div className="hidden lg:block absolute rounded-full" style={{ right: 79, top: 42, width: 400, height: 400, backgroundColor: '#722ED1', opacity: 0.3, filter: 'blur(400px)' }} />
      {/* Mobile */}
      <div className="lg:hidden absolute rounded-full" style={{ left: -121, bottom: -10, width: 311, height: 311, backgroundColor: '#722ED1', opacity: 0.2, filter: 'blur(200px)' }} />
      <div className="lg:hidden absolute rounded-full" style={{ right: -105, top: 64, width: 265, height: 265, backgroundColor: '#722ED1', opacity: 0.2, filter: 'blur(200px)' }} />
    </div>
  )
}

// Houzeify's final vertical logo lockup — the mark and the "Houzeify"
// wordmark as one combined vector (src/imports/Logo/Houzeify-VLogo.svg),
// replacing the previous separate purple icon-badge + font-rendered
// "Houzeify" text. No drop-shadow/badge card here — this is the real
// logo asset rendered as-is, not an icon sitting inside a UI card.
const VLOGO_PATHS: string[] = [
  'M377.647 198.597H390.695L402.206 240.136L417.441 198.597H433L408.421 258.915C404.062 269.554 397.09 277.124 387.507 281.626C387.507 281.626 380.326 285.643 369.612 284.304C371.398 279.394 373.183 274.126 373.63 272.787C377.647 272.787 380.291 271.526 380.291 271.526C386.906 268.662 391.716 263.993 394.723 257.52L377.647 198.597Z',
  'M331.023 198.713V257.52H316.045V198.713H331.023Z',
  'M331.222 191.454V176.277L316.045 176.33V191.454H331.222Z',
  'M204.912 198.597L249.086 198.597V210.381L219.05 246.297H252.432L248.64 257.52H202.662V251.909V246.297L233.145 210.381H200.738L204.912 198.597Z',
  'M193.734 198.597V257.52H182.196L180.412 250.001C173.686 255.014 166.551 257.52 159.008 257.52C147.042 257.52 141.06 250.393 141.06 236.139V198.597H155.831V235.747C155.831 242.256 158.655 245.511 164.303 245.511C169.097 245.511 173.983 243.584 178.963 239.731V198.597H193.734Z',
  'M90.6734 227.863C90.6734 240.113 95.4164 246.238 104.902 246.238C114.388 246.238 119.131 240.113 119.131 227.863C119.131 215.911 114.388 209.935 104.902 209.935C95.4164 209.935 90.6734 215.911 90.6734 227.863ZM75.8867 228.086C75.8867 208.427 85.5585 198.597 104.902 198.597C124.246 198.597 133.918 208.427 133.918 228.086C133.918 247.709 124.246 257.52 104.902 257.52C85.6329 257.52 75.9611 247.709 75.8867 228.086Z',
  'M0 257.52V177.17H14.7508V210.321H53.9935V177.17H68.7443V257.52H53.9935V223.245H14.7508V257.52H0Z',
  'M367.418 174.491C370.682 174.491 373.74 174.836 376.591 175.525L374.075 182.527L372.108 188.236C370.924 188.113 369.714 188.052 368.478 188.052C360.071 188.052 355.867 190.339 355.867 198.597H372.551L368.087 210.315H355.867V257.186H341.08V198.597C341.08 182.527 349.86 174.491 367.418 174.491Z',
  'M280.965 198.597C298.838 198.597 307.774 207.725 307.774 225.982C307.774 228.414 307.606 230.846 307.27 233.277H268.178C268.178 241.583 274.272 245.735 286.462 245.735C292.407 245.735 297.851 245.268 303.796 244.146L301.76 249.932L299.398 256.685C295.51 257.52 292.78 257.521 285.34 257.521C263.99 257.521 253.314 247.475 253.314 227.385C253.315 208.193 262.531 198.597 280.965 198.597ZM280.965 210.27C273.113 210.27 268.851 214.497 268.178 222.952H293.304V222.503C293.304 214.347 289.191 210.27 280.965 210.27Z',
]
const VLOGO_MARK_PATH =
  'M287.163 135H241.263V119.7C241.263 107.771 231.592 98.0997 219.663 98.0996C207.734 98.0996 198.063 107.771 198.063 119.7V135H152.163V63C205.263 81 232.263 81 287.163 63V135ZM287.163 39.5996C241.263 71.9996 196.263 71.9996 152.163 39.5996V0H198.063V11.7002C198.064 23.6295 207.734 33.2998 219.663 33.2998C231.592 33.2997 241.263 23.6294 241.263 11.7002V0H287.163V39.5996Z'

function VerticalLogo() {
  return (
    <svg
      className="w-[200px] h-auto"
      viewBox="0 0 433 285"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-name="houzeify-vertical-logo"
      aria-label="Houzeify"
    >
      <path d={VLOGO_MARK_PATH} fill="#722ED1" />
      {VLOGO_PATHS.map(d => (
        <path key={d} d={d} fill="#545454" />
      ))}
    </svg>
  );
}

function TaglineText() {
  return (
    <p className="font-['Geist:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-[15px] lg:text-[20px] text-center whitespace-nowrap" data-name="tagline-text">
      <span className="font-['Google_Sans_Flex:Medium',sans-serif] leading-[normal]" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>{`Build Smart. `}</span>
      <span className="font-['Google_Sans_Flex:SemiBold',sans-serif] font-semibold leading-[normal] text-[#722ED1]" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
        Build Confidently.
      </span>
    </p>
  );
}

function BrandingStack() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] lg:gap-[16px] items-center relative shrink-0 w-full" data-name="branding-stack">
      <VerticalLogo />
      <TaglineText />
    </div>
  );
}

function StatusTitleRow() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="status-title-row">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
          <circle cx="4" cy="4" fill="#722ED1" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] font-['Sometype_Mono:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#242326] text-[13px] uppercase whitespace-nowrap">Initializing AI</p>
    </div>
  );
}

function StatusMessage() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full" data-name="status-message">
      <StatusTitleRow />
      <p className="[word-break:break-word] font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#68636D] text-[13px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Preparing your construction workspace
      </p>
    </div>
  );
}

function ProgressFill() {
  return (
    <div className="bg-[#722ED1] content-stretch flex h-full items-center justify-end relative rounded-[3px] shrink-0 w-[160px]" data-name="progress-fill">
      <div className="relative shrink-0 size-[12px]" data-name="progress-node">
        <div className="absolute inset-[-50%]">
          <svg className="block size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g filter="url(#filter0_d_0_4)" id="progress-node">
              <circle cx="12" cy="12" fill="#722ED1" r="6" />
              <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_0_4" width="24" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset />
                <feGaussianBlur stdDeviation="3" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.329412 0 0 0 0 0.168627 0 0 0 0 0.878431 0 0 0 0.4 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_0_4" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_0_4" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ProgressBarTrack() {
  return (
    <div className="bg-[var(--hz-primary-wash)] content-stretch flex h-[6px] items-center relative rounded-[3px] shrink-0 w-[240px] lg:w-[400px]" data-name="progress-bar-track">
      <ProgressFill />
    </div>
  );
}

function LoaderBlock() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] lg:gap-[20px] items-center relative shrink-0 w-full" data-name="loader-block">
      <StatusMessage />
      <ProgressBarTrack />
    </div>
  );
}

function CapabilityPlan() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] lg:gap-[16px] items-center leading-[normal] relative shrink-0 text-[11px] whitespace-nowrap" data-name="capability-Plan">
      <p className="font-['Geist_Mono:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#68636D] tracking-[0.66px] uppercase">Plan</p>
      <p className="font-['Geist_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#736e66]">/</p>
    </div>
  );
}

function CapabilityEstimate() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] lg:gap-[16px] items-center leading-[normal] relative shrink-0 text-[11px] whitespace-nowrap" data-name="capability-Estimate">
      <p className="font-['Sometype_Mono:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#68636D] tracking-[0.66px] uppercase">Estimate</p>
      <p className="font-['Geist_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#736e66]">/</p>
    </div>
  );
}

function CapabilityUnderstand() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] lg:gap-[16px] items-center leading-[normal] relative shrink-0 text-[11px] whitespace-nowrap" data-name="capability-Understand">
      <p className="font-['Geist_Mono:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#68636D] tracking-[0.66px] uppercase">Understand</p>
      <p className="font-['Geist_Mono:Regular',sans-serif] font-normal relative shrink-0 text-[#736e66]">/</p>
    </div>
  );
}

function CapabilityBuild() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="capability-Build">
      <p className="[word-break:break-word] font-['Geist_Mono:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#68636D] text-[11px] tracking-[0.66px] uppercase whitespace-nowrap">Build</p>
    </div>
  );
}

function CapabilitiesRow() {
  return (
    <div className="content-stretch flex gap-[10px] lg:gap-[16px] items-center justify-center pt-[10px] lg:pt-[16px] relative shrink-0 w-full" data-name="capabilities-row">
      <CapabilityPlan />
      <CapabilityEstimate />
      <CapabilityUnderstand />
      <CapabilityBuild />
    </div>
  );
}

function SplashCard() {
  return (
    <div className="content-stretch flex flex-col gap-[22px] lg:gap-[36px] items-center relative shrink-0 w-full max-w-[640px] px-6 lg:px-0" data-name="splash-card">
      <BrandingStack />
      <div className="h-0 relative shrink-0 w-[36px] lg:w-[48px]" data-name="Line">
        <div className="absolute inset-[-2px_0_0_0]">
          <svg className="block size-full" fill="none" height="2" preserveAspectRatio="none" viewBox="0 0 48 2" width="48">
            <line id="Line" opacity="0.6" stroke="#722ED1" strokeWidth="2" x2="48" y1="1" y2="1" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Sometype_Mono:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#722ED1] text-[12px] text-center tracking-[0.48px] uppercase whitespace-nowrap">AI Construction Advisor</p>
      <LoaderBlock />
      <CapabilitiesRow />
    </div>
  );
}

export default function HouzeifySplashPage() {
  return (
    <div className="bg-[#fcfbf9] content-stretch flex flex-col items-center justify-center relative size-full overflow-hidden" data-name="houzeify-splash-page">
      <AmbientBackground />
      <SplashCard />
    </div>
  );
}