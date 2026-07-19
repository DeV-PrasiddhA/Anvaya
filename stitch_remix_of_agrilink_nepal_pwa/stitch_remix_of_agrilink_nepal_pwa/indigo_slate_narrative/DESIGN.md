---
name: Indigo Slate Narrative
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#454652'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#757684'
  outline-variant: '#c5c5d4'
  surface-tint: '#4355b9'
  primary: '#24389c'
  on-primary: '#ffffff'
  primary-container: '#3f51b5'
  on-primary-container: '#cacfff'
  inverse-primary: '#bac3ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#404445'
  on-tertiary: '#ffffff'
  tertiary-container: '#585b5d'
  on-tertiary-container: '#d1d3d5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#00105c'
  on-primary-fixed-variant: '#293ca0'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is authoritative yet approachable, blending high-end editorial aesthetics with the precision of modern productivity tools. It targets a professional audience that values clarity, efficiency, and a calm digital environment. 

The design style is **Minimalist with Glassmorphic accents**. It utilizes heavy whitespace to reduce cognitive load and focuses on a refined "Indigo & Slate" palette to evoke a sense of trust and stability. The interface feels light and airy, using subtle translucent layers to establish hierarchy without the clutter of heavy borders or traditional shadows. The emotional response is one of focus, sophistication, and reliability.

## Colors

The palette is anchored by a deep **Indigo (#3F51B5)**, used for primary actions and brand signifiers to communicate confidence. This is supported by **Slate (#64748B)** for secondary information and iconography, providing a softer alternative to pure black.

The background uses a tiered approach:
- **Surface**: Pure white (#FFFFFF) for primary content cards.
- **Background**: Soft Gray (#F8FAFC) for the main canvas to create separation.
- **Text**: Deep Slate (#1E293B) for high-readability body text, with lighter slate variants for captions.
- **Accents**: Subtle indigo tints (5-10% opacity) are used for hover states and selection highlights to maintain the "Apple-inspired" clean look.

## Typography

This design system uses a dual-font pairing to balance character with utility. **Manrope** is used for all headings and titles; its modern, geometric construction provides a progressive feel. **Inter** is utilized for body copy and UI labels, chosen for its exceptional legibility and systematic, neutral tone.

For headlines, tighter letter spacing is applied to create a more impactful, editorial appearance. Labels and small captions utilize slightly increased letter spacing and a medium weight to ensure clarity at small scales.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with a 12-column structure for desktop and a 4-column structure for mobile. 

- **Desktop**: 12 columns, 24px gutters, and 64px side margins. 
- **Tablet**: 8 columns, 24px gutters, and 32px side margins.
- **Mobile**: 4 columns, 16px gutters, and 16px side margins.

Spacing follows an 8px base unit. Use `md` (24px) for most internal component padding and `lg` (48px) for vertical section spacing to maintain an open, breathable feel characteristic of high-end software.

## Elevation & Depth

Hierarchy is established through **Tonal Layering and Glassmorphism** rather than traditional drop shadows.

- **Level 0 (Base)**: Soft Gray (#F8FAFC) background.
- **Level 1 (Card)**: Pure White surface with a 1px stroke in a very light Slate (#E2E8F0).
- **Level 2 (Overlay)**: Used for navigation bars and modals. This level uses a backdrop blur (20px) and 80% opacity white fill to create a frosted glass effect.
- **Shadows**: When depth is required (e.g., for floating action buttons), use "Ambient Shadows"—low-opacity (10%), large-spread Indigo-tinted shadows that feel like light passing through colored glass rather than a gray smudge.

## Shapes

The design system uses a **Rounded** shape language to feel modern and friendly.

- **Standard Elements**: Buttons and input fields use a 0.5rem (8px) radius.
- **Large Elements**: Cards and containers use a 1rem (16px) radius to emphasize a "contained" and safe aesthetic.
- **Interactive Toggles**: Checkboxes use a small 4px radius, while Radio buttons remain fully circular.

## Components

### Buttons
- **Primary**: Solid Indigo (#3F51B5) with White text. No border.
- **Secondary**: Ghost style. Transparent background with a 1px Slate border and Slate text.
- **Tertiary**: Text-only in Indigo, used for less frequent actions.

### Input Fields
Inputs should be minimal. Use a white background with a 1px light Slate border. On focus, the border transitions to Indigo with a subtle 4px Indigo-tinted outer glow (glow, not shadow).

### Cards
Cards are the primary container. They feature 16px rounded corners, a white background, and a very subtle Slate border. No shadow is used for standard cards to maintain the flat, clean Apple aesthetic.

### Chips & Tags
Used for categorization. They should have a light Slate background (#F1F5F9) and Slate text. Active chips transition to a light Indigo background with Indigo text.

### Lists
List items are separated by whitespace rather than lines where possible. For dense data, use a 1px divider in the lightest Slate tint (#F8FAFC). Interactive list items should have a 4px Indigo vertical bar on the left during the active/selected state.