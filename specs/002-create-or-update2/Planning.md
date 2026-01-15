## Goals

1. **Fast time-to-MVP**: Deploy capture + classification in asap
2. **Zero infrastructure cost** for local dev
3. **Pluggable LLM**: Easy to swap providers (Azure OpenAI → Claude → local LLaMA)
4. **Trust mechanisms**: Audit trail, confidence scores, easy fixes
5. **Idempotent design**: Safe retries, no duplicate processing
6. **Scalable architecture**: Handle increasing data and user load efficiently as the project goes to multi-tenant
7. **User-centric design**: Ensure the system is intuitive and meets user needs through continuous feedback and iteration
8. **Security and Privacy**: Minimal security in MVP
9. **Build with extensibility in mind**: Design the system to easily incorporate new features and technologies in the future
10. **I want to go sell this system to end users**: I am thinking of giving the MVP away, and charging for advanced features or premium access.

## Ideas
### here are some initial MVP ideas.
1. Build a second brain using AI to manage and organize thoughts, tasks, and projects efficiently.
2. Start with a simple capture system using a web form or mobile app to quickly capture ideas and tasks.
- The web form or mobile app should be intuitive and easy to use, minimizing friction in capturing information.
- It should have 3 pages: capture, organize and reminder.
- Use Convex as a backend to store and manage captured data.
3. Implement AI-driven classification and routing to automatically organize captured information.
- The AI should be able to categorize notes, tasks, and projects based on content and context.
- a suggested starting point for 4 classification categories: people, projects, ideas, and admin.
- adding classifications should be easy and intuitive for the user.
- the classification reasoning should be transparent and explainable.
4. Use AI to surface relevant information and provide nudges for next actions.
- The AI should be able to identify the most relevant information and suggest actionable next steps.
- The AI should provide reminders and follow-ups to ensure tasks are completed on the third page of the web app or mobile app.
5. Continuously review and refine the system to ensure it adapts to changing needs and priorities.
6. Leverage AI insights to identify patterns and opportunities for improvement in personal and professional workflows.
7. Keep the system modular and flexible to accommodate new tools and technologies for adding features as they become available.

## Planning
1. Become and expert in developing AI-driven productivity systems using Convex as a backend.
- Read G:\repos\ActionableIdeas\specs\002-create-or-update2\SuggestedConvexLearningPath.md for suggestions.
2. Gain proficiency in frontend development to create intuitive and responsive user interfaces.
3. Learn best practices for integrating AI into the application.
4. Decide on the core features and functionality for the MVP.
5. Create a development timeline and milestones for the MVP.
6. Identify potential risks and mitigation strategies for the MVP.
7. Define success metrics and key performance indicators (KPIs) for the MVP.
8. Plan for user feedback and iterative improvements based on real-world usage.
9. Stay aligned with project goals and objectives, by reviewing progress regularly.
9. Ask for clarification and input from me when in doubt or when you get stuck.

## Decide on Architecture
- This sections is to provide guidance on one possible architecture.

### Data Flow

```
User Types Idea
    ↓
Web form (fire-and-forget POST)
    ↓
API /capture endpoint (idempotent by ClientMessageId)
    ↓
CaptureItem saved to DB
    ↓
Enqueued to background processor
    ↓
CaptureProcessorWorker pulls from queue
    ↓
ILlmProvider.ClassifyAsync() called
    ↓
Result: ClassificationType + Confidence
    ↓
Bouncer Logic:
  if confidence >= 0.6:
    → Route to A LowConfidence table which can be reviewed later.
  else:
    → Log as needsReview=true, ask user
    ↓
InboxLog (audit trail) updated
    ↓
Success response to UI
```

### Key Principles (from "Second Brain" design)

1. **One frictionless capture point** (Dropbox): Single form, zero taxonomy decisions at capture time
2. **AI Sorter** (Classifier): LLM decides bucket, extracts fields
3. **Form** (Schema): Minimal fields per entity (name, description, next action, etc.)
4. **Filing Cabinet** (Database): People, Projects, Ideas, Admin, LowConfidence tables
5. **Receipt** (InboxLog): Audit trail with confidence scores
6. **Bouncer** (Confidence threshold): Prevents junk filing
7. **Tap on shoulder**: Daily/weekly digests (Phase 1.5)
8. **Fix Button**: Easy manual corrections

## Scope: V1 MVP

### Must-Have
- ✅ Capture form (single text input)
- ✅ API endpoint (fire-and-forget)
- ✅ LLM classification (pluggable provider)
- ✅ Audit trail (InboxLog table)
- ✅ Bouncer (confidence threshold)
- ✅ Database schema (4 entity tables + inbox log)
- ✅ Background processor (IHostedService)
- ✅ Unit tests (basic classification tests)

### Nice-to-Have (Phase 1.5)
- ❌ Web inbox UI (list classified items, show needsReview)
- ❌ Daily digest (scheduled summary)
- ❌ Weekly digest (weekly summary)
- ❌ Push notifications

### Out of Scope (Phase 2+)
- ❌ Voice input
- ❌ Email ingestion
- ❌ Mobile-native app (use web responsive)
- ❌ Semantic search / vector DB

## If you are not an expert in Convex, become one.
- Here are some suggestions

### Step 1: Learn Convex fundamentals
Start with the official docs and one guided tutorial so the mental model is solid. Convex is a document-relational database accessed only through backend functions you write in TypeScript.
​

Read these in order:

Convex database basics (tables, documents, IDs, schemas, relationships, and actions).​

Reading data (queries) and writing data (mutations).
​
Review the the chat app tutorial, to see real-time updates and the sync model.
- The chat app tutorial is a good starting point because we can hook the chat up with the AI for classification.
- The hook up with AI for classification is optional but recommended to understand the full potential of Convex.
- The hook up can be handled with the third type of function in Convex, which allows for custom backend logic, actions.
​

### Step 2: Pick one frontend stack
1. Do research and find a frontend stack that Convex supports well. For forms, Next.js or plain React may be easiest.
2. Keep the frontend stack simple and focused on the MVP requirements.
3. Look for a quickstart or tutorial that aligns with the MVP requirements.
4. Understand how to wire up ConvexProvider, useQuery, useMutation, and useAction.

### Step 3: Build the starter “tasks” CRUD example, then modify it (extra fields, filters, validation).
#### Goal to progressivly create a MVP UI/UX.
1. The initial step is to set up the basic CRUD operations for ideas.
- Start with the Idea input page
- Pages for Reporting (daily, weekly) can be done later
- Pages for Exceptions, error correction, expansion and learning can be added subsequently.
2. Sync the CRUD operations with the frontend to ensure real-time updates.
3. After the basic CRUD operations are functional, add extra fields, filters, and validation as needed.
- Validation should be as simple and intuitive as possible.
4. Test the CRUD operations thoroughly to ensure data integrity and proper functionality.

### Step 4: Implement AI-driven classification and routing
1. Integrate AI models to automatically categorize notes, tasks, and projects.
2. Ensure the AI provides transparent and explainable reasoning for its classifications.
3. Allow users to easily add or modify classification categories.
4. Implement routing logic to direct tasks and projects to the appropriate categories based on AI classifications.
5. Continuously monitor and refine the AI classification and routing system to improve accuracy and relevance.
6. Add scoring mechanisms to evaluate the effectiveness of AI classifications and routing decisions.
7. Implement a feedback loop for users to correct misclassifications, improving the AI model over time.

## Suggested Database Schema

### CaptureItem
- `Id` (GUID, PK)
- `UserId` (GUID, FK)
- `ClientMessageId` (string, unique with UserId for idempotency)
- `RawText` (string, max 2000)
- `Status` (enum: New, Processing, Processed, Error)
- `CreatedAt`, `ProcessedAt`

**Indexes**:
- `(UserId, ClientMessageId)` UNIQUE
- `Status`

### InboxLog (Audit Trail / Receipt)
- `Id` (GUID, PK)
- `CaptureItemId` (GUID, FK)
- `UserId` (GUID, FK)
- `RawText` (string, max 2000)
- `DestinationType` (enum: None, Person, Project, Idea, Admin)
- `DestinationId` (GUID, nullable)
- `Confidence` (double, 0–1)
- `NeedsReview` (bool)
- `ErrorMessage` (string, nullable)
- `ProcessingAttempt` (int)
- `CreatedAt`

**Indexes**:
- `(UserId, CreatedAt)` DESC
- `NeedsReview`

### Person, Project, Idea, AdminItem
- Minimal fields per entity
- `UserId` (for multi-tenancy)
- Timestamps

## Idempotency Strategy

### Capture Endpoint
- Client sends optional `ClientMessageId` (GUID)
- Backend checks for existing `CaptureItem` with same `(UserId, ClientMessageId)`
- If exists: return existing ID (no re-process)
- If new: create and enqueue

### Background Worker
- Check `InboxLog` for existing `CaptureItemId` before processing
- If already logged: skip (idempotent consumption)
- If error: retry with exponential backoff, log attempt count

### Fix Flow
- Correction is new row in `InboxLog` (append-only)
- Old entry marked with `CorrectionFrom` reference
- Full audit trail preserved

## LLM Classification Prompt (V1)

**System Prompt** (JSON-mode, no prose):

```
You are a classification system. Classify ideas into: Person, Project, Idea, Admin.
Return ONLY valid JSON with no markdown, no prose.

{
  "type": "Person|Project|Idea|Admin",
  "confidence": 0.0-1.0,
  "fields": {
    "name": "string",
    "description": "string",
    "nextAction": "string (for Project)",
    "dueDate": "ISO8601 (for Admin)"
  }
}

Rules:
- Person: Names, contacts, relationships
- Project: Goals, deliverables, milestones
- Idea: Insights, concepts, learnings
- Admin: Tasks, reminders, housekeeping

If unsure, set confidence < 0.5 and system will ask.
```