# E-Waste Passport

> **Track 03: Waste and Energy**  
> *"A passport for every old device, from the owner's hand to its final outcome."*

### 🚀 Live Demo

<p align="center">
  <a href="https://main.d298fn45tbafnm.amplifyapp.com/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Website-2EA44F?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

[![Build & Test](https://img.shields.io/badge/tests-180%20passed-emerald)](https://github.com/Sanesh764/Energy_recycle)
[![React](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-blue)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/backend-Node.js%2020%20%2B%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MongoDB-forest)](https://mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)](./LICENSE)

---

## 1. Project Overview

**E-Waste Passport** is a civic circular-economy platform designed to solve electronic waste hoarding and unmanaged disposal by providing end-to-end lifecycle traceability for retired electronics. 

Every device registered by a citizen receives an immutable digital passport tracking its journey through:
1. **Multimodal AI triage** (condition analysis & disposition guidance)
2. **Doorstep collection** by authorized local handlers
3. **Physical diagnostic inspection**
4. **Verified final outcome** (**REPAIR**, **REUSE**, **RESALE**, or **RECYCLE**)

Citizens earn **EcoCoins** upon verified collection, which can be redeemed for sample shopping vouchers and mobility discounts in the demo store. Administrators oversee system-wide operations and audit real-world environmental impact using published international characterization factors (**ITU / UNITAR Global E-waste Monitor 2024**).

---

## 2. Architecture & Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS, React Router v6
- **Backend:** Node.js 20 (LTS), Express 4.21, Mongoose 8.9, Zod 3.24, Bcryptjs
- **Database:** MongoDB 7.0+ (Atlas / Local)
- **Authentication:** 
  - Production: Amazon Cognito User Pool (JWT with `aws-jwt-verify`)
  - Local / Demo: Secure server-backed authentication (`/api/auth`) with bcrypt password hashing and session tokens (`dev-token-${userId}`)
  - Security Boundary: Automatic fail-closed protection in production (`NODE_ENV === 'production'` strictly rejects any dev tokens)
- **Storage:** Amazon S3 (Private bucket with presigned PUT/GET URLs and dev mock fallback)
- **AI Triage:** Amazon Bedrock Converse API (Multimodal Claude 3 Haiku / Sonnet with deterministic fallback)
- **Rewards System:** Atomic balance tracking, anti-duplicate collection awarding, interactive coupon redemptions
- **Testing:** Jest 29, Supertest 7 (**180 automated backend unit, integration, and security boundary tests**)

---

## 3. Verified Demo Accounts & Credentials

The database comes pre-seeded with verified test accounts across all three roles. Passwords are encrypted using bcrypt (10 rounds):

| Role | Email Address | Password | Permissions & Available Views |
| :--- | :--- | :--- | :--- |
| **Admin** | `sanesh7644@gmail.com` | `password@123` | System oversight, read-only audit register, aggregate empirical impact metrics (`/admin/stats`, `/admin/devices`) |
| **Collector 1** | `santosh@gmail.com` | `password@123` | Open pickups in PIN codes `110001`, `110002`, doorstep collection, physical inspection (`/collector/open`, `/collector/my-pickups`) |
| **Collector 2** | `collector2@ewaste.local` | `password@123` | Secondary authorized collector for concurrent pickup acceptance testing |
| **Collector 3** | `collector3@ewaste.local` | `password@123` | Tertiary authorized collector |
| **Citizen** | `citizen@example.org` | `password@123` | Device registration, doorstep pickup booking, EcoCoins wallet (`/citizen/devices`, `/citizen/rewards`) |
| **New Citizen** | *Public Registration* | *User-defined* | Public signup automatically creates citizen accounts (`POST /api/auth/signup`) |

---

## 4. Quick Start (Local Development)

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Sanesh764/Energy_recycle.git
cd Energy_recycle

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Seed Database with Reference Factors & Demo Accounts

Run the idempotent database seed script:

```bash
cd backend
npm run seed
```

This populates:
1. **Authoritative Impact Factors:** Published characterization data from the **ITU Global E-waste Monitor 2024** for `PHONE` (0.2 kg, 80% recyclable), `LAPTOP` (2.5 kg, 85% recyclable), and `TV` (15.0 kg, 75% recyclable).
2. **Verified Test Accounts:** Admin (`sanesh7644@gmail.com`), Collectors (`santosh@gmail.com`), and Citizen (`citizen@example.org`) with hashed passwords.
3. **Sample Devices:** Pre-configured sample devices (`isSample: true`) illustrating all lifecycle stages (`EW-2026-000101` to `EW-2026-000105`).
4. **Initial Rewards Ledger:** Seeded transactions and 120 EcoCoins for the citizen account.

### Step 3: Start Backend Server

```bash
cd backend
npm start
```
*API runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

### Step 4: Start Frontend Application

In a separate terminal:

```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Public Homepage & Navigation

The public homepage (`/`) has been completely redesigned with a high-trust circular-economy aesthetic:

- **Hero Section:** Headline *"Turn Your E-Waste Into Rewards."* with prominent CTAs (`Recycle Now` and `Track My Device`) and an interactive passport preview card.
- **Dedicated EcoCoins Showcase (`#rewards`):** Visual wallet card showing demo balance, transaction history, and sample discount coupons.
- **Why Choose E-Waste Passport (`#why-us`):** Four core features (doorstep pickup, transparent tracking, eco rewards, AI assistance).
- **How It Works (`#how-it-works`):** Visual 4-step workflow (Register → Request → Verify → Track & Earn).
- **Stakeholder Roles (`#roles`):** Segregated portals for Citizens, Collectors, and Administrators.
- **Transparent Impact (`#impact`):** Empirical recovery formulas citing published ITU / UNU-KEY factors.
- **About the Developer (`#developer`):** Profile details for Sanesh Kumar with verified links.
- **Cross-Route Section Anchoring:** Clicking any section link from `/login` or `/signup` automatically navigates to the homepage and smoothly scrolls directly into view.

---

## 6. Authentication Architecture & Security Boundaries

### Production Mode (Amazon Cognito User Pool)
- Validates cryptographic JWT signatures via `CognitoJwtVerifier` against AWS JWKS keys.
- Role groups (`citizen`, `collector`, `admin`) are extracted from token claims.
- Users with no groups default strictly to `citizen`. Unknown groups are rejected with HTTP 403.

### Local Development Mode (`ALLOW_DEV_DEMO_AUTH=true`)
- Session tokens are issued by `POST /api/auth/login` upon verifying bcrypt-hashed passwords.
- Validates active sessions via `GET /api/auth/me`.
- Public signup (`POST /api/auth/signup`) is strictly locked to `role: 'citizen'`. Any client attempts to supply `role: 'admin'` or `role: 'collector'` are ignored by the server.
- Duplicate email registration is prevented with HTTP 409 Conflict.

### Fail-Closed Production Guardrail
- When `NODE_ENV === 'production'`, any development tokens (`dev-token-*` or `ewaste-demo-*`) are immediately rejected with HTTP 401 Unauthorized.

---

## 7. Running Tests & Production Build

### Backend Test Suite (180 Tests across 12 Suites)

```bash
cd backend
npm test
```

All 12 test suites execute in band:
- `tests/security.test.js` — 16 security & boundary tests (unauthenticated rejection, public signup role enforcement, role boundary isolation, admin access, session validation, production fail-closed security)
- `tests/auth.test.js` — Cognito JWT verification, group mapping, and role extraction
- `tests/devAuth.test.js` — Dev demo auth guardrails and production rejection
- `tests/rewards.test.js` — EcoCoins wallet balance, coupon redemptions, anti-duplicate collection awarding
- `tests/devices.test.js` — Device registration, atomic code generation, inspection, and completion
- `tests/pickups.test.js` — Pickup lifecycle & concurrency protection
- `tests/admin.test.js` — Admin impact calculation & sample data exclusion toggle
- `tests/seed.test.js` — Published reference factor integrity
- `tests/uploads.test.js` — S3 presigned URL validation
- `tests/statusMachine.test.js` — Centralized lifecycle state machine
- `tests/ai.test.js` — Bedrock Converse AI integration & deterministic fallback
- `tests/health.test.js` — Health check endpoint

### Frontend Production Build

```bash
cd frontend
npm run build
```

Compiles the application to production bundle in `dist/` with 0 errors.

---

## 8. Three-Minute Demo Video Recording Script

Follow this sequence to record a crisp, 3-minute video presentation:

### Scene 1: Landing Page & Problem Pitch (0:00 – 0:35)
- **URL:** `http://localhost:5173/`
- **Actions:**
  - Scroll past the hero banner showing the headline *"Turn Your E-Waste Into Rewards."*
  - Highlight the dedicated **EcoCoins** rewards card and sample coupons.
  - Show the 4-step workflow: *Register → Request → Verify → Track & Earn*.
  - Click **"Recycle Now"** to open Citizen registration or sign in.
- **Narration:**
  > *"Every year, over 62 million tonnes of electronic waste are discarded worldwide. Citizens keep old laptops and smartphones in drawers because they don't know where they end up. E-Waste Passport solves this by creating an immutable digital passport for every device, connecting owners to certified collectors and rewarding responsible disposal with EcoCoins."*

### Scene 2: Citizen Device Registration & AI Triage (0:35 – 1:15)
- **URL:** `http://localhost:5173/citizen/devices/new`
- **Actions:**
  - Select Category: **Laptop**, Age: **3 years**, Powers on: **Yes**, Condition: **Working - Minor Scratches**.
  - Enter required pickup address: House *"Flat 402, Green Enclave"*, Locality *"Sector 14"*, City *"New Delhi"*, PIN Code *"110001"*, Phone *"9876543210"*.
  - Submit device: AI suggests **REPAIR** with safety tips.
  - Review the generated passport code (e.g. `EW-2026-000106`) and confirm the pickup request.
- **Narration:**
  > *"As a citizen, I register an old laptop. The platform captures hardware specifications and photo evidence, calling Amazon Bedrock for multimodal triage. The AI suggests 'Repair' with safety tips. I confirm my pickup address, and a unique passport is issued with real-time tracking."*

### Scene 3: Collector Acceptance & Custody Verification (1:15 – 1:55)
- **URL:** `http://localhost:5173/login` (or Quick Switch to Collector)
- **Actions:**
  - Sign in as Collector (`santosh@gmail.com` / `password@123`).
  - Open **"Open Pickups"** (`/collector/open`). Notice the laptop pickup matching service PIN code `110001`.
  - Click **"Accept Pickup"** (concurrency-safe atomic claim).
  - Navigate to **"My Pickups"** (`/collector/my-pickups`) and click **"Mark Collected"**.
  - Click **"Perform Inspection"**, select Final Confirmed Outcome: **REPAIR**, and submit completion.
- **Narration:**
  > *"Switching to the field collector view, I see open pickups in my authorized postal codes. I accept the request with concurrency protection. Upon doorstep handover, I mark the device Collected, which immediately credits EcoCoins to the citizen. After diagnostic inspection, I record the authoritative outcome—Repair—completing the passport lifecycle."*

### Scene 4: Citizen Reward Wallet & Interactive Redemption (1:55 – 2:25)
- **URL:** `http://localhost:5173/citizen/rewards`
- **Actions:**
  - Return to Citizen view (`citizen@example.org`).
  - Point out the updated EcoCoins balance (+50 coins credited from the verified collection) and the new entry in the Transaction Ledger.
  - Click **"Redeem"** on the *₹100 Green Electronics Voucher*.
  - Show the interactive success modal and generated promo code (`ECO-40-XXXXXX`).
- **Narration:**
  > *"Back in the citizen portal, my Rewards Wallet immediately reflects +50 EcoCoins from the verified collection. I can redeem these coins interactively for shopping vouchers or EV mobility passes, turning unwanted e-waste into tangible community incentives."*

### Scene 5: Admin Impact Analytics & AI Guide (2:25 – 3:00)
- **URL:** `http://localhost:5173/admin/stats`
- **Actions:**
  - Sign in as Admin (`sanesh7644@gmail.com` / `password@123`).
  - Highlight the empirical impact metrics: *Completed Devices Handled*, *Kept in Use (kg)*, and *Recyclable Material (kg)*.
  - Toggle the **"Exclude Sample Data"** checkbox to show transparent separation of pilot samples from live data.
  - Click the floating **"E-Waste AI Guide"** widget in the bottom right corner to demonstrate grounded device-wiping advice.
- **Narration:**
  > *"Finally, the sustainability admin dashboard aggregates real-world circular impact using verified ITU Global E-waste Monitor factors. Administrators can audit outcomes and toggle sample pilot data with a single click. The built-in AI Guide ensures citizens always have grounded guidance on data sanitization and recycling. E-Waste Passport delivers complete traceability—from the owner's hand to certified outcome."*

---

## 9. Developer & Project Information

- **Developer:** Sanesh Kumar
- **GitHub:** [https://github.com/Sanesh764](https://github.com/Sanesh764)
- **LinkedIn:** [https://www.linkedin.com/in/sanesh-kumar/](https://www.linkedin.com/in/sanesh-kumar/)
- **Repository:** [https://github.com/Sanesh764/Energy_recycle](https://github.com/Sanesh764/Energy_recycle)
- **Track:** Waste and Energy (Track 03)

---

## 10. License

This project is licensed under the ISC License.
