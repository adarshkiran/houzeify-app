// The Houzeify "H" symbol mark — sourced from the final logo asset the
// user supplied (src/imports/Logo/HouzeifySymbol.svg), not a hand-built
// approximation. Rendered inline (not via <img>) so its fill can be set
// to white for the badge use every caller already expects, rather than
// the mark's own default brand-purple fill (used as-is on transparent
// backgrounds — see LogoMark below).
const SYMBOL_PATH =
  'M150 44C99.0002 79.9996 49.0006 79.9995 0.000976562 44C0.000976562 53 0.000812531 59 0.000976562 70C59.0003 89.9997 89.0005 89.9997 150 70V150H99V133C99 119.745 88.2547 109 75 109C61.7453 109 51 119.745 51 133V150H0V0H51V13C51 26.2547 61.7453 36.9998 75 37C88.2547 36.9998 99 26.2547 99 13V0H150V44Z'

interface HIconProps {
  size?: number
  shadow?: boolean
}

// The badge every existing caller expects: a solid brand-purple rounded
// square with the white "H" mark centred inside — same sizing contract
// as before (size = the whole square, corner radius scales with it).
export default function HIcon({ size = 36, shadow = false }: HIconProps) {
  const scale = size / 112
  const glyphSize = size * 0.62

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#722ED1',
        borderRadius: Math.round(16 * scale),
        boxShadow: shadow ? '0px 12px 16px rgba(0,0,0,0.17)' : undefined,
      }}
    >
      <svg width={glyphSize} height={glyphSize} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={SYMBOL_PATH} fill="white" />
      </svg>
    </div>
  )
}

// The mark on its own, brand-purple, no badge background — for spots
// that want the logo mark directly (e.g. next to a wordmark) rather than
// the "icon in a colored square" badge HIcon renders above.
export function HLogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={SYMBOL_PATH} fill="#722ED1" />
    </svg>
  )
}
