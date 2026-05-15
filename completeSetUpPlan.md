# Build With AI 2026 KL – MyHack

## Team War Plan · Jeff, Chun Xin, Hamse, Rose

---

## 🧭 Overview

| Item  | Detail                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------- |
| Event | Build With AI 2026 KL – MyHack                                                                    |
| Date  | May 16–17, 2026 (24 hours)                                                                        |
| Venue | Sunway University, Petaling Jaya                                                                   |
| Stack | Next.js · Tailwind CSS · Firebase · Google AI Studio / Gemini · Cloud Run · Docker · GitHub  |
| Team  | Jeff (Lead/Frontend/Demo) · Chun Xin (DevOps/Backend) · Hamse (AI/Prompts) · Rose (Design/Deck) |

---

## ⚙️ Pre-Hackathon: Scaffold Preparation (Do This Tonight)

> Everything below must be committed and working **before** the event starts. The goal is zero setup time on Day 1.

### Repository Structure

```
/
├── app/                    # Next.js App Router
│   ├── (root)/
│   │   └── page.tsx        # Landing / entry
│   ├── api/
│   │   └── ai/route.ts     # Gemini API proxy endpoint
│   └── layout.tsx
├── components/
│   ├── ui/                 # Shared UI primitives (shadcn or custom)
│   └── features/           # Feature-specific components (plug in after topic drops)
├── lib/
│   ├── gemini.ts           # Gemini client wrapper
│   ├── firebase.ts         # Firebase init + helper hooks
│   └── types.ts            # Shared TypeScript types
├── public/
├── Dockerfile
├── .env.local.example
├── docker-compose.yml      # Local dev environment
├── .github/
│   └── workflows/
│       └── deploy.yml      # Cloud Run CD pipeline
├── firebase.json
├── firestore.rules
└── README.md
```

### Scaffold Checklist (Chun Xin leads, Jeff supports)

* [ ] `npx create-next-app@latest --typescript --tailwind --app`
* [ ] Install deps: `firebase`, `@google/generative-ai`, `shadcn/ui`, `zustand` (state), `react-hot-toast`
* [ ] Configure `tailwind.config.ts` with custom color tokens and dark mode
* [ ] Set up `lib/gemini.ts` — initialize Gemini 1.5 Pro / Flash client, export `generateContent()` wrapper
* [ ] Set up `lib/firebase.ts` — Firestore + Auth init, export `db`, `auth`
* [ ] Create `/api/ai/route.ts` — proxy POST handler that forwards prompt to Gemini and streams back response
* [ ] Set up `.env.local.example`:
  ```
  GEMINI_API_KEY=NEXT_PUBLIC_FIREBASE_API_KEY=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=NEXT_PUBLIC_FIREBASE_PROJECT_ID=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
* [ ] Verify `app/page.tsx` renders cleanly — placeholder hero with team name and project slot
* [ ] Push to GitHub `main` branch, confirm CI green

### Docker Setup

**`Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**`docker-compose.yml`** (local dev)

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

### GitHub Actions → Cloud Run

**`.github/workflows/deploy.yml`** (stub, fill GCP project details)

```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: myhack-app
          region: asia-southeast1
          source: .
          env_vars: |
            GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
```

### Firebase Setup

* Create Firebase project, enable **Firestore** and **Authentication** (anonymous or Google)
* Set Firestore rules to allow reads/writes for authenticated users
* Add Firebase config to `.env.local`
* Pre-create Firestore collections stub: `sessions`, `results` (generic names, rename after topic)

---

## 🚀 Phase 0 — Topic Drop Protocol (First 30 Minutes)

> This is the most critical window. Follow this sequence exactly.

```
Topic Released
     │
     ▼ (5 min)
[ALL] Silent Read + Individual Brain-dump
     │
     ▼ (10 min)
[Jeff leads] Structured Brainstorm (see framework below)
     │
     ▼ (10 min)
[Team] Vote → Lock 1 Idea
     │
     ▼ (5 min)
[Jeff + Hamse] Define AI's core role in the solution
[Chun Xin] Map backend data model
[Rose] Rough sketch of 2–3 key screens
     │
     ▼
EXECUTION BEGINS
```

### Brainstorm Framework (10-minute session)

Answer these 5 questions as a team. Write on whiteboard / shared doc.

1. **What is the real-world pain point?** (Who suffers, how often, how badly)
2. **Which UN SDG does this map to?** (Pick the most obvious one — SDG 3, 4, 8, 11, 13 are safe bets)
3. **What is the AI's job?** (Not "chatbot wrapper" — what does AI uniquely enable? prediction / classification / generation / analysis / personalization)
4. **What does the MVP demo look like?** (Can a judge use it in 2 minutes and understand the value?)
5. **What's the 10× version?** (For pitch narrative — show ambition, but build the MVP)

### Idea Scoring Matrix (30 seconds per idea)

| Criteria                      | Weight |
| ----------------------------- | ------ |
| Clear problem, real user      | 30%    |
| AI is genuinely indispensable | 30%    |
| Buildable MVP in 20 hours     | 25%    |
| SDG alignment is obvious      | 15%    |

Score each idea 1–5 on each criteria. Highest score wins.

---

## 🏗️ Phase 1 — Architecture Lock (Hour 1–2)

Once idea is locked:

### Jeff

* Define all frontend routes/pages needed
* Decide component hierarchy for core user flow
* Set up Zustand store shape (if state management needed)

### Hamse

* Write the core Gemini system prompt draft
* Define input/output schema for AI calls (what goes in, what structured JSON comes out)
* Test prompt in Google AI Studio immediately

### Chun Xin

* Finalize Firestore schema (collections, document fields)
* Set up Cloud Run service (deploy scaffold to verify pipeline works)
* Configure environment variables in GCP Secret Manager

### Rose

* Finalize 3–4 key screen wireframes (Figma or paper, max 30 min)
* Define color palette + typography (pick from Tailwind defaults, no custom fonts needed)
* Start Pitch Deck structure (Problem / Solution / Tech / Demo / SDG / Team)

---

## 💻 Phase 2 — Core Development (Hour 2–18)

### Time Blocks

| Time        | Focus                                                 |
| ----------- | ----------------------------------------------------- |
| Hour 2–8   | Core AI feature + primary user flow (MVP first)       |
| Hour 8–12  | Integration: frontend ↔ API ↔ Firebase              |
| Hour 12–16 | Polish UI, edge cases, loading states, error handling |
| Hour 16–18 | Demo flow rehearsal + Pitch Deck finalization         |
| Hour 18–20 | Buffer: bug fixes, final deployment, backup video     |

### Development Rules

* **Commit every 2 hours** to `main` — auto-deploys to Cloud Run
* Feature branches for anything risky: `git checkout -b feat/ai-analysis`
* Use `console.log` freely during dev, strip before demo
* Keep a `DEMO_SCRIPT.md` — the exact click path judges will see
* If a feature breaks and can't be fixed in 30 min: **cut it, don't chase it**

### AI Integration Pattern (Hamse + Chun Xin)

```typescript
// lib/gemini.ts pattern
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeWithGemini(input: string): Promise<YourOutputType> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: input }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.response.text()) as YourOutputType;
}
```

* Always request `responseMimeType: "application/json"` for structured outputs
* Always have a fallback mock response for demo safety
* Cache results in Firestore to avoid re-calling API on demo refresh

### Firebase Pattern (Chun Xin)

```typescript
// Typical save pattern
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveResult(data: ResultType) {
  return addDoc(collection(db, "results"), {
    ...data,
    createdAt: serverTimestamp()
  });
}
```

---

## 🧪 Phase 3 — Testing Protocol

### Functional Checklist (Hour 16)

* [ ] Happy path: full user flow works end-to-end
* [ ] AI call returns valid response and renders correctly
* [ ] Firebase read/write works (check Firestore console)
* [ ] App loads on mobile viewport (judges may use phone)
* [ ] Cloud Run deployment is live and accessible via URL
* [ ] Env vars are all set in Cloud Run (not just local)

### Demo Safety Measures

* Record a **backup demo video** (Loom or screen record) by Hour 17
* Pre-load a "golden" Firestore document with good AI output — use this if live AI call fails
* Test the demo URL on a different device/network (not localhost)
* Have a hotspot ready in case venue WiFi is bad

---

## 🎤 Phase 4 — Pitch Structure

**Total time: ~5 minutes**

| Section                                     | Duration | Owner          |
| ------------------------------------------- | -------- | -------------- |
| Hook — the problem in one sentence         | 20 sec   | Jeff           |
| SDG alignment — which goal, why it matters | 30 sec   | Jeff           |
| Solution overview                           | 45 sec   | Jeff           |
| Live Demo                                   | 2 min    | Jeff (driving) |
| Tech stack highlight — Gemini + GCP        | 30 sec   | Jeff or Hamse  |
| Impact + scale vision                       | 30 sec   | Jeff           |
| Call to action / close                      | 15 sec   | Jeff           |

### Pitch Deck Slide Outline (Rose builds)

1. Title slide — product name, tagline, team
2. Problem — 1 powerful stat or user story
3. SDG connection — which goal(s), visual
4. Solution — what it does in plain language
5. Demo screenshot / flow (judges who missed live demo)
6. Tech architecture — Gemini / Firebase / Cloud Run diagram
7. AI impact — what AI uniquely enables (not just "we use AI")
8. Market / scale potential — for Cradle Fund
9. Team slide
10. Thank you + QR code to live app

---

## 🌐 Deployment Reference

### Cloud Run Deploy Command (manual fallback)

```bash
gcloud run deploy myhack-app \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

### Next.js for Cloud Run

Add to `next.config.js`:

```js
module.exports = {
  output: 'standalone'
}
```

This is required — Cloud Run needs the standalone output.

---

## 📋 Role Quick-Reference Card

| Who      | Primary Focus                                     | Secondary                |
| -------- | ------------------------------------------------- | ------------------------ |
| Jeff     | Frontend UX, user flow, demo narrative, pitch     | Integration coordination |
| Chun Xin | Cloud Run, Firebase, API stability, Docker        | Environment & secrets    |
| Hamse    | Gemini prompts, AI output schema, reasoning logic | Backend AI endpoint      |
| Rose     | UI design, component styles, pitch deck visuals   | Architecture diagram     |

---

## ⚠️ Red Lines (Do Not Cross)

* No 3R content (Race, Religion, Royalty) — pick neutral universal topics
* No LGBTQ+ or politically sensitive content
* Core logic must be written during the hackathon — no full copy-paste solutions
* Physical attendance required for pitch — confirm travel to Sunway University

---

## 🔗 Key Links (fill in tonight)

* GitHub Repo: `https://github.com/[team]/myhack2026`
* Cloud Run URL: `https://myhack-app-[hash]-as.a.run.app`
* Firebase Console: `https://console.firebase.google.com/project/[project-id]`
* Google AI Studio: `https://aistudio.google.com`
* Pitch Deck (Figma/Canva): `[link]`
* Backup Demo Video: `[Loom link]`

---

*Last updated: May 15, 2026 — pre-hackathon scaffold prep night*
