# Production Deployment Guide - DendWriteAI

Complete the PRE-DEPLOYMENT-CHECKLIST.md first before following this guide.

---

## Step 1: Deploy Convex Backend

### 1.1 Create Production Deployment

```bash
cd g:\repos\dendwriteai
npx convex auth
```

Follow the prompts to log in with your Convex account. This creates your production deployment.

### 1.2 Configure Environment Variables in Convex Dashboard

1. Go to: https://dashboard.convex.dev
2. Select your project
3. Navigate to: Settings → Environment Variables
4. Add this secret:

```
Name: ANTHROPIC_API_KEY
Value: <your-anthropic-api-key-from-console.anthropic.com>
```

5. Click "Save"

### 1.3 Deploy Functions and Schema

```bash
npx convex deploy
```

Wait for the success message. This deploys:

- Database schema
- Convex functions (captures.ts, classification.ts, process.ts, etc.)
- LLM provider integration
- Multi-tenant isolation

### 1.4 Get Your Production URL

```bash
npx convex env list
```

Look for your production deployment URL. Format:

```
https://your-project-id.convex.cloud
```

**Save this URL** - you'll need it for the frontend configuration.

**Verify it works:**

```bash
curl https://your-project-id.convex.cloud
# Should return valid response (not "connection refused")
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Environment Variables

Create `web/.env.production` with:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<from-pre-deployment-checklist>
NEXTAUTH_URL=https://your-domain.com

# Convex Configuration (from Step 1.4)
NEXT_PUBLIC_CONVEX_URL=https://your-project-id.convex.cloud
CONVEX_URL=https://your-project-id.convex.cloud
```

**Example:**

```env
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
NEXTAUTH_URL=https://dendwriteai.vercel.app
NEXT_PUBLIC_CONVEX_URL=https://main-lion-123.convex.cloud
CONVEX_URL=https://main-lion-123.convex.cloud
```

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
cd g:\repos\dendwriteai\web
vercel --prod
```

Follow prompts and set environment variables when asked.

**Option B: GitHub Integration (Recommended)**

1. Push code to GitHub:

   ```bash
   git push origin main
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Select your repository from GitHub
5. Vercel auto-detects Next.js project
6. In "Environment Variables" section, add:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_URL`

7. Click "Deploy"
8. Wait 2-5 minutes for build to complete

**Verify Deployment:**

- Check Vercel Dashboard → Deployments
- Latest deployment should show "Ready" with green checkmark
- Click the deployment to view logs

### 2.3 Configure Custom Domain (Optional)

If using custom domain instead of `vercel.app`:

1. Go to Vercel Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `your-domain.com`
4. Follow DNS configuration instructions
5. Allow up to 24 hours for DNS propagation

Vercel automatically provisions SSL certificate for HTTPS.

---

## Step 3: Verify Production Deployment

### 3.1 Test Authentication Flow

1. **Visit your production URL**
   - If using Vercel default: `https://your-project-name.vercel.app`
   - If custom domain: `https://your-domain.com`

2. **Should see redirect to signin page** (`/auth/signin`)

3. **Test signup:**
   - Click "Create Account" or "Sign Up"
   - Enter email and password
   - Should create user and redirect to signin
   - Check Convex Dashboard → Data → users table
   - Your new user should appear

4. **Test signin:**
   - Enter credentials you just created
   - Should authenticate and show main page
   - Check browser DevTools → Application → Cookies
   - Should see `next-auth.session-token`

5. **Test capture submission:**
   - Submit a test capture idea
   - Should appear in "Recent Ideas" with "Pending" status
   - Check Convex Dashboard → Data → captures table
   - Your capture should be present with your tenantId

6. **Test session persistence:**
   - Sign in, note the session token cookie
   - Close browser completely (all tabs)
   - Reopen your production URL
   - Should still be logged in (no redirect to signin)
   - Session token cookie should still exist

### 3.2 Check Logs

**Vercel Logs:**

```bash
vercel logs
```

Or view in dashboard: Vercel Dashboard → Deployments → select latest → Logs tab

**Convex Logs:**

- Go to Convex Dashboard
- Select your project
- Click "Production" deployment
- Click "Logs" tab
- Should see recent database operations

Look for any errors or warnings.

### 3.3 Performance Verification

In browser DevTools → Network tab, check:

- Page load time: Should be < 2s
- API responses: Should be < 500ms
- Image loading: Check no 404s

---

## Step 4: Security Checklist

Before inviting testers, verify:

- [ ] **NEXTAUTH_SECRET is unique and strong** (32+ hex characters)
- [ ] **NEXTAUTH_URL matches your production domain exactly**
- [ ] **CONVEX URLs are production** (not localhost:3210)
- [ ] **ANTHROPIC_API_KEY is in Convex secrets** (not in frontend code)
- [ ] **No .env.local or .env files in git repository**
  ```bash
  git log --all -- ".env*"
  # Should show no files
  ```
- [ ] **HTTPS is enforced** (Vercel does automatically)
- [ ] **Cookies are HttpOnly and Secure** (configured in `web/auth.ts`)
- [ ] **CORS is configured** (check for cross-origin errors in logs)

---

## Step 5: Enable Monitoring

### Vercel Monitoring (Pro plan)

If on Pro plan:

- Go to Project Settings → Monitoring
- Enable "Web Analytics"
- Enable "Real Experience Monitoring"

### Convex Monitoring

Convex provides built-in:

- Request logs with latency
- Error tracking
- Database query analysis
- Usage statistics

View at: Convex Dashboard → your project → Monitoring tab

### Optional: External Error Tracking

Consider adding Sentry or LogRocket for additional visibility:

- Sentry: https://sentry.io (free tier available)
- LogRocket: https://logrocket.com (free tier available)

For MVP phase, Vercel + Convex logs are usually sufficient.

---

## Step 6: Invite Alpha Testers

Once verified and secure, share production URL with testers:

```
Welcome to DendWriteAI Alpha Testing! 👋

Sign up and try capturing your ideas:
https://your-domain.com

Please report any issues or feedback to: [your-email]

See ALPHA_TESTER_GUIDE.md for getting started.
```

---

## Rollback (If Needed)

### Rollback to Previous Version

**Vercel Rollback:**

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click three dots (⋯) next to deployment
4. Select "Promote to Production"
5. Confirm the rollback

**Convex Rollback:**

1. Convex Dashboard → Production Deployment → Logs
2. Find previous stable deployment version
3. Contact Convex support or redeploy previous code

---

## Troubleshooting

### Issue: "Connection refused" on Convex URL

**Cause:** Convex deployment not live yet  
**Fix:**

```bash
npx convex env list
# Verify deployment URL is listed as "ready"
```

### Issue: "NEXTAUTH_SECRET not set" error

**Cause:** Environment variable missing in Vercel  
**Fix:**

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `NEXTAUTH_SECRET` for Production environment
3. Click "Save"
4. Redeploy: Vercel → Deployments → click latest → "Redeploy"

### Issue: Login works but capture fails

**Cause:** Convex URL mismatch or ANTHROPIC_API_KEY missing  
**Fix:**

1. Check `.env.production` has correct Convex URL
2. Verify ANTHROPIC_API_KEY set in Convex Dashboard
3. Check Convex logs for specific error messages
4. Redeploy if environment variables changed

### Issue: Session not persisting

**Cause:** NEXTAUTH_URL doesn't match production domain  
**Fix:**

1. Verify `NEXTAUTH_URL` in Vercel environment variables
2. Should match exactly (protocol, domain, no trailing slash)
3. Check browser cookie settings (DevTools → Application → Cookies)
4. Should see `next-auth.session-token` with long expiry

### Issue: Slow page loads

**Cause:** Vercel serverless cold start or Convex latency  
**Fix:**

- Keep at least one deployment warm (Vercel Pro)
- Check Convex logs for slow database queries
- Consider implementing edge caching

---

## Monitoring Checklist

After deployment, monitor these metrics:

- [ ] **Error Rate** - Should be < 1%
- [ ] **Page Load Time** - Should be < 3s (p95)
- [ ] **API Response Time** - Should be < 500ms (p95)
- [ ] **Database Queries** - Should be < 100ms (p95)
- [ ] **Session Failures** - Should be 0%
- [ ] **Capture Success Rate** - Should be > 99%

---

## Support & Escalation

**For Convex Issues:**

- Docs: https://docs.convex.dev
- Support: support@convex.dev
- Discord: https://discord.gg/convex

**For Vercel Issues:**

- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Status: https://www.vercel-status.com

**For Authentication Issues:**

- NextAuth.js Docs: https://next-auth.js.org
- NextAuth Support: https://github.com/nextauthjs/next-auth/discussions

**For Anthropic Issues:**

- Docs: https://docs.anthropic.com
- Support: https://console.anthropic.com (check dashboard)

---

## Post-Deployment Checklist

- [ ] All services deployed and running
- [ ] Production URL accessible
- [ ] Authentication working end-to-end
- [ ] Captures successfully submitted
- [ ] Sessions persist correctly
- [ ] Security checklist complete
- [ ] Monitoring configured
- [ ] Team notified of deployment
- [ ] Alpha testers can access
- [ ] Support procedures documented

---

## Environment Variables Reference

| Variable                 | Dev Value               | Prod Value                             | Set In         | Required |
| ------------------------ | ----------------------- | -------------------------------------- | -------------- | -------- |
| `NEXTAUTH_SECRET`        | Generated               | Strong secret                          | Vercel         | Yes      |
| `NEXTAUTH_URL`           | `http://localhost:3000` | `https://your-domain.com`              | Vercel         | Yes      |
| `NEXT_PUBLIC_CONVEX_URL` | `http://127.0.0.1:3210` | `https://your-project-id.convex.cloud` | Vercel         | Yes      |
| `CONVEX_URL`             | `http://127.0.0.1:3210` | `https://your-project-id.convex.cloud` | Vercel         | Yes      |
| `ANTHROPIC_API_KEY`      | Dev key                 | Prod key                               | Convex Secrets | Yes\*    |

\*Required only if using Claude classification feature

---

**Production deployment complete! 🚀**

Monitor for the first 24 hours and be ready to rollback if critical issues arise.
