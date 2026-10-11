# E-Waste Passport

> **Track 03: Waste and Energy**  
> *"A passport for every old device, from the owner's hand to its final outcome."*

---

## 1. Project Overview

E-Waste Passport is a civic circular-economy platform designed to tackle electronic waste by providing end-to-end lifecycle traceability for retired electronics. Every device registered by a citizen receives an immutable digital passport tracking its journey through AI-assisted condition triage, doorstep collection by certified handlers, hands-on diagnostic inspection, and verified final disposition (**REPAIR**, **REUSE**, **RESALE**, or **RECYCLE**). 

Citizens earn **green reward coins** upon verified device collection, which can be redeemed for sample shopping coupons. Aggregate metrics empower administrators to audit real-world environmental impact using verified, published characterization factors.

---

## 2. Architecture & Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS, React Router v6
- **Backend:** Node.js 20 (LTS), Express 4.21, Mongoose 8.9, Zod 3.24
- **Database:** MongoDB 7.0+
- **Authentication:** Amazon Cognito User Pool (JWT with `aws-jwt-verify`) + Safe Dev Demo Auth provider
- **Storage:** Amazon S3 (Private bucket with presigned PUT/GET URLs)
- **AI Triage:** Amazon Bedrock Converse API (Multimodal Claude 3 Haiku / Sonnet)
- **Rewards System:** Atomic balance tracking, anti-duplicate collection awarding, interactive coupon redemptions
- **Testing:** Jest 29, Supertest 7 (160 automated backend unit & integration tests)

---

## 3. Quick Start (Local Development)

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Seed Database with Reference Data & Demo Devices

Run the idempotent database seed script:

```bash
cd backend
npm run seed
```

This populates:
1. **Authoritative Impact Factors:** Published characterization data from the **ITU / UNITAR Global E-waste Monitor 2024** for `PHONE` (0.2 kg, 80% recyclable), `LAPTOP` (2.5 kg, 85% recyclable), and `TV` (15.0 kg, 75% recyclable).
2. **Deterministic Demo Accounts:** Controlled identities for Citizen, Collector, and Administrator.
3. **Sample Devices:** Pre-configured sample devices (`isSample: true`) illustrating all lifecycle stages.
4. **Initial Rewards Ledger:** Seeded transactions and coins for the demo citizen account.

### Step 3: Start Backend API

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

## 4. Authentication Modes

### Mode A: Production (Amazon Cognito)
- Uses live AWS Cognito User Pool.
- Tokens are verified cryptographically via `CognitoJwtVerifier` against the AWS public key set.
- Groups (`citizen`, `collector`, `admin`) are extracted from token claims.
- Users with no groups default to `citizen`. Unknown groups are rejected with HTTP 403.

### Mode B: Local Demo Mode (`ALLOW_DEV_DEMO_AUTH=true`)
- Operates when live AWS Cognito is not configured during local development or demonstrations.
- Uses three deterministic, isolated tokens:
  - `ewaste-demo-citizen-token` → Citizen (`dev-demo-citizen-01`, 120 initial coins)
  - `ewaste-demo-collector-token` → Collector (`dev-demo-collector-01`, pincodes `110001`, `110002`)
  - `ewaste-demo-admin-token` → Admin (`dev-demo-admin-01`)
- Arbitrary client tokens or client-supplied roles are strictly rejected with HTTP 401.

---

## 5. Live AWS Services vs. Local Fallback

| Capability | Local Development Mode | Live AWS Production Mode |
| :--- | :--- | :--- |
| **Authentication** | Opt-in controlled demo provider (`ALLOW_DEV_DEMO_AUTH=true`) | Amazon Cognito User Pool JWT verification |
| **Photo Uploads** | S3 dev fallback with direct mock target | Private Amazon S3 bucket via presigned PUT/GET URLs |
| **AI Assessment** | Deterministic fallback (`status: FALLBACK`, `suggestedOutcome: RECYCLE`) | Amazon Bedrock Converse API multimodal triage |
| **Traceability** | MongoDB state machine | MongoDB state machine |
| **Impact Analytics** | ITU/UNITAR empirical calculations | ITU/UNITAR empirical calculations |
| **Rewards Wallet** | Interactive demo shop & ledger | Production reward ledger |

---

## 6. Running Tests & Production Build

### Backend Test Suite

```bash
cd backend
npm test
```

Executes **160 unit, integration, and security tests** across 11 test suites:
- `tests/rewards.test.js` — Reward wallet balance, coupon redemptions, anti-duplicate collection awarding
- `tests/devAuth.test.js` — Dev demo auth guardrails and production rejection
- `tests/seed.test.js` — Published reference factor integrity
- `tests/admin.test.js` — Admin impact calculation & sample toggle
- `tests/devices.test.js` — Device registration, code generation, inspection, completion
- `tests/pickups.test.js` — Pickup workflow & concurrency protection
- `tests/uploads.test.js` — S3 presigned URL validation
- `tests/auth.test.js` — Cognito JWT verification & group mapping
- `tests/health.test.js` — Health check endpoint
- `tests/statusMachine.test.js` — Centralized lifecycle state machine
- `tests/ai.test.js` — Bedrock Converse AI integration & deterministic fallback

### Frontend Production Build

```bash
cd frontend
npm run build
```

Compiles the application to production bundle in `dist/`.

---

## 7. Three-Minute Demo Video Recording Script

Follow this exact sequence to record a crisp, 3-minute video presentation:

### Scene 1: Landing Page & Problem Pitch (0:00 – 0:35)
- **URL:** `http://localhost:5173/`
- **Actions:**
  - Scroll past the hero banner showing genuine e-waste collection photography and the headline *"Turn Your E-Waste Into Rewards."*
  - Highlight the 3-step lifecycle: *Submit Device → Get It Collected → Earn Rewards*.
  - Show the Environmental Mission statistics (62 million tonnes generated, only 22.3% recycled).
  - Click the **"Recycle Now"** primary CTA button.
- **Narration:**
  > *"Every year, over 62 million tonnes of electronic waste are discarded. Citizens keep old laptops and smartphones in drawers because they don't know what to do with them. E-Waste Passport solves this by creating a verified digital passport for every device, connecting owners to certified collectors and rewarding responsible disposal."*

### Scene 2: Citizen Device Registration & AI Triage (0:35 – 1:15)
- **URL:** `http://localhost:5173/citizen/devices/new`
- **Actions:**
  - Select Category: **Laptop**, Age: **3 years**, Powers on: **Yes**, Damage: **Minor**.
  - Choose a sample device photo.
  - Click **"Submit for AI Analysis"**.
  - System generates unique passport code (e.g. `EW-2026-000106`) and shows the Bedrock AI disposition triage (**REPAIR**).
  - Click **"Schedule Free Pickup"**, enter address *"123 Green Lane, Pincode 110001"*, select *"Morning"* slot, and confirm.
- **Narration:**
  > *"As a citizen, I register an old laptop. The platform captures hardware details and photo evidence, calling Amazon Bedrock for multimodal triage. The AI suggests 'Repair' with safety tips. I schedule a free doorstep pickup, and my digital passport is created with an immutable audit timeline."*

### Scene 3: Collector Acceptance & Custody Verification (1:15 – 1:55)
- **Actions:**
  - Use the top Dev Auth Boundary bar to switch active role to **Collector**.
  - Open **"Open Pickups"** (`/collector/open`). Notice the laptop pickup matching service pincode `110001`.
  - Click **"Accept Pickup"** (concurrency-safe atomic claim).
  - Navigate to **"My Pickups"** (`/collector/my-pickups`).
  - Click **"Mark Collected"**. Notice the device status updates to `COLLECTED` and citizen reward coins are credited.
  - Click **"Perform Inspection"**, select Final Confirmed Outcome: **REPAIR**, enter diagnostic notes, and submit.
  - Click **"Mark Completed"**.
- **Narration:**
  > *"Switching to the field collector view, I see open pickups in my authorized postal codes. I accept the request with concurrency protection. Upon doorstep arrival, I mark the device as Collected, which automatically awards green reward coins to the citizen. After diagnostic inspection, I record the authoritative outcome—Repair—completing the passport lifecycle."*

### Scene 4: Citizen Reward Wallet & Interactive Redemption (1:55 – 2:25)
- **Actions:**
  - Switch role back to **Citizen** and navigate to **"Rewards Wallet"** (`/citizen/rewards`).
  - Point out the updated coin balance (+50 coins earned from collection) and the new entry in the Transaction Ledger.
  - Under sample shopping coupons, click **"Redeem for 50 Coins"** on the *EcoMart Groceries Voucher*.
  - Show the interactive success alert and generated coupon code (e.g. `ECO-50-AE4DA0`).
- **Narration:**
  > *"Back in the citizen portal, my Rewards Wallet immediately reflects +50 green coins from the verified collection. I can redeem these coins interactively for sample retail vouchers or EV mobility passes, turning unwanted e-waste into tangible community incentives."*

### Scene 5: Admin Impact Analytics & AI Guide (2:25 – 3:00)
- **Actions:**
  - Switch role to **Admin** and open **"Impact & Stats"** (`/admin/stats`).
  - Highlight the empirical impact metrics: *Completed Devices Handled*, *Kept in Use (kg)*, and *Recyclable Material (kg)*.
  - Toggle the **"Exclude Sample Data"** checkbox to prove real data separation from pilot samples.
  - Click the floating **"E-Waste AI Guide"** widget in the bottom right corner, click *"How should I prepare my device for handover?"*, and show the grounded data-wiping advice.
- **Narration:**
  > *"Finally, the sustainability admin dashboard aggregates real-world circular impact using verified ITU Global E-waste Monitor factors. Administrators can audit outcomes and toggle sample pilot data with a single click. The built-in AI Guide ensures citizens always have grounded guidance on data sanitization and recycling. E-Waste Passport delivers complete traceability—from the owner's hand to certified outcome."*
