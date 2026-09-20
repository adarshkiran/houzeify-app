import type { ReactNode } from 'react'

// ─── "Select a service" section — the service tile picker ──────────────────
// Extracted from HomeServicesScreen's ServiceGroupsLanding so the Home
// Dashboard renders the identical section (same eyebrow, heading and tile
// treatment). Each screen supplies its own tile list: the labels are fixed,
// only onClick differs — HomeServicesScreen opens its in-page pickers, the
// Home Dashboard routes to a dedicated screen or the Services landing with
// the matching picker pre-opened.
//
// A tile shows its real branded image when one exists; otherwise it falls
// back to a line icon on the app's standard icon-on-gradient placeholder —
// the same "no fake photography" convention every other surface here uses.

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'
const FONT_BODY = '"Open Sans:Regular", sans-serif'

export interface SelectAServiceTile {
  id: string
  label: string
  onClick: () => void
  /** Real branded tile art. */
  image?: string
  /** Line-icon fallback when there is no real image for this tile. */
  icon?: ReactNode
}

export default function SelectAServiceSection({ tiles }: { tiles: SelectAServiceTile[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
        <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
          What do you need help with?
        </h2>
      </div>
      {/* A single edge-to-edge row: each tile grows to an equal share (taller
          icon panels scale with the tile's own width via aspect-square).
          Below the width a tile can comfortably shrink to, the row falls
          back to horizontal scroll rather than clipping. */}
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={tile.onClick}
            className="group flex flex-col items-center gap-2 text-center bg-white rounded-[14px] border border-[#E3DDD7] p-2.5 cursor-pointer hover:border-[#722ED1] transition-all flex-1 min-w-[92px] sm:min-w-[104px]"
          >
            <div className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-[#F3EAFF]">
              {tile.image ? (
                <img
                  src={tile.image}
                  alt={tile.label}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 20%' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#722ED1] opacity-40">
                  <div style={{ transform: 'scale(2)' }}>{tile.icon}</div>
                </div>
              )}
            </div>
            <span className="text-[11px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
