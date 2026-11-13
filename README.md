# HSTOCK Account Checker — Complete Project Source Code

A full-stack multi-platform social account existence & telemetry verification platform built with **React 19 + TypeScript + Vite + Tailwind CSS v4** on the frontend and **Express.js + Node.js** on the backend, with **Binance USDT (BEP20)** deposit settlement, **2-step Email OTP registration**, **Individual User Dashboards**, and a **Master Admin Controller**.

---

## 1. Folder Structure

```text
.
├── index.html                      # Main HTML entry point & SEO metadata
├── package.json                    # Dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite bundler & Tailwind CSS v4 setup
├── Dockerfile                      # Multi-stage Docker production build
├── .dockerignore                   # Docker build exclusions
├── .env.example                    # Required & optional environment variables template
├── firebase.json                   # Firebase Hosting & Firestore rules config
├── firebase-blueprint.json         # Firestore entity schemas
├── firestore.rules                 # Zero-trust Firestore security rules
├── firebase-applet-config.json     # Firebase Web SDK client configuration
├── server.ts                       # Full Express backend, auth, OTP, deposits, checkers & admin APIs
├── metaService.js                  # Optional Meta Graph API helper module
├── scripts/
│   └── generate-icons.cjs          # PWA icon generator helper
├── data/
│   └── hstock_db.example.json      # Sanitized database structure & schema template
├── public/                         # Static icons, PWA assets & images
└── src/
    ├── main.tsx                    # React DOM root mount
    ├── App.tsx                     # Root application shell
    ├── index.css                   # Tailwind CSS v4 global stylesheet
    ├── assets/                     # Bundled image assets
    ├── hooks/                      # Custom React hooks (usePWAInstall)
    ├── services/
    │   ├── hstockApi.ts            # Authenticated client API service
    │   ├── checkerService.ts       # Checker client helpers
    │   ├── firebase.ts             # Firebase app/auth/firestore initializer
    │   └── api.ts                  # Base service helpers
    ├── types/
    │   └── hstock.ts               # All TypeScript interfaces, defaults & pricing
    └── components/
        ├── HstockAccountCheckerApp.tsx   # Main authenticated workspace & checker controller
        ├── AuthLandingPortal.tsx         # Public landing & 2-step OTP registration/login gate
        ├── AuthModal.tsx                 # Login, OTP signup & password recovery modal
        ├── Header.tsx                    # Top navigation bar & balance badge
        ├── UserDashboardView.tsx         # Personal wallet, recovery code, ledger & profile editor
        ├── AdminDashboardModal.tsx       # Master Admin Console (deposits, users, activity, keys, WAF)
        ├── BinanceUsdtDepositModal.tsx   # BEP20 USDT deposit & TXID verification modal
        ├── ResultsDashboard.tsx          # Exportable (CSV/TXT/JSON) account check results table
        ├── VerificationProgress.tsx      # Real-time check batch progress display
        ├── HistoryModal.tsx              # Saved batch history browser
        ├── StatsModal.tsx                # Account checking telemetry modal
        ├── ShareResultsModal.tsx         # Generate view-only report share links
        ├── SharedResultsView.tsx         # Public read-only report viewer (?share=id)
        ├── MaintenanceOverlay.tsx        # Maintenance mode notice
        └── LegalModal.tsx / ContactModal.tsx / PrivacyPolicyModal.tsx
```

---

## 2. Requirements & Independent Local Setup

- **Node.js 20+** (recommended: **Node.js 22 LTS**) and **npm**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` from template:**
   ```bash
   cp .env.example .env
   ```
   Fill in optional variables like `RESEND_API_KEY` (for automated email OTP delivery) and `APP_URL`.

3. **Initialize database (automatic on first boot):**
   On first startup, `server.ts` automatically creates `data/hstock_db.json` if missing. To inspect the JSON schema beforehand, see `data/hstock_db.example.json`.

4. **Start development server (runs both Express backend + Vite frontend on port 3000):**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 3. Production Build & Independent Deployment

### Option A: Node.js / VPS (Ubuntu, PM2, Nginx, Railway, Render)
```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 npm start
```
- The production build compiles Vite SPA assets into `dist/` and bundles `server.ts` into `dist/server.js`.
- Persist the `./data` folder across deployments so `data/hstock_db.json` retains all users, deposits, check batches, and settings.
- Put **Cloudflare** or **Nginx** in front with HTTPS enabled and point your custom domain DNS to your server.

### Option B: Docker / Google Cloud Run / Fly.io
```bash
docker build -t hstock-account-checker .
docker run -d -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e RESEND_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  --name hstock-app \
  hstock-account-checker
```

### Option C: Firebase Hosting + Firestore Rules
```bash
firebase login
firebase deploy --only firestore:rules
```
*(Note: Because the checker verification engines, auth sessions, and payment checks run on Node.js (`server.ts`), host the Express backend on Cloud Run, Railway, Render, or a VPS rather than static-only hosting.)*

---

## 4. How to Edit & Customize

- **Admin Emails:** Edit `ADMIN_EMAILS` in `server.ts` to add or change authorized admin email addresses.
- **Pricing & USDT Wallet:** Update directly from the live **Admin Console → Settings**, or adjust defaults in `src/types/hstock.ts` (`DEFAULT_PLATFORM_PRICING`, `DEFAULT_SETTINGS`).
- **API Keys (YouTube, Meta Graph, Threads, GitHub, Cloudflare):** Configure securely inside **Admin Console → API Keys / Cloudflare** (stored server-side and stripped from public `/api/settings`).
- **UI & Branding:** Components live under `src/components/` using Tailwind CSS v4 utilities (`src/index.css`). Always run `npm run lint` and `npm run build` after edits.
