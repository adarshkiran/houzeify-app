import { useEffect, useState } from 'react'
import ServiceImage from '@/shared/components/ServiceImage'
import { initials } from '@/data/homeownerProfile'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import hoziehelperGoldImg from '@/imports/Hoziehelper/Hozie Helper Gold.png'
import hoziehelperStandardImg from '@/imports/Hoziehelper/Hozie Helper Standard.png'
import iconHoziehelper from '@/imports/Services icons/hozie-helper-avatar.png'
import iconSalonWomen from '@/imports/Services icons/WomensSalon&Spa.png'
import iconSalonMen from '@/imports/Services icons/MensSalon&Massage.png'
import iconCleaningPest from '@/imports/Services icons/Cleaning&Pest Control.png'
import iconWallPanels from '@/imports/Services icons/Wallpanels.png'
import wallPanelsBannerImg from '@/imports/Services icons/Wallpanels-banner.png'
import electricianBannerImg from '@/imports/Services icons/Electrician-banner.png'
import skinSpaCareBannerImg from '@/imports/Services icons/Skin&spacare-banner.png'
import iconPaintingWaterproofing from '@/imports/Services icons/Painting&Waterproofing.png'
import iconAcAppliance from '@/imports/Services icons/AC.png'
import iconElectricianPlumberCarpenter from '@/imports/Services icons/ElectricianPlumber&Carpenter.png'
import iconSalonForWomen from '@/imports/Services icons/salon-for-women.png'
import salonTierLuxeImg from '@/imports/Services icons/Salon-for-Women-real1.png'
import salonTierPrimeImg from '@/imports/Services icons/Salon-for-Women-real2.png'
import iconSpaForWomen from '@/imports/Services icons/spa-for-women.png'
import iconHairStudioForWomen from '@/imports/Services icons/hair-studio-for-women.png'
import iconMakeupSareeStyling from '@/imports/Services icons/makeup-saree&styling.png'
import nnFullHomeCleaningImg from '@/imports/Services icons/New and noteworthy/Full Home-By Room Cleaning.png'
import nnLivingBedroomCleaningImg from '@/imports/Services icons/New and noteworthy/Living&BedroomCleaning.png'
import nnFullHomePaintingImg from '@/imports/Services icons/New and noteworthy/Fullhomepainting.png'
import nnWallPanelsImg from '@/imports/Services icons/New and noteworthy/WallPanels.png'
import nnStoveRepairImg from '@/imports/Services icons/New and noteworthy/StoveService&Repair.png'
import nnLaptopRepairImg from '@/imports/Services icons/New and noteworthy/LaptopRepair.png'
import nnSpaAyurvedaImg from '@/imports/Services icons/New and noteworthy/SpaAyurveda.png'
import nnHairStudioWomenImg from '@/imports/Services icons/New and noteworthy/HairStudioforWomen.png'
import nnAcImg from '@/imports/Services icons/New and noteworthy/AC&Repair.png'
import tcFacialsCleanupsImg from '@/imports/Services icons/Thoughtful curations/Facials&Cleanups.png'
import tcSpaForWomenImg from '@/imports/Services icons/Thoughtful curations/SpaforWomen.png'
import tcMassageForMenImg from '@/imports/Services icons/Thoughtful curations/MassageforMen.png'
import tcSalonForMenImg from '@/imports/Services icons/Thoughtful curations/SalonforMen.png'
import tcPaintingWaterproofingImg from '@/imports/Services icons/Thoughtful curations/Painting&Waterproofing.png'
import {
  type ServiceCategoryMeta,
  type ServiceCategory,
  type HomeServiceGroup,
  searchServiceCategories,
  getServiceCategory,
} from '@/data/homeServices'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import Sidebar from '@/shared/components/Sidebar'
import SelectAServiceSection from './SelectAServiceSection'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Service category icons — line icons, one per homeowner category ───────

const IcoFlooring = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/>
    <path d="M2.5 8.8h15M2.5 13.5h15M7.5 2.5v15M12.8 2.5v15"/>
  </svg>
)
const IcoWindowsDoors = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1.2"/>
    <path d="M10 2.5v15M3 10h14"/>
  </svg>
)
const IcoPainting = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3.5" width="9" height="5" rx="1"/>
    <path d="M8.5 8.5v3a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 011.5 1.5V16"/>
    <circle cx="11.5" cy="16.2" r="1.3"/>
  </svg>
)
const IcoElectrical = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2.5L4.5 11.5H9.5L8.5 17.5L15.5 8H10.5L11 2.5z"/>
  </svg>
)
const IcoPlumbing = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3.5h5v4a3 3 0 003 3v0a3 3 0 003-3v-1.5"/>
    <path d="M6.5 3.5v4M12 10.5V17M9.2 17h5.6"/>
  </svg>
)
const IcoWaterproofing = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 6.2 5 9.8a5 5 0 01-10 0C5 8.7 10 2.5 10 2.5z"/>
  </svg>
)
const IcoHomeOutline = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" />
    <path d="M4.5 8v8a1 1 0 001 1h9a1 1 0 001-1V8" />
    <path d="M8 17v-5h4v5" />
  </svg>
)
const IcoWallSection = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1" />
    <path d="M3 8.5h14M3 13h14M8 2.5v15" />
  </svg>
)
const IcoKitchen = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5a6.5 6.5 0 0113 0"/>
    <path d="M2.5 8.5h15M4.5 8.5V16h11V8.5"/>
    <line x1="10" y1="3" x2="10" y2="1.5"/>
  </svg>
)
const IcoBathroom = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z"/>
    <path d="M4.5 10V4.8A1.8 1.8 0 016.3 3v0c.7 0 1.3.4 1.6 1"/>
    <line x1="6" y1="16" x2="6" y2="17.5"/>
    <line x1="14" y1="16" x2="14" y2="17.5"/>
  </svg>
)
const IcoRoofing = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 10.5L10 3.5l7.5 7"/>
    <path d="M4.5 9v7.5h11V9"/>
  </svg>
)
const IcoCarpentry = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12.5l6-6 2 2-6 6a1.4 1.4 0 01-2-2z"/>
    <path d="M11 6.5l2.5-2.5 3 3-2.5 2.5"/>
  </svg>
)
const IcoCivilWork = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="3" width="6" height="4"/><rect x="9" y="3" width="6.5" height="4"/>
    <rect x="2.5" y="7.5" width="6" height="4"/><rect x="9" y="7.5" width="6.5" height="4"/>
    <rect x="2.5" y="12" width="6" height="4"/><rect x="9" y="12" width="6.5" height="4"/>
  </svg>
)
const IcoFalseCeiling = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="12" rx="1.2"/>
    <path d="M2.5 8h15M2.5 12h15M8 4v12M13.3 4v12"/>
  </svg>
)
const IcoGlassAluminium = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1.2"/>
    <path d="M6 15L14 5"/>
  </svg>
)
const IcoSolar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="6" r="2.4"/>
    <path d="M10 1.3v1.2M5.8 3.8l.9.9M14.2 3.8l-.9.9"/>
    <rect x="3" y="11" width="14" height="6.5" rx="1"/>
    <path d="M6.3 11v6.5M10 11v6.5M13.7 11v6.5"/>
  </svg>
)
const IcoHvac = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.2"/>
    <path d="M10 10c1.6-1.8 4-1.6 4 .6M10 10c-1.8 1.6-1.6 4 .6 4M10 10c-1.6 1.8-4 1.6-4-.6M10 10c1.8-1.6 1.6-4-.6-4"/>
  </svg>
)
// Specific icons for the four real categories under the Women's Salon & Spa
// picker (below) — same hand-drawn line-icon language as every icon above,
// not a photo/emoji stand-in.
const IcoSalonMirror = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="5"/>
    <path d="M10 12v6M7.5 18h5"/>
  </svg>
)
const IcoSpaLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16c0-7 4-12 12-12 0 8-5 12-12 12z"/>
    <path d="M4 16c3-4 6-6 9-9"/>
  </svg>
)
const IcoHairDryer = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5.5h5a2.5 2.5 0 010 5h-2"/>
    <rect x="4" y="4.5" width="5" height="6" rx="2"/>
    <path d="M6.5 10.5V17"/>
  </svg>
)
const IcoLipstick = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 9l4-4 2 2-4 4z"/>
    <rect x="5" y="11" width="6" height="6.5" rx="1.5"/>
    <path d="M5 13.5h6"/>
  </svg>
)
const IcoCleaning = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z"/>
    <path d="M15.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z"/>
  </svg>
)
const IcoOther = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4.5" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="10" r="1.1" fill="currentColor" stroke="none"/>
  </svg>
)

// ─── Group-level icons — Home Services / Cleaning Services split. Every
// legacy category keeps its own specific icon (below); the 40 new
// categories share one honest, representative icon per group rather than
// 40 bespoke icons with no real visual basis. ───────────────────────────────

const IcoPersonalCare = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="6.5" r="3.2"/>
    <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>
  </svg>
)
const IcoAppliance = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2.5" width="12" height="15" rx="1.5"/>
    <circle cx="10" cy="12" r="3.2"/>
    <line x1="6" y1="5.5" x2="8" y2="5.5"/>
  </svg>
)
const IcoTool = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 3.5a3.5 3.5 0 00-4.6 4l-6 6a1.6 1.6 0 002.3 2.3l6-6a3.5 3.5 0 004-4.6l-2.2 2.2-1.7-.5-.5-1.7 2.2-2.2z"/>
  </svg>
)
const IcoHomeGeneral = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L10 3.5l7 6"/><path d="M5 8.5V16h10V8.5"/>
  </svg>
)
const IcoPestControl = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="10" cy="10.5" rx="3.4" ry="5"/>
    <line x1="10" y1="5.5" x2="10" y2="2.5"/>
    <line x1="7.5" y1="6.5" x2="5.5" y2="4.5"/>
    <line x1="12.5" y1="6.5" x2="14.5" y2="4.5"/>
    <line x1="6.6" y1="10.5" x2="3" y2="10.5"/>
    <line x1="13.4" y1="10.5" x2="17" y2="10.5"/>
    <line x1="6.8" y1="14" x2="3.5" y2="16.5"/>
    <line x1="13.2" y1="14" x2="16.5" y2="16.5"/>
  </svg>
)


// Specific icons for every legacy category (reused or retired) — never
// removed, so an old stored ServiceRequest can still render its own icon.
const CATEGORY_ICONS: Partial<Record<ServiceCategory, React.ReactNode>> = {
  flooring: <IcoFlooring />,
  'windows-doors': <IcoWindowsDoors />,
  painting: <IcoPainting />,
  electrical: <IcoElectrical />,
  plumbing: <IcoPlumbing />,
  waterproofing: <IcoWaterproofing />,
  kitchen: <IcoKitchen />,
  bathroom: <IcoBathroom />,
  roofing: <IcoRoofing />,
  carpentry: <IcoCarpentry />,
  'civil-work': <IcoCivilWork />,
  cleaning: <IcoCleaning />,
  'false-ceiling': <IcoFalseCeiling />,
  'glass-aluminium': <IcoGlassAluminium />,
  solar: <IcoSolar />,
  hvac: <IcoHvac />,
  other: <IcoOther />,
  'salon-spa-women': <IcoSalonMirror />,
  'spa-for-women': <IcoSpaLeaf />,
  'hair-studio-women': <IcoHairDryer />,
  'makeup-saree-styling': <IcoLipstick />,
}

const GROUP_ICONS: Record<HomeServiceGroup, React.ReactNode> = {
  'personal-care-at-home': <IcoPersonalCare />,
  'ac-appliance-repair': <IcoAppliance />,
  'electrician-plumber-carpenter': <IcoTool />,
  'home-services-general': <IcoHomeGeneral />,
  'pest-control': <IcoPestControl />,
}

/** The single icon-resolution point for every category, old or new — a
 *  specific icon where one is real and already drawn, otherwise an honest,
 *  representative icon for the category's catalogue/group, never a guess
 *  per individual new category. */
function iconForCategory(category: ServiceCategoryMeta): React.ReactNode {
  if (CATEGORY_ICONS[category.id]) return CATEGORY_ICONS[category.id]
  if (category.catalogue === 'cleaning') return <IcoCleaning />
  if (category.group) return GROUP_ICONS[category.group]
  return <IcoOther />
}

// ─── Chrome icons ───────────────────────────────────────────────────────────

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
const IcoServices = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M9 5.5v3.5l2.5 1.5"/>
  </svg>
)
const IcoContractors = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="5.5" r="2.25"/>
    <path d="M2 15v-1a4.5 4.5 0 019 0v1"/>
    <circle cx="13" cy="6.5" r="1.9"/>
    <path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13"/>
  </svg>
)
const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 15.5V9.5L9 3l6 6.5v6"/>
    <path d="M6.5 15.5V11h5v4.5"/>
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
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoSearch = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="5.5"/>
    <line x1="16" y1="16" x2="12.2" y2="12.2"/>
  </svg>
)
const IcoMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z"/>
    <circle cx="7" cy="5.5" r="1.5"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2.5" y1="7.5" x2="12.5" y2="7.5"/><path d="M8.5 3.5l4 4-4 4"/>
  </svg>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active ? 'bg-[#F3EAFF] text-[#722ED1]' : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.


function MobileTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to your dashboard" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
        </button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{title}</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ title, userInitials, onNavigate }: { title: string; userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h1>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="flex items-center gap-2 ml-1 px-2 py-1 rounded-[10px] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent">
          {/* Customer Implementation 10D — real onboarding initials
              (initials(full_name ‖ preferred_name)); "?" when no name.
              Was a literal hardcoded "AK". */}
          <div className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{userInitials}</div>
        </button>
      </div>
    </header>
  )
}


// ─── Location bar ───────────────────────────────────────────────────────────

function LocationBar({ city, state, onChangeLocation, onSetLocation }: { city?: string; state?: string; onChangeLocation: () => void; onSetLocation: () => void }) {
  if (!city) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[13px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>
          <IcoMapPin /> Location not set
        </span>
        <button
          onClick={onSetLocation}
          className="h-8 px-3 rounded-[8px] bg-[#722ED1] text-white text-[12px] font-medium cursor-pointer hover:brightness-90 transition-all border-0"
          style={{ fontFamily: FONT_BODY }}
        >
          Set location
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="flex items-center gap-1.5 text-[13px] text-[#242326] font-medium" style={{ fontFamily: FONT_BODY }}>
        <IcoMapPin /> {[city, state].filter(Boolean).join(', ')}
      </span>
      <button onClick={onChangeLocation} className="text-[12.5px] text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
        Change location →
      </button>
    </div>
  )
}

// ─── Search ─────────────────────────────────────────────────────────────────

function ServiceSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      <label htmlFor="service-search" className="sr-only">Search for a service</label>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A949D] pointer-events-none"><IcoSearch /></span>
      <input
        id="service-search"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search for a service..."
        className="w-full h-[52px] pl-11 pr-4 rounded-[14px] border border-[#E3DDD7] bg-white text-[14.5px] text-[#242326] placeholder-[#9A949D] outline-none focus:border-[#722ED1] focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all"
        style={{ fontFamily: FONT_BODY }}
      />
    </div>
  )
}

// ─── Service category card ──────────────────────────────────────────────────

function ServiceCategoryCard({ category, onSelect }: { category: ServiceCategoryMeta; onSelect: () => void }) {
  // Cleaning cards read orange, Home Services cards read purple — the same
  // accent split as the rest of Services, applied per-category so a mixed
  // grid (e.g. search results) still reads correctly for each result.
  const accent = category.catalogue === 'cleaning' ? 'orange' : 'purple'
  return (
    <button
      onClick={onSelect}
      className={`group relative text-left flex flex-col gap-2.5 rounded-[16px] border border-[#E3DDD7] bg-white overflow-hidden cursor-pointer transition-all duration-150 outline-none hover:-translate-y-[1px] ${accent === 'orange' ? 'hover:border-[#FF5500]' : 'hover:border-[#722ED1]'}`}
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <ServiceImage icon={iconForCategory(category)} alt={category.name} accent={accent} className="w-full aspect-square" />
      <div className="flex items-start justify-between gap-2 px-3.5 pb-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{category.name}</span>
          <span className="text-[12px] text-[#68636D] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{category.description}</span>
        </div>
        <span className={`shrink-0 text-[#CAC7C6] mt-1 transition-colors ${accent === 'orange' ? 'group-hover:text-[#FF5500]' : 'group-hover:text-[#722ED1]'}`}><IcoArrow /></span>
      </div>
    </button>
  )
}

// ─── Search results ─────────────────────────────────────────────────────────

function SearchResults({ query, results, onSelect, onAskHozie }: { query: string; results: ServiceCategoryMeta[]; onSelect: (id: string) => void; onAskHozie: () => void }) {
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>
        {results.length > 0 ? `Results for "${query}"` : 'Search'}
      </span>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map(c => (
            <ServiceCategoryCard key={c.id} category={c} onSelect={() => onSelect(c.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-6 flex flex-col items-center text-center gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-[14px] text-[#242326] m-0" style={{ fontFamily: FONT_BODY }}>No matching services found.</p>
          <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Try another search or ask Hozie.</p>
          <button
            onClick={onAskHozie}
            className="h-9 px-4 rounded-[10px] bg-[#722ED1] text-white text-[12.5px] font-medium cursor-pointer hover:brightness-90 transition-all border-0"
            style={{ fontFamily: FONT_BODY }}
          >
            Ask Hozie →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Loading / error ────────────────────────────────────────────────────────

function ServicesSkeleton() {
  const bar = (w: string, h = 14) => <div className="rounded-full bg-[#F4F0EC]" style={{ width: w, height: h, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col gap-2">{bar('30%', 12)}{bar('55%', 30)}{bar('45%', 14)}</div>
      {bar('52px', 52)}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => <div key={i} className="rounded-[16px] border border-[#E3DDD7]" style={{ height: 100, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />)}
      </div>
    </div>
  )
}

function ServicesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20" style={{ maxWidth: 420, margin: '0 auto' }}>
      <p className="text-[15px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>We couldn&apos;t load services.</p>
      <button onClick={onRetry} className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
        Try again
      </button>
    </div>
  )
}

// ─── Services page — the ONE Services page now, regardless of how it was
// reached (Primary Navigation → Services, a dashboard "Select a service"
// tile, a Cleaning-specific CTA, or a search). The former split between a
// "landing" (no service_entry) and a separate catalogue-specific browse page
// (service_entry set) is gone — search and this curated content live on one
// screen together; see HomeServicesScreen's own render below. Cross-section
// CTAs that used to re-navigate with a different service_entry (a Cleaning
// or Electrician/Plumber/Carpenter banner's "Book now" / "See all") now open
// that same in-page picker the matching "Select a service" tile opens.

// Real group landing — replaces the old 2-card "Cleaning Services / Home
// Services" chooser with a direct shortcut grid, laid out and labelled to
// match the reference 8-tile grid exactly (icons, order, wording), with
// every tile pointed at a real, already-active destination:
//   - "InstaHelp" → "Hoziehelper": opens the HoziehelperModal below — an
//     instant-booking tier picker in Houzeify's own branding, mirroring the
//     reference's own Instahelp popup, rather than keeping a rival
//     platform's branded feature name inside this app.
//   - "Wall Panels by Revamp" → "Wall Panels": same real category
//     (wall-panels-installation), minus "Revamp" — no such vendor/brand
//     exists in this app, so nothing here can honestly attribute a project
//     to it.
//   - "Cleaning & Pest Control" leads into the Cleaning Services catalogue
//     (its 11 items dominate the combined tile); Pest Control stays fully
//     reachable on its own via the full Home Services catalogue.
//   - The two multi-category tiles ("Electrician, Plumber & Carpenter" and
//     "Cleaning & Pest Control") land in their existing catalogue; the six
//     single-category tiles jump straight to that one real category
//     (Screen 015), the same direct pattern Popular Services already uses.
// Each tile's image is a real, Houzeify-branded asset supplied for this
// grid (src/imports/Services icons/, one file per tile, named to match) —
// rendered as a plain <img>, never through ServiceImage (its opacity wash
// is for line icons and would fade a photo out against its own background).

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
)
const IcoStar = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z" /></svg>
)
const IcoArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
)
const IcoMassageHands = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11V5.5a1.5 1.5 0 013 0V10" />
    <path d="M7 10V4a1.5 1.5 0 013 0v6.5" />
    <path d="M10 10.2V5a1.5 1.5 0 013 0v6" />
    <path d="M13 11V7.5a1.5 1.5 0 013 0V13c0 3-2 5.5-5 5.5H8c-1.5 0-2.7-.7-3.6-1.8L2 13.5" />
  </svg>
)

// ─── Home-page preview carousels & promo banners — built from the
// reference's own bottom-of-page sections (In the spotlight, New and
// noteworthy, Thoughtful curations, Most booked services, and one
// horizontal carousel per category with a "See all"), all under the
// existing "Select a service" tile row. Every item's rating/reviews/
// price/original price is real, taken from the reference as given.
//
// Two honest departures from the reference:
//   - Three of its own banners promote things Houzeify doesn't have —
//     a real Native-brand water purifier/RO hardware line, and a real
//     "Forest Essentials" spa-brand partnership. Reproducing those
//     would claim products/partnerships this app doesn't have, so
//     those banners are replaced with real Houzeify categories
//     instead (same "no false brand/product claims" rule this app's
//     tier pickers already follow) — "New and noteworthy" similarly
//     drops its one Native Water Purifier tile.
//   - No real photography exists in this project, so every card here
//     uses this app's own icon-on-gradient placeholder (the same
//     treatment as every other missing-photo surface in this app),
//     and the reference's "story"-style video cards under "Thoughtful
//     curations" become plain static gradient cards — never a real
//     video that doesn't exist.
//
// Every section is wired into a REAL destination already active in
// this app: category previews open the matching category (or, for
// "Massage for Men" — whose 4 preview items are the exact same
// catalogue as the already-built Massage Prime page — straight into
// that page itself, the deepest link this data honestly supports).
// Nothing here is a dead end or a fabricated checkout.

interface HomePreviewItem {
  id: string
  title: string
  rating: string
  reviews: string
  price: number
  originalPrice?: number
  badge?: string
  icon: React.ReactNode
  image?: string
}

function HomePreviewCard({ item, onSelect }: { item: HomePreviewItem; onSelect?: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col gap-2 text-left bg-white rounded-[14px] border border-[#E3DDD7] p-2.5 cursor-pointer hover:border-[#722ED1] transition-all flex-1 min-w-[148px] sm:min-w-[164px]"
    >
      <div className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-[#F3EAFF] flex items-center justify-center text-[#722ED1]">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          item.icon
        )}
        {item.badge && (
          <span
            className="absolute top-1.5 left-1.5 px-1.5 py-[2px] rounded-[5px] text-[9.5px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#0F7A3D', fontFamily: FONT_BODY }}
          >
            {item.badge}
          </span>
        )}
      </div>
      <span className="text-[12.5px] font-semibold text-[#242326] leading-tight line-clamp-2" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
      <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>
        <IcoStar /> {item.rating} <span className="text-[#9A949D] font-normal">({item.reviews})</span>
      </span>
      <span className="text-[12.5px]" style={{ fontFamily: FONT_BODY }}>
        {item.originalPrice && <span className="line-through text-[#9A949D] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
        <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
      </span>
    </button>
  )
}

function HomeCarouselSection({ title, subtitle, items, onSeeAll }: {
  title: string
  subtitle?: string
  items: HomePreviewItem[]
  /** Omitted for carousels spanning several catalogues at once (e.g. "New
   *  and noteworthy") now that there's no single full-catalogue browse page
   *  left to send "See all" to — never a fake or wrong destination. */
  onSeeAll?: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[19px] sm:text-[22px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
          {subtitle && <p className="text-[12.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{subtitle}</p>}
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="shrink-0 h-8 px-3 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white"
            style={{ fontFamily: FONT_BODY }}
          >
            See all
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {items.map(item => (
          <HomePreviewCard key={item.id} item={item} onSelect={onSeeAll} />
        ))}
      </div>
    </div>
  )
}

// A promo banner for the full-width and 3-up "In the spotlight" slots —
// same gradient-card language as every HeroBanner elsewhere in this
// app, just smaller.
function HomePromoBanner({ badge, heading, subtext, ctaLabel, onCta, gradient, icon, compact, image }: {
  badge?: string
  heading: string
  subtext?: string
  ctaLabel: string
  onCta: () => void
  gradient: string
  icon: React.ReactNode
  compact?: boolean
  /** Real photo backdrop, when one exists (currently just the Wall
   *  Panels spotlight card) — takes over from the flat gradient +
   *  decorative-icon backdrop; a dark scrim + white text keep the
   *  content legible over it instead of the plain dark-on-light text
   *  the gradient cards use. */
  image?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-[16px] flex flex-col justify-end ${compact ? 'p-4 gap-2 h-[190px]' : 'p-6 gap-3 min-h-[150px]'}`} style={{ background: gradient }}>
      {image && (
        <>
          <img src={image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(20,12,36,0.05) 0%, rgba(20,12,36,0.15) 35%, rgba(20,12,36,0.62) 100%)' }}
          />
        </>
      )}
      {badge && (
        <span className="self-start px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap relative z-[1]" style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}>
          {badge}
        </span>
      )}
      <h3
        className={`font-semibold leading-[1.2] m-0 relative z-[1] ${compact ? 'text-[16px] max-w-[85%]' : 'text-[20px] sm:text-[24px] max-w-[60%] sm:max-w-[420px]'}`}
        style={{ fontFamily: FONT_HEAD, color: image ? '#FFFFFF' : '#242326', textShadow: image ? '0 1px 6px rgba(0,0,0,0.25)' : undefined }}
      >
        {heading}
      </h3>
      {subtext && (
        <p
          className={`leading-[1.4] m-0 relative z-[1] ${compact ? 'text-[11.5px] max-w-[85%]' : 'text-[13px] max-w-[60%] sm:max-w-[380px]'}`}
          style={{ fontFamily: FONT_BODY, color: image ? 'rgba(255,255,255,0.88)' : '#68636D' }}
        >
          {subtext}
        </p>
      )}
      <button
        onClick={onCta}
        className={`self-start rounded-[10px] bg-[#242326] text-white font-semibold cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all border-0 relative z-[1] ${compact ? 'h-8 px-3 text-[12px]' : 'h-10 px-4 text-[13px]'}`}
        style={{ fontFamily: FONT_BODY }}
      >
        {ctaLabel}
      </button>
      {!image && (
        <div className={`absolute text-[#722ED1] opacity-[0.16] pointer-events-none ${compact ? 'right-2 bottom-2' : 'right-4 bottom-2'}`} style={{ transform: compact ? 'scale(2.6)' : 'scale(4)' }}>
          {icon}
        </div>
      )}
    </div>
  )
}

// Static gradient "story" tile — stands in for the reference's real
// video cards under Thoughtful curations (no real video exists here).
// Optional `image` swaps the flat gradient + faded icon backdrop for a
// real photo — plain black text underneath, no dark scrim, since these
// photos are light/pastel-toned product shots (unlike HomePromoBanner's
// darker real-world photos, which still need the scrim + white text).
function HomeStoryCard({ title, icon, image, onSelect }: { title: string; icon: React.ReactNode; image?: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group relative overflow-hidden rounded-[14px] flex-1 min-w-[130px] h-[190px] flex items-end p-3 cursor-pointer border-0"
      style={{ background: image ? undefined : 'linear-gradient(160deg, #F3EAFF 0%, #F9F5FF 55%, #FFF3EA 100%)' }}
    >
      {image ? (
        <img src={image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#722ED1] opacity-25">
          <div style={{ transform: 'scale(2.4)' }}>{icon}</div>
        </div>
      )}
      <span
        className="relative z-[1] text-[13px] font-semibold leading-tight text-left"
        style={{ fontFamily: FONT_HEAD, color: '#242326' }}
      >
        {title}
      </span>
    </button>
  )
}

function ServiceGroupsLanding({
  onNavigate,
  city,
  state,
  onChangeLocation,
  onSetLocation,
  query,
  onQueryChange,
  isSearching,
  searchResults,
  onSelectCategory,
  onAskHozie,
  onOpenHoziehelper,
  onOpenWomensSalonSpa,
  onOpenMensSalon,
  onOpenCleaningPestControl,
  onOpenPaintingWaterproofing,
  onOpenElectricianPlumberCarpenter,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  city?: string
  state?: string
  onChangeLocation: () => void
  onSetLocation: () => void
  query: string
  onQueryChange: (v: string) => void
  isSearching: boolean
  searchResults: ServiceCategoryMeta[]
  /** Shared select handler for search results AND the full-catalogue grids
   *  (Popular Services / All Home Services / All Cleaning Services) further
   *  down this same page — routes via the category's own real catalogue,
   *  never an ambient "current page" one, since both catalogues now live on
   *  this one page together. */
  onSelectCategory: (id: string) => void
  onAskHozie: () => void
  onOpenHoziehelper: () => void
  onOpenWomensSalonSpa: () => void
  onOpenMensSalon: () => void
  onOpenCleaningPestControl: () => void
  onOpenPaintingWaterproofing: () => void
  onOpenElectricianPlumberCarpenter: () => void
}) {
  const goCategory = (categoryId: string) =>
    onNavigate('service-category-detail', { service_category_id: categoryId, service_entry: 'home-services' })

  const tiles: { id: string; label: string; image: string; onClick: () => void }[] = [
    { id: 'ask-hozie', label: 'HozieHelp', image: iconHoziehelper, onClick: onOpenHoziehelper },
    // Opens the Women's Salon & Spa picker (below) — the same "pick a
    // specific service first" pattern as HozieHelp — instead of jumping
    // straight into one catalogue entry, now that there are four real,
    // separately booked categories under this tile.
    { id: 'salon-spa-women', label: "Women's Salon & Spa", image: iconSalonWomen, onClick: onOpenWomensSalonSpa },
    // Opens the Men's Salon & Massage picker (below) — same "pick a
    // specific service first" pattern as Women's Salon & Spa — instead
    // of jumping straight into one catalogue entry.
    { id: 'salon-for-men', label: "Men's Salon & Massage", image: iconSalonMen, onClick: onOpenMensSalon },
    // Opens the Cleaning & Pest Control picker (below) — same "pick a
    // specific service first" pattern as every other multi-category
    // tile here — instead of jumping straight into the flat Cleaning
    // Services catalogue.
    { id: 'cleaning', label: 'Cleaning & Pest Control', image: iconCleaningPest, onClick: onOpenCleaningPestControl },
    { id: 'wall-panels-installation', label: 'Wall Panels', image: iconWallPanels, onClick: () => onNavigate('wall-panels-installation') },
    { id: 'painting', label: 'Painting & Waterproofing', image: iconPaintingWaterproofing, onClick: onOpenPaintingWaterproofing },
    { id: 'ac-service-repair', label: 'AC & Appliance Repair', image: iconAcAppliance, onClick: () => goCategory('ac-service-repair') },
    // Opens the Electrician, Plumber & Carpenter picker (below) — same
    // "pick a specific service first" pattern as every other multi-
    // category tile here — instead of jumping straight into the flat
    // group listing.
    { id: 'electrician-plumber-carpenter', label: 'Essential Home Repairs', image: iconElectricianPlumberCarpenter, onClick: onOpenElectricianPlumberCarpenter },
  ]


  // ── Preview-carousel data — every rating/reviews/price/original
  // price below is real, taken from the reference as given. ──────────
  const newAndNoteworthy: HomePreviewItem[] = [
    { id: 'nn-full-home-cleaning', title: 'Full Home/ By Room Cleaning', rating: '4.8', reviews: '7M', price: 978, icon: <IcoCleaning />, image: nnFullHomeCleaningImg },
    { id: 'nn-full-home-painting', title: 'Full home painting', rating: '4.8', reviews: '124K', price: 14999, icon: <IcoPainting />, image: nnFullHomePaintingImg },
    { id: 'nn-living-bedroom-cleaning', title: 'Living & Bedroom Cleaning', rating: '4.79', reviews: '312K', price: 549, icon: <IcoCleaning />, image: nnLivingBedroomCleaningImg },
    { id: 'nn-wall-panels', title: 'Wall Panels', badge: 'New', rating: '4.86', reviews: '18K', price: 1499, icon: <IcoFlooring />, image: nnWallPanelsImg },
    { id: 'nn-stove-repair', title: 'Stove Service & Repair', rating: '4.82', reviews: '96K', price: 299, icon: <IcoAppliance />, image: nnStoveRepairImg },
    { id: 'nn-laptop-repair', title: 'Laptop Repair', rating: '4.77', reviews: '21K', price: 299, icon: <IcoTool />, image: nnLaptopRepairImg },
    { id: 'nn-spa-ayurveda', title: 'Spa Ayurveda', rating: '4.84', reviews: '541K', price: 949, icon: <IcoSpaLeaf />, image: nnSpaAyurvedaImg },
    { id: 'nn-hair-studio-women', title: 'Hair Studio for Women', rating: '4.83', reviews: '412K', price: 399, icon: <IcoHairDryer />, image: nnHairStudioWomenImg },
    { id: 'nn-ac', title: 'AC', rating: '4.73', reviews: '859K', price: 299, icon: <IcoHvac />, image: nnAcImg },
  ]

  const mostBooked: HomePreviewItem[] = [
    { id: 'mb-intense-cleaning-2bhk', title: 'Intense cleaning (2 bathroom)', rating: '4.80', reviews: '7M', price: 978, originalPrice: 1058, icon: <IcoBathroom /> },
    { id: 'mb-intense-cleaning-3bhk', title: 'Intense cleaning (3 bathroom)', rating: '4.80', reviews: '7M', price: 1437, originalPrice: 1587, icon: <IcoBathroom /> },
    { id: 'mb-plumber-consultation', title: 'Plumber consultation', rating: '4.74', reviews: '206K', price: 49, icon: <IcoPlumbing /> },
    { id: 'mb-ac-repair', title: 'AC repair', rating: '4.73', reviews: '859K', price: 299, icon: <IcoHvac /> },
    { id: 'mb-electrician-consultation', title: 'Electrician consultation', rating: '4.75', reviews: '170K', price: 49, icon: <IcoElectrical /> },
  ]

  // These 4 are the exact same catalogue as the already-built Massage
  // Prime page — same titles, ratings, reviews and prices — so this
  // carousel links straight into that real page rather than a generic
  // category, the deepest connection this data honestly supports.
  const massageForMen: HomePreviewItem[] = [
    { id: 'mfm-quick-comfort', title: 'Quick comfort therapy', badge: '17% OFF', rating: '4.81', reviews: '23K', price: 999, originalPrice: 1199, icon: <IcoMassageHands /> },
    { id: 'mfm-leg-relief', title: 'Leg relief massage', rating: '4.85', reviews: '15K', price: 919, icon: <IcoMassageHands /> },
    { id: 'mfm-top-to-toe', title: 'Top-to-toe stress relief massage', rating: '4.83', reviews: '35K', price: 1979, icon: <IcoMassageHands /> },
    { id: 'mfm-back-relief', title: 'Back relief massage', rating: '4.85', reviews: '13K', price: 919, icon: <IcoMassageHands /> },
  ]

  const salonForWomen: HomePreviewItem[] = [
    { id: 'sfw-roll-on-waxing', title: 'Roll-on waxing (Full arms, legs & underarms)', rating: '4.86', reviews: '248K', price: 899, icon: <IcoPersonalCare /> },
    { id: 'sfw-crystal-rose-pedicure', title: 'Crystal rose pedicure', rating: '4.83', reviews: '328K', price: 759, icon: <IcoPersonalCare /> },
    { id: 'sfw-power-glow-cleanup', title: 'Power glow cleanup', rating: '4.86', reviews: '146K', price: 699, icon: <IcoLipstick /> },
    { id: 'sfw-sara-fruit-cleanup', title: 'Sara fruit cleanup', rating: '4.85', reviews: '158K', price: 729, icon: <IcoLipstick /> },
  ]

  const cleaningEssentials: HomePreviewItem[] = [
    { id: 'ce-intense-cleaning-2bhk', title: 'Intense cleaning (2 bathroom)', rating: '4.80', reviews: '7M', price: 978, originalPrice: 1058, icon: <IcoBathroom /> },
    { id: 'ce-intense-cleaning-3bhk', title: 'Intense cleaning (3 bathroom)', rating: '4.80', reviews: '7M', price: 1437, originalPrice: 1587, icon: <IcoBathroom /> },
    { id: 'ce-fridge-cleaning', title: 'Fridge cleaning', rating: '4.84', reviews: '174K', price: 399, icon: <IcoAppliance /> },
    { id: 'ce-pest-control', title: 'Pest control (includes utensil removal)', rating: '4.79', reviews: '166K', price: 1399, icon: <IcoPestControl /> },
    { id: 'ce-kitchen-window-cleaning', title: 'Kitchen window cleaning', rating: '4.78', reviews: '73K', price: 399, icon: <IcoWindowsDoors /> },
  ]

  const applianceRepairService: HomePreviewItem[] = [
    { id: 'ars-ac-repair', title: 'AC repair', rating: '4.73', reviews: '859K', price: 299, icon: <IcoHvac /> },
    { id: 'ars-water-purifier', title: 'Water Purifier Service & Installation', rating: '4.80', reviews: '313K', price: 299, icon: <IcoAppliance /> },
    { id: 'ars-geyser-checkup', title: 'Geyser check-up', rating: '4.72', reviews: '147K', price: 249, icon: <IcoAppliance /> },
    { id: 'ars-foam-jet-ac', title: 'Foam-jet AC service', rating: '4.75', reviews: '2.9M', price: 699, icon: <IcoHvac /> },
    { id: 'ars-geyser-service', title: 'Geyser service', rating: '4.76', reviews: '102K', price: 599, icon: <IcoAppliance /> },
  ]

  const homeRepairInstallation: HomePreviewItem[] = [
    { id: 'hri-plumber-consultation', title: 'Plumber consultation', rating: '4.74', reviews: '206K', price: 49, icon: <IcoPlumbing /> },
    { id: 'hri-flush-tank-repair', title: 'Flush tank repair', rating: '4.76', reviews: '157K', price: 149, icon: <IcoPlumbing /> },
    { id: 'hri-electrician-consultation', title: 'Electrician consultation', rating: '4.75', reviews: '170K', price: 49, icon: <IcoElectrical /> },
    { id: 'hri-fan-repair', title: 'Fan repair', rating: '4.80', reviews: '190K', price: 149, icon: <IcoElectrical /> },
    { id: 'hri-book-carpenter', title: 'Book a carpenter', rating: '4.66', reviews: '183K', price: 49, icon: <IcoCarpentry /> },
  ]

  const spaForWomen: HomePreviewItem[] = [
    { id: 'sfw2-leg-relief', title: 'Leg relief massage', rating: '4.83', reviews: '18K', price: 929, icon: <IcoMassageHands /> },
    { id: 'sfw2-quick-comfort', title: 'Quick comfort therapy', badge: '17% OFF', rating: '4.80', reviews: '20K', price: 999, originalPrice: 1199, icon: <IcoMassageHands /> },
    { id: 'sfw2-top-to-toe', title: 'Top-to-toe stress relief massage', rating: '4.81', reviews: '63K', price: 1929, icon: <IcoMassageHands /> },
    { id: 'sfw2-full-body-scrub', title: 'Full body massage & scrub', rating: '4.82', reviews: '58K', price: 1699, icon: <IcoMassageHands /> },
    { id: 'sfw2-back-relief', title: 'Back relief massage', rating: '4.84', reviews: '12K', price: 929, icon: <IcoMassageHands /> },
  ]

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero banner — built from the reference's own top-of-page hero
          (headline "Home services at your doorstep", a real-photo
          collage, and a "4.8 Service Rating* / 12M+ Customers
          Globally*" stat row) but not reproduced as-is: those are
          Urban Company's own real business metrics and real branded
          partner photography, and this app has neither, so claiming
          them here would misrepresent Houzeify. This keeps the
          reference's intent — a warm welcome banner above the service
          grid — with original Houzeify copy, the same icon-on-gradient
          placeholder every other missing-photo surface in this app
          uses instead of a photo, and the app's own already-established
          Houzeify Promise claims (Verified Professionals / Hassle Free
          Booking / Transparent Pricing) in place of fabricated stats. */}
      <div
        className="relative w-full overflow-hidden rounded-[20px]"
        style={{ background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
      >
        <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
          <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Services</span>
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[75%] sm:max-w-[460px]" style={{ fontFamily: FONT_HEAD }}>
            Home services, right at your doorstep.
          </h1>
          <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[75%] sm:max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
            Verified professionals for repairs, cleaning, salon care & more — booked in a few taps, at a price you can trust.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1">
            {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[12.5px] text-[#242326] font-medium" style={{ fontFamily: FONT_BODY }}>
                <IcoCheck /> {t}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-[30%] sm:w-[34%] flex items-center justify-center text-[#722ED1] opacity-20">
          <div style={{ transform: 'scale(3.4)' }}><IcoHomeGeneral /></div>
        </div>
      </div>

      {/* Location + search — functional pieces the old separate catalogue
          page carried; kept here so nothing was dropped in the merge. */}
      <LocationBar city={city} state={state} onChangeLocation={onChangeLocation} onSetLocation={onSetLocation} />
      <ServiceSearch value={query} onChange={onQueryChange} />

      {isSearching ? (
        <SearchResults
          query={query.trim()}
          results={searchResults}
          onSelect={onSelectCategory}
          onAskHozie={onAskHozie}
        />
      ) : (
        <>
      <SelectAServiceSection tiles={tiles} />

      {/* ── In the spotlight ── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[19px] sm:text-[22px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>In the spotlight</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <HomePromoBanner
            badge="Trending"
            heading="A beautiful fix for damp walls"
            subtext="Wall panels"
            ctaLabel="Explore"
            onCta={() => onNavigate('wall-panels-installation')}
            gradient="linear-gradient(135deg, #F4F0EC 0%, #E9E1D8 100%)"
            icon={<IcoFlooring />}
            image={wallPanelsBannerImg}
            compact
          />
          <HomePromoBanner
            heading="Every repair job, sorted"
            subtext="Essential Home Repairs"
            ctaLabel="Book now"
            onCta={onOpenElectricianPlumberCarpenter}
            gradient="linear-gradient(135deg, #F9F5FF 0%, #F3EAFF 100%)"
            icon={<IcoTool />}
            image={electricianBannerImg}
            compact
          />
          <HomePromoBanner
            heading="Skin & spa care, elevated"
            subtext="Facials, cleanups & more"
            ctaLabel="Book now"
            onCta={onOpenWomensSalonSpa}
            gradient="linear-gradient(135deg, #FFF3EA 0%, #FDE8D8 100%)"
            icon={<IcoLipstick />}
            image={skinSpaCareBannerImg}
            compact
          />
        </div>
      </div>

      {/* ── New and noteworthy ── */}
      <HomeCarouselSection title="New and noteworthy" items={newAndNoteworthy} />

      {/* ── Thoughtful curations ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[19px] sm:text-[22px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>Thoughtful curations</h2>
          <p className="text-[12.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>of our finest experiences</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <HomeStoryCard title="Facials & Cleanups" icon={<IcoLipstick />} image={tcFacialsCleanupsImg} onSelect={onOpenWomensSalonSpa} />
          <HomeStoryCard title="Spa for Women" icon={<IcoSpaLeaf />} image={tcSpaForWomenImg} onSelect={onOpenWomensSalonSpa} />
          <HomeStoryCard title="Massage for Men" icon={<IcoMassageHands />} image={tcMassageForMenImg} onSelect={onOpenMensSalon} />
          <HomeStoryCard title="Salon for Men" icon={<IcoSalonMirror />} image={tcSalonForMenImg} onSelect={onOpenMensSalon} />
          <HomeStoryCard title="Painting & Waterproofing" icon={<IcoWaterproofing />} image={tcPaintingWaterproofingImg} onSelect={onOpenPaintingWaterproofing} />
        </div>
      </div>

      {/* ── Most booked services ── */}
      <HomeCarouselSection
        title="Most booked services"
        items={mostBooked}
      />

      {/* ── Wall Panels banner ── */}
      <HomePromoBanner
        heading="Wall Panels"
        subtext="Level up your walls"
        ctaLabel="Know more"
        onCta={() => onNavigate('wall-panels-installation')}
        gradient="linear-gradient(120deg, #FBEFE6 0%, #F4E4D6 100%)"
        icon={<IcoFlooring />}
      />

      {/* ── Massage for Men — these 4 items are the exact same
          catalogue as the already-built Massage Prime page, so this
          links straight there rather than the generic category. ── */}
      <HomeCarouselSection
        title="Massage for Men"
        items={massageForMen}
        onSeeAll={() => onNavigate('massage-prime')}
      />

      {/* ── A cleaner home banner ── */}
      <HomePromoBanner
        heading="A cleaner home, without any hassle"
        subtext="Full home cleaning starting from ₹3,499"
        ctaLabel="Book now"
        onCta={onOpenCleaningPestControl}
        gradient="linear-gradient(120deg, #F0E9DF 0%, #E7DACB 100%)"
        icon={<IcoCleaning />}
      />

      {/* ── Salon for Women ── */}
      <HomeCarouselSection
        title="Salon for Women"
        subtitle="Pamper yourself at home"
        items={salonForWomen}
        onSeeAll={onOpenWomensSalonSpa}
      />

      {/* ── Cleaning Essentials ── */}
      <HomeCarouselSection
        title="Cleaning Essentials"
        subtitle="Monthly cleaning essential services"
        items={cleaningEssentials}
        onSeeAll={onOpenCleaningPestControl}
      />

      {/* ── Home painting banner ── */}
      <HomePromoBanner
        heading="Give your space the glow-up it deserves"
        subtext="Home painting"
        ctaLabel="Buy now"
        onCta={onOpenPaintingWaterproofing}
        gradient="linear-gradient(120deg, #FBF0DC 0%, #F5E4C2 100%)"
        icon={<IcoPainting />}
      />

      {/* ── Appliance repair & service ── */}
      <HomeCarouselSection
        title="Appliance repair & service"
        items={applianceRepairService}
        onSeeAll={() => goCategory('ac-service-repair')}
      />

      {/* ── Home repair & installation ── */}
      <HomeCarouselSection
        title="Home repair & installation"
        items={homeRepairInstallation}
        onSeeAll={onOpenElectricianPlumberCarpenter}
      />

      {/* ── Spa for Women ── */}
      <HomeCarouselSection
        title="Spa for Women"
        items={spaForWomen}
        onSeeAll={onOpenWomensSalonSpa}
      />

        </>
      )}
    </div>
  )
}

// ─── Hoziehelper — instant-booking tier picker ─────────────────────────────
// Opens over the catalogue when the "Hoziehelper" tile is tapped, matching
// the reference popup's layout/copy/pricing under Houzeify's own branding
// (Instahelp → HozieHelp, Instahelp Gold → HozieHelp Gold, Instahelp
// Standard → HozieHelp Standard). Each tier's photo is a real, Houzeify-
// branded asset supplied for this feature (src/imports/Hoziehelper/) —
// unlike every other card in this app, which still has no real photography
// and falls back to an icon-on-gradient placeholder (see ServiceImage's own
// header comment); this is the one place that placeholder doesn't apply.
// Selecting a tier closes the popup and hands off into the existing, real
// Create Service Request flow (Screen 016) against a real, active category
// (home-maintenance) — the same honest "real screen, never a fake
// checkout" rule every other tile here follows — with the chosen tier and
// its promised earliest time carried along as real context, not silently
// dropped.

const IcoHozieBroom = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M31 3L20 14"/>
    <path d="M14 14l3 3-8 8-5-5 8-8 2 2z"/>
    <path d="M9 19l6 6"/>
  </svg>
)
const IcoHozieBolt = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7.5 1L2 8h3.5L6 13l5.5-7H8L7.5 1Z"/></svg>
)
const IcoHozieClock = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.8"/>
    <path d="M7 3.8V7l2.3 1.3"/>
  </svg>
)
const IcoHozieChevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
)
const IcoHozieClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
)

interface HoziehelperTier {
  id: 'gold' | 'standard'
  title: string
  topRated?: boolean
  price: string
  earliest: string
  description: string
  image: string
}

const HOZIEHELPER_TIERS: HoziehelperTier[] = [
  { id: 'gold', title: 'HozieHelp Gold', topRated: true, price: 'Starts at ₹79/visit', earliest: 'Earliest : Today, 11:00 AM', description: 'Top rated & more experienced', image: hoziehelperGoldImg },
  { id: 'standard', title: 'HozieHelp Standard', price: 'Starts at ₹49/visit', earliest: 'Earliest : Today, 12:30 PM', description: 'Trained in all home chores', image: hoziehelperStandardImg },
]

function HoziehelperModal({ onClose, onSelectTier }: { onClose: () => void; onSelectTier: (tier: HoziehelperTier) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="HozieHelp"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 420, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-center justify-end px-4 pt-4 shrink-0">
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {/* Hero */}
          <div className="relative overflow-hidden px-6 pt-3 pb-8 mt-1" style={{ background: 'linear-gradient(135deg, #722ED1 0%, #5B1FB0 100%)' }}>
            <div className="absolute -top-1 -right-1 opacity-90" style={{ transform: 'rotate(12deg)' }}><IcoHozieBroom /></div>
            <div className="absolute bottom-3 -left-2 opacity-90" style={{ transform: 'rotate(-18deg)' }}><IcoHozieBroom size={26} /></div>
            <div className="relative flex flex-col gap-2 items-start pt-2">
              <span className="text-white text-[32px] font-bold leading-none" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                HozieHelp
              </span>
              <span className="flex items-center gap-1.5 text-white text-[13px] font-semibold" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoHozieBolt /> Arriving in minutes
              </span>
            </div>
          </div>

          {/* Tiers */}
          <div className="flex flex-col">
            {HOZIEHELPER_TIERS.map((tier, i) => (
              <button
                key={tier.id}
                onClick={() => onSelectTier(tier)}
                className={`w-full flex items-center gap-4 text-left px-5 py-5 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${i > 0 ? 'border-t border-[#F4F0EC]' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className="w-[96px] h-[128px] rounded-[14px] overflow-hidden shrink-0" aria-label={tier.title} role="img">
                    <img src={tier.image} alt={tier.title} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
                  </div>
                  {tier.topRated && (
                    <span
                      className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: '#D4A017', fontFamily: '"Inter Variable", sans-serif' }}
                    >
                      ★ Top rated
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{tier.title}</span>
                  <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{tier.price}</span>
                  <span className="flex items-center gap-1.5 text-[12.5px] text-[#68636D] font-semibold" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                    <IcoHozieClock /> {tier.earliest}
                  </span>
                  <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{tier.description}</span>
                </div>
                <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Women's Salon & Spa — picker ───────────────────────────────────────────
// Opens over the catalogue when the "Women's Salon & Spa" tile is tapped —
// same "pick a specific service before booking" pattern as the HozieHelp
// picker above, but for the four real, already-active categories under the
// personal-care-at-home group (see homeServices.ts's SERVICE_META) rather
// than one generic catalogue entry. Names come straight from
// getServiceCategory() — never a second, hand-typed copy of the same
// label — and each image is a real, Houzeify-branded illustration supplied
// for this picker (src/imports/Services icons/), same as the landing
// grid's own tiles — rendered as a plain <img>, never through ServiceImage
// (see that component's own header comment on why). Selecting one hands
// off to the existing, real Service Category Detail flow (Screen 015) —
// same honest "real screen, never a fake picker" rule as everywhere else
// on this page.

const WOMENS_SALON_SPA_OPTIONS: { id: 'salon-spa-women' | 'spa-for-women' | 'hair-studio-women' | 'makeup-saree-styling'; image: string }[] = [
  { id: 'salon-spa-women', image: iconSalonForWomen },
  { id: 'spa-for-women', image: iconSpaForWomen },
  { id: 'hair-studio-women', image: iconHairStudioForWomen },
  { id: 'makeup-saree-styling', image: iconMakeupSareeStyling },
]

function WomensSalonSpaModal({ onClose, onSelectCategory }: { onClose: () => void; onSelectCategory: (categoryId: string) => void }) {
  const options = WOMENS_SALON_SPA_OPTIONS
    .map(opt => ({ ...opt, category: getServiceCategory(opt.id) }))
    .filter((opt): opt is typeof opt & { category: ServiceCategoryMeta } => !!opt.category)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Women's Salon & Spa"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 shrink-0">
          <h2 className="text-[26px] sm:text-[30px] font-bold text-[#242326] leading-tight m-0" style={{ fontFamily: FONT_HEAD }}>
            Women's Salon & Spa
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white shrink-0"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-5 pb-6" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {options.map(({ id, image, category }) => (
              <button
                key={id}
                onClick={() => onSelectCategory(id)}
                className="group flex flex-col items-center gap-2.5 text-center bg-white rounded-[16px] border border-[#E3DDD7] p-3 cursor-pointer hover:border-[#722ED1] transition-all"
              >
                <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#F3EAFF]">
                  {/* Grayscale by default, full color on hover/focus — these
                      four only have one image each (no separate hover
                      asset like the landing tiles above), so the reveal is
                      a CSS filter rather than an image swap. */}
                  <img
                    src={image}
                    alt={category.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition-[filter] duration-200"
                    style={{ objectPosition: '50% 20%' }}
                  />
                </div>
                <span className="text-[13px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Salon for Women — professional tier picker ────────────────────────────
// A second, nested popup opened from the Women's Salon & Spa picker's
// "Salon for Women" option — same "pick a specific service before
// booking" chain as HozieHelp, just one level deeper. Honest departures
// from the UC reference this was matched against:
//   - The reference's "Japanese glow rituals / New launch" hero is a real
//     marketing campaign for a real company; this hero uses fresh
//     Houzeify-written copy instead of reproducing someone else's
//     campaign name.
//   - The reference's per-tier tags name real cosmetic brands (CASMARA,
//     CIREPIL, O3+, RICA) — reusing those would read as a false claim
//     that this app is affiliated with those brands, so the tags here are
//     generic, honest descriptions instead.
//   - Each tier's photo is a real, Houzeify-branded asset supplied for
//     this picker (src/imports/Services icons/), same as HozieHelp Gold/
//     Standard's own tier photos — rendered as a plain <img>, never
//     through ServiceImage (see that component's own header comment on
//     why this is the one place its placeholder doesn't apply).
//   - Price and "earliest" text are flat, representative demo values,
//     same convention as HOZIEHELPER_TIERS above.
// The back chevron returns to the Women's Salon & Spa popup it came from;
// ✕ closes straight back to the Services page, same as every other popup
// in this file. Selecting a tier hands off into the existing, real Create
// Service Request flow (Screen 016) for salon-spa-women, carrying the
// tier choice along as real context — same pattern as hoziehelper_tier.

interface SalonTier {
  id: 'luxe' | 'prime'
  title: string
  image: string
  topRated?: boolean
  tags: string[]
  startingPrice: string
  earliest?: string
}

const SALON_TIERS: SalonTier[] = [
  { id: 'luxe', title: 'Luxe', image: salonTierLuxeImg, topRated: true, tags: ['Premium products', 'Certified experts'], startingPrice: '799' },
  { id: 'prime', title: 'Prime', image: salonTierPrimeImg, tags: ['Trained professionals', 'Affordable care'], startingPrice: '599', earliest: 'Earliest : Today, 1:15 PM' },
]

const IcoChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoClock = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.8"/>
    <path d="M7 3.8V7l2.3 1.3"/>
  </svg>
)

function SalonTierRow({ tier, isFirst, onSelect }: { tier: SalonTier; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 text-left px-4 py-4 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${isFirst ? '' : 'border-t border-[#F4F0EC]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-[76px] h-[96px] rounded-[14px] overflow-hidden shrink-0" aria-label={tier.title} role="img">
          <img src={tier.image} alt={tier.title} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
        </div>
        {tier.topRated && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Top rated pros
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{tier.title}</span>
        <div className="flex flex-wrap gap-1.5">
          {tier.tags.map(tag => (
            <span key={tag} className="px-2 py-[3px] rounded-[6px] bg-[#F4F0EC] text-[11px] text-[#68636D] font-semibold" style={{ fontFamily: FONT_BODY }}>{tag}</span>
          ))}
        </div>
        {tier.earliest && (
          <span className="flex items-center gap-1.5 text-[12px] text-[#0F8A4C] font-semibold" style={{ fontFamily: FONT_BODY }}>
            <IcoClock /> {tier.earliest}
          </span>
        )}
        <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>Starting at ₹{tier.startingPrice}</span>
      </div>
      <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
    </button>
  )
}

function SalonForWomenModal({ onBack, onClose, onSelectTier }: { onBack: () => void; onClose: () => void; onSelectTier: (tier: SalonTier) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Salon for Women"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Back to Women's Salon & Spa"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoChevronLeft />
          </button>
          <h2 className="text-[17px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Salon for Women</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pt-3 pb-5" style={{ scrollbarWidth: 'none' }}>
          <div
            className="relative w-full overflow-hidden rounded-[16px] h-[150px] sm:h-[140px]"
            style={{ background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
          >
            <div className="absolute inset-0 flex items-center px-4 sm:px-5">
              {/* max-w and font sizes shrink at this modal's own narrow
                  (mobile) width so the subtitle wraps inside its own
                  column instead of overflowing under the image — same
                  fix as HeroBanner's in HoziehelperGoldScreen.tsx. */}
              <div className="flex flex-col gap-1.5 max-w-[128px] sm:max-w-[220px]">
                <h3 className="text-[16px] sm:text-[19px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Salon &amp; spa,<br />styled for you
                </h3>
                <p className="text-[11px] sm:text-[12.5px] text-[#68636D] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
                  Skilled stylists, at your doorstep.
                </p>
              </div>
            </div>
            <img
              src={iconSalonForWomen}
              alt="Salon for Women"
              className="absolute right-0 bottom-0 h-full object-cover w-[36%] sm:w-[42%]"
              style={{ objectPosition: '50% 15%', maskImage: 'linear-gradient(90deg, transparent, black 12%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%)' }}
            />
          </div>

          <h3 className="text-[14px] font-semibold text-[#242326] m-0 mt-5 mb-2" style={{ fontFamily: FONT_HEAD }}>Choose your professional</h3>
          <div className="border border-[#E3DDD7] rounded-[16px] overflow-hidden">
            {SALON_TIERS.map((tier, i) => (
              <SalonTierRow key={tier.id} tier={tier} isFirst={i === 0} onSelect={() => onSelectTier(tier)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── "Spa for Women" tier picker — same nested-popup pattern as
// SalonForWomenModal above, own tier set (Luxe / Prime / Ayurveda). No
// real massage/spa photography exists in this app's image library yet
// (only Salon & Beauty photos do), so each tier uses the same icon-on-
// gradient placeholder treatment as every other missing-photo surface
// in this app, rather than fabricating or reusing an unrelated real
// photo. Matches the reference popup's own layout — no hero banner, a
// plain "Select your preference" heading, and each row's price/
// description sitting side-by-side rather than stacked. ────────────────

interface SpaTier {
  id: 'spa-luxe' | 'spa-prime' | 'spa-ayurveda'
  title: string
  topRated?: boolean
  tag?: string
  startingPrice: string
  description: string
}

const SPA_TIERS: SpaTier[] = [
  { id: 'spa-luxe', title: 'Luxe', topRated: true, tag: 'Aroma oil', startingPrice: '898', description: 'Curated therapies with only highly-rated therapists & oils' },
  { id: 'spa-prime', title: 'Prime', startingPrice: '699', description: 'Regular oil massages with standard techniques & therapist' },
  { id: 'spa-ayurveda', title: 'Ayurveda', tag: 'Herbal oil', startingPrice: '699', description: 'Therapist trained in traditional massage techniques & oils' },
]

function SpaTierRow({ tier, isFirst, onSelect }: { tier: SpaTier; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 text-left px-4 py-4 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${isFirst ? '' : 'border-t border-[#F4F0EC]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-[76px] h-[96px] rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]" aria-label={tier.title} role="img">
          <IcoSpaLeaf />
        </div>
        {tier.topRated && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Top rated
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{tier.title}</span>
        {tier.tag && (
          <span className="self-start px-2 py-[3px] rounded-[6px] bg-[#F4F0EC] text-[11px] tracking-[0.04em] uppercase text-[#68636D] font-semibold" style={{ fontFamily: FONT_BODY }}>{tier.tag}</span>
        )}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <span className="text-[13px] text-[#242326] font-medium whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>Starts at ₹{tier.startingPrice}</span>
          <span className="text-[12.5px] text-[#68636D] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{tier.description}</span>
        </div>
      </div>
      <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
    </button>
  )
}

function SpaForWomenModal({ onBack, onClose, onSelectTier }: { onBack: () => void; onClose: () => void; onSelectTier: (tier: SpaTier) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Spa for Women"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Back to Women's Salon & Spa"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoChevronLeft />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <h2 className="text-[22px] font-bold text-[#242326] m-0 px-5 pt-2 pb-4" style={{ fontFamily: FONT_HEAD }}>Select your preference</h2>
        <div className="border-t border-[#E3DDD7]" />

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {SPA_TIERS.map((tier, i) => (
            <SpaTierRow key={tier.id} tier={tier} isFirst={i === 0} onSelect={() => onSelectTier(tier)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── "Men's Salon & Massage" category picker — same grid-of-options
// pattern as WomensSalonSpaModal, just two entries and icon-on-gradient
// placeholders instead of real photos (no dedicated photo asset exists
// for either "Salon for Men" or "Massage for Men" the way it does for
// the four Women's Salon & Spa categories). Names/descriptions come
// from the same shared catalogue (getServiceCategory) as every other
// category in this file, not a second hand-typed copy. ────────────────

const IcoRazor = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5h6v4H5z" />
    <path d="M5 7.5v9a1.5 1.5 0 003 0v-9M8 7.5v9a1.5 1.5 0 003 0v-9" />
    <path d="M11 3.5h4v2h-4z" />
  </svg>
)
const IcoMassageTable = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="4" rx="1.5" />
    <path d="M4 10v4M16 10v4" />
    <circle cx="7.5" cy="4.5" r="1.3" />
  </svg>
)

const MENS_SALON_MASSAGE_OPTIONS: { id: 'salon-for-men' | 'massage-for-men'; icon: React.ReactNode }[] = [
  { id: 'salon-for-men', icon: <IcoRazor /> },
  { id: 'massage-for-men', icon: <IcoMassageTable /> },
]

function MensSalonMassageModal({ onClose, onSelectCategory }: { onClose: () => void; onSelectCategory: (categoryId: string) => void }) {
  const options = MENS_SALON_MASSAGE_OPTIONS
    .map(opt => ({ ...opt, category: getServiceCategory(opt.id) }))
    .filter((opt): opt is typeof opt & { category: ServiceCategoryMeta } => !!opt.category)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Men's Salon & Massage"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 shrink-0">
          <h2 className="text-[26px] sm:text-[30px] font-bold text-[#242326] leading-tight m-0" style={{ fontFamily: FONT_HEAD }}>
            Men's Salon &amp; Massage
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white shrink-0"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-5 pb-6" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {options.map(({ id, icon, category }) => (
              <button
                key={id}
                onClick={() => onSelectCategory(id)}
                className="group flex flex-col items-center gap-2.5 text-center bg-white rounded-[16px] border border-[#E3DDD7] p-3 cursor-pointer hover:border-[#722ED1] transition-all"
              >
                <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#F3EAFF] flex items-center justify-center text-[#722ED1]">
                  {icon}
                </div>
                <span className="text-[13px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Cleaning & Pest Control — category picker ─────────────────────────
// Opens over the catalogue when the "Cleaning & Pest Control" tile is
// tapped, matching the reference popup's own two-section layout
// exactly (a "Cleaning" group of 4 categories, then a "Pest Control"
// group of 3) — same compact icon-tile grid as every other category
// picker in this file (HozieHelp, Women's Salon & Spa, Men's Salon &
// Massage), not the larger browse-grid ServiceCategoryCard used on the
// full catalogue pages. Every id/name/description/icon here comes from
// this app's one real category catalogue (getServiceCategory /
// iconForCategory) — never a second, hand-typed copy — and all 7 were
// already real, active categories before this modal existed (4 already
// live in the Cleaning Services catalogue, 3 in Home Services' own
// Pest Control group), so every tile lands on a real, already-working
// category page.
const CLEANING_PICKER_IDS = ['bathroom-cleaning', 'kitchen-cleaning', 'living-bedroom-cleaning', 'full-home-cleaning'] as const
const PEST_CONTROL_PICKER_IDS = ['cockroach-control', 'termite-control', 'ants-bedbugs-control'] as const

function CleaningPestControlModal({ onClose, onSelectCategory }: { onClose: () => void; onSelectCategory: (categoryId: string) => void }) {
  const cleaningItems = CLEANING_PICKER_IDS.map(id => getServiceCategory(id)).filter((c): c is ServiceCategoryMeta => !!c)
  const pestItems = PEST_CONTROL_PICKER_IDS.map(id => getServiceCategory(id)).filter((c): c is ServiceCategoryMeta => !!c)

  const renderTile = (category: ServiceCategoryMeta) => (
    <button
      key={category.id}
      onClick={() => onSelectCategory(category.id)}
      className="group flex flex-col items-center gap-2.5 text-center bg-white rounded-[16px] border border-[#E3DDD7] p-3 cursor-pointer hover:border-[#722ED1] transition-all"
    >
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#F3EAFF] flex items-center justify-center text-[#722ED1]">
        {iconForCategory(category)}
      </div>
      <span className="text-[13px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{category.name}</span>
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Cleaning & Pest Control"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 shrink-0">
          <h2 className="text-[26px] sm:text-[30px] font-bold text-[#242326] leading-tight m-0" style={{ fontFamily: FONT_HEAD }}>
            Cleaning &amp; Pest Control
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white shrink-0"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-5 pb-6 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Cleaning</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cleaningItems.map(renderTile)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Pest Control</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pestItems.map(renderTile)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Electrician, Plumber & Carpenter — category picker ────────────────
// Same "pick a specific service first" pattern as Cleaning & Pest
// Control (above) — real "Home repairs"/"Home installation" sections
// from the reference screenshot, every tile a real, already-active
// category from this app's one real catalogue (getServiceCategory /
// iconForCategory) — never a second, hand-typed copy. Wall Panels by
// Revamp is the one tile with its own real detail/booking page
// already built (wall-panels-installation), so it's routed there
// directly by the caller rather than the generic category flow. ────────

const ELECTRICIAN_PLUMBER_CARPENTER_REPAIR_IDS = ['electrical', 'plumbing', 'carpentry', 'civil-work'] as const
const ELECTRICIAN_PLUMBER_CARPENTER_INSTALL_IDS = ['furniture-assembly', 'geyser-service-repair', 'tile-grouting', 'lights-installation', 'wall-panels-installation'] as const

function ElectricianPlumberCarpenterModal({ onClose, onSelectCategory }: { onClose: () => void; onSelectCategory: (categoryId: string) => void }) {
  const repairItems = ELECTRICIAN_PLUMBER_CARPENTER_REPAIR_IDS.map(id => getServiceCategory(id)).filter((c): c is ServiceCategoryMeta => !!c)
  const installItems = ELECTRICIAN_PLUMBER_CARPENTER_INSTALL_IDS.map(id => getServiceCategory(id)).filter((c): c is ServiceCategoryMeta => !!c)

  const renderTile = (category: ServiceCategoryMeta) => (
    <button
      key={category.id}
      onClick={() => onSelectCategory(category.id)}
      className="group flex flex-col items-center gap-2.5 text-center bg-white rounded-[16px] border border-[#E3DDD7] p-3 cursor-pointer hover:border-[#722ED1] transition-all"
    >
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#F3EAFF] flex items-center justify-center text-[#722ED1]">
        {category.id === 'wall-panels-installation' ? (
          <img src={iconWallPanels} alt="" className="w-full h-full object-cover" />
        ) : (
          iconForCategory(category)
        )}
      </div>
      <span className="text-[13px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{category.name}</span>
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Essential Home Repairs"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 shrink-0">
          <h2 className="text-[26px] sm:text-[30px] font-bold text-[#242326] leading-tight m-0" style={{ fontFamily: FONT_HEAD }}>
            Essential Home Repairs
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white shrink-0"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-5 pb-6 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Home repairs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {repairItems.map(renderTile)}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Home installation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {installItems.map(renderTile)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Salon for Men — professional tier picker ──────────────────────────
// A second, nested popup opened from the Men's Salon & Massage picker's
// "Salon for Men" option — same "pick a specific service before
// booking" chain as Salon for Women, one level deeper. Same honest
// departure from the UC reference as Salon for Women's own tier picker:
// the reference's per-tier tags name real cosmetic brands (INOA,
// REPÊCHAGE, O3+, L'ORÉAL, Bombay Shaving Company) — reusing those
// would read as a false claim that this app is affiliated with those
// brands, so the tags here are the same generic, honest descriptions
// Salon for Women's own Luxe/Prime tiers already use. No dedicated
// photo asset exists for these tiers, so this uses the same icon-on-
// gradient placeholder as Spa for Women's own tier picker rather than a
// fabricated or borrowed photo. ─────────────────────────────────────

interface MensSalonTier {
  id: 'royale' | 'mens-prime'
  title: string
  topRated?: boolean
  tags: string[]
  startingPrice: string
  description: string
}

const MENS_SALON_TIERS: MensSalonTier[] = [
  { id: 'royale', title: 'Royale', topRated: true, tags: ['Premium products', 'Certified experts'], startingPrice: '449', description: 'Only top professionals for advanced cuts, beard styling & facials.' },
  { id: 'mens-prime', title: 'Prime', tags: ['Trained professionals', 'Affordable care'], startingPrice: '249', description: 'Everyday cuts, color & cleanup.' },
]

function MensSalonTierRow({ tier, isFirst, onSelect }: { tier: MensSalonTier; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 text-left px-4 py-4 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${isFirst ? '' : 'border-t border-[#F4F0EC]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-[76px] h-[96px] rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]" aria-label={tier.title} role="img">
          <IcoRazor />
        </div>
        {tier.topRated && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Top rated pros
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{tier.title}</span>
        <div className="flex flex-wrap gap-1.5">
          {tier.tags.map(tag => (
            <span key={tag} className="px-2 py-[3px] rounded-[6px] bg-[#F4F0EC] text-[11px] text-[#68636D] font-semibold" style={{ fontFamily: FONT_BODY }}>{tag}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <span className="text-[13px] text-[#242326] font-medium whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>Starts at ₹{tier.startingPrice}</span>
          <span className="text-[12.5px] text-[#68636D] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{tier.description}</span>
        </div>
      </div>
      <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
    </button>
  )
}

function SalonForMenModal({ onBack, onClose, onSelectTier }: { onBack: () => void; onClose: () => void; onSelectTier: (tier: MensSalonTier) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Salon for Men"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Back to Men's Salon & Massage"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoChevronLeft />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <h2 className="text-[22px] font-bold text-[#242326] m-0 px-5 pt-2 pb-4" style={{ fontFamily: FONT_HEAD }}>Select your preference</h2>
        <div className="border-t border-[#E3DDD7]" />

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {MENS_SALON_TIERS.map((tier, i) => (
            <MensSalonTierRow key={tier.id} tier={tier} isFirst={i === 0} onSelect={() => onSelectTier(tier)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Painting & Waterproofing — real "Select your scope" popup the
// user supplied a screenshot of. Two real scopes, taken as given
// ("Full home painting" — 1/2/3/4 BHK & above, "Few walls & rooms" —
// individual walls or 1/2/3 rooms); no per-scope pricing page exists
// yet, so both still route to the existing generic category page for
// now (same target as before this popup existed), carrying the chosen
// scope as extra context for whenever a dedicated page is built. No
// real photography exists in this project, so each row uses the same
// icon-on-gradient placeholder every other picker row in this app
// falls back to, instead of the reference's own real photos. The
// reference's own share icon is chrome, not catalogue data, and no
// other picker in this app has one — left out rather than added as
// dead UI.

interface PaintingScope {
  id: 'full-home' | 'few-walls-rooms'
  title: string
  description: string
  icon: React.ReactNode
}

const PAINTING_SCOPES: PaintingScope[] = [
  { id: 'full-home', title: 'Full home painting', description: '1/2/3/4 BHK & above', icon: <IcoHomeOutline /> },
  { id: 'few-walls-rooms', title: 'Few walls & rooms', description: 'Individual walls or 1/2/3 rooms', icon: <IcoWallSection /> },
]

function PaintingScopeRow({ scope, isFirst, onSelect }: { scope: PaintingScope; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 text-left px-5 py-4 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${isFirst ? '' : 'border-t border-[#F4F0EC]'}`}
    >
      <div className="w-[76px] h-[76px] rounded-[14px] shrink-0 flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
        {scope.icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{scope.title}</span>
        <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{scope.description}</span>
      </div>
      <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
    </button>
  )
}

function PaintingWaterproofingModal({ onClose, onSelectScope }: { onClose: () => void; onSelectScope: (scope: PaintingScope) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Painting & Waterproofing"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 shrink-0">
          <button
            onClick={onClose}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoChevronLeft />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <div className="px-5 pt-2 pb-4 flex flex-col gap-1">
          <h2 className="text-[22px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Painting &amp; Waterproofing</h2>
          <span className="text-[14px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Select your scope</span>
        </div>
        <div className="border-t border-[#E3DDD7]" />

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {PAINTING_SCOPES.map((scope, i) => (
            <PaintingScopeRow key={scope.id} scope={scope} isFirst={i === 0} onSelect={() => onSelectScope(scope)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── "Massage for Men" tier picker — the "Massage for Men" option's own
// nested popup, same chain as Salon for Men. Reference's own three tiers
// (Royale / Prime / Ayurveda) carry the exact same pricing and copy
// this app's existing Spa for Women Prime/Ayurveda tiers already use —
// genuinely identical service tiers, gender-neutral massage catalogue —
// only Royale differs from Women's Luxe (₹899 vs ₹898, same "Curated
// therapies…" line). No dedicated tags/pills shown on any of these
// three rows in the reference (unlike Salon for Men's own tiers), so
// none are added here. No dedicated photo asset exists for these
// tiers either, so this reuses the same icon-on-gradient placeholder
// as every other missing-photo tier row in this file. Tier detail
// pages don't exist yet — selecting one falls through to the generic
// request flow, same as every tier waits for its own page. ────────────

interface MassageTier {
  id: 'massage-royale' | 'massage-prime' | 'massage-ayurveda'
  title: string
  topRated?: boolean
  startingPrice: string
  description: string
}

const MASSAGE_FOR_MEN_TIERS: MassageTier[] = [
  { id: 'massage-royale', title: 'Royale', topRated: true, startingPrice: '899', description: 'Curated therapies with only Highly-rated therapists & oils' },
  { id: 'massage-prime', title: 'Prime', startingPrice: '699', description: 'Regular oil massages with standard techniques & therapist' },
  { id: 'massage-ayurveda', title: 'Ayurveda', startingPrice: '699', description: 'Therapist trained in traditional massage techniques & oils' },
]

function MassageTierRow({ tier, isFirst, onSelect }: { tier: MassageTier; isFirst: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-4 text-left px-4 py-4 cursor-pointer border-0 bg-white hover:bg-[#F9F5FF] transition-colors ${isFirst ? '' : 'border-t border-[#F4F0EC]'}`}
    >
      <div className="relative shrink-0">
        <div className="w-[76px] h-[96px] rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]" aria-label={tier.title} role="img">
          <IcoMassageTable />
        </div>
        {tier.topRated && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Top rated
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{tier.title}</span>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <span className="text-[13px] text-[#242326] font-medium whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>Starts at ₹{tier.startingPrice}</span>
          <span className="text-[12.5px] text-[#68636D] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{tier.description}</span>
        </div>
      </div>
      <span className="shrink-0 text-[#9A949D]"><IcoHozieChevron /></span>
    </button>
  )
}

function MassageForMenModal({ onBack, onClose, onSelectTier }: { onBack: () => void; onClose: () => void; onSelectTier: (tier: MassageTier) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(36,35,38,0.32)', animation: 'welcomeFadeUp 0.15s ease-out both' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Massage for Men"
        onClick={e => e.stopPropagation()}
        className="w-full bg-white rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(36,35,38,0.20)' }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 shrink-0">
          <button
            onClick={onBack}
            aria-label="Back to Men's Salon & Massage"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoChevronLeft />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#242326] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-white"
          >
            <IcoHozieClose />
          </button>
        </div>

        <h2 className="text-[22px] font-bold text-[#242326] m-0 px-5 pt-2 pb-4" style={{ fontFamily: FONT_HEAD }}>Select your preference</h2>
        <div className="border-t border-[#E3DDD7]" />

        <div className="overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {MASSAGE_FOR_MEN_TIERS.map((tier, i) => (
            <MassageTierRow key={tier.id} tier={tier} isFirst={i === 0} onSelect={() => onSelectTier(tier)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Screen ────────────────────────────────────────────────────────────
// Screen 014 — Home Services / Cleaning Services. Service DISCOVERY only —
// browsing and search, never a contractor directory, quote page or request
// form. Selecting a category hands off to 015 — Service Category Detail.
// One component, two fully separate catalogues, branched entirely by
// `serviceEntry` — never a single mixed list of both.

export default function HomeServicesScreen({
  onNavigate,
  city,
  state,
  serviceEntry,
  serviceGroup,
  openPicker,
  initialQuery,
  fullName,
  preferredName,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  city?: string
  state?: string
  serviceEntry?: string
  /** Set only by ServiceGroupsLanding's group tiles (projectData.service_group)
   *  — which real HomeServiceGroup section to scroll straight to once the
   *  Home Services catalogue itself has rendered. Never read for 'cleaning'
   *  (that catalogue has no groups), never persisted as a filter — purely a
   *  one-time scroll target for this visit. */
  serviceGroup?: string
  /** Set by the Home Dashboard's "Select a service" tiles
   *  (projectData.open_picker) — which of the landing's in-page pickers to
   *  auto-open on arrival, so a dashboard tile behaves exactly like the same
   *  tile tapped here. One-time, only meaningful on the landing view. */
  openPicker?: string
  /** Customer Implementation 09I — set by the Home Dashboard's search field
   *  (projectData.search_query). Seeds this screen's own existing search
   *  state (query/isSearching/searchResults below) so it renders the exact
   *  same results/routing a search typed here would. One-time. */
  initialQuery?: string
  /** Customer Implementation 10D — the shared initials() helper only (not
   *  the homeownerProfile demo fixture), for the desktop header avatar.
   *  Same real onboarding identity (projectData.full_name / preferred_name)
   *  Home and ServiceCategoryDetailScreen already use. */
  fullName?: string
  preferredName?: string
}) {
  const userInitials = initials(fullName?.trim() || preferredName?.trim() || '')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState(() => initialQuery ?? '')
  const [showHoziehelper, setShowHoziehelper] = useState(false)
  const [showWomensSalonSpa, setShowWomensSalonSpa] = useState(false)
  const [showSalonForWomen, setShowSalonForWomen] = useState(false)
  const [showSpaForWomen, setShowSpaForWomen] = useState(false)
  const [showMensSalonMassage, setShowMensSalonMassage] = useState(false)
  const [showSalonForMen, setShowSalonForMen] = useState(false)
  const [showMassageForMen, setShowMassageForMen] = useState(false)
  const [showCleaningPestControl, setShowCleaningPestControl] = useState(false)
  const [showPaintingWaterproofing, setShowPaintingWaterproofing] = useState(false)
  const [showElectricianPlumberCarpenter, setShowElectricianPlumberCarpenter] = useState(false)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [attempt])

  // Scrolls to the chosen group's own section once the page has finished
  // loading — the group tiles are a shortcut INTO the existing "All Home
  // Services" list further down this page, not a separate filtered view.
  useEffect(() => {
    if (loading || !serviceGroup) return
    const el = document.getElementById(`service-group-${serviceGroup}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, serviceGroup])

  // A dashboard "Select a service" tile arrives with ?open_picker=<id> — open
  // the same in-page picker its HomeServicesScreen twin opens, then clear the
  // flag from projectData right away (same one-shot pattern AIAdvisorScreen
  // uses for ai_query) so returning here later — e.g. via the Services nav
  // tab — never silently re-opens a stale picker.
  useEffect(() => {
    if (!openPicker) return
    if (openPicker === 'hoziehelper') setShowHoziehelper(true)
    else if (openPicker === 'womens-salon-spa') setShowWomensSalonSpa(true)
    else if (openPicker === 'salon-for-women') setShowSalonForWomen(true)
    else if (openPicker === 'mens-salon-massage') setShowMensSalonMassage(true)
    else if (openPicker === 'salon-for-men') setShowSalonForMen(true)
    else if (openPicker === 'cleaning-pest-control') setShowCleaningPestControl(true)
    else if (openPicker === 'painting-waterproofing') setShowPaintingWaterproofing(true)
    else if (openPicker === 'electrician-plumber-carpenter') setShowElectricianPlumberCarpenter(true)
    onNavigate('home-services', { open_picker: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPicker])

  // Customer Implementation 09I — initialQuery already seeded `query`'s own
  // lazy useState initializer above (no flash of the browse view first);
  // this only clears projectData.search_query right after, same one-shot
  // pattern as open_picker, so a later visit to Services never silently
  // re-applies a stale search.
  useEffect(() => {
    if (!initialQuery) return
    onNavigate('home-services', { search_query: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const handleSelectHoziehelperTier = (tier: HoziehelperTier) => {
    setShowHoziehelper(false)
    // Both tiers now get their own detail/booking page — Gold's and
    // Standard's, same layout, each with its own real content (see
    // HoziehelperStandardScreen.tsx's header comment).
    if (tier.id === 'gold') {
      onNavigate('hoziehelper-gold')
      return
    }
    if (tier.id === 'standard') {
      onNavigate('hoziehelper-standard')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'home-maintenance', service_entry: 'home-services' })
  }

  const handleSelectWomensSalonSpaCategory = (categoryId: string) => {
    // "Salon for Women" and "Spa for Women" each open a second, nested
    // popup (SalonForWomenModal / SpaForWomenModal, below) to pick a
    // professional tier before booking. "Hair Studio for Women" and
    // "Makeup, Saree & Styling" have no tiers, so they go straight to
    // their own dedicated pages.
    if (categoryId === 'salon-spa-women') {
      setShowWomensSalonSpa(false)
      setShowSalonForWomen(true)
      return
    }
    if (categoryId === 'spa-for-women') {
      setShowWomensSalonSpa(false)
      setShowSpaForWomen(true)
      return
    }
    if (categoryId === 'hair-studio-women') {
      setShowWomensSalonSpa(false)
      onNavigate('hair-studio-for-women')
      return
    }
    if (categoryId === 'makeup-saree-styling') {
      setShowWomensSalonSpa(false)
      onNavigate('makeup-saree-styling')
      return
    }
    setShowWomensSalonSpa(false)
    onNavigate('service-category-detail', { service_category_id: categoryId, service_entry: 'home-services' })
  }

  const handleSelectSpaTier = (tier: SpaTier) => {
    setShowSpaForWomen(false)
    // Each Spa tier now has its own detail/booking page with a real cart.
    if (tier.id === 'spa-luxe') {
      onNavigate('spa-luxe')
      return
    }
    if (tier.id === 'spa-prime') {
      onNavigate('spa-prime')
      return
    }
    if (tier.id === 'spa-ayurveda') {
      onNavigate('spa-ayurveda')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'spa-for-women', service_entry: 'home-services' })
  }

  const handleSelectSalonTier = (tier: SalonTier) => {
    setShowSalonForWomen(false)
    // Both tiers now have their own detail/booking page with a real cart —
    // Luxe (SalonLuxeScreen) and Prime (PrimeScreen).
    if (tier.id === 'luxe') {
      onNavigate('salon-luxe')
      return
    }
    if (tier.id === 'prime') {
      onNavigate('prime')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'salon-spa-women', service_entry: 'home-services' })
  }

  const handleSelectMensSalonMassageCategory = (categoryId: string) => {
    // Both "Salon for Men" and "Massage for Men" open a second, nested
    // popup to pick a professional tier before booking — same chain as
    // Salon/Spa for Women.
    if (categoryId === 'salon-for-men') {
      setShowMensSalonMassage(false)
      setShowSalonForMen(true)
      return
    }
    if (categoryId === 'massage-for-men') {
      setShowMensSalonMassage(false)
      setShowMassageForMen(true)
      return
    }
    setShowMensSalonMassage(false)
    onNavigate('service-category-detail', { service_category_id: categoryId, service_entry: 'home-services' })
  }

  const handleSelectMensSalonTier = (tier: MensSalonTier) => {
    setShowSalonForMen(false)
    // Both tiers now have their own detail/booking page with a real
    // cart — same pattern Salon/Spa for Women's own tiers use.
    if (tier.id === 'royale') {
      onNavigate('salon-royale')
      return
    }
    if (tier.id === 'mens-prime') {
      onNavigate('salon-prime')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'salon-for-men', service_entry: 'home-services' })
  }

  const handleSelectMassageForMenTier = (tier: MassageTier) => {
    setShowMassageForMen(false)
    // All three tiers now have their own detail/booking page with a
    // real cart.
    if (tier.id === 'massage-royale') {
      onNavigate('massage-royale')
      return
    }
    if (tier.id === 'massage-prime') {
      onNavigate('massage-prime')
      return
    }
    if (tier.id === 'massage-ayurveda') {
      onNavigate('massage-ayurveda')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'massage-for-men', service_entry: 'home-services' })
  }

  const handleSelectCleaningPestControlCategory = (categoryId: string) => {
    setShowCleaningPestControl(false)
    // Bathroom Cleaning, Kitchen Cleaning, Living & Bedroom Cleaning and
    // Full Home/ By Room Cleaning now have their own detail/booking
    // pages with a real cart — every other tile here still falls
    // through to the generic flow, same "until it gets its own page"
    // pattern every other pre-page category in this file uses.
    if (categoryId === 'bathroom-cleaning') {
      onNavigate('bathroom-cleaning')
      return
    }
    if (categoryId === 'kitchen-cleaning') {
      onNavigate('kitchen-cleaning')
      return
    }
    if (categoryId === 'living-bedroom-cleaning') {
      onNavigate('living-bedroom-cleaning')
      return
    }
    if (categoryId === 'full-home-cleaning') {
      onNavigate('full-home-cleaning')
      return
    }
    if (categoryId === 'cockroach-control') {
      onNavigate('cockroach-control')
      return
    }
    if (categoryId === 'termite-control') {
      onNavigate('termite-control')
      return
    }
    if (categoryId === 'ants-bedbugs-control') {
      onNavigate('ants-bedbugs-control')
      return
    }
    // Cleaning tiles belong to the Cleaning Services catalogue, Pest
    // Control tiles to Home Services — read straight from the one real
    // category catalogue rather than assuming either.
    const category = getServiceCategory(categoryId)
    onNavigate('service-category-detail', { service_category_id: categoryId, service_entry: category?.catalogue ?? 'home-services' })
  }

  // Every tile in the Electrician, Plumber & Carpenter picker now has
  // its own dedicated page, each built from a real reference PDF or
  // screenshot — Electrician/Plumbing/Wall Panels/Carpentry/Furniture
  // Assembly/Geyser Service & Repair/Tile Grouting/Festival Lights
  // Installation. This list just decides when to navigate straight to
  // the category id (App.tsx routes each one to its own real screen)
  // instead of the generic service-category-detail flow.
  const REAL_CATEGORY_SCREEN_IDS = ['furniture-assembly', 'geyser-service-repair', 'tile-grouting', 'lights-installation', 'civil-work']

  const handleSelectElectricianPlumberCarpenterCategory = (categoryId: string) => {
    setShowElectricianPlumberCarpenter(false)
    if (categoryId === 'wall-panels-installation') {
      onNavigate('wall-panels-installation')
      return
    }
    if (categoryId === 'electrical') {
      onNavigate('electrician')
      return
    }
    if (categoryId === 'plumbing') {
      onNavigate('plumbing')
      return
    }
    if (categoryId === 'carpentry') {
      onNavigate('carpentry')
      return
    }
    if (REAL_CATEGORY_SCREEN_IDS.includes(categoryId)) {
      onNavigate(categoryId)
      return
    }
    const category = getServiceCategory(categoryId)
    onNavigate('service-category-detail', { service_category_id: categoryId, service_entry: category?.catalogue ?? 'home-services' })
  }

  // "Few walls & rooms" now has its own real detail/booking page built
  // from a real reference PDF; "Full home painting" has no dedicated
  // page yet, so it still falls through to the generic category page
  // — same "until it gets its own page" pattern every other pre-page
  // category in this file uses.
  const handleSelectPaintingScope = (scope: PaintingScope) => {
    setShowPaintingWaterproofing(false)
    if (scope.id === 'few-walls-rooms') {
      onNavigate('painting-few-walls-rooms')
      return
    }
    onNavigate('service-category-detail', { service_category_id: 'painting', service_entry: 'home-services', painting_scope: scope.id })
  }

  const handleSelect = (serviceCategoryId: string) => {
    // Wall Panels by Revamp, Electrician and Plumbing each already have
    // their own real detail/booking page — reached the same way here
    // (search results, "See all", the flat category grid) as from the
    // Electrician, Plumber & Carpenter picker's own tiles, rather than
    // falling through to the generic flow only when entered one way.
    if (serviceCategoryId === 'wall-panels-installation') {
      onNavigate('wall-panels-installation')
      return
    }
    if (serviceCategoryId === 'electrical') {
      onNavigate('electrician')
      return
    }
    if (serviceCategoryId === 'plumbing') {
      onNavigate('plumbing')
      return
    }
    if (serviceCategoryId === 'carpentry') {
      onNavigate('carpentry')
      return
    }
    if (REAL_CATEGORY_SCREEN_IDS.includes(serviceCategoryId)) {
      onNavigate(serviceCategoryId)
      return
    }
    // Never overwrites primary_intent or any other homeowner context already
    // captured — only adds the newly selected category (and which real
    // catalogue it came from — this page now shows both together, so there
    // is no longer one ambient "current" catalogue to fall back to) to it.
    const category = getServiceCategory(serviceCategoryId)
    onNavigate('service-category-detail', { service_category_id: serviceCategoryId, service_entry: category?.catalogue ?? 'home-services' })
  }

  const trimmedQuery = query.trim()
  const isSearching = trimmedQuery.length > 0
  // Customer Implementation 09I — Home search (and this page's own search
  // bar) is scoped to the Home Services catalogue only, never Cleaning.
  const searchResults = isSearching ? searchServiceCategories(trimmedQuery, 'home-services') : []

  const hasError = loadError

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      <MobileTopBar title="Services" onBack={() => onNavigate('dashboard-home')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="services" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader title="Services" userInitials={userInitials} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
            {loading && <ServicesSkeleton />}

            {!loading && hasError && (
              <ServicesErrorState onRetry={() => setAttempt(a => a + 1)} />
            )}

            {!loading && !hasError && (
              <ServiceGroupsLanding
                onNavigate={onNavigate}
                city={city}
                state={state}
                onChangeLocation={() => onNavigate(DASHBOARD_ROUTES.locationSetup)}
                onSetLocation={() => onNavigate(DASHBOARD_ROUTES.locationSetup)}
                query={query}
                onQueryChange={setQuery}
                isSearching={isSearching}
                searchResults={searchResults}
                onSelectCategory={handleSelect}
                onAskHozie={() => onNavigate(DASHBOARD_ROUTES.aiAdvisor)}
                onOpenHoziehelper={() => setShowHoziehelper(true)}
                onOpenWomensSalonSpa={() => setShowWomensSalonSpa(true)}
                onOpenMensSalon={() => setShowMensSalonMassage(true)}
                onOpenCleaningPestControl={() => setShowCleaningPestControl(true)}
                onOpenPaintingWaterproofing={() => setShowPaintingWaterproofing(true)}
                onOpenElectricianPlumberCarpenter={() => setShowElectricianPlumberCarpenter(true)}
              />
            )}
          </main>
        </div>
      </div>

      {showHoziehelper && (
        <HoziehelperModal onClose={() => setShowHoziehelper(false)} onSelectTier={handleSelectHoziehelperTier} />
      )}

      {showWomensSalonSpa && (
        <WomensSalonSpaModal onClose={() => setShowWomensSalonSpa(false)} onSelectCategory={handleSelectWomensSalonSpaCategory} />
      )}

      {showSalonForWomen && (
        <SalonForWomenModal
          onBack={() => { setShowSalonForWomen(false); setShowWomensSalonSpa(true) }}
          onClose={() => setShowSalonForWomen(false)}
          onSelectTier={handleSelectSalonTier}
        />
      )}

      {showSpaForWomen && (
        <SpaForWomenModal
          onBack={() => { setShowSpaForWomen(false); setShowWomensSalonSpa(true) }}
          onClose={() => setShowSpaForWomen(false)}
          onSelectTier={handleSelectSpaTier}
        />
      )}

      {showMensSalonMassage && (
        <MensSalonMassageModal onClose={() => setShowMensSalonMassage(false)} onSelectCategory={handleSelectMensSalonMassageCategory} />
      )}

      {showCleaningPestControl && (
        <CleaningPestControlModal onClose={() => setShowCleaningPestControl(false)} onSelectCategory={handleSelectCleaningPestControlCategory} />
      )}

      {showPaintingWaterproofing && (
        <PaintingWaterproofingModal onClose={() => setShowPaintingWaterproofing(false)} onSelectScope={handleSelectPaintingScope} />
      )}

      {showElectricianPlumberCarpenter && (
        <ElectricianPlumberCarpenterModal onClose={() => setShowElectricianPlumberCarpenter(false)} onSelectCategory={handleSelectElectricianPlumberCarpenterCategory} />
      )}

      {showSalonForMen && (
        <SalonForMenModal
          onBack={() => { setShowSalonForMen(false); setShowMensSalonMassage(true) }}
          onClose={() => setShowSalonForMen(false)}
          onSelectTier={handleSelectMensSalonTier}
        />
      )}

      {showMassageForMen && (
        <MassageForMenModal
          onBack={() => { setShowMassageForMen(false); setShowMensSalonMassage(true) }}
          onClose={() => setShowMassageForMen(false)}
          onSelectTier={handleSelectMassageForMenTier}
        />
      )}
    </div>
  )
}
