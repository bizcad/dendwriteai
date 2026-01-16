# DendwriteAI

Capture, classify, and organize your ideas with AI.

## Current Status (2026-01-15)

✅ **Core Features Working**

- NextAuth.js v4 with 30-day persistent sessions
- User authentication (sign up/sign in)
- Capture submission with auto-user creation
- Multi-tenant architecture ready
- Convex backend (http://127.0.0.1:3210)
- Next.js frontend (http://localhost:3000)
- Tailwind CSS configured

📋 **Documentation & Deployment**

- Spec Phase 2: Auth implementation complete ([specs/002-create-or-update2](specs/002-create-or-update2))
- Spec Phase 3: Auth docs ([specs/003-add-auth-feature/docs](specs/003-add-auth-feature/docs))
- Spec Phase 4: Alpha testing guide ([specs/004-Alpha-testing-and-deployment](specs/004-Alpha-testing-and-deployment))

---

## Stack

- **Frontend**: Next.js 16.1.2 + TypeScript + Tailwind CSS v4
- **Backend**: Convex (serverless database + functions)
- **LLM**: Claude (Anthropic) - integrated for classification
- **Auth**: NextAuth.js v4 + Credentials provider (multi-tenant)
- **Database**: Convex (multi-table schema with indexes)
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Project Structure

```
dendwriteai/
├── web/                          # Next.js 16 frontend
│   ├── app/
│   │   ├── api/                 # API routes (capture, auth)
│   │   ├── auth/                # Auth pages (signin, signup)
│   │   ├── components/          # React components (CaptureForm, etc)
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Home page (protected)
│   ├── auth.ts                  # NextAuth configuration
│   ├── tailwind.config.ts       # Tailwind configuration
│   ├── public/                  # Static assets
│   └── package.json
├── convex/                       # Convex backend (TypeScript)
│   ├── schema.ts                # Multi-tenant database schema
│   ├── captures.ts              # Capture mutations/queries
│   ├── classification.ts        # AI classification with Claude
│   ├── process.ts               # Process workflow
│   ├── llm_provider.ts          # LLM integration
│   ├── convex.config.js         # Convex configuration
│   └── _generated/              # Auto-generated types & API
├── specs/
│   ├── 002-create-or-update2/   # Auth implementation spec
│   ├── 003-add-auth-feature/    # Auth documentation
│   └── 004-Alpha-testing-and-deployment/ # Testing guide
├── scripts/                     # Utility scripts
├── QUICK_REFERENCE.md           # Development quick start
├── README.md                    # This file
├── .env.local                   # Local environment variables
└── package.json                 # Root dependencies
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Convex CLI (installed via npm)

### Quick Start

**Using aliases (in VS Code terminal):**

```powershell
# Terminal 1
convex-dev

# Terminal 2 (new terminal)
web-dev
```

**Manual startup:**

```bash
# Terminal 1: Start Convex backend
cd g:\repos\dendwriteai
npx convex dev

# Terminal 2: Start Next.js
cd g:\repos\dendwriteai\web
npm run dev
```

3. **Open browser**: http://localhost:3000

### What Works Now

- ✅ Next.js 16 + Convex integration with hot reload
- ✅ User authentication (sign up/sign in with credentials)
- ✅ Auto-user creation on first capture
- ✅ Persistent login (30-day sessions with secure cookies)
- ✅ Multi-tenant support (each user gets their own tenant)
- ✅ Capture form with real-time Convex sync
- ✅ Display pending captures in "Recent Ideas"
- ✅ Database schema with 8 tables (captures, users, people, projects, ideas, admin, lowConfidence, inboxLog)
- ✅ Claude API integration for classification
- ✅ Confidence-based routing (0.6 threshold)
- ✅ Low-confidence flagging and review table
- ✅ Tailwind CSS v4 styling
- ✅ NextAuth.js v4 with HttpOnly cookies + JWT

### Project Phases

**Phase 0 ✅ - Setup & Learning**

- Convex initialized with schema
- Next.js 16 frontend created
- Basic capture form working

**Phase 1 ✅ - LLM Integration**

- Claude API integrated for classification
- Classification logic implemented
- Low-confidence flagging system

**Phase 2 ✅ - Authentication**

- NextAuth.js v4 configured
- Sign up/sign in pages
- Persistent login with cookies
- Multi-tenant user support
- Auto-user creation on capture

**Phase 3 - Upcoming (Category Views)**

- [ ] Inbox view (classified captures)
- [ ] People view (extracted entities)
- [ ] Projects view (extracted initiatives)
- [ ] Ideas view (extracted concepts)
- [ ] Manual override UI for low-confidence items
- [ ] GitHub/OAuth authentication

**Phase 4 - Deployment**

- [ ] Production deployment to Vercel + Convex Cloud
- [ ] Alpha testing setup
- [ ] Performance optimization

## Environment Variables

### Root (.env.local)

```
CONVEX_DEPLOYMENT=<auto-generated by convex dev>
CONVEX_URL=http://127.0.0.1:3210
```

### Web (.env.local)

```
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
CONVEX_URL=http://127.0.0.1:3210
NEXTAUTH_SECRET=<generated during setup>
NEXTAUTH_URL=http://localhost:3000
```

### Convex Dashboard Secrets

- `ANTHROPIC_API_KEY`: Claude API key (required for classification)
- `OPENAI_API_KEY`: OpenAI API key (if switching providers)

## Resources

- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Anthropic Claude](https://console.anthropic.com)

## Quick Links

- [Quick Reference](QUICK_REFERENCE.md) - Development commands and aliases
- [Auth Implementation](specs/003-add-auth-feature/docs) - Complete auth documentation
- [Alpha Testing Guide](specs/004-Alpha-testing-and-deployment/ALPHA_TESTER_GUIDE.md) - For testers
- [Spec 002: Auth Details](specs/002-create-or-update2/docs) - Technical documentation
