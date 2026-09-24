// ─── Renovate → Space details ────────────────────────────────────────────
// Screen 03 of the Renovate journey — "Tell us about your space". Pre-fills
// location/property type from the same derived values App.tsx already
// threads to Create Project (resolvedLocation/resolvedPropertyType), so a
// homeowner who already has that on file never re-types it. The field set
// shown depends on what was picked on the previous screen — Kitchen gets
// its own real field set from the spec (layout/condition/cabinets/
// countertop/flooring/lighting/appliances/storage), Full Home gets its own
// (property type/total area/rooms/current condition), everything else gets
// a simpler generic version of the Kitchen set. Same Chip/FormLabel pattern
// as ConstructionIntentScreen/CreateProjectScreen — no new visual language.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { RENOVATION_AREA_LABELS, type RenovationArea } from './RenovateSelectAreaScreen'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const TOTAL_STEPS = 9

const CheckIcon = ({ size = 8 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function FormLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{children}</span>
}

function Chip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? '#F3EAFF' : '#FFFFFF',
        borderColor: selected ? '#722ED1' : '#CAC7C6',
        color: selected ? '#722ED1' : '#1E1E1E',
      }}
    >
      {selected && <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon /></span>}
      {label}
    </button>
  )
}

interface ChipField {
  key: string
  label: string
  options: string[]
}

const CONDITION_OPTIONS = ['Good', 'Needs minor repair', 'Needs major repair', 'Very old / damaged']

const KITCHEN_FIELDS: ChipField[] = [
  { key: 'layout', label: 'Current layout', options: ['Straight', 'L-shaped', 'U-shaped', 'Parallel', 'Island', 'Open'] },
  { key: 'condition', label: 'Current condition', options: CONDITION_OPTIONS },
  { key: 'cabinets', label: 'Existing cabinets', options: ['None', 'Wooden', 'Modular', 'Old / worn'] },
  { key: 'countertop', label: 'Countertop', options: ['Granite', 'Marble', 'Quartz', 'Laminate', 'None'] },
  { key: 'flooring', label: 'Flooring', options: ['Tiles', 'Marble', 'Vitrified', 'Wooden', 'Cement'] },
  { key: 'lighting', label: 'Lighting', options: ['Adequate', 'Basic', 'Poor', 'Needs upgrade'] },
  { key: 'appliances', label: 'Appliances', options: ['Fully equipped', 'Some modern', 'Old', 'None'] },
  { key: 'storage', label: 'Storage requirements', options: ['Sufficient', 'Need more', 'Need complete overhaul'] },
]

const GENERIC_FIELDS: ChipField[] = [
  { key: 'condition', label: 'Current condition', options: CONDITION_OPTIONS },
  { key: 'flooring', label: 'Flooring', options: ['Tiles', 'Marble', 'Vitrified', 'Wooden', 'Cement'] },
  { key: 'lighting', label: 'Lighting', options: ['Adequate', 'Basic', 'Poor', 'Needs upgrade'] },
]

const FULL_HOME_FIELDS: ChipField[] = [
  { key: 'property_type', label: 'Property type', options: ['House', 'Villa', 'Apartment', 'Farmhouse', 'Other'] },
  { key: 'rooms', label: 'Number of rooms', options: ['1', '2', '3', '4', '5+'] },
  { key: 'condition', label: 'Current condition', options: CONDITION_OPTIONS },
]

function ChipFieldGroup({ field, value, onSelect }: { field: ChipField; value?: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <FormLabel>{field.label}</FormLabel>
      <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-2">
        {field.options.map(opt => (
          <Chip key={opt} label={opt} selected={value === opt} onSelect={() => onSelect(opt)} />
        ))}
      </div>
    </div>
  )
}

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateSpaceDetailsScreen({
  onNavigate,
  renovationAreas,
  initialLocation = 'Hyderabad, Telangana',
  initialPropertyType = 'House',
  initialBuiltUpArea,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  renovationAreas?: string
  initialLocation?: string
  initialPropertyType?: string
  initialBuiltUpArea?: string
}) {
  const areas = (renovationAreas?.split(',').filter(Boolean) as RenovationArea[]) ?? []
  const isFullHome = areas.includes('full-home')
  const isKitchenOnly = !isFullHome && areas.length === 1 && areas[0] === 'kitchen'
  const fields = isFullHome ? FULL_HOME_FIELDS : isKitchenOnly ? KITCHEN_FIELDS : GENERIC_FIELDS

  const [areaSize, setAreaSize] = useState(initialBuiltUpArea?.replace(/\s*sq ft$/i, '') ?? '')
  const [location] = useState(initialLocation)
  const [values, setValues] = useState<Record<string, string>>(isFullHome ? { property_type: initialPropertyType } : {})

  function setValue(key: string, v: string) {
    setValues(prev => ({ ...prev, [key]: v }))
  }

  const canContinue = areaSize.trim().length > 0

  function handleContinue() {
    if (!canContinue) return
    onNavigate('renovate-requirements', {
      home_built_up_area: areaSize.trim(),
      location,
      property_type: values.property_type ?? initialPropertyType,
      space_details: JSON.stringify(values),
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-select-area', { renovation_areas: renovationAreas ?? '' })} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-select-area', { renovation_areas: renovationAreas ?? '' })} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[#F4F0EC] w-full shrink-0">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: `${(2 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 2 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Tell us about your space</h2>
                <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                  Renovating: <strong style={{ color: '#242326' }}>{areas.map(a => RENOVATION_AREA_LABELS[a]).join(', ')}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-6 max-w-[560px]">
                <div className="flex flex-col gap-2">
                  <FormLabel>{isFullHome ? 'Total area' : 'Area / size'}</FormLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={areaSize}
                      onChange={e => setAreaSize(e.target.value)}
                      placeholder="e.g. 150"
                      className="h-11 px-4 rounded-[10px] border border-[#E3DDD7] text-[14px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors w-[180px]"
                      style={{ fontFamily: FONT_BODY }}
                    />
                    <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>sq.ft</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <FormLabel>Location</FormLabel>
                  <span className="text-[14px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{location}</span>
                </div>

                {fields.map(field => (
                  <ChipFieldGroup key={field.key} field={field} value={values[field.key]} onSelect={v => setValue(field.key, v)} />
                ))}
              </div>

              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={[
                  'h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px]',
                  canContinue ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[#F4F0EC] text-[#9A949D] cursor-not-allowed',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
