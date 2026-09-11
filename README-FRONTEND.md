# Project Awaaz: Next.js Production Web Frontend

> *A deterministic multi-agent governance architecture ensuring zero-harm, privacy-preserving case resolution for high-stakes missing-child investigations across connected urban infrastructure.*

---

## Overview

This modern, responsive Next.js (App Router) web application upgrades Project Awaaz from its initial Streamlit prototype to a high-aesthetic, production-grade frontend built for hackathon evaluation and 1-click deployment on **Vercel**.

Designed to project trustworthiness, authority, and cryptographic rigor, the frontend provides full observability into the deterministic **3+1 LangGraph multi-agent governance architecture**, the **FastMCP Pre-LLM Data Minimization Gate**, and the **ChromaDB Hybrid Vector RAG Engine**.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5.x
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) with custom slate/zinc dark aesthetic, glowing hazard accents, and glassmorphism
- **Animations:** [Framer Motion 11](https://www.framer.com/motion/) for stepped execution replays and smooth card transitions
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** Vercel (Edge & Serverless ready with zero external API dependencies required for judge evaluation)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` or `v26+`
- npm `v9+` or `v10+`

### 2. Run Locally
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Verification
```bash
cd frontend
npm run build
npm run start
```

---

## ☁️ 1-Click Deployment to Vercel

In a monorepo or project where the Next.js frontend is located in `frontend/`, Vercel requires setting the **Root Directory** to `frontend`:

### Step-by-Step Vercel Setup:
1. Go to your project on the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings** > **General**.
3. Under the **Root Directory** section, click **Edit**.
4. Select or type: `frontend`.
5. Click **Save**.
6. Trigger a **Redeploy** (Deployments > click `...` > **Redeploy**).

> **Why this is required:** Vercel looks for `package.json` in the specified Root Directory to detect Next.js. Setting the Root Directory to `frontend` ensures Vercel automatically detects Next.js 14, executes `npm install`, and runs `next build` with full Server Components and API route support.

---

## 🎯 Guided Evaluation Checklist for Judges

### 1. Authoritative Governance Banner & Health Badges
- Notice the prominent header directive:
  > *"Strict Governance Directive: The AI cannot authorize interventions. Human review is mandatory. All real-world civic actions require certified officer sign-off."*
- Telemetry indicators confirm **System Healthy (12ms)** and **FastMCP: Connected (stdio)**.
- Toggle between **Sovereign Offline Engine** (100% deterministic, 0 external API calls) and **Live Gemini 2.5 Mode**.

### 2. The Signature Feature Card (`CASE-002: Hard Contradiction Override`)
- Select **`CASE-002 (Hard Contradiction)`** in the left sidebar.
- Click **"Run Multi-Agent Investigation"** (or view instant pre-run state).
- Observe **The Signature Feature Card**:
  - **Similarity Score:** 94.0% (Facial Candidate Match: 98.4%)
  - **Multi-Source Dimension Breakdown:**
    * Age: `✓ 0.91 (Confirmed)`
    * Origin: `✓ 0.87 (Confirmed)`
    * Timeline: `✓ 0.93 (Confirmed)`
    * Physical Marker: `✗ HARD (Contradiction Detected: left forearm != right forearm)`
  - **Striking Alert Box:**
    ```
    🚫 ESCALATION BLOCKED
    Physical marker contradiction detected.
    Policy: HARD CONTRADICTION > SIMILARITY. Final State: HOLD.
    ```
  - **The Governance Contrast:** Shows how unconstrained AI models would trigger a false-positive alert based on 94% similarity, whereas Awaaz's deterministic Rule 1 immediately halts automation.

### 3. FastMCP Pre-LLM Data Minimization Inspector
- Click **"Inspect FastMCP Quarantine"** in the top navigation bar.
- Inspect the schema gate:
  - `exact_address`, `biometric_hash`, and `contact_number` are strictly quarantined.
  - **0 Sensitive Fields Exposed** to model token contexts.
- Click **"Probe: exact_address"** in the interactive tester to observe the FastMCP server immediately throw:
  ```python
  ValueError("UNAUTHORIZED_FIELD_ACCESS: Request blocked by data minimization policy.")
  ```

### 4. 3+1 LangGraph Planes Execution Trace
- Watch the 4 decoupled planes execute:
  1. **Plane 1 (Case Manager):** 3-Tier jailbreak scan (regex, structural entropy, semantic intent audit) and dynamic uncertainty budget routing.
  2. **Plane 2 (Investigators):** FastMCP tool calls (`search_case_metadata`, `check_case_timeline`) and ChromaDB Vector RAG.
  3. **Plane 3 (Safety Critic):** Dual-mode LLM contradiction audit distinguishing HARD anatomical conflicts from soft ambiguities.
  4. **The +1 Plane (Deterministic Policy Engine):** Zero-LLM deterministic rules 1-5.

### 5. Clean Evidence Corroboration & Human Adjudicator Sign-Off (`CASE-003`)
- Select **`CASE-003: Clean Evidence`**.
- All 4 dimensions achieve 98% corroboration with zero anomalies.
- Click **"Launch Adjudicator Sign-Off"** to inspect the Human-in-the-Loop sign-off interface, where certified child welfare officers provide cryptographic authorization tokens before any field alert can be triggered.

### 6. Uncertainty Entropy Reduction Curve
- View the real-time entropy decline $H = 1.00 \to 0.00$ plotted on the interactive curve, tracking evidence convergence across agent steps.

---

## 📂 Architecture Directory Structure

```
awaaz/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── vercel.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                # Authoritative root layout, fonts, meta tags
│       │   ├── page.tsx                  # Dashboard view (Trace, Signature Card, Telemetry)
│       │   ├── globals.css               # Design system, glowing hazard cards, dark theme
│       │   └── api/
│       │       ├── investigate/route.ts  # Next.js API route for investigation execution
│       │       └── mcp/route.ts          # FastMCP probe & civic dispatch simulation route
│       ├── components/
│       │   ├── Navbar.tsx                # Strict rule banner, health badges, engine toggle
│       │   ├── CaseSidebar.tsx           # Test scenario selector (CASE-001, 002, 003) & dossier
│       │   ├── ExecutionTraceTimeline.tsx# 3+1 LangGraph planes stepped execution visualizer
│       │   ├── SignatureCard.tsx         # Signature Contradiction Override UI (94% vs HARD)
│       │   ├── DataMinimizationDrawer.tsx# FastMCP Quarantine Gate & interactive probe tester
│       │   ├── EntropyReductionChart.tsx # SVG Uncertainty Entropy reduction curve
│       │   ├── EvidenceInspector.tsx     # ChromaDB Vector RAG transit evidence inspector
│       │   └── HumanReviewModal.tsx      # Adjudicator review sign-off panel for CASE-003
│       └── lib/
│           ├── api.ts                    # Client API with mock simulation & live backend support
│           ├── types.ts                  # Strictly typed interfaces
│           ├── mockData.ts               # Accurate test cases, traces, RAG sources, MCP schemas
│           └── utils.ts                  # Styling utilities & formatters
├── vercel.json                           # Root Vercel monorepo deployment configuration
└── README-FRONTEND.md                    # This documentation file
```
