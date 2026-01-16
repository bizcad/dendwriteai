# Pre-Deployment Checklist - DendWriteAI

Complete all items below BEFORE attempting production deployment.

---

## 1. Accounts & Services Setup

- [ ] **Convex Account Created**
  - Visit: https://convex.dev
  - Sign up (free tier available)
  - Save your account credentials
  - Note: Will need this for `npx convex auth`

- [ ] **Vercel Account Created**
  - Visit: https://vercel.com
  - Sign up (free tier available, $20/month for Pro)
  - Connect to GitHub account (recommended for CI/CD)
  - Save account credentials

- [ ] **GitHub Repository**
  - Repository must be public or private on GitHub
  - Branch: `main` is default
  - Remote: `git remote -v` should show origin pointing to GitHub

- [ ] **Anthropic API Account**
  - Visit: https://console.anthropic.com
  - Create account
  - Generate API key (for Claude classification)
  - Keep key secure (will add to Convex secrets)

- [ ] **Custom Domain** (Optional)
  - Decide on domain name (or use Vercel's default: `your-project.vercel.app`)
  - If custom: Purchase domain and note DNS provider
  - Register with Vercel DNS or configure external DNS

---

## 2. Code & Documentation Verification

- [ ] **README.md is current**
  - [ ] Port numbers correct (3000 for Next.js, 3210 for Convex)
  - [ ] Stack versions listed accurately
  - [ ] Getting started instructions clear

- [ ] **QUICK_REFERENCE.md is accurate**
  - [ ] Commands tested in development
  - [ ] URLs match actual endpoints
  - [ ] Troubleshooting section helpful

- [ ] **.gitignore is complete**
  - [ ] `node_modules/` excluded
  - [ ] `.env.local` excluded
  - [ ] `.next/` excluded
  - [ ] `convex/_generated/` excluded
  - [ ] Session logs excluded

- [ ] **No secrets in code**
  - [ ] `grep -r "ANTHROPIC_API_KEY" web/` → No results
  - [ ] `grep -r "NEXTAUTH_SECRET" web/` → No results
  - [ ] `grep -r "password" .` → Only in schema/comments
  - [ ] All secrets in `.env.local` or environment variables

---

## 3. Environment Variables Configuration

### Web Folder `.env.production`

Create file: `web/.env.production`

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<run: openssl rand -hex 32>
NEXTAUTH_URL=https://your-domain.com

# Convex Configuration (from Step 4 below)
NEXT_PUBLIC_CONVEX_URL=https://your-project-id.convex.cloud
CONVEX_URL=https://your-project-id.convex.cloud
```

**Generate NEXTAUTH_SECRET:**

On Windows PowerShell:

```powershell
-join ((0..31) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })
```

On macOS/Linux:

```bash
openssl rand -hex 32
```

- [ ] NEXTAUTH_SECRET generated and saved
- [ ] NEXTAUTH_URL matches your production domain
- [ ] NEXT_PUBLIC_CONVEX_URL will be filled after Convex deployment
- [ ] CONVEX_URL will be filled after Convex deployment

---

## 4. Convex Cloud Setup

- [ ] **Create Production Deployment**

  ```bash
  cd g:\repos\dendwriteai
  npx convex auth
  # Follow prompts to log in with your Convex account
  ```

- [ ] **Set Production Secrets**
  - Go to: Convex Dashboard → Your Project → Settings → Environment Variables
  - Add:
    - Key: `ANTHROPIC_API_KEY`
    - Value: `<your-anthropic-api-key>`
  - Click "Save"

- [ ] **Deploy Schema & Functions**

  ```bash
  npx convex deploy
  # Wait for success message
  ```

- [ ] **Get Production URL**

  ```bash
  npx convex env list
  ```

  - Find your production deployment URL
  - Format: `https://your-project-id.convex.cloud`
  - Copy and save for `.env.production`

- [ ] **Verify Deployment**
  - Go to Convex Dashboard → Deployments
  - Click on your production deployment
  - Should see green "Ready" status

---

## 5. Frontend Build & Testing

- [ ] **Build succeeds locally**

  ```bash
  cd web
  npm run build
  # Should complete with no errors
  ```

- [ ] **No TypeScript errors**

  ```bash
  npm run lint
  # Should pass all checks
  ```

- [ ] **Test with production environment variables**
  - Set `NEXT_PUBLIC_CONVEX_URL` to your Convex production URL
  - Run: `npm run dev`
  - Test sign up / sign in / capture flow
  - Verify no console errors

---

## 6. Git & Deployment Setup

- [ ] **All changes committed**

  ```bash
  git status
  # Should show "working tree clean"
  ```

- [ ] **Latest code pushed to GitHub**

  ```bash
  git push origin main
  # Should complete with no errors
  ```

- [ ] **No untracked sensitive files**

  ```bash
  git clean -fdx --dry-run
  # Review what would be deleted, should not include .env files
  ```

- [ ] **Vercel connected to GitHub**
  - Go to https://vercel.com
  - Click "New Project"
  - Import your GitHub repository
  - Vercel should detect Next.js project automatically

---

## 7. Production Environment Variables (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXTAUTH_SECRET=<from .env.production>
NEXTAUTH_URL=<your production domain>
NEXT_PUBLIC_CONVEX_URL=<from convex env list>
CONVEX_URL=<from convex env list>
```

- [ ] All four variables set in Vercel
- [ ] Variables set for "Production" environment
- [ ] No typos in values

---

## 8. Security Checklist

- [ ] **NEXTAUTH_SECRET is strong** (32+ hex characters)
- [ ] **NEXTAUTH_URL matches exactly** (including protocol)
- [ ] **CONVEX_URL is production** (not localhost)
- [ ] **ANTHROPIC_API_KEY set in Convex** (not in frontend)
- [ ] **No .env files in git**
  ```bash
  git log --all --full-history -- ".env*"
  # Should show no results
  ```
- [ ] **HTTPS enforced** (Vercel does this automatically)
- [ ] **Cookies are HttpOnly** (configured in auth.ts)

---

## 9. Domain & DNS (if using custom domain)

- [ ] **Domain registered** (GoDaddy, Namecheap, etc.)
- [ ] **DNS pointing to Vercel**
  - In Vercel: Project Settings → Domains → Add domain
  - Follow DNS configuration steps
  - Allow up to 24 hours for propagation
- [ ] **HTTPS certificate installed** (Vercel handles automatically)
- [ ] **Domain resolves correctly**
  ```bash
  nslookup your-domain.com
  # Should resolve to Vercel's servers
  ```

---

## 10. Pre-Launch Testing

- [ ] **Convex Production is accessible**

  ```bash
  curl https://your-project-id.convex.cloud
  # Should get a response (not "connection refused")
  ```

- [ ] **Vercel build completes**
  - Go to Vercel Dashboard → Deployments
  - Latest deployment should show "Ready"
  - No failed builds or warnings

- [ ] **Sign up works**
  - Visit your production URL
  - Should redirect to /auth/signin
  - Create a test account
  - Should succeed without errors

- [ ] **Sign in works**
  - Sign out
  - Sign in with test credentials
  - Should be able to access main page

- [ ] **Capture submission works**
  - Submit a test capture
  - Should appear in "Recent Ideas" with "Pending" status
  - Check Convex dashboard → Data → captures table
  - Test capture should be present with correct tenantId

- [ ] **Session persistence works**
  - Sign in, then close browser completely
  - Reopen production URL
  - Should still be logged in (no redirect to signin)
  - Check DevTools → Application → Cookies
  - Should see `next-auth.session-token`

---

## 11. Monitoring & Alerts

- [ ] **Vercel monitoring enabled**
  - Vercel Dashboard → Project Settings → Monitoring
  - Check "Enable Monitoring" (Pro plan feature)

- [ ] **Convex logs accessible**
  - Convex Dashboard → your project → Deployments → Production
  - Click "Logs" tab
  - Should see recent database operations

- [ ] **Error tracking (optional)**
  - Consider: Sentry, LogRocket, or similar
  - For MVP, Vercel + Convex logs are sufficient

---

## 12. Documentation & Handoff

- [ ] **PRODUCTION_DEPLOYMENT.md complete**
  - [ ] All sections filled out
  - [ ] URLs use production domains
  - [ ] Environment variables documented

- [ ] **Deployment documented**
  - [ ] What was deployed and when
  - [ ] Which environment variables were set
  - [ ] Any issues encountered and solutions
  - [ ] Support contacts recorded

- [ ] **README.md mentions production URL**
  - [ ] Link to live app included
  - [ ] Difference between dev/prod clearly stated

---

## Go/No-Go Decision

**Go to Production if:**

- [ ] All items above checked
- [ ] No critical bugs found in testing
- [ ] Security checklist complete
- [ ] Team consensus obtained

**Do NOT go to Production if:**

- [ ] Any security items unchecked
- [ ] Build/deployment failures
- [ ] Sensitive data in repository
- [ ] Production environment variables incomplete

---

## After Deployment

1. **Monitor first 24 hours**
   - Check Vercel dashboard for errors
   - Check Convex logs for issues
   - Have team available for quick fixes

2. **Test from multiple devices**
   - Desktop browser
   - Mobile phone
   - Different networks (WiFi + cellular)

3. **Share with alpha testers**
   - Provide production URL
   - Request feedback on signup/login flow
   - Collect bug reports

4. **Document any issues**
   - Record in GitHub issues
   - Plan fixes for next phase

---

**Checklist Version**: 1.0  
**Last Updated**: January 15, 2026  
**Status**: Ready for production preparation
