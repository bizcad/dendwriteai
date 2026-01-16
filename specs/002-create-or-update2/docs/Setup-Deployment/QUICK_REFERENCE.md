# Quick Reference: Multi-Tenant Auth Setup

## 📋 Files at a Glance

### Backend (Convex)
| File | Purpose |
|------|---------|
| `convex/auth.ts` | Auth mutations & queries (register, getUserByEmail) |
| `convex/captures.ts` | Capture operations (now tenant-filtered) |
| `convex/process.ts` | Classification (now tenant-scoped) |
| `convex/schema.ts` | Database schema with tenantId fields |

### Frontend (Next.js)
| File | Purpose |
|------|---------|
| `web/auth.ts` | NextAuth.js configuration |
| `web/app/page.tsx` | Home page (protected, shows user) |
| `web/app/layout.tsx` | Root layout (with SessionProvider) |
| `web/app/auth/signin/page.tsx` | Login page |
| `web/app/auth/signup/page.tsx` | Registration page |
| `web/app/api/auth/[...nextauth]/route.ts` | Auth API handlers |
| `web/app/api/auth/register/route.ts` | Registration endpoint |
| `web/app/api/auth/user/route.ts` | User lookup endpoint |

### Documentation
| File | Purpose |
|------|---------|
| `AUTH_IMPLEMENTATION_SUMMARY.md` | Overview of what was built |
| `MULTI_TENANCY_SETUP.md` | Detailed setup & configuration |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step deployment guide |
| `ARCHITECTURE.md` | System design & diagrams |
| `TROUBLESHOOTING.md` | Common issues & solutions |

---

## 🚀 Quickstart Commands

```bash
# 1. Install dependencies
cd web
npm install

# 2. Generate AUTH_SECRET
openssl rand -base64 32

# 3. Create .env.local with (get CONVEX_URL from dashboard):
echo 'NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud' >> .env.local
echo 'CONVEX_URL=https://your-convex-url.convex.cloud' >> .env.local
echo 'AUTH_SECRET=<paste-secret-from-step-2>' >> .env.local

# 4. Deploy Convex schema
npx convex deploy

# 5. Run dev server
npm run dev

# 6. Visit http://localhost:3000
```

---

## 🔑 Key Concepts

### Tenant ID
- **Auto-created** on user signup
- **Unique GUID** per user (no two users share tenantId)
- **Stored in session** after login
- **Passed to all mutations/queries**

### Password Security
- **Hashed with bcrypt** (10 salt rounds)
- **Client-side hash** before sending to server
- **Server-side verification** against stored hash
- **Never stored in plain text**

### Session Management
- **NextAuth.js** handles JWT in cookie
- **Secure, HttpOnly cookie** (can't be accessed by JS)
- **Auto-logout** when user signs out
- **Persists across page refreshes** (until logout)

### Data Isolation
- **Every table has tenantId field**
- **Every query filters by tenantId**
- **Every mutation requires tenantId**
- **No cross-tenant data possible**

---

## 🛡️ Security Layers

```
Browser Auth (SessionProvider)
    ↓ session.user.tenantId
API Verification (next-auth check)
    ↓ extract tenantId from session
Convex Query Filter (.withIndex("by_tenantId"))
    ↓ only returns user's data
Database (enforced at query time)
    ↓
✅ Only authorized data returned
```

---

## 📝 Environment Variables

```env
# Required for authentication
AUTH_SECRET=base64-32-character-secret

# Required for Convex connectivity
NEXT_PUBLIC_CONVEX_URL=https://yourdeployment.convex.cloud
CONVEX_URL=https://yourdeployment.convex.cloud

# Optional: for testing with different Convex environments
CONVEX_DEPLOYMENT=prod  # or dev
```

**Note**: 
- `NEXT_PUBLIC_*` are exposed to browser (public)
- Other vars are server-only (secret)
- `.env.local` is not committed to git

---

## 🔐 Authentication Flow (Quick)

1. **Sign Up**: Name + Email + Password
   - Password hashed with bcrypt
   - User + tenantId created in DB
   - Auto-login after signup

2. **Sign In**: Email + Password
   - Fetch user from DB
   - Verify bcrypt hash
   - Create session token
   - Set secure cookie

3. **Authenticated Requests**:
   - Browser cookie sent automatically
   - NextAuth.js validates token
   - User data extracted from token
   - Request proceeds with user.tenantId

4. **Sign Out**:
   - Clear session cookie
   - Redirect to signin page

---

## 📊 Database Schema Summary

```
users → { email, name, passwordHash, tenantId }

captures → { text, userId, tenantId, status }
people → { name, description, sourceCapture, tenantId }
projects → { name, description, sourceCapture, tenantId }
ideas → { name, description, sourceCapture, tenantId }
admin → { title, description, sourceCapture, tenantId }
lowConfidence → { captureText, classificationAttempt, tenantId }
inboxLog → { captureId, classification, tenantId }
```

**Key**: All tables have `tenantId` for filtering

---

## 🧪 Testing Checklist

```
Signup:
  ☐ Create account with name, email, password
  ☐ Auto-login after signup
  ☐ Land on home page
  ☐ See user name in header

Submit Capture:
  ☐ Type text and submit
  ☐ See it in "Pending Captures"
  ☐ It has your tenantId (in DB)

Multi-Tenant:
  ☐ Open incognito/second browser
  ☐ Create different account
  ☐ Submit different capture
  ☐ First browser doesn't see 2nd user's capture ✅

Classify:
  ☐ Click "Classify All"
  ☐ Only your captures are classified
  ☐ Results appear in home page
  ☐ Other user's captures untouched

Logout:
  ☐ Click "Sign Out"
  ☐ Redirect to signin
  ☐ Session cleared

Login:
  ☐ Sign back in
  ☐ See your data (from before)
  ☐ Logout session preserved data ✅
```

---

## 🐛 Debugging Commands

```bash
# Check Convex schema
npx convex dev  # Starts sync watcher

# Push schema changes
npx convex deploy

# View Convex logs
# Go to: https://dashboard.convex.dev → Logs tab

# Check env variables (locally)
cat .env.local

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# See database state
# Go to: https://dashboard.convex.dev → Data tab
```

---

## 🚨 Common Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| "User not found" | User doesn't exist | Sign up first, then login |
| Logged out immediately | AUTH_SECRET not set | Add AUTH_SECRET to .env.local |
| CORS error | Wrong CONVEX_URL | Check URL in dashboard |
| Can't submit capture | tenantId missing | User must be logged in |
| See other user's data | tenantId not passed | Should be impossible (security bug!) |
| Password hash failing | Wrong bcrypt usage | Check both client & server code |
| Data not appearing | Stale query | Refresh page (hard refresh: Ctrl+Shift+R) |

---

## 📞 Support Resources

- **Convex**: [docs.convex.dev](https://docs.convex.dev)
- **NextAuth.js**: [next-auth.js.org](https://next-auth.js.org)
- **Next.js**: [nextjs.org](https://nextjs.org)
- **Bcryptjs**: [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

---

## ✅ Deployment Checklist

- [ ] `npm install` in `web/` directory
- [ ] `.env.local` created with 3 env vars
- [ ] `npx convex deploy` successful
- [ ] Tested locally: signup → submit → classify → logout
- [ ] Tested multi-tenant isolation
- [ ] Ready for alpha testers!

---

**You're all set!** This setup is production-ready and secure. Go invite your alpha testers! 🎉
