---
name: Agri-Premium Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414944'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3e6752'
  primary: '#002d1c'
  on-primary: '#ffffff'
  primary-container: '#1a4331'
  on-primary-container: '#85b098'
  inverse-primary: '#a4d0b8'
  secondary: '#006d3e'
  on-secondary: '#ffffff'
  secondary-container: '#8cf5b2'
  on-secondary-container: '#007241'
  tertiary: '#242623'
  on-tertiary: '#ffffff'
  tertiary-container: '#3a3c39'
  on-tertiary-container: '#a5a6a2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0edd3'
  primary-fixed-dim: '#a4d0b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#264e3c'
  secondary-fixed: '#8ff8b4'
  secondary-fixed-dim: '#73db9a'
  on-secondary-fixed: '#00210f'
  on-secondary-fixed-variant: '#00522d'
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c6c7c2'
  on-tertiary-fixed: '#1a1c19'
  on-tertiary-fixed-variant: '#454744'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for a sophisticated, mobile-first agricultural ecosystem. It bridges the gap between raw earth and high-tech intelligence, targeting professional farmers and retailers. The aesthetic is rooted in **Minimalism** and **Modern Apple-inspired** design, utilizing high whitespace to reduce cognitive load in complex data environments.

The brand personality is **Trustworthy** and **Sophisticated**. We achieve this through:
- **Glassmorphism:** Using translucent layers to maintain context and depth.
- **Precision:** Clean lines and intentional alignment that evoke a sense of reliability.
- **Sophistication:** A premium feel that elevates agricultural software to the level of high-end fintech or lifestyle applications.

## Colors
The palette, "Agri-Premium," transitions seamlessly between Light and Dark modes.

- **Primary (Deep Forest):** Used for core branding, sidebar backgrounds, and primary navigation elements. It represents stability and growth.
- **Secondary (Vibrant Lime):** Used as an accent for call-to-actions, price trends, and positive status indicators.
- **Tertiary (Sand/Cream):** Used for subtle backgrounds in light mode to provide warmth and an earthy connection.
- **Surface:** In dark mode, surfaces utilize deep charcoal-greys (`#1E293B`) rather than pure black to maintain the glass effect's visibility.

## Typography
The system uses **Inter** for its systematic, utilitarian, and high-legibility characteristics. 

- **Scale:** High contrast between headlines and body text ensures a clear hierarchy on small mobile screens.
- **Headlines:** Feature tight letter-spacing and bold weights to anchor sections.
- **Readability:** Body text uses a generous 1.5x line height to ensure accessibility for users in outdoor, high-glare environments.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for mobile-first PWA delivery.

- **Grid:** A 4px/8px incremental rhythm is strictly enforced for all padding and margins.
- **Mobile:** Content occupies a single column with 16px side margins. Glassmorphic cards should span the full width of the safe area.
- **Desktop/Tablet:** Sidebar navigation becomes persistent. The dashboard utilizes a multi-column masonry-style layout for price intelligence cards and charts.
- **Safety:** Bottom navigation bars and floating AI triggers must respect the safe-area-inset for modern mobile browsers.

## Elevation & Depth
Depth is created through **Glassmorphism** rather than traditional heavy shadows.

- **Surfaces:** Use `backdrop-filter: blur(12px)` with a high-transparency white or dark-grey fill (80% opacity).
- **Shadows:** Only used to lift the "Active" glass layer from the background. Shadows are extremely diffused: `0 8px 32px 0 rgba(0, 0, 0, 0.08)`.
- **Borders:** "Ghost borders" are essential for glass elements. Use a 1px solid border with 10% white (light mode) or 10% primary green (dark mode) to define edges against vibrant backgrounds.

## Shapes
The shape language is ultra-modern and soft.

- **Radius:** A standard `2xl` (1.5rem / 24px) is the default for all major containers and cards to evoke a friendly, high-end consumer feel.
- **Buttons:** Use fully pill-shaped (rounded-full) geometry to differentiate interactive elements from informational containers.
- **Inputs:** Maintain the `2xl` radius to match the overall card aesthetic.

## Components
- **Glassmorphic Cards:** The primary container. Features a subtle inner glow on the top border to simulate light hitting glass. Used for dashboard metrics and price intelligence.
- **Price Intelligence Charts:** Clean, line-based charts (Chart.js style) using the Secondary Lime color for growth trends. Avoid grid lines; use "floating" data points with hover-states.
- **AI Chatbot Interface:** A docked floating action button that expands into a full-height glass sheet. Text bubbles use high-contrast primary green for the user and soft sand/grey for the AI.
- **Sidebar Navigation:** On mobile, this is a bottom-tab bar with blurred glass. On desktop, a vertical forest-green bar with frosted icon highlights.
- **Input Fields:** Search bars and data entry fields utilize a "glass-inset" look—slightly darker/more opaque than the background card with no heavy borders.
- **Status Chips:** Small, pill-shaped indicators using low-opacity versions of semantic colors (e.g., 10% Green for "Optimal", 10% Amber for "Market Volatile").