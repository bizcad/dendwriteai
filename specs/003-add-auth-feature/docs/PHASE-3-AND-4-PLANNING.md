# Phase 3 & 4 Planning - Responsive UI & Classification

## Overview

This document outlines the remaining work needed before handing off to another developer:

1. **Phase 3**: Responsive UI with mobile support
2. **Phase 3 (continued)**: Classification integration
3. **Phase 4**: Handoff preparation

---

## Phase 3A: Responsive UI Design

### Current State

- Desktop layout working well in development and production
- Mobile/tablet sizes not tested yet
- No @media queries implemented

### Goals

- [ ] Application usable on all device sizes
- [ ] Touch-friendly interface (larger buttons, appropriate spacing)
- [ ] Optimal layout for: phone (375px), tablet (720px), laptop (1080px), desktop (1440px+)

### Breakpoints to Implement

```css
/* Mobile - phones (375px - 600px) */
@media (max-width: 600px) {
  /* Stack layout vertically */
  /* Increase button/input sizes for touch */
  /* Reduce font sizes appropriately */
}

/* Tablet - small tablets (600px - 1024px) */
@media (min-width: 601px) and (max-width: 1023px) {
  /* Two-column layout option */
  /* Balanced spacing */
}

/* Laptop - standard screens (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  /* Current desktop layout */
}

/* Large desktop (1440px+) */
@media (min-width: 1440px) {
  /* Max-width containers */
  /* Larger typography for readability */
}
```

### Components Needing Responsive Updates

#### 1. **CaptureForm.tsx**

- [ ] Form inputs responsive width
- [ ] Label positioning for mobile (stack vs. side-by-side)
- [ ] Submit button full-width on mobile, auto on desktop
- [ ] Input padding increased for touch on mobile
- [ ] Font sizes reduced for mobile

#### 2. **Authentication Pages** (`signin/page.tsx`, `signup/page.tsx`)

- [ ] Form card max-width: 400px on desktop, 100% on mobile (with padding)
- [ ] Typography scaling
- [ ] Link/button sizing for touch targets (min 44px)

#### 3. **Layout** (`layout.tsx`)

- [ ] Navigation responsive (hamburger menu on mobile)
- [ ] Header/footer sizing
- [ ] Main content padding/margin appropriate for screen size
- [ ] Safe areas for notched phones (padding-safe)

#### 4. **Recent Ideas Section**

- [ ] List items: full-width on mobile, card-based on desktop
- [ ] Table → card layout transformation on small screens
- [ ] Status badges visible but appropriately sized

### Responsive Design Checklist

- [ ] Test on Chrome DevTools device emulation
  - [ ] iPhone 12 (390px)
  - [ ] iPad (768px)
  - [ ] MacBook (1440px)
  - [ ] Pixel 6 (412px)

- [ ] Test in actual browsers
  - [ ] Safari on iPhone
  - [ ] Chrome on Android
  - [ ] Firefox on desktop
  - [ ] Edge on desktop

- [ ] Verify touch interactions
  - [ ] Buttons are minimum 44x44px
  - [ ] Inputs are touch-friendly
  - [ ] No hover-only interactions
  - [ ] Proper spacing between tap targets

- [ ] Performance on mobile
  - [ ] Page load < 3s on 4G
  - [ ] No layout shift (CLS < 0.1)
  - [ ] Images optimized for mobile

### Tailwind CSS Approach

Using Tailwind's responsive prefixes:

```tsx
// Example from CaptureForm
<input
  className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 text-sm md:text-base"
/>

<button
  className="w-full md:w-auto px-4 py-2 md:py-3 text-sm md:text-base"
/>
```

**Tailwind Breakpoints:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Phase 3B: Classification Integration

### Current State

- Claude API integration exists in Convex (`convex/llm_provider.ts`)
- Classification logic exists (`convex/process.ts`)
- **Blocked**: Missing ANTHROPIC_API_KEY environment variable in production

### Goals

- [ ] Classify submitted captures automatically
- [ ] Route to category tables (people, projects, ideas, admin)
- [ ] Flag low-confidence items for review
- [ ] Display classification results in UI

### Implementation Steps

#### Step 1: Set Up Anthropic API Key

**In Development:**

```bash
# .env.local in root
ANTHROPIC_API_KEY=sk-ant-v0-...your-key-here...
```

**In Production (Convex Cloud):**

1. Go to https://console.anthropic.com
2. Generate API key
3. Convex Dashboard → your project → Settings → Environment Variables
4. Add: `ANTHROPIC_API_KEY` = `sk-ant-v0-...`

#### Step 2: Trigger Classification

**Option A: Manual "Classify All" Button**

- Add button to UI
- Calls mutation: `convex.process.classifyAllPending()`
- Shows loading state during processing
- Displays results after completion

**Option B: Automatic Classification**

- Classify immediately after capture submission
- Add to capture flow: `submitCapture()` → `classifyCapture()`
- Show classification result to user

**Recommended**: Start with Option A (manual), then add Option B later

#### Step 3: Update UI to Show Classification Results

**Components to Create/Update:**

1. **ClassificationButton.tsx**

```tsx
// Manual "Classify All" button
const handleClassify = async () => {
  setLoading(true);
  try {
    const result = await convex.mutation(api.process.classifyAllPending);
    setResults(result);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

2. **ClassificationResults.tsx**

```tsx
// Show classified captures by category
// Display: category name, confidence, description
// Option to review low-confidence items
```

3. **Update CaptureItem** to show classification status

```tsx
// Change status from "Pending" → "People", "Projects", "Ideas", etc.
// Show confidence score as badge
```

#### Step 4: Build Category View Pages

After classification is working:

- [ ] `/inbox` - All classified captures
- [ ] `/people` - Extracted people/entities
- [ ] `/projects` - Project ideas
- [ ] `/ideas` - General notes
- [ ] `/admin` - Administrative tasks

### Environment Variables for Classification

**Development:**

```
ANTHROPIC_API_KEY=<dev-key>
```

**Production (Convex Secrets):**

```
ANTHROPIC_API_KEY=<prod-key>
```

**Never in frontend code** - Always in Convex secrets

### Classification Flow

```
User Submits Capture
        ↓
Store in "captures" table (status: pending)
        ↓
[Manual] User clicks "Classify All"
        ↓
Convex calls Claude API
        ↓
Claude analyzes and returns classification + confidence
        ↓
Route to appropriate table:
├─ If confidence >= 0.6 → category table (people/projects/ideas/admin)
└─ If confidence < 0.6 → lowConfidence table (for manual review)
        ↓
Update capture status (pending → classified)
        ↓
Real-time update in UI
        ↓
Display classification with reasoning
```

### Testing Classification

```bash
# In local development:
1. npm run dev (Next.js + Convex)
2. Submit several captures
3. Click "Classify All" button
4. Check:
   - Convex logs show Claude API calls
   - Categories populated with classified items
   - Low-confidence items in review table
   - No errors in browser console
```

---

## Phase 4: Handoff Preparation

### Goals

- [ ] Repository ready for another developer to take over
- [ ] All features documented
- [ ] Deployment process documented
- [ ] No tribal knowledge needed
- [ ] Easy to extend

### Handoff Checklist

#### Documentation

- [ ] PHASE-2-COMPLETE.md - Authentication work
- [ ] PHASE-3-COMPLETE.md - Responsive UI + Classification (to be created)
- [ ] PRE-DEPLOYMENT-CHECKLIST.md - Pre-deployment steps
- [ ] PRODUCTION_DEPLOYMENT.md - Step-by-step deployment
- [ ] ALPHA_TESTER_GUIDE.md - Testing instructions
- [ ] Architecture diagrams in specs/
- [ ] API documentation (Convex mutations/queries)
- [ ] Component documentation (props, usage)

#### Code Quality

- [ ] All TypeScript files pass `npm run lint`
- [ ] No console.log statements (use proper logging)
- [ ] Error handling consistent across components
- [ ] Comments for complex logic
- [ ] No hard-coded values (use env variables)

#### Development Experience

- [ ] QUICK_REFERENCE.md accurate and complete
- [ ] WORKSPACE_SETUP.md current
- [ ] .gitignore complete
- [ ] Dependencies documented
- [ ] Package versions locked

#### Production Readiness

- [ ] Monitoring configured
- [ ] Error tracking in place
- [ ] Performance benchmarks documented
- [ ] Security audit completed
- [ ] Backup/recovery procedures documented

#### Knowledge Transfer

- [ ] Architecture decisions documented
- [ ] Why certain tools were chosen (Next.js, Convex, etc.)
- [ ] Known limitations or tech debt
- [ ] Future roadmap (Phase 5 features)
- [ ] Support procedures documented

### Future Phases (Beyond Handoff)

#### Phase 5: Customer Private Instances

- [ ] Docker containerization
- [ ] Helm charts for Kubernetes
- [ ] Installation documentation
- [ ] Self-hosted deployment guide
- [ ] Data privacy/encryption options
- [ ] Multi-organization support

#### Phase 6: Advanced Features

- [ ] GitHub OAuth integration
- [ ] Advanced search/filtering
- [ ] Export to PDF/CSV
- [ ] Bulk import/export
- [ ] Custom categories
- [ ] Webhooks for integrations

---

## Timeline Estimate

- **Phase 3A (Responsive UI)**: 3-5 days
- **Phase 3B (Classification)**: 2-3 days
- **Phase 4 (Handoff)**: 2-3 days
- **Total**: 1-2 weeks

---

## Resources

### Responsive Design

- Tailwind CSS Responsive: https://tailwindcss.com/docs/responsive-design
- Mobile-First Approach: https://www.nngroup.com/articles/mobile-first-design/
- Touch Targets: https://www.nngroup.com/articles/touch-target-size/

### Anthropic Claude API

- Documentation: https://docs.anthropic.com
- API Reference: https://docs.anthropic.com/en/api
- Prompt Engineering: https://docs.anthropic.com/en/docs/build-a-bot

### Next.js Mobile Optimization

- Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Responsive Design: https://nextjs.org/docs/app/building-your-application/styling

---

**Next Developer**: Review this document, PHASE-2-COMPLETE.md, and PRE-DEPLOYMENT-CHECKLIST.md before starting Phase 3 work.

Current Status: Phase 2 (Auth) Complete ✅, Ready for Phase 3
