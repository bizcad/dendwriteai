# Architecture: Multi-Tenant DendwriteAI

## User Registration Flow

```
┌─────────────┐
│  Browser    │
│  /signup    │
└──────┬──────┘
       │ Enter: name, email, password
       │
       ▼
┌──────────────────────┐
│  Sign Up Page        │
│ - Validate fields    │
│ - Bcrypt hash pwd    │
└──────┬───────────────┘
       │ POST /api/auth/register
       │ {email, name, passwordHash}
       │
       ▼
┌──────────────────────┐
│  Next.js API Route   │
│  /api/auth/register  │
└──────┬───────────────┘
       │ Call Convex mutation
       │
       ▼
┌──────────────────────┐
│  Convex Cloud        │
│  auth.register()     │
│ - Create tenantId    │
│ - Insert user        │
└──────┬───────────────┘
       │ Return {userId, tenantId, email, name}
       │
       ▼
┌──────────────────────┐
│  Browser             │
│  Auto-signin         │
│  NextAuth.js         │
│  Create session      │
└──────┬───────────────┘
       │ Redirect /
       │
       ▼
┌──────────────────────┐
│  Home Page (/)       │
│  User authenticated  │
└──────────────────────┘
```

## Authentication Flow

```
┌─────────────┐
│  Browser    │
│  /signin    │
└──────┬──────┘
       │ Enter: email, password
       │
       ▼
┌──────────────────────┐
│  Sign In Page        │
│  (NextAuth form)     │
└──────┬───────────────┘
       │ POST /api/auth/callback/credentials
       │ {email, password}
       │
       ▼
┌──────────────────────┐
│  NextAuth.js         │
│  Credentials Provider│
│  - authorize()       │
└──────┬───────────────┘
       │ Call /api/auth/user?email
       │
       ▼
┌──────────────────────┐
│  Next.js API Route   │
│  /api/auth/user      │
└──────┬───────────────┘
       │ Call Convex query
       │
       ▼
┌──────────────────────┐
│  Convex Cloud        │
│  getUserByEmail()    │
│  Return user + hash  │
└──────┬───────────────┘
       │ Return to authorize()
       │
       ▼
┌──────────────────────┐
│  NextAuth.js         │
│  Verify bcrypt hash  │
│  Match? Yes → token  │
└──────┬───────────────┘
       │ Store JWT in cookie
       │
       ▼
┌──────────────────────┐
│  Browser             │
│  Session created     │
│  Redirect /          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Home Page           │
│  useSession()        │
│  Get user.tenantId   │
└──────────────────────┘
```

## Data Isolation (Tenant Boundary)

```
┌──────────────────────────────────────────────────────────┐
│              Convex Cloud (Shared)                       │
│                                                          │
│  ┌──────────────────┐          ┌──────────────────┐    │
│  │  User: alice     │          │  User: bob       │    │
│  │  tenantId: t123  │          │  tenantId: t456  │    │
│  └────────┬─────────┘          └────────┬─────────┘    │
│           │                             │               │
│           │ Tenant ID Filter            │ Tenant ID     │
│           │ =====================>      │ Filter        │
│           │                             │ =====>        │
│           │                             │               │
│  ┌────────▼────────────┐      ┌────────▼────────────┐  │
│  │  Captures (t123)    │      │  Captures (t456)    │  │
│  │ ├─ "Big idea #1"    │      │ ├─ "Different idea" │  │
│  │ ├─ "Big idea #2"    │      │ └─ (bob's data)     │  │
│  │ └─ (alice's data)   │      │                     │  │
│  └─────────────────────┘      └─────────────────────┘  │
│           │                             │               │
│  ┌────────▼────────────┐      ┌────────▼────────────┐  │
│  │  People (t123)      │      │  People (t456)      │  │
│  │  ├─ Person A        │      │  ├─ Person C        │  │
│  │  └─ Person B        │      │  └─ (bob's data)    │  │
│  └─────────────────────┘      └─────────────────────┘  │
│           │                             │               │
│  ┌────────▼────────────┐      ┌────────▼────────────┐  │
│  │  Projects (t123)    │      │  Projects (t456)    │  │
│  │  ├─ Project 1       │      │  ├─ Project X       │  │
│  │  └─ (alice's data)  │      │  └─ (bob's data)    │  │
│  └─────────────────────┘      └─────────────────────┘  │
│                                                          │
│  Each user's data is filtered by tenantId at DB level   │
│  ✅ No cross-tenant access possible                      │
│  ✅ Enforced in all queries/mutations                    │
└──────────────────────────────────────────────────────────┘
```

## Capture Processing with Multi-Tenant

```
┌─────────────────────────┐
│  User (Tenant A)        │
│  Submits: "Big idea"    │
└────────┬────────────────┘
         │ POST (text, userId, tenantId)
         │
         ▼
┌─────────────────────────┐
│  API: /captures/submit  │
└────────┬────────────────┘
         │ Call Convex mutation
         │
         ▼
┌─────────────────────────────────────┐
│  Convex: submitCapture()            │
│  Insert captures table:             │
│ {                                   │
│   text: "Big idea",                 │
│   userId: "user_a",                 │
│   tenantId: "tenant_a",  ◄──────┐   │
│   status: "pending",              │   │
│   createdAt: timestamp            │   │
│ }                                   │   │
└────────┬────────────────────────────┘   │
         │                                │
         │ Return success                 │ Tenant isolation
         ▼                                │ enforced here
┌─────────────────────────┐              │
│  Home Page              │              │
│  Shows pending capture  │◄─────────────┘
│  (only user's data)     │
└─────────────────────────┘
         │
         │ User clicks "Classify All"
         │
         ▼
┌──────────────────────────────────┐
│  API: /process/classifyAll       │
│  Mutation params:                │
│  - tenantId: "tenant_a"          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Convex: classifyAllPending()            │
│  Query: captures where status = pending  │
│         AND tenantId = "tenant_a"        │◄─ FILTERED
│  Result: Only user's pending captures    │
│                                          │
│  Process each:                           │
│  1. Call Claude API                      │
│  2. Insert to inboxLog (tenantId set)    │
│  3. Insert to category table (tenantId)  │
│  4. Update capture (status: classified)  │
└──────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Success                │
│  Home page updates      │
│  (data is user's only)  │
└─────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Authentication (Browser → Server)             │
│  ├─ Email/password login via NextAuth.js               │
│  ├─ Bcrypt password verification (10 salt rounds)      │
│  ├─ Session JWT in secure cookie                       │
│  └─ Auto-logout on sign-out                            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Route Protection (Next.js)                    │
│  ├─ Home page checks useSession()                      │
│  ├─ Unauthenticated → redirect to /signin              │
│  ├─ Protected API routes check session                 │
│  └─ 401/403 on missing auth                            │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Tenant Isolation (Convex)                     │
│  ├─ All queries filtered by tenantId                   │
│  ├─ All mutations require tenantId                     │
│  ├─ Database enforces via indexes                      │
│  └─ No cross-tenant data possible                      │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Owner Verification (API)                      │
│  ├─ API routes verify user owns tenantId               │
│  ├─ userId checked against request                     │
│  └─ Cross-tenant requests rejected                     │
└─────────────────────────────────────────────────────────┘
```

## Database Schema (Simplified)

```
users table:
  _id (PK)
  email (UNIQUE, INDEX)
  name
  passwordHash (bcrypt)
  tenantId (INDEX) ◄─── Creates tenant automatically
  createdAt

captures table:
  _id (PK)
  text
  clientMessageId
  status (pending|classified|error)
  userId (FK: users) ◄─ Owner reference
  tenantId (INDEX) ◄─ Tenant filter
  createdAt
  Indexes: by_tenantId, by_tenantId_status

people, projects, ideas, admin tables:
  _id (PK)
  name
  description
  confidence
  sourceCapture (FK: captures)
  tenantId (INDEX) ◄─ Tenant isolation
  extractedAt
  Indexes: by_tenantId, by_sourceCapture

lowConfidence table:
  _id (PK)
  captureText
  classificationAttempt
  confidence
  reason
  tenantId (INDEX) ◄─ Tenant isolation
  flaggedAt
  Indexes: by_tenantId, by_flaggedAt

inboxLog table:
  _id (PK)
  captureId (FK)
  classification
  confidence
  reasoning
  status (success|error|overridden)
  tenantId (INDEX) ◄─ Tenant isolation
  createdAt
  Indexes: by_tenantId, by_captureId
```

---

**Key Principle**: Every table has a `tenantId` field that's used in WHERE clauses. This ensures complete data isolation at the database level.
