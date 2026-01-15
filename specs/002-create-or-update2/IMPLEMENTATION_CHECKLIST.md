# ActionableIdeas v2 - Implementation Checklist

## 🎯 Overview
This checklist tracks the implementation of the Convex + React MVP.  
**Status**: Ready to begin (awaiting clarifications)  
**Target Duration**: 5–7 days for full MVP

---

## 📋 Phase 0: Setup & Learning (Est. 1–2 days)

- [ ] **0.1** Learn Convex fundamentals
  - [ ] Read: [Convex Database Basics](https://docs.convex.dev/database)
  - [ ] Read: [Queries & Mutations](https://docs.convex.dev/client/queries)
  - [ ] Skim: [Actions & Background Jobs](https://docs.convex.dev/functions/actions)
  
- [ ] **0.2** Create new Convex project
  - [ ] Run `npm init` in workspace root
  - [ ] Run `npm install convex convex-cli`
  - [ ] Run `npx convex init` (login to Convex Cloud)
  - [ ] Verify project created: `convex/convex.json`
  
- [ ] **0.3** Set up Next.js 15 frontend
  - [ ] Run `npm create next-app@latest web --typescript --tailwind --eslint --app`
  - [ ] Configure `next.config.ts` if needed
  - [ ] Install Convex client: `npm install convex`
  - [ ] Set up Convex provider in layout.tsx
  - [ ] Verify dev server runs: `cd web && npm run dev` → http://localhost:3000
  
- [ ] **0.4** Test Convex ↔ React integration
  - [ ] Create minimal schema (`convex/schema.ts`)
  - [ ] Create test mutation (`convex/test.ts`)
  - [ ] Build test component with `useMutation` hook
  - [ ] Verify round-trip: component → Convex → database → back to component

- [ ] **0.5** Configure environment variables
  - [ ] Create `.env.local` in project root
  - [ ] Add `CONVEX_DEPLOYMENT` (from `convex/convex.json`)
  - [ ] Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
  - [ ] Verify secrets accessible in Convex actions

---

## 🛠️ Phase 1: Core Backend (Est. 2–3 days)

### Schema & Data Modeling

- [ ] **1.1** Define Convex schema (`convex/schema.ts`)
  - [ ] `captures`: { id, text, clientMessageId, createdAt, userId?, status }
  - [ ] `people`: { id, name, description, confidence, sourceCapture, createdAt }
  - [ ] `projects`: { id, name, description, confidence, sourceCapture, createdAt }
  - [ ] `ideas`: { id, name, description, confidence, sourceCapture, createdAt }
  - [ ] `admin`: { id, title, description, confidence, sourceCapture, createdAt }
  - [ ] `lowConfidence`: { id, captureText, classificationAttempt, reason, flaggedAt, reviewedAt? }
  - [ ] `inboxLog`: { id, captureId, classification, confidence, status, createdAt, reasoning }
  - [ ] Test schema validation: `npx convex typecheck`

### Capture & Classification Mutations

- [ ] **1.2** Implement `captures.ts` (database writes)
  - [ ] Mutation: `submitCapture({ text, clientMessageId })`
    - [ ] Generate unique ID or use clientMessageId as key
    - [ ] Save to `captures` table with `status: "pending"`
    - [ ] Return capture ID + receipt
  - [ ] Query: `getCaptures()` (list all)
  - [ ] Query: `getCaptureById(id)` (fetch one)
  - [ ] Mutation: `deleteCapture(id)` (cleanup)

- [ ] **1.3** Implement `classification.ts` (LLM integration)
  - [ ] Create `llm-provider.ts` abstraction
    - [ ] Interface: `ILlmProvider.classify(text): { category, confidence, reasoning }`
    - [ ] Implement `ClaudeProvider` (or OpenAI)
    - [ ] Implement `StubProvider` (for testing)
  - [ ] Action: `classifyCapture(text)` (calls LLM)
    - [ ] Log classification attempt
    - [ ] Return: `{ category, confidence, reasoning }`
  - [ ] Mutation: `recordClassification(captureId, result)`
    - [ ] Apply bouncer logic: `if (confidence < 0.6) → lowConfidence table`
    - [ ] Else → route to appropriate category table
    - [ ] Write to `inboxLog` with confidence + reasoning
    - [ ] Update capture status: `"classified"`
  - [ ] Mutation: `updateClassification(captureId, newCategory)` (manual override)
    - [ ] Move item from old category → new category
    - [ ] Log override in `inboxLog`

### Background Processing (Optional for MVP)

- [ ] **1.4** Optional: Trigger classification on capture
  - [ ] Mutation `submitCapture` → enqueue classification action
  - [ ] Use Convex scheduled actions or immediate action call
  - [ ] Return "processing" status to UI

---

## 💻 Phase 2: Frontend (Est. 1–2 days)

### Capture Page

- [ ] **2.1** Create `/app/capture/page.tsx`
  - [ ] Component: `CaptureForm`
    - [ ] Single text input: "What's your big idea?"
    - [ ] Submit button
    - [ ] Error/loading states
  - [ ] Integrate `useMutation` for `submitCapture`
  - [ ] Show receipt after submission: text, classification, confidence, timestamp
  - [ ] Optimistic UI: disable input → show pending state → re-enable
  - [ ] Clear form after success

### Inbox Page

- [ ] **2.2** Create `/app/inbox/page.tsx`
  - [ ] Query: fetch all items from `inboxLog`
  - [ ] Display table: text | classification | confidence | status | actions
  - [ ] Add columns for: override, delete, view reasoning
  - [ ] Implement pagination (optional for MVP)

### Category Pages

- [ ] **2.3** Create `/app/[category]/page.tsx` (dynamic route)
  - [ ] Params: `people`, `projects`, `ideas`, `admin`
  - [ ] Query: fetch items from respective category table
  - [ ] Display list/grid view with name + description
  - [ ] Add link back to inbox

### Layout & Navigation

- [ ] **2.4** Set up root layout
  - [ ] Wrap app in `ConvexProvider`
  - [ ] Add navbar: Capture | Inbox | People | Projects | Ideas | Admin
  - [ ] Style with Tailwind (or preferred CSS)

### Styling

- [ ] **2.5** Apply Tailwind CSS
  - [ ] Color scheme (dark/light mode optional)
  - [ ] Responsive design for mobile + desktop
  - [ ] Input validation feedback

---

## 🧪 Phase 3: Testing & Hardening (Est. 1–2 days)

### Manual Testing

- [ ] **3.1** Smoke tests
  - [ ] Capture form submits without errors
  - [ ] Classification populates inbox within 5 seconds
  - [ ] Override changes category correctly
  - [ ] Delete removes from inbox
  - [ ] Navigate between pages works

- [ ] **3.2** Edge cases
  - [ ] Empty text submission (should fail)
  - [ ] Very long text (1000+ chars)
  - [ ] Rapid submissions (idempotency check)
  - [ ] No LLM API key (graceful fallback to stub)

### Unit Tests

- [ ] **3.3** Convex function tests
  - [ ] Test `submitCapture` idempotency (same clientMessageId)
  - [ ] Test `classifyCapture` with mock LLM
  - [ ] Test bouncer logic (confidence thresholds)
  - [ ] Use Convex testing utilities

### Error Handling & Logging

- [ ] **3.4** Add error boundaries
  - [ ] React Error Boundary for capture form
  - [ ] Fallback UI if LLM fails
  - [ ] Log errors to console/monitoring (optional)

### Rate Limiting (Optional)

- [ ] **3.5** Prevent abuse
  - [ ] Limit captures per user per hour (e.g., 100)
  - [ ] Add `lastCaptureTime` tracking if multi-user

---

## 📚 Phase 4: Documentation & Deployment (Est. 1 day)

### Documentation

- [ ] **4.1** Update project docs
  - [ ] Write `docs/QUICKSTART.md` (new Convex setup)
  - [ ] Write `docs/API_REFERENCE.md` (Convex functions)
  - [ ] Write `docs/DATA_MODEL.md` (schema diagram)
  - [ ] Add diagrams (data flow, architecture)

### Deployment

- [ ] **4.2** Deploy to production
  - [ ] Frontend: Deploy to Vercel (connect GitHub)
  - [ ] Backend: Convex Cloud (automatic with `npx convex deploy`)
  - [ ] Test live: submit a capture on deployed app
  - [ ] Monitor Convex dashboard for errors

### Analytics (Optional)

- [ ] **4.3** Add basic monitoring
  - [ ] Track classification success rate
  - [ ] Track user engagement (captures/day)
  - [ ] Log slow queries

---

## 🔄 Phase 5: Iterative Polish (Optional)

- [ ] **5.1** Based on user feedback
  - [ ] Add custom categories
  - [ ] Improve classification reasoning transparency
  - [ ] Add undo/restore deleted items
  - [ ] Bulk actions (multi-select delete, reclassify)

- [ ] **5.2** Advanced features
  - [ ] Daily/weekly digests (Phase 1.5)
  - [ ] Multi-user authentication (Clerk)
  - [ ] File attachments (Convex file storage)
  - [ ] Export to Notion/Obsidian (webhooks)

---

## 📊 Success Metrics

- [x] MVP launches in ≤1 week
- [ ] Capture form works reliably
- [ ] Classification accuracy ≥80% (subjective for early feedback)
- [ ] Page load time <2 seconds
- [ ] Zero unhandled errors in 24 hours of usage

---

## 🚨 Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM API rate limits | Classification hangs | Implement queue + retry logic |
| Schema changes mid-way | Data corruption | Version schema carefully, test migrations |
| Network latency (Convex ↔ UI) | Poor UX | Use optimistic updates, loading states |
| Inadequate error messages | Hard to debug | Log detailed errors, return user-friendly messages |

---

## 📝 Decision Log

Record decisions here as you implement:

- **Frontend Framework**: (Awaiting clarification)
- **LLM Provider**: (Awaiting clarification)
- **Categories**: People, Projects, Ideas, Admin (confirmed)
- **Authentication**: Anonymous for MVP (recommended)

---

**Last Updated**: 2026-01-14  
**Next Milestone**: Clarifications received → Phase 0 begins
