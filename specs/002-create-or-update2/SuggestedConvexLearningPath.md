# Suggested Convex Learning Path

## Purpose
- The purpose of this document is to share with you a structured learning path for becoming proficient with Convex as recommended by Convex.
- It is not intended to cover the "Second Brain" use case, but to provide a recognized roadmap for learning Convex, and citations for "how to".

## Goal
- Create Focus on mastering the core primitives (queries, mutations, actions) and a single frontend stack first (e.g., React or React Native) before branching out.[1][2][3][4]

## Step 1: Learn Convex fundamentals

Start with the official docs and one guided tutorial so the mental model is solid. Convex is a **document-relational** database accessed only through backend functions you write in TypeScript.[2][1]

- Read these in order:
  - Convex database basics (tables, documents, IDs, schemas).[2]
  - Reading data (queries) and writing data (mutations).[2]
- Complete a single full tutorial end‑to‑end, e.g. the chat app tutorial, to see real-time updates and the sync model.[1]

## Step 2: Pick one frontend stack

Specialize first in one UI stack that Convex supports well. For forms, Next.js or plain React is usually easiest.[3][4][5]

- If you like React / Next.js:
  - Do the React or Next.js quickstart to wire up ConvexProvider, useQuery, and useMutation.[5][3]
  - Build the starter “tasks” CRUD example, then modify it (extra fields, filters, validation).[3][5]
- If you want mobile:
  - Follow the React Native quickstart using Expo; connect Convex via ConvexReactClient.[4]
  - Build a simple “notes” or “todos” form that syncs across devices.[4]

## Step 3: Build 3–4 focused form projects

Use small, realistic projects to exercise forms, validation, and relations.[6][7]

- Suggested projects:
  - Contact/feedback form with validation, saving submissions in a table.
  - Multi-step registration form that writes to multiple tables (user, profile, preferences).
  - Simple survey builder with:
    - A forms table
    - A form_fields table
    - A responses table, similar to Convex’s “Informal” form-builder template.[7][6]
- For each project, practice:
  - One mutation per write path (create, update, delete).
  - One or two queries per page, using Convex’s reactive hooks so the UI updates automatically.[1][3]

## Step 4: Deepen Convex-specific skills

Once CRUD forms feel easy, focus on the Convex features that separate “basic user” from **expert**.[8][9][2]

- Data modeling and performance:
  - Define schemas for safety and queries; practice modeling relations via document IDs.[2]
  - Add indexes for your common query patterns and try paginated queries for long lists.[2]
- Backend architecture:
  - Learn when to use queries, mutations, and actions, and how to keep them small and fast.[8]
  - Add simple background tasks or scheduled jobs (e.g., nightly cleanup or reminder emails).[9]
- Ecosystem features:
  - Try built-in file storage for file-upload form fields.[9]
  - Experiment with authentication (e.g., Clerk + Convex) to restrict who can submit or view forms.[10][11][6]

## Step 5: Use advanced resources and “deliberate practice”

Level up by studying others’ real apps and deliberately refactoring your own.[12][13][10][7][8]

- Watch a few in-depth Convex videos:
  - Beginner/“pit of success” talks on best practices for queries, mutations, and reactive caching.[12][8]
  - Longer app builds (Threads clone, real-time apps) to see how experts structure code and data.[13][10]
- Study templates:
  - Clone the Convex form-builder template and dissect how forms, fields, and responses are modeled and rendered.[7]
- Practice loop for each project:
  - Identify a slow or messy part (e.g., large list, complex form).
  - Improve schema, indexes, or function boundaries.
  - Re-run and verify UI responsiveness and simplicity.

If you share what stack you’re using (plain React, Next.js, React Native, or something else), a concrete 2–3 week practice plan with specific mini-projects and milestones can be laid out.

[1](https://docs.convex.dev/tutorial/)
[2](https://docs.convex.dev/database)
[3](https://docs.convex.dev/quickstart/react)
[4](https://docs.convex.dev/quickstart/react-native)
[5](https://docs.convex.dev/quickstart/nextjs)
[6](https://www.youtube.com/watch?v=HQOD7Qw8BTk)
[7](https://www.convex.dev/templates/form-builder)
[8](https://www.youtube.com/watch?v=dyEWQ9s2ji4)
[9](https://docs.convex.dev/quickstarts)
[10](https://www.youtube.com/watch?v=D-DUZNeVlRE)
[11](https://dev.to/aaronksaunders/vuejs-convex-backend-with-clerk-authentication-full-stack-tutorial-2f66)
[12](https://www.youtube.com/watch?v=608khv7qqOI)
[13](https://www.youtube.com/watch?v=V0MuSxsbuCE)
[14](https://stack.convex.dev/lessons-from-building-an-ai-app-builder)
[15](https://www.youtube.com/watch?v=vaQZYRSiimI)