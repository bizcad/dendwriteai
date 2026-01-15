# ActionableIdeas v2 - Convex + React Stack

> **Fresh Start**: Moving away from the Microsoft stack (Aspire, Blazor, SQL Server) to a **Convex + React** solution for faster MVP delivery and lower operational complexity.

---

## 📋 THOUGHT PROCESS & ANALYSIS

### Why the Microsoft Stack Failed
The previous approach with Aspire, Blazor, and SQL Server had these pain points:
1. **Setup Friction**: Aspire orchestration, health checks, service registration were complex
2. **Local Development Overhead**: Multiple projects, migrations, configuration
3. **Time Tax**: Spent hours debugging Aspire health checks instead of building features
4. **Overkill for MVP**: Too much infrastructure for a single capture form + classifier

### Why Convex + React
1. **Zero Infrastructure**: Convex handles database, real-time sync, auth, file storage—no DevOps needed
2. **Fast Iteration**: Write TypeScript functions, ship them instantly
3. **Built for Forms**: Convex's reactive hooks (`useQuery`, `useMutation`) are perfect for real-time form apps
4. **Cost-Effective**: Generous free tier; pay as you scale
5. **Pluggable LLM**: Easy to integrate Claude/OpenAI via Convex `actions`
6. **Proven Path**: Learning path provided; many "second brain" SaaS use this stack

### Key Insight from Nate Jones Transcript
> "For the first time in 2026, you don't have to be an engineer to build a second brain... systems that actively work against information... classify, route, or summarize without us having to remember to do any of those activities."

This means:
- **Fire-and-forget capture**: User types, form submits, AI processes in background
- **Automatic classification**: No manual tagging—AI decides bucket
- **Trust & transparency**: Audit trail shows confidence scores, easy to override

---

## 🎯 PLAN (Phase-Based)

### **Phase 0: Learning & Setup (Days 1–2)**
- [ ] Follow Convex fundamentals (queries, mutations, actions)
- [ ] Spin up a Convex project locally
- [ ] Integrate Next.js 15 frontend
- [ ] Test Convex ↔ Next.js sync with a simple counter

### **Phase 1: Core MVP (Days 3–5)**
**Goal**: Single capture form → AI classification → Inbox log

**Backend (Convex)**:
- [ ] Schema: `CaptureItem`, `People`, `Projects`, `Ideas`, `Admin`, `InboxLog`
- [ ] Mutation: `submitCapture()` (idempotent by `clientMessageId`)
- [ ] Action: `classifyCapture()` (integrates Claude/OpenAI via env vars)
- [ ] Mutation: `recordClassification()` (writes to appropriate table + audit log)
- [ ] Bouncer logic: Confidence threshold (≥0.6 → low confidence table, flag review)

**Frontend (React)**:
- [ ] One-question capture form: "What's your big idea?"
- [ ] Fire-and-forget POST (optimistic UI feedback)
- [ ] Receipt showing: idea text, classification, confidence, timestamp

### **Phase 2: UI Polish & Trust (Days 6–7)**
- [ ] Inbox page: View all captured items, confidence scores
- [ ] Manual override: Click to reclassify or move between buckets
- [ ] Audit trail: Show classification reasoning
- [ ] Delete/undo: Fix mistakes

### **Phase 3: Real-World Hardening (Days 8+)**
- [ ] Add unit tests (Convex functions)
- [ ] Error handling & retry logic (idempotent functions)
- [ ] Rate limiting on capture endpoint
- [ ] Analytics: Track classification accuracy, user behavior

---

## ✅ CHECKLIST

### **Setup & Environment**
- [ ] Create `/ActionableIdeas.Convex` folder
- [ ] `npm init -y && npm install convex`
- [ ] `npx convex init` (authenticate with Convex Cloud)
- [ ] Create `.env.local` with `OPENAI_API_KEY` (or Azure OpenAI credentials)

### **Convex Backend**
- [ ] Define schema in `convex/schema.ts`:
  - [ ] `captures` table (id, text, clientMessageId, createdAt, userId)
  - [ ] `people` table (name, description, sourceCapture)
  - [ ] `projects` table (name, description, sourceCapture)
  - [ ] `ideas` table (name, description, sourceCapture)
  - [ ] `admin` table (title, description, sourceCapture)
  - [ ] `lowConfidence` table (reason, originalClassification, flaggedAt, reviewedAt)
  - [ ] `inboxLog` table (captureId, classification, confidence, status, createdAt)

- [ ] Write Convex functions in `convex/`:
  - [ ] `captures.ts`:
    - [ ] `submitCapture`: Mutation (saves CaptureItem, triggers classification)
    - [ ] `getInboxLog`: Query (lists recent captures with classification status)
  - [ ] `classification.ts`:
    - [ ] `classifyCapture`: Action (calls Claude/OpenAI)
    - [ ] `recordClassification`: Mutation (saves result + audit log)
    - [ ] `updateClassification`: Mutation (manual override)

### **React Frontend**
- [ ] Create `/ActionableIdeas.Web.React` or `/web` folder
- [ ] Set up Next.js or plain React (choose based on team preference)
- [ ] Create pages:
  - [ ] `/capture`: One-question form
  - [ ] `/inbox`: View all captures + classifications
  - [ ] `/people`, `/projects`, `/ideas`, `/admin`: View organized items
- [ ] Integrate Convex client: `ConvexProvider`, `useQuery`, `useMutation`
- [ ] Implement capture form with optimistic UI

### **Testing & Validation**
- [ ] Unit tests for classification logic
- [ ] Manual test: Submit 5 ideas, verify classifications
- [ ] Manual test: Override a classification, verify audit log
- [ ] Load test: Submit 100 ideas, verify performance

### **Documentation**
- [ ] Update `QUICKSTART.md` with new Convex + React setup
- [ ] Write API reference for Convex functions
- [ ] Create data model diagram

---

## 🚀 NEXT STEPS (YOUR INPUT NEEDED)

Before I start implementing, **please clarify**:

1. **Frontend Framework Preference**: 
   - Option A: **Next.js 15** (full-stack, built-in API routes, SSR optional)
   - Option B: **React 19 + Vite** (SPA, simpler, faster dev)
   - Option C: **Plain React** (minimal, but more config)
   - *My recommendation: **Next.js** for fast deployment to Vercel + best DX*

2. **LLM Provider Preference**:
   - Option A: **OpenAI API** (ChatGPT, GPT-4, cheapest at scale)
   - Option B: **Anthropic Claude** (better reasoning, great for classification)
   - Option C: **Azure OpenAI** (if you have credits)
   - Option D: **Local LLM stub** (for testing, no API key)
   - *My recommendation: **Claude** (better classification reasoning, clear to use)*

3. **Classification Categories**:
   - Confirmed 4 from spec: **People**, **Projects**, **Ideas**, **Admin**
   - Any custom categories to add? (e.g., "Bugs", "Opportunities", "Learning")?

4. **User Authentication** (MVP):
   - Option A: **Anonymous** (no auth, single user for MVP)
   - Option B: **Clerk + Convex** (OAuth, multi-user ready)
   - Option C: **Simple email/password** (built-in Convex auth)
   - *My recommendation: **Anonymous for MVP**, add Clerk later when you want multi-user*

5. **Timeline Preference**:
   - Option A: **Bare bones in 2 days** (capture + classify only)
   - Option B: **Full MVP in 5 days** (+ inbox, overrides, audit)
   - Option C: **Production-ready in 1 week** (+ tests, error handling, deploy)

---

## 📁 Proposed Project Structure

```
ActionableIdeas/
├── web/                           # Next.js frontend
│   ├── app/
│   │   ├── capture/               # Capture page
│   │   ├── inbox/                 # Inbox page
│   │   └── [category]/            # People, Projects, Ideas, Admin pages
│   ├── components/
│   │   ├── CaptureForm.tsx
│   │   ├── InboxTable.tsx
│   │   └── ClassificationBadge.tsx
│   ├── lib/
│   │   └── convex-client.ts
│   └── package.json
├── convex/                        # Convex backend
│   ├── schema.ts
│   ├── captures.ts
│   ├── classification.ts
│   ├── lib/
│   │   └── llm-provider.ts        # LLM abstraction
│   └── convex.json
├── specs/
│   └── 002-create-or-update2/     # This spec
└── ActionableIdeas.slnx           # Keep old C# solution (archived)
```

---

## 📚 References & Resources

- **Convex Learning Path**: `./SuggestedConvexLearningPath.md`
- **Nate Jones Talk**: `./NateJonesTranscript.md` (philosophy behind second brain design)
- **Planning Notes**: `./Planning.md`
- **Archived (v1)**: `../001-create-or-update/` (Aspire/Blazor attempt—do not use)

---

## ✨ Why This Will Work

1. **Fast feedback loop**: Change TypeScript → deploy in seconds
2. **No DevOps**: Convex Cloud handles scaling, backups, real-time sync
3. **Built-in patterns**: Queries/mutations map perfectly to CRUD forms
4. **Proven for SaaS**: Companies like linear.app, mem.ai, usewish.io use this stack
5. **Cost-effective**: Free tier covers MVP + early users

---

**Status**: 🔴 **Ready for implementation** (awaiting your answers to clarification questions)
