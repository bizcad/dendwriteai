# Convex + React Architecture Deep Dive

## 🏗️ System Architecture

### High-Level Data Flow

```
┌─────────────────────────────┐
│      User Types Idea        │
│  "I want to build an AI     │
│   second brain for notes"   │
└──────────────┬──────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   React Form         │
    │  (CaptureForm.tsx)   │
    │  - One text input    │
    │  - Fire-and-forget   │
    │    POST              │
    └──────────┬───────────┘
               │
               │ useMutation(submitCapture)
               ▼
    ┌──────────────────────────────┐
    │   Convex Mutation            │
    │   submitCapture()            │
    │  - Generate clientMessageId  │
    │  - Save to captures table    │
    │  - Return receipt            │
    │  - Mark status: "pending"    │
    └──────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Convex Action (async)       │
    │  classifyCapture()           │
    │  - Call Claude/OpenAI API    │
    │  - Parse response            │
    │  - Return {category,         │
    │    confidence, reasoning}    │
    └──────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Convex Mutation              │
    │ recordClassification()       │
    │ - Check confidence >= 0.6    │
    │   YES → Route to category    │
    │   NO → Flag as lowConfidence │
    │ - Write audit log            │
    │ - Update capture status      │
    └──────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Convex Database             │
    │  - people, projects,         │
    │    ideas, admin              │
    │  - lowConfidence             │
    │  - inboxLog (audit trail)    │
    └──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  React UI Updated            │
    │  - Show receipt              │
    │  - Display classification    │
    │  - Show confidence badge     │
    │  - Link to inbox             │
    └──────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tables & Relationships

```typescript
// === CAPTURES (Input Log) ===
captures: {
  _id: Id<"captures">,
  text: string,                     // "I want to build a second brain"
  clientMessageId: string,          // UUID for idempotency
  status: "pending" | "classified" | "error",
  createdAt: number,
  userId?: string,                  // Future: for multi-user
}

// === CLASSIFIED ITEMS ===
people: {
  _id: Id<"people">,
  name: string,
  description: string,
  confidence: number,               // 0.0–1.0
  sourceCapture: Id<"captures">,    // Back-ref to original capture
  extractedAt: number,
}

projects: { name, description, confidence, sourceCapture, extractedAt }
ideas: { name, description, confidence, sourceCapture, extractedAt }
admin: { title, description, confidence, sourceCapture, extractedAt }

// === BOUNCER / NEEDS REVIEW ===
lowConfidence: {
  _id: Id<"lowConfidence">,
  captureText: string,
  classificationAttempt: string,    // "idea" (what we THOUGHT it was)
  confidence: number,               // e.g., 0.45
  reason: string,                   // e.g., "ambiguous: could be idea or project"
  flaggedAt: number,
  reviewedAt?: number,              // When user manually classified it
  manualCategory?: string,          // What user chose
}

// === AUDIT TRAIL / INBOX LOG ===
inboxLog: {
  _id: Id<"inboxLog">,
  captureId: Id<"captures">,
  classification: string,           // "people" | "projects" | "ideas" | "admin" | "needs_review"
  confidence: number,
  reasoning: string,                // "Mentions 'John Smith' and 'CTO', so classified as person"
  status: "success" | "error" | "overridden",
  createdAt: number,
  overriddenBy?: {                  // If user manually reclassified
    newCategory: string,
    timestamp: number,
    reason?: string,
  },
}
```

### Indexes (Performance)

```typescript
// Query by capture status (to find pending items)
captures.status

// Query recent inbox entries (dashboard)
inboxLog.createdAt (descending)

// Query items in each category
people, projects, ideas, admin: no special index needed (small dataset)

// Query items flagged for review
lowConfidence.flaggedAt
```

---

## 🔌 Convex Functions

### Queries (Read-Only)

```typescript
// convex/captures.ts
export const getCaptures = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("captures").collect();
  },
});

export const getCaptureById = query({
  args: { id: v.id("captures") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// convex/inbox.ts
export const getInboxLog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("inboxLog")
      .order("desc")
      .take(limit);
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query(category as "people" | "projects" | "ideas" | "admin")
      .collect();
  },
});

export const getLowConfidenceItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("lowConfidence")
      .filter((q) => q.eq(q.field("reviewedAt"), undefined))
      .collect();
  },
});
```

### Mutations (Write)

```typescript
// convex/captures.ts
export const submitCapture = mutation({
  args: { text: v.string(), clientMessageId: v.string() },
  handler: async (ctx, { text, clientMessageId }) => {
    // Idempotency: check if already processed
    const existing = await ctx.db
      .query("captures")
      .filter((q) => q.eq(q.field("clientMessageId"), clientMessageId))
      .first();
    
    if (existing) {
      return existing; // Return existing record
    }
    
    // Save new capture
    const captureId = await ctx.db.insert("captures", {
      text,
      clientMessageId,
      status: "pending",
      createdAt: Date.now(),
    });
    
    // Trigger classification (fire background action)
    await ctx.scheduler.runAfter(0, internal.classification.classifyCapture, {
      captureId,
      text,
    });
    
    return { id: captureId, status: "pending", text };
  },
});

// convex/classification.ts
export const recordClassification = mutation({
  args: {
    captureId: v.id("captures"),
    category: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
  },
  handler: async (ctx, { captureId, category, confidence, reasoning }) => {
    const CONFIDENCE_THRESHOLD = 0.6;
    
    if (confidence < CONFIDENCE_THRESHOLD) {
      // Route to review queue
      await ctx.db.insert("lowConfidence", {
        captureText: (await ctx.db.get(captureId))?.text,
        classificationAttempt: category,
        confidence,
        reason: reasoning,
        flaggedAt: Date.now(),
      });
      
      // Log in audit trail
      await ctx.db.insert("inboxLog", {
        captureId,
        classification: "needs_review",
        confidence,
        reasoning,
        status: "success",
        createdAt: Date.now(),
      });
    } else {
      // Route to appropriate category table
      await ctx.db.insert(category, {
        name: extractName(text),        // Use LLM reasoning to extract
        description: extractDescription(text),
        confidence,
        sourceCapture: captureId,
        extractedAt: Date.now(),
      });
      
      // Log in audit trail
      await ctx.db.insert("inboxLog", {
        captureId,
        classification: category,
        confidence,
        reasoning,
        status: "success",
        createdAt: Date.now(),
      });
    }
    
    // Mark capture as classified
    await ctx.db.patch(captureId, { status: "classified" });
  },
});

export const updateClassification = mutation({
  args: {
    captureId: v.id("captures"),
    newCategory: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { captureId, newCategory, reason }) => {
    const originalLog = await ctx.db
      .query("inboxLog")
      .filter((q) => q.eq(q.field("captureId"), captureId))
      .first();
    
    // Append override to log
    await ctx.db.insert("inboxLog", {
      captureId,
      classification: newCategory,
      confidence: 1.0,  // User override = high confidence
      reasoning: `User override: ${reason || "no reason provided"}`,
      status: "overridden",
      createdAt: Date.now(),
      overriddenBy: {
        newCategory,
        timestamp: Date.now(),
        reason,
      },
    });
  },
});
```

### Actions (Long-Running, LLM Calls)

```typescript
// convex/classification.ts
export const classifyCapture = action({
  args: { captureId: v.id("captures"), text: v.string() },
  handler: async (ctx, { captureId, text }) => {
    try {
      const llm = new ClaudeProvider(process.env.ANTHROPIC_API_KEY);
      
      const result = await llm.classify(text);
      // Returns: { category: "ideas", confidence: 0.89, reasoning: "..." }
      
      // Save result back to database
      await ctx.runMutation(internal.classification.recordClassification, {
        captureId,
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning,
      });
      
      return { success: true, ...result };
    } catch (error) {
      // Handle LLM errors gracefully
      await ctx.runMutation(internal.captures.updateStatus, {
        captureId,
        status: "error",
        error: error.message,
      });
      throw error;
    }
  },
});
```

---

## 🎨 React Component Structure

### Main Flow

```
App (Root Layout)
├── ConvexProvider (wrap in middleware)
├── Navbar (nav links)
├── Routes
│   ├── /capture
│   │   └── CaptureForm
│   │       ├── TextInput
│   │       ├── SubmitButton
│   │       └── ReceiptDisplay (after success)
│   ├── /inbox
│   │   └── InboxTable
│   │       ├── useSuspenseQuery("getInboxLog")
│   │       ├── InboxRow (for each item)
│   │       │   ├── Text
│   │       │   ├── ClassificationBadge
│   │       │   ├── ConfidenceBar
│   │       │   └── ActionsMenu (override, delete)
│   │       └── Pagination (optional)
│   ├── /[category]
│   │   └── CategoryPage
│   │       ├── useQuery(`getByCategory`)
│   │       └── ItemCard[] (grid/list view)
│   └── /low-confidence
│       └── ReviewPage
│           ├── useSuspenseQuery("getLowConfidenceItems")
│           └── ManualClassifyForm
└── ErrorBoundary
```

### Sample Component: CaptureForm

```typescript
// app/capture/page.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FormEvent, useState } from "react";

export default function CapturePage() {
  const [text, setText] = useState("");
  const [receipt, setReceipt] = useState<any>(null);
  const submitCapture = useMutation(api.captures.submitCapture);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const clientMessageId = crypto.randomUUID();
    const result = await submitCapture({ text, clientMessageId });
    
    setReceipt(result);
    setText(""); // Clear form
    
    // Auto-hide receipt after 5 seconds
    setTimeout(() => setReceipt(null), 5000);
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">What's your big idea?</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your idea here..."
          className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-500"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Capture
        </button>
      </form>
      
      {receipt && (
        <div className="mt-6 p-4 bg-green-100 border border-green-500 rounded-lg">
          <h3 className="font-bold">✓ Captured!</h3>
          <p className="text-sm mt-2">{receipt.text}</p>
          <div className="flex justify-between mt-3 text-sm">
            <span className="bg-blue-200 px-2 py-1 rounded">
              {receipt.category} ({Math.round(receipt.confidence * 100)}%)
            </span>
            <a href="/inbox" className="text-blue-600 underline">
              View in inbox
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Why Convex Over Other Backends

| Feature | Convex | Firebase | Supabase | Custom API |
|---------|--------|----------|----------|-----------|
| **Setup Time** | 2 min | 5 min | 10 min | 2 days |
| **Real-time Sync** | Built-in | ✓ | ✓ | Custom |
| **Mutations** | Simple | Complex | Simple | Very simple |
| **Background Jobs** | Native | Cloud Functions | Edge functions | Queue needed |
| **Free Tier** | Generous | Generous | Good | $0 (self-hosted) |
| **Learning Curve** | Shallow | Medium | Medium | Steep |
| **TypeScript DX** | Excellent | Good | Good | Excellent |
| **Scaling** | Automatic | Automatic | Manual | Manual |

**Winner for this project**: Convex (focus on shipping fast)

---

## 🛡️ Idempotency & Resilience

### Problem
User submits form twice (network hiccup, user impatience). We don't want duplicate classifications.

### Solution: clientMessageId

```typescript
// Client side
const handleSubmit = async (e) => {
  const clientMessageId = crypto.randomUUID(); // Generated once per submit attempt
  await submitCapture({ text, clientMessageId });
  // If network fails, retry with SAME clientMessageId
};

// Server side
export const submitCapture = mutation({
  args: { text, clientMessageId },
  handler: async (ctx, { text, clientMessageId }) => {
    // Query database for existing capture with same clientMessageId
    const existing = await ctx.db
      .query("captures")
      .filter((q) => q.eq(q.field("clientMessageId"), clientMessageId))
      .first();
    
    if (existing) {
      return existing; // Return cached result, no duplicate
    }
    
    // ... create new capture
  },
});
```

---

## 📊 Comparison: V1 (Aspire) vs V2 (Convex)

| Aspect | Aspire (V1) | Convex (V2) |
|--------|----------|---------|
| **Setup** | ServiceDefaults, health checks, orchestration | `npx convex init` |
| **DB Migrations** | EF Core, manual migration files | Convex schema auto-sync |
| **Real-time** | SignalR (optional) | Built-in sync |
| **Background Jobs** | IHostedService, explicit queue | Convex scheduler/actions |
| **Testing** | xUnit with mocked DbContext | Convex test utilities |
| **Deployment** | Docker container + load balancer | Vercel (frontend) + Convex Cloud (backend) |
| **Local Dev Friction** | Medium (SQL Server install, secrets) | Low (dev token, instant deploy) |
| **Time to first feature** | 3–4 hours | 30 minutes |

---

## 🎯 Philosophy Behind This Architecture

### Constraints Drive Design

1. **MVP Speed First**: Every minute spent on infra is a minute not shipping features.
   → Convex handles infrastructure, we build features.

2. **Trust by Transparency**: Users must see why we classified something.
   → `inboxLog` + `reasoning` field shows the reasoning chain.

3. **Graceful Degradation**: If LLM fails, we still capture the idea.
   → `status: "error"` + fallback to manual classification.

4. **Idempotent by Default**: Network is unreliable; assume retries.
   → `clientMessageId` prevents duplicate classifications.

5. **Audit Everything**: Every change is logged for transparency.
   → `inboxLog.overriddenBy` tracks user corrections for feedback loop.

---

**Next**: Awaiting your clarifications on framework, LLM, and auth choices!
