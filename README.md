# Anvaya Dashboards

Working React + TypeScript + Tailwind implementation of the two dashboards
designed in Stitch for Anvaya.

**SCRUM-33 — Transportation Dashboard** &nbsp;·&nbsp; **SCRUM-34 — Retailer Dashboard**

## Tech stack

- **Vite 5** — dev server + bundler
- **React 18** + **TypeScript** (strict)
- **Tailwind CSS 3** with the Material 3 token set lifted from the Stitch designs
- **React Router 6** for navigation between the two dashboards
- **Inter** + **Material Symbols Outlined** via Google Fonts (matches the Stitch output)

No external state library — `useState`/`useMemo` is enough for the scope here.
Data lives in `src/data/*.ts` and is structured so it can be swapped for
real API calls (replace the imports in the page components with `useEffect` +
`fetch` later).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  →  /transport  or  /retailer
npm run build      # tsc --noEmit && vite build
npm run preview    # serve the production build locally
```

`/` redirects to `/transport`.

## Project layout

```
src/
├── App.tsx                      # route table
├── main.tsx                     # entry, BrowserRouter, globals
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # main padding + outlet
│   │   ├── Sidebar.tsx          # dark desktop sidebar (md+)
│   │   ├── TopBar.tsx           # mobile top bar
│   │   └── BottomNav.tsx        # mobile bottom nav
│   └── ui/
│       ├── Badge.tsx            # status pill (in-transit, processing…)
│       ├── Icon.tsx             # Material Symbols wrapper
│       ├── Modal.tsx            # accessible modal w/ Esc + backdrop close
│       └── Toast.tsx            # auto-dismissing bottom toast
├── data/
│   ├── nav.ts                   # nav items (PRIMARY / SECONDARY / BOTTOM)
│   ├── transport.ts             # mock route, backhauls, metrics
│   └── retailer.ts              # mock stats, orders, suppliers, price chart
├── hooks/
│   └── useToast.ts              # toast state w/ auto-dismiss
├── pages/
│   ├── NotFound.tsx
│   ├── transport/
│   │   └── TransportDashboard.tsx
│   └── retailer/
│       └── RetailerDashboard.tsx
├── styles/
│   └── index.css                # tailwind layers + glass utilities
└── types/
    └── index.ts                 # shared TS types
```

## What's interactive

### Transportation (`/transport`)
- **Live tracking toggle** in the header — pause/resume simulated progress
  on the route map; progress % updates every 4s while active
- **Backhaul loads** — filter by category (all / produce / fertilizer),
  click "Bid on Load" → opens a modal with pre-filled NPR bid amount
- **Bid modal** — adjusts bid amount, submits, success toast appears
- **Metric period selector** (week / month / quarter)
- **Action buttons** (Contact Driver, Report Issue, Open in Maps) — wired
  to toast for demo; ready to be hooked to phone/email/map deep-links
- Active sidebar / bottom-nav state synced to current route

### Retailer (`/retailer`)
- **Live search** across Order ID / Supplier / Commodity / Destination
- **Status filter pills** (All / In Transit / Processing / Delivered)
  — order total updates reactively
- **Commodity price dropdown** swaps the bar chart + current price
  + change %
- **Top Rated Farmers** — clickable rows
- **"New Order" button** → modal that adds a real order to the table
- **Order row menu** triggers a toast (placeholder for real actions)

## Design system

All Material 3 color tokens from the Stitch designs are exposed in
`tailwind.config.js` under `colors`. Use the named classes directly, e.g.:

```tsx
className="bg-secondary text-on-secondary"
className="bg-primary-container text-on-primary"
className="bg-surface-container-low border-outline-variant/30"
```

Custom utility classes:

- `.glass-panel` / `.glass-card` — frosted background with blur
- `.pb-safe` / `.pt-safe` — safe-area insets for iOS PWA
- `.nav-link-active` / `.nav-link-inactive` — sidebar link states

## Where to extend next

- **Real API**: replace `src/data/*.ts` exports with `useEffect` + `fetch`
  calls. Types in `src/types/index.ts` are the contract.
- **Auth**: the language-select / sign-up screens belong to other team
  members' tasks — once a session exists, gate `AppShell` behind it.
- **PWA**: drop `vite-plugin-pwa` into `vite.config.ts` and a `manifest.webmanifest`
  to install offline.
- **i18n**: the requirements call for EN/नेपाली — wire `react-i18next`
  and translate the strings in the page files (they're all inline right now).
- **Other team slices**: the Sidebar currently disables Marketplace /
  Intelligence / Community — drop in real routes as those tickets land.
