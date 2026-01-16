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

→ This is non-critical. It's because there are two package-lock.json files. You can ignore it or see WORKSPACE_SETUP.md for the fix.

### Auth not working?

→ Make sure .env.local exists in `web/` with NEXTAUTH_SECRET, NEXTAUTH_URL, and CONVEX_URL values.

---

## Next: Testing Auth Flow

When ready to test:

1. Both servers should be running (Convex + Next.js)
2. Open browser to http://localhost:3000
3. Should redirect to /auth/signin
4. Sign up with test credentials
5. Try logging out and back in
6. Close browser entirely and reopen - should still be logged in!

---

_Reference guide for DendWriteAI workspace setup_
