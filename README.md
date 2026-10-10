# E-Waste Passport

> **Track 03: Waste and Energy**  
> *"A passport for every old device, from the owner's hand to its final outcome."*

---

## 1. Project Overview

E-Waste Passport is a civic circular-economy platform designed to tackle electronic waste by providing end-to-end lifecycle traceability for retired electronics. Every device registered by a citizen receives an immutable digital passport tracking its journey through AI-assisted condition triage, doorstep collection by certified handlers, hands-on diagnostic inspection, and verified final disposition (**REPAIR**, **REUSE**, **RESALE**, or **RECYCLE**). Aggregate metrics empower administrators to audit real-world environmental impact using verified, published characterization factors.

---

## 2. Architecture & Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS, React Router v6
- **Backend:** Node.js 20 (LTS), Express 4.21, Mongoose 8.9, Zod 3.24
- **Database:** MongoDB 7.0+
- **Authentication:** Amazon Cognito User Pool (JWT with `aws-jwt-verify`)
- **Storage:** Amazon S3 (Private bucket with presigned PUT/GET URLs)
- **AI Triage:** Amazon Bedrock Converse API (Multimodal Claude 3 Haiku / Sonnet)
- **Testing:** Jest 29, Supertest 7 (154 automated backend unit & integration tests)

---

## 3. Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`
- **MongoDB:** Local MongoDB community server running on `localhost:27017` (or MongoDB Atlas URI)

---

## 4. Environment Configuration

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
# Server & Database
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/e-waste-passport
CORS_ORIGIN=*

# AWS Authentication (Amazon Cognito)
# Leave empty for local demo mode with ALLOW_DEV_DEMO_AUTH=true
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=

# Local Development / Demo Auth Mode
# Set to true for offline demo testing. Strictly prohibited in production!
ALLOW_DEV_DEMO_AUTH=true

# AWS Cloud Infrastructure (S3 & Bedrock)
AWS_REGION=us-east-1
S3_BUCKET_NAME=e-waste-passport-photos-dev
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

> [!CAUTION]
> `ALLOW_DEV_DEMO_AUTH` is an opt-in setting for local offline testing only. The backend configuration schema will **refuse to start** if `NODE_ENV=production` and `ALLOW_DEV_DEMO_AUTH=true`.

### Frontend Configuration (`frontend/.env`)

```bash
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Quick Start (Local Development)

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
1. **Authoritative Impact Factors:** Published characterization data from the **ITU / UNITAR Global E-waste Monitor 2024** for `PHONE` (0.2 kg, 80% recyclable), `LAPTOP` (2.5 kg, 85% recyclable), and `TV` (15.0 kg, 75% recyclable). Unverified categories are intentionally omitted and display `"not available"` per specification.
2. **Deterministic Demo Accounts:** Controlled identities for Citizen, Collector, and Administrator.
3. **Sample Devices:** Pre-configured sample devices (`isSample: true`) illustrating all lifecycle stages.

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

## 6. Authentication Modes

### Mode A: Production (Amazon Cognito)
- Uses live AWS Cognito User Pool.
- Tokens are verified cryptographically via `CognitoJwtVerifier` against the AWS public key set.
- Groups (`citizen`, `collector`, `admin`) are extracted from token claims.
- Users with no groups default to `citizen`. Unknown groups are rejected with HTTP 403.

### Mode B: Local Demo Mode (`ALLOW_DEV_DEMO_AUTH=true`)
- Operates when live AWS Cognito is not configured during local development or demonstrations.
- Uses three deterministic, isolated tokens:
  - `ewaste-demo-citizen-token` → Citizen (`dev-demo-citizen-01`)
  - `ewaste-demo-collector-token` → Collector (`dev-demo-collector-01`, pincodes `110001`, `110002`)
  - `ewaste-demo-admin-token` → Admin (`dev-demo-admin-01`)
- Arbitrary client tokens or client-supplied roles are strictly rejected with HTTP 401.

---

## 7. Running Tests

### Backend Test Suite

```bash
cd backend
npm test
```

Executes 154 unit, integration, and security tests across 10 test suites:
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

Verifies Vite compilation, syntax, and asset bundling.

---

## 8. Live AWS Services vs. Local Fallback

| Capability | Local Development Mode | Live AWS Production Mode |
| :--- | :--- | :--- |
| **Authentication** | Opt-in controlled demo provider (`ALLOW_DEV_DEMO_AUTH=true`) | Amazon Cognito User Pool JWT verification |
| **Photo Uploads** | S3 mock / offline handling | Private Amazon S3 bucket via presigned PUT/GET URLs |
| **AI Assessment** | Deterministic fallback (`status: FALLBACK`, `suggestedOutcome: RECYCLE`) | Amazon Bedrock Converse API multimodal triage |
| **Traceability** | MongoDB state machine | MongoDB state machine |
| **Impact Analytics** | ITU/UNITAR empirical calculations | ITU/UNITAR empirical calculations |

---

## 9. Security Safeguards

- **Zero Hardcoded Secrets:** All AWS credentials resolve via EC2 IAM role or environment variables.
- **Strict Role Isolation:** Backend independently verifies role authorization on every protected route.
- **Atomic Operations:** Concurrency-safe pickup claims and sequential passport code generation (`EW-YYYY-NNNNNN`).
- **Data Privacy:** Sensitive addresses, phone numbers, and raw auth tokens are never logged.
- **Authoritative Inspection:** Collector hands-on diagnostic inspection overrides advisory AI recommendations.
