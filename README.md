# houzeify-app
Houzeify is the digital construction record for every project — connecting construction companies, project teams, site work and customers through one transparent, intelligent platform.
# Houzeify — Unified Design System

> The Digital Construction Record for Every Project.

## 01. Overview

Houzeify is a construction management and transparency platform designed to help homeowners, contractors, teams, and project stakeholders make better decisions and maintain a clear digital record of every project.

This document is the **single visual and interaction source of truth** for Houzeify across Customer, Partner, and Admin experiences.

The visual direction is premium, modern, warm, precise, and construction-aware. The interface should feel trustworthy and approachable without becoming playful or decorative. Information density should be balanced with generous breathing room.

### Core principles

- Use Houzeify Purple as the primary brand and interaction color.
- Build every spacing, size, and gap from a 4px base grid.
- Keep surfaces clean and mostly flat; use elevation deliberately.
- Use domain-specific semantic colors for construction, costs, services, AI, progress, and status.
- Maintain a strong typography hierarchy using the three-font system below.
- Prefer consistency over one-off visual treatment.
- Avoid decorative UI that does not communicate product meaning.

---

## 02. Brand

### Product name

**Houzeify**

Always title-case. Never use `HOUZEIFY`, `houzeify`, or `Houzeify AI` as the product name.

### Tagline

**Construction management and transparency platform**

### Brand assets

Use the approved Houzeify logo and H icon assets already present in the codebase.

**Never redraw, recreate, trace, or substitute the logo or H icon.**

### Logo rules

- Do not edit files under `src/imports/`; they are Figma-generated and read-only.
- Use the existing imported logo asset and the existing `HIcon` component.
- Preserve the logo's proportions and intended clear space.
- Do not introduce alternate purple logo variants unless explicitly defined as brand assets.

---

## 03. Color System

### Brand / Primary

| Token | Hex | Usage |
|---|---|---|
| Primary | `#722ED1` | Buttons, active states, links, progress bars, focus states, AI identity, brand accents |
| Primary Hover | `#5A22A8` | Hover state on primary buttons and selected interactive elements |
| Primary Light | `#F3EAFF` | Active navigation background, AI/Hozie cards, lavender tints, progress tracks |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| Canvas | `#FBF9F7` | Main page background |
| Surface | `#FFFFFF` | Cards, sidebar, header, panels, modals |
| Surface Alt | `#F4F0EC` | Secondary surfaces, hover states, grouped controls |
| Border | `#E3DDD7` | Card borders, dividers, input borders |
| Border Alt | `#E7E5E4` | Sidebar/header borders and construction-screen separators |

### Text

Use a deliberately small text palette. Avoid creating screen-specific aliases unless a genuine contrast or product-semantic need exists.

| Token | Hex | Usage |
|---|---|---|
| Text Primary | `#242326` | Headings, primary content, important labels |
| Text Secondary | `#68636D` | Supporting labels, descriptions, secondary UI text |
| Text Muted | `#9A949D` | Captions, timestamps, hints, disabled-supporting text |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| Build | `#F8E3BD` | Construction/material stage tint |
| AI | `#F3EAFF` | AI features and Hozie surfaces |
| Progress | `#C6F6D5` | Progress and completion states |
| Services | `#CAEBFF` | Services and utility tints |

### Cost Breakdown Colors

These colors are reserved for cost-category communication and should remain visually distinct from the brand color.

| Category | Color | Background Tint |
|---|---|---|
| Materials | `#E14B19` | `#FFF2E8` |
| Labour | `#E19C12` | `#FFFBE6` |
| Finishing | `#4AB017` | `#F6FFED` |
| Services | `#136BE6` | `#E6F4FF` |
| Contingency | `#7E7E7E` | `#F5F5F5` |

### Status Colors

| Status | Color | Background |
|---|---|---|
| High priority / Error | `#DC2626` | `#FEE2E2` |
| Medium priority | `#D97706` | `#FEF3C7` |
| Low priority | `#6B7280` | `#F3F4F6` |
| Success | `#16A34A` | `#DCFCE7` |
| Info | `#0284C7` | `#E0F2FE` |

### Construction Stage Colors

| Stage | Color | Background |
|---|---|---|
| Foundation | `#D97706` | `#FEF3C7` |
| Plinth Beam | `#0284C7` | `#E0F2FE` |
| Structure | `#16A34A` | `#DCFCE7` |
| Site Prep / Planning | `#6B7280` | `#F3F4F6` |

### Color rules

- Primary Purple is the canonical brand purple: `#722ED1`.
- Never introduce another purple as a substitute for Primary.
- Use purple primarily for interaction, AI identity, progress, active navigation, focus, and defined brand accents.
- Do not use category colors as decorative accents without a semantic reason.
- Status colors must communicate state, not decoration.
- Avoid gradients as general decoration. Controlled gradients are permitted only where specifically defined for Hero/AI surfaces.
- Do not use pure black (`#000000`) for normal interface text; use the defined text palette.

---

## 04. Typography

Three fonts form the complete Houzeify type system. Apply them consistently across the product.

### Google Sans Flex — Headings & Numbers

```tsx
fontFamily: '"Google Sans Flex:SemiBold", sans-serif'
```

Use for page headings, section headings, card titles, project names, KPI values, cost figures, important numbers, and high-priority information.

| Role | Size | Weight |
|---|---:|---|
| Page headline | 40px | SemiBold |
| Section heading | 22–24px | SemiBold |
| Card title | 17–20px | SemiBold |
| Body heading | 14–15px | SemiBold |
| KPI value | 28–34px | SemiBold |
| Cost figure | 34–42px | SemiBold |

### Open Sans — Body & UI

```tsx
fontFamily: '"Open Sans:Regular", sans-serif'
```

Use for body copy, descriptions, button labels, form labels, sidebar navigation labels, captions, and general UI text.

| Role | Size |
|---|---:|
| Body copy | 13–14px |
| Button label | 12–13px |
| Caption / meta | 11–12px |
| Navigation label | 13px |

### Sometype Mono — Labels & Data

```tsx
fontFamily: '"Sometype Mono:SemiBold", monospace'
```

Use for eyebrow labels, status badges, stage tags, percentages, timestamps, KPI category labels, and technical metadata.

| Role | Size | Case / Treatment |
|---|---:|---|
| Eyebrow label | 9–10px | UPPERCASE, `0.08–0.10em` tracking |
| Status badge | 10px | Title case |
| Percentage | 11–13px | As-is |
| Data label | 9px | UPPERCASE |

### Typography rules

- Keep the hierarchy stable between screens.
- Prefer two visible font weights per screen where possible.
- Do not introduce General Sans, DM Sans, or JetBrains Mono into the Houzeify system.
- Use Google Sans Flex for important numerical information, not Open Sans.
- Use Sometype Mono for compact technical/data labels rather than body paragraphs.

---

## 05. Spacing System

### Base grid

**Base unit: 4px**

```text
4  ·  8  ·  12  ·  16  ·  20  ·  24  ·  32  ·  40  ·  48  ·  64  ·  80  ·  96
```

All padding, margins, component gaps, and section spacing should resolve to this grid unless a documented exception is required.

### Component padding

| Size | Padding |
|---|---|
| Small | `8px 12px` |
| Medium | `10px 16px` |
| Large | `12px 24px` |

### Product layout spacing

| Context | Rule |
|---|---|
| Section gap | `24px` (`gap-6`) |
| Card gap | `16px` (`gap-4`) |
| Mobile page padding | `16px` |
| Tablet page padding | `24px` |
| Desktop page padding | `32px` |

### Section rhythm

Use larger spacing when moving between major sections than between elements inside a section.

Recommended rhythm:

```text
Element → Element       8–16px
Control → Control       8–16px
Card → Card             16–24px
Section → Section       32–64px
Major page regions      48–96px
```

### Content widths

| Experience | Max content width |
|---|---:|
| Estimation screens | `1080px` |
| Construction screens | `1180px` |

Do not replace these with a single universal container width unless the screen architecture requires it.

### Card grids

Use `16–24px` gaps depending on density and viewport size.

---

## 06. Layout & Responsive Behavior

### Page layout

```text
Desktop
┌──────────────── Sidebar ────────────────┬───────────────────────────┐
│                                        │ Header                    │
│                                        ├───────────────────────────┤
│                                        │                           │
│                                        │ Main content              │
│                                        │                           │
└────────────────────────────────────────┴───────────────────────────┘
```

### Sidebar

| Breakpoint | Width | Behavior |
|---|---:|---|
| `< md` | Hidden | Mobile top bar / drawer navigation |
| `md` | `68–72px` | Icon-only |
| `lg` | `236–240px` | Icon + label |

### Two-column layout

```css
Left:  flex: 60 60 0;
Right: flex: 40 40 0;
```

Typical usage:

- Left: projects, breakdowns, core content.
- Right: insight, summary, contextual actions.

Construction screens stack to one column below `xl` (1280px).
Estimation screens stack to one column below `lg` (1024px).

### Header

```text
Height: 60–72px
Background: #FFFFFF
Border-bottom: 1px solid #E3DDD7
```

Left side:

- Page title: Google Sans Flex, 17–22px.
- Optional subtitle: Open Sans, 13px, Text Secondary.

Right side:

- Secondary actions.
- Icon buttons.
- Contextual controls.

### Scroll behavior

- Dashboard shells provide the viewport structure.
- Dashboard main content should own its internal scroll.
- Scrollbars may be visually hidden where already established by the product shell.
- Do not create nested scroll regions without a clear usability reason.

---

## 07. Border Radius

Use a small, intentional radius scale.

| Token | Radius | Usage |
|---|---:|---|
| Radius XS | `4px` | Tags, micro elements, inline code |
| Radius SM | `8px` | Inputs, selects, compact controls |
| Radius MD | `10px` | Buttons, navigation items |
| Radius LG | `12px` | Compact cards, search bars |
| Radius XL | `16px` | Standard cards, AI cards |
| Radius Hero | `20px` | Hero cards, major feature surfaces |
| Radius Full | `9999px` | Pills, status badges, progress bars |

### Radius rules

- Do not invent arbitrary radii such as `13px`, `15px`, or `18px` unless a component-specific exception is documented.
- Buttons should generally use `10px`.
- Standard content cards should generally use `16px`.
- Hero surfaces should generally use `20px`.
- Pills and progress indicators use full radius.

---

## 08. Elevation & Shadows

Houzeify should feel mostly flat and structured. Borders establish the default surface hierarchy; shadows are used sparingly.

### Default card

```css
border: 1px solid #E3DDD7;
box-shadow: none;
```

### Optional light card elevation

Use only where additional separation materially improves hierarchy:

```css
box-shadow: 0 1px 4px rgba(0,0,0,0.04);
```

### Medium elevation

```css
box-shadow: 0 1px 6px rgba(0,0,0,0.04);
```

### Hover elevation

For interactive cards:

```css
box-shadow: 0 8px 30px rgba(0,0,0,0.08);
transform: translateY(-2px);
transition: 200ms ease;
```

### Hero card

```css
box-shadow:
  0 2px 24px rgba(114,46,209,0.07),
  0 1px 4px rgba(0,0,0,0.04);
```

### AI / Hozie surfaces

AI surfaces may use subtle purple atmospheric elevation, but should remain softer than primary controls.

### Focus

Use a visible focus ring rather than relying only on shadow:

```css
box-shadow: 0 0 0 3px rgba(114,46,209,0.12);
```

### Elevation rules

- Do not add shadows to every component.
- Prefer border hierarchy over shadow hierarchy.
- Reserve stronger shadows for hover, popovers, and clearly elevated surfaces.
- Never use large dark shadows for standard cards.

---

## 09. Components

### Buttons

#### Primary

```text
Background: #722ED1
Text: #FFFFFF
Hover: #5A22A8
Height: 36–46px
Radius: 10px
Font: Open Sans, 12–13px, semibold
```

#### Secondary

```text
Background: #FFFFFF
Border: #E3DDD7
Text: #242326
Hover background: #F4F0EC
Height: 32–36px
Radius: 10px
```

#### Ghost

```text
Background: transparent
Border: none
Text: #68636D
Hover: #F4F0EC / #242326
```

#### Dashed Add

```text
Background: transparent
Border: 1px dashed #D1D5DB
Text: #9CA3AF
Hover border: #722ED1
Hover text: #722ED1
Height: 36px
Radius: 8px
```

#### Destructive

Use Error red for actions that remove, reject, or permanently destroy data. Do not use Error red as a decorative button style.

### Button interaction

```text
Hover: translateY(-1px)
Transition: 150–200ms
```

Do not combine multiple distracting transformations on a single control.

### Cards

#### Base card

```text
Background: #FFFFFF
Border: 1px #E3DDD7
Radius: 16px
Padding: 16–20px
Shadow: none by default
```

#### Hero card

```css
background: linear-gradient(
  135deg,
  rgba(243,234,255,0.28) 0%,
  #FFFFFF 55%
);
border: 1px solid #E3DDD7;
radius: 20px;
padding: 24–28px;
```

This is a controlled product surface, not a general decorative gradient.

#### Hozie / AI card

```text
Background: #F3EAFF
Radius: 16px
Padding: 16–20px
Shadow: none
```

The Hozie icon sits in a white rounded container, typically `28–32px`.

#### Category card

```text
Background: #FFFFFF
Border: 1px #E3DDD7
Radius: 12–14px
Overflow: hidden
```

Use the appropriate category accent strip and background tint for cost categories.

### Status badges

```text
Font: Sometype Mono SemiBold
Size: 10px
Padding: 2px 8px
Radius: 9999px
```

#### Active / confidence badge

```text
Background: #F3EAFF
Border: 1px solid rgba(114,46,209,0.16)
Text: #722ED1
```

The Hozie status dot may use `hozieStatusPulse` where appropriate.

### Progress bars

```text
Height: 6–10px
Track radius: 9999px
Bar radius: 9999px
Track: #F3EAFF or relevant category tint
Bar: #722ED1 or relevant category color
```

Width transitions should be smooth and should communicate real progress rather than decorative motion.

### Navigation items

```text
Height: 36–40px
Radius: 10px
Padding: 9px 12px
Gap: 12px
Font: Open Sans, 13px
Icon: 18×18px
```

Active:

```text
Background: #F3EAFF
Text/icon: #722ED1
```

Default:

```text
Text/icon: #68636D
```

Hover:

```text
Background: #F4F0EC
Text: #242326
```

### Sidebar structure

```text
Header: 60–64px
Nav: flex-1 scrollable
Padding: p-2 (md) / p-3 (lg)
Bottom: border-top + Help + Settings
```

### Inputs

```text
Border: 1px solid #E3DDD7
Background: #FFFFFF
Radius: 8px
Vertical padding: 10px
Horizontal padding: 14px
Font: Open Sans, 14px
```

Focus:

```text
Border: #722ED1
Ring: 0 0 0 3px rgba(114,46,209,0.12)
```

Error:

```text
Border: #DC2626
```

Placeholder:

```text
Text Muted: #9A949D
```

### Search

Global search may be triggered by `⌘K` where implemented.

Preferred treatment:

```text
Rounded bar
Magnifying glass icon
Optional keyboard shortcut badge
```

### Lists

Use stacked rows with dividers for dense information.

```text
Row padding: 12px 16px
Divider: 1px solid #E3DDD7
Hover: #F4F0EC
```

---

## 10. Iconography

- Use the existing icon system consistently.
- Maintain consistent icon stroke weight and visual density.
- Default navigation icon size: `18×18px`.
- Do not mix multiple unrelated icon styles within the same screen.
- The Houzeify H icon is a protected brand asset.

---

## 11. Ambient Background

Ambient backgrounds may be used on estimation and AI screens to create subtle spatial depth.

They are fixed-position, `pointer-events-none`, and remain behind interactive content.

### Circle 1 — top right

```text
top: -100px
right: -180px
size: 560×560px
background: rgba(114,46,209,0.042)
blur: 130px
```

### Circle 2 — bottom left

```text
bottom: -160px
left: -100px
size: 640×640px
background: rgba(243,234,255,0.50)
blur: 140px
```

### Circle 3 — mid right

```text
top: 55%
right: 15%
size: 380×380px
background: rgba(243,234,255,0.38)
blur: 90px
```

### Ambient rules

- Never allow ambient effects to reduce text or control contrast.
- Do not use ambient background effects on dense data tables unless explicitly required.
- Keep the visual effect soft and peripheral.

---

## 12. Motion & Animation

Motion should communicate progress, state change, hierarchy, and AI activity.

All defined animations should be implemented in `src/index.css` and applied consistently.

| Name | Description | Usage |
|---|---|---|
| `splashFadeIn` | `opacity 0→1`, `translateY 8px→0` | Screen transitions |
| `welcomeFadeUp` | `opacity 0→1`, `translateY 12px→0` | Card/section entrances |
| `hozieStatusPulse` | Scale `1→0.97→1`, opacity pulse | AI status dot |
| `aiIconGlow` | Purple box-shadow pulse | Hozie icon |
| `estimateRingExpand` | Scale `0.92→1.60`, opacity `0.30→0` | Loading rings |
| `estimatePulse` | Scale + opacity oscillation | Loading state |
| `estimateReveal` | `opacity 0→1`, `translateY 10px→0` | Estimate content reveal |
| `estimateButtonPop` | Scale `0.92→1.04→1` | CTA entrance |
| `pingRipple` | Scale `1→2.5`, opacity `1→0` | Ping effects |
| `successIconReveal` | Stroke dash animation | Success checkmark |
| `successBadgePop` | Scale `0→1.1→1` | Success badge |

### Staggered delays

Use the established progression where appropriate:

```text
0.05s
0.10s
0.15s
0.18s
0.24s
0.30s
0.36s
```

### Motion rules

- Prefer short, purposeful transitions.
- Do not animate static content continuously without product meaning.
- Honor reduced-motion preferences when feasible.
- Avoid combining large movement, scale, glow, and opacity changes on the same element.

---

## 13. Accessibility & States

Every interactive component should define the following visual states where applicable:

```text
Default
Hover
Active
Focus
Disabled
Error
Success
Loading
```

### Focus

Focus must be visually obvious and should not depend only on color change.

### Disabled

Disabled controls should appear visually inactive without being confused with secondary actions.

### Contrast

Maintain sufficient contrast across text, controls, status colors, and surfaces in both light and future dark-mode implementations.

### Feedback

Use semantic colors consistently. Do not communicate important state using color alone; pair color with text, iconography, or another visible indicator where necessary.

---

## 14. Navigation Architecture

### Estimation flow

```text
Home → dashboard-home
AI Advisor → ai-advisor
Estimates → estimate-dashboard
```

Sidebar active item: **Estimates** when inside the estimation experience.

### Construction management

```text
Home
Projects
Progress
Site Operations
Workforce
Live Site
Documents
Reports
Team
Hozie AI
Settings
```

Badge counts are permitted for meaningful actionable counts only.

---

## 15. Screen Architecture

### Standard dashboard shell

```tsx
<div className="flex h-full">
  <Sidebar />
  <div className="flex flex-col flex-1 min-w-0 min-h-0">
    <header />
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[...] mx-auto px-... py-6 flex flex-col gap-6">
        {/* content */}
      </div>
    </main>
  </div>
</div>
```

### Header

```text
Height: 60–72px
Background: #FFFFFF
Border-bottom: 1px #E3DDD7
```

### Content hierarchy

Use the following order wherever applicable:

```text
Page title
↓
Context / summary
↓
Primary action / key metric
↓
Main content
↓
Supporting information
↓
Secondary actions
```

---

## 16. Product-Specific Visual Language

### Estimation

Estimation experiences should feel precise, calm, analytical, and trustworthy.

Use:

- Google Sans Flex for costs and headline numbers.
- Sometype Mono for technical labels and data points.
- Cost category colors for Materials, Labour, Finishing, Services, and Contingency.
- Purple for AI guidance and primary actions.
- Subtle ambient backgrounds only when they support the AI/estimate experience.

### Construction management

Construction management experiences should feel structured, operational, and transparent.

Use:

- Strong card hierarchy.
- Clearly separated status information.
- Construction stage colors where stage communication is required.
- Dense but readable tables/lists.
- Sidebar navigation as the primary information architecture.

### AI / Hozie

Hozie is part of the product experience and should feel intelligent without looking gimmicky.

Use:

- `#F3EAFF` as the primary AI surface.
- `#722ED1` for AI actions and identity.
- Subtle glow/pulse only for meaningful AI activity.
- Clear copy and visible status indicators.

---

## 17. Do's and Don'ts

### Do

- Do use `#722ED1` as the canonical Houzeify primary color.
- Do use the 4px spacing grid throughout the product.
- Do use Google Sans Flex for headings and important numbers.
- Do use Open Sans for body and general UI.
- Do use Sometype Mono for data labels, status, and technical metadata.
- Do keep cards predominantly flat and structured by borders.
- Do use larger card radii only where the component hierarchy calls for them.
- Do use semantic colors consistently.
- Do keep AI visuals subtle and purposeful.
- Do keep customer, partner, and admin experiences visually consistent unless a documented role-specific requirement exists.

### Don't

- Don't replace `#722ED1` with another purple.
- Don't mix General Sans, DM Sans, or JetBrains Mono into Houzeify.
- Don't create arbitrary spacing values outside the 4px grid.
- Don't create arbitrary radius values.
- Don't use decorative gradients throughout the product.
- Don't use large shadows on static cards.
- Don't use category colors without semantic meaning.
- Don't use color alone to communicate critical status.
- Don't redesign or recreate the approved logo/H icon.
- Don't use pure black for normal text.
- Don't introduce one-off component styles that contradict this system.

---

## 18. Implementation Rules

1. Primary color is always `#722ED1` — never `#4C12A1` or another purple variant.
2. Brand name is always **Houzeify** — never `HOUZEIFY`, `houzeify`, or `Houzeify AI`.
3. Never edit files under `src/imports/`; they are Figma-generated and read-only.
4. Each screen is self-contained with its own Sidebar copy — no shared Sidebar component, unless the implementation architecture is intentionally revised later.
5. All screens accept `onNavigate: (s: string, data?: Record<string, string>) => void`.
6. `projectData` state in `App.tsx` carries shared data between screens.
7. Dashboard screens manage their own internal scroll; `App.tsx` should not introduce an additional vertical scroll wrapper around those screens.
8. Never use inline universal CSS resets such as `* { margin: 0 }`.
9. Use the design tokens in this file before creating a new color, spacing, radius, or shadow value.
10. When a new token is genuinely required, document it here before using it broadly.

---

## 19. Source-of-Truth Priority

When two visual decisions conflict, use this order:

```text
1. Houzeify brand rules
2. Houzeify semantic / construction rules
3. Houzeify typography system
4. Unified spacing / radius / elevation rules
5. Component-specific rules
6. Screen-specific exceptions documented in code
```

Screen-specific styling must not silently redefine global tokens.

---

## 20. Final Design Direction

Houzeify should consistently feel:

**Trustworthy · Precise · Warm · Modern · Operational · AI-enabled**

The system should avoid both extremes:

```text
Too sterile / enterprise-generic  ←→  Too decorative / consumer-playful
```

The desired middle ground is a premium construction product where information is easy to scan, actions are obvious, and the visual language remains unmistakably Houzeify.
