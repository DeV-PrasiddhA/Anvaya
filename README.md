# Anvaya

**Nepal's Direct Agricultural Exchange & Logistics Network**

Anvaya empowers Nepalese growers, retailers, cooperatives, and transport providers to trade directly—eliminating middlemen, enabling live price transparency, and connecting farms to buyers through GPS-tracked logistics and AI-powered insights.

---

## 🌾 What is Anvaya?

Anvaya is a full-stack agricultural marketplace platform designed for Nepal's farming ecosystem. It:

- **Connects farmers directly to buyers** through a location-aware marketplace with QR-traceable crop listings
- **Displays live Kalimati Market prices** via daily automated imports from Nepal's government agricultural hub
- **Tracks logistics in real-time** with GPS coordinates and live location updates for transport providers
- **Provides AI-powered insights** including price forecasts, weather trends, and soil health advice
- **Protects farmer privacy** by rounding GPS coordinates before displaying locations to map visitors

Built with TypeScript, React, Express, Python, and Supabase—deployed as a cloud-native monorepo.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ (for price import scripts)
- **Supabase** project (free tier works) with URL and service role key
- **Google Gemini API** key (for commodity name translation)

### Clone & Install

```bash
git clone https://github.com/DeV-PrasiddhA/Anvaya.git
cd Anvaya
npm install
```

This installs dependencies for both `frontend/` and `backend/` workspaces.

### Environment Setup

Create `.env` in the project root:

```bash
cp backend/.env.example backend/.env
```

Fill in:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
NODE_ENV=development
PORT=5001
```

### Database Setup

Run the Supabase schema SQL:

```bash
# Open your Supabase SQL editor and execute:
# backend/supabase_schema.sql
```

This creates tables for users, products, market prices, and translation cache.

### Run Development

**Start both frontend and backend concurrently:**

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:frontend  # React app on http://localhost:5173
npm run dev:backend   # Express API on http://localhost:5001
```

### Import Today's Kalimati Prices

```bash
cd backend
python scripts/fetch_kalimati_prices.py
```

Or import a specific date:

```bash
python scripts/fetch_kalimati_prices.py --date 2026-07-31
```

Check your Gemini configuration:

```bash
python scripts/fetch_kalimati_prices.py --check-gemini
```

---

## 📁 Project Structure

```
Anvaya/
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/           # UI: SignUp, Dashboard, BrandLogo
│   │   ├── App.tsx               # Landing page, authentication flow
│   │   ├── api.ts                # API client (Supabase + backend)
│   │   └── supabaseClient.ts     # Supabase auth & DB client
│   ├── public/fonts/Aakriti 2/   # Nepali font for native text
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                      # Express + TypeScript + Supabase
│   ├── src/
│   │   └── index.ts              # REST API (users, products, maps, prices)
│   ├── scripts/
│   │   └── fetch_kalimati_prices.py  # Daily price importer + translator
│   ├── supabase_schema.sql       # Database schema
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # Documentation
├── package.json                  # Monorepo root (workspaces)
└── README.md
```

---

## 🔌 API Routes

### User Management

**POST** `/api/users/signup`
- Create a new user profile or complete OAuth signup
- Required fields: `name`, `role`, `email`, `password` (for new email signups)
- Optional: `phone`, `province`, `district`, `ward`, `latitude`, `longitude`, `locationSource`

**POST** `/api/users/login`
- Email & password login (fallback to frontend OAuth)
- Returns user profile and Supabase session

**GET** `/api/users/profile/:id`
- Fetch authenticated user profile (requires Bearer token)

### Map & Location

**GET** `/api/map/locations`
- List all farmers/retailers/transporters opted into map visibility
- Returns rounded GPS coords (3 decimals) to protect privacy

**POST** `/api/map/location`
- Update authenticated user's real-time location (for transport providers)
- Stores GPS accuracy and source (`gps`, `manual`, `district_centroid`, `admin`)

### Products & Listings

**GET** `/api/products?district=Kathmandu&crop=Cardamom`
- Search crop listings by district and commodity name

**POST** `/api/products`
- Create a new harvest listing with crop, price, quantity, grade, QR data

### Market Prices

**GET** `/api/market-prices`
- Fetch live Kalimati prices (latest + previous day for % change)
- Returns English & Nepali commodity names, min/avg/max prices

**GET** `/api/status`
- Health check; shows server uptime and Supabase connectivity

---

## 🛠️ Build & Deploy

### Frontend Build

```bash
npm run build:frontend
# Output: frontend/dist/
```

### Backend Build

```bash
npm run build:backend
# Compiles TypeScript → JavaScript in dist/
npm run start  # Run compiled backend
```

### Docker (Optional)

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/src ./src
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

---

## 🔄 Daily Kalimati Price Import (GitHub Actions)

The repository includes a GitHub Actions workflow that runs **daily at 18:15 UTC (12:00 AM Nepal time)**:

```yaml
# .github/workflows/import-kalimati-prices.yml
```

**Setup:**

1. Add secrets to your repository:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`

2. Optionally add a repository variable:
   - `GEMINI_MODEL` (defaults to `gemini-2.0-flash`)

The workflow automatically scrapes Kalimati, translates commodity names, and upserts prices to your Supabase instance every night.

---

## 👥 User Roles

| Role | Purpose |
|------|---------|
| **Farmer** | Create harvest listings, track orders, receive direct payments |
| **Retailer** | Browse verified crop listings, place bulk orders, track delivery |
| **Transport Provider** | Accept load board offers, update GPS in real-time, prove delivery |
| **Cooperative** | *(Coming Soon)* Aggregate member harvests and run auctions |

---

## 🌍 Key Features

### 🗺️ Live Location Mapping
- Interactive Leaflet map showing all map-enabled accounts
- Transport providers' locations update in real-time (< 10 min stale)
- GPS coordinates rounded to 3 decimals to protect exact farm locations

### 💰 Profit Calculator
- Compare Kalimati minimum reference vs. direct Anvaya pricing
- Estimate extra margin for selected crops and harvest volumes
- Live data synced from daily Kalimati imports

### 🔍 Market Price Transparency
- Real-time commodity prices from Kalimati Market
- English & Nepali commodity names
- Daily price change indicators (↑ up, ↓ down, or "New")
- Filterable by crop name or market

### 🏷️ QR Traceability
- Auto-generated QR codes for every harvest batch
- Encodes farmer name, pesticide status, lab certifications, harvest date
- Buyers scan to verify producer credibility and chemical safety

### 🤖 AI Assistant
- Mock 24/7 chatbot for weather forecasts, price queries, soil tips
- Extensible to real ML models for predictive analytics

### 🔐 Authentication
- Supabase Auth with email/password and Google OAuth
- Role-based access control (Farmer, Retailer, Transport Provider)
- JWT tokens for secure API endpoints

---

## 🛡️ Privacy & Security

- **Location Privacy:** GPS coordinates rounded before public map display
- **CORS Protection:** Backend validates request origins
- **Service Role Keys:** Never exposed to frontend; backend-only
- **Authentication Fallback:** Email/password login backed by Supabase Auth

---

## 📚 Architecture

```
Frontend (React + Vite)
         ↓ (HTTP)
Backend (Express + TypeScript)
         ↓ (REST + Row-Level Security)
Supabase (PostgreSQL + Auth + Realtime)
         ↓ (Python Script)
Kalimati Market Gov Site
         ↓ (AI Translation)
Google Gemini API
```

---

## 🔧 Development Tips

### Hot Reload
- **Frontend:** Vite HMR enabled by default
- **Backend:** Nodemon watches TypeScript files and restarts automatically

### TypeScript
- Strict mode enabled in both frontend and backend
- Run `tsc -b` to check for type errors

### Linting
- Frontend uses **Oxlint** (fast Rust-based linter)
- Run: `npm run lint --workspace=frontend`

### Testing
- Add Jest or Vitest for unit tests
- End-to-end tests: Playwright or Cypress (not yet configured)

---

## 📖 Documentation

- **Backend Kalimati Importer:** See `backend/README.md`
- **Frontend Template:** See `frontend/README.md`
- **Supabase Schema:** Review `backend/supabase_schema.sql`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📋 Roadmap

- [ ] Cooperative account support (aggregation + auctions)
- [ ] Real ML models for crop price forecasting
- [ ] Cold-chain temperature monitoring (IoT sensors)
- [ ] Invoice & payment settlement system
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Hindi, Maithili, Bhojpuri)

---

## 📄 License

This project is open source. See `LICENSE` file for details.

---

## 💬 Support

For issues, questions, or feature requests, please open a [GitHub Issue](https://github.com/DeV-PrasiddhA/Anvaya/issues).

---

## 🙏 Acknowledgments

- **Kalimati Market Development Board** for daily agricultural price data
- **Supabase** for seamless backend infrastructure
- **Google Gemini** for commodity name translation
- **Nepal's farming community** for inspiration and feedback

---

**Made with ❤️ for Nepal's agricultural ecosystem.**
