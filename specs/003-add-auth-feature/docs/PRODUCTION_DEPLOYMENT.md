# Production Deployment Guide - DendwriteAI

This guide walks you through deploying DendwriteAI to production.

## Prerequisites

- [ ] Convex account (convex.dev)
- [ ] Vercel account (or Netlify/your hosting platform)
- [ ] Domain name (optional, but recommended)
- [ ] GitHub repository (for CI/CD)

---

## Step 1: Deploy Convex Backend

### 1.1 Create Convex Project

```bash
cd g:\repos\dendwriteai
npx convex auth
# Follow prompts to log in with your Convex account
# This creates a production deployment
```

### 1.2 Configure Environment Variables

Set production variables in Convex dashboard:

```bash
# In Convex Dashboard → Settings → Environment Variables
ANTHROPIC_API_KEY=your-anthropic-key-here
```

### 1.3 Deploy Schema & Functions

```bash
npx convex deploy
# This deploys your schema and all Convex functions to production
```

### 1.4 Get Your Production URL

```bash
npx convex env list
# Look for your production deployment URL
# Format: https://your-project-id.convex.cloud
```

**Save this URL** — you'll need it for the frontend.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Environment Variables

Create `.env.production` in the `web/` directory:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-domain.com

# Convex Configuration (use production URL from Step 1.4)
NEXT_PUBLIC_CONVEX_URL=https://your-project-id.convex.cloud
CONVEX_URL=https://your-project-id.convex.cloud
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
-join ((0..31) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })

# On macOS/Linux:
openssl rand -hex 32
```

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
cd g:\repos\dendwriteai\web
vercel
# Follow prompts, set environment variables when asked
```

**Option B: GitHub Integration (Recommended)**
1. Push to GitHub: `git push origin main`
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Set environment variables in Vercel settings
6. Deploy

### 2.3 Configure Custom Domain

In Vercel Dashboard:
- Project Settings → Domains
- Add your domain
- Follow DNS configuration steps

---

## Step 3: Verify Production Deployment

### 3.1 Test Auth Flow

1. Visit your production URL
2. Create a test account
3. Sign in
4. Verify session persists (close browser, reopen)
5. Check DevTools for `next-auth.session-token` cookie

### 3.2 Check Logs

**Vercel Logs:**
```bash
vercel logs
```

**Convex Logs:**
- Convex Dashboard → Deployments → select production → Logs tab

### 3.3 Monitor in Production

**Errors & Monitoring:**
- Vercel: Integrated in dashboard
- Convex: Built-in monitoring & logs
- Optional: Add Sentry for error tracking

---

## Step 4: Security Checklist

- [ ] NEXTAUTH_SECRET is unique and strong
- [ ] NEXTAUTH_URL matches your production domain
- [ ] No `.env.local` or `.env` files in production
- [ ] ANTHROPIC_API_KEY is set in Convex (not in frontend code)
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Cookies are HttpOnly and Secure
- [ ] CORS is configured properly

---

## Step 5: Invite Alpha Testers

Once verified, share the production URL with testers:

```
👋 Welcome to DendwriteAI Alpha Testing!

Sign up here: https://your-domain.com

See ALPHA_TESTER_GUIDE.md for getting started.
```

---

## Rollback (if needed)

### Revert to Previous Version

**Vercel:**
- Vercel Dashboard → Deployments → select previous build → click three dots → "Promote to Production"

**Convex:**
- Convex Dashboard → Production Deployment → Logs → select previous version

---

## Troubleshooting

### Issue: Login not working
- Check `CONVEX_URL` matches production deployment
- Verify `NEXTAUTH_SECRET` is set in environment variables
- Check Vercel logs: `vercel logs`

### Issue: Session not persisting
- Ensure `NEXTAUTH_URL` matches your domain exactly
- Check cookie settings in browser DevTools
- Verify secure cookie is enabled in production

### Issue: Can't connect to Convex
- Verify production Convex deployment is running
- Check `NEXT_PUBLIC_CONVEX_URL` is correct
- Confirm network connectivity to Convex servers

---

## Support

- **Convex Support:** [support@convex.dev](mailto:support@convex.dev)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Our Team:** [your support email]

---

## Environment Variable Reference

| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| `NEXTAUTH_SECRET` | Generated | Strong secret | Yes |
| `NEXTAUTH_URL` | `http://localhost:3001` | `https://your-domain.com` | Yes |
| `NEXT_PUBLIC_CONVEX_URL` | `http://127.0.0.1:3210` | `https://your-project-id.convex.cloud` | Yes |
| `CONVEX_URL` | `http://127.0.0.1:3210` | `https://your-project-id.convex.cloud` | Yes |
| `ANTHROPIC_API_KEY` | Set in Convex dev | Set in Convex production | Yes |

---

**You're now live! 🚀**
