# Quick Reference: DendWriteAI Development Commands

## Terminal Aliases (Available in VS Code)

### 📁 Navigation

```powershell
cddend      # Jump to project root (G:\repos\dendwriteai)
cdweb       # Jump to Next.js web folder
cdconvex    # Jump to Convex backend folder
```

### 🚀 Start Services

```powershell
convex-dev  # Start Convex backend server
web-dev     # Start Next.js frontend server
install-all # Install npm dependencies (web folder)
```

### 🛠 Utilities

```powershell
head        # Show first 10 lines (command | head)
tail        # Show last 10 lines (command | tail)
wc          # Count lines (command | wc)
grep        # Find pattern (grep 'pattern' [file])
```

---

## Browser Access

| Purpose          | URL                   | Status     |
| ---------------- | --------------------- | ---------- |
| Application      | http://localhost:3000 | ✅ Running |
| Convex Dashboard | http://127.0.0.1:6790 | ✅ Running |

---

## Manual Server Startup (if needed)

**Option 1: Using aliases**

```powershell
# Terminal 1
convex-dev

# Terminal 2 (new terminal)
web-dev
```

**Option 2: Manual commands**

```powershell
# Terminal 1: Convex
cd g:\repos\dendwriteai
npx convex dev

# Terminal 2: Next.js
cd g:\repos\dendwriteai\web
npm run dev
```

---

## Troubleshooting

### QuestionManager aliases still showing?

→ This means the global profile is still loading. New terminals in this workspace should use DendWriteAI aliases. If not, reload the VS Code window (Ctrl+Shift+P → "Reload Window").

### "Connection refused" on localhost:3000?

→ Wait 2-3 seconds after seeing "Ready in Xms" message. The dev server needs time to fully start.

### Next.js showing workspace root warning?

→ This is non-critical. It appears during startup but doesn't affect functionality. It's because there are two package-lock.json files in the monorepo structure.

### Auth not working?

→ Make sure .env.local exists in `web/` with NEXTAUTH_SECRET, NEXTAUTH_URL, and CONVEX_URL values.

---

## Current Features

✅ **User Authentication**

- Sign up / Sign in with credentials
- Auto-user creation on first capture
- 30-day persistent login with secure cookies

✅ **Capture System**

- Submit ideas via capture form
- Automatic user/tenant creation
- Real-time sync with Convex database
- View pending captures in "Recent Ideas"

✅ **Tailwind CSS**

- Pre-configured with tailwind.config.ts
- Full styling support

## Testing Workflow

1. Both servers should be running (Convex + Next.js)
2. Open http://localhost:3000 → redirects to /auth/signin
3. Sign up or sign in with test credentials
4. Submit a capture from the form
5. Should appear in "Recent Ideas" with "Pending" status
6. Close browser completely and reopen → still logged in!

---

_Reference guide for DendWriteAI workspace setup_
