# Next Steps - Deployment Checklist

**Current Status:** ✅ Development environment ready with NextAuth.js + persistent login (30 days)

Use this checklist to go live.

---

## 🎯 5-Step Path to Production

### ✅ Step 1: Environment Setup
- [ ] Read `PRODUCTION_DEPLOYMENT.md`
- [ ] Create Convex production account
- [ ] Create Vercel production account
- [ ] Purchase domain name (optional but recommended)

### ✅ Step 2: Deploy Convex Backend
- [ ] Run `npx convex auth` and log in
- [ ] Set `ANTHROPIC_API_KEY` in Convex environment variables
- [ ] Run `npx convex deploy`
- [ ] Save production Convex URL (`https://your-project-id.convex.cloud`)

### ✅ Step 3: Deploy Frontend to Vercel
- [ ] Create `.env.production` with production URLs
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Deploy to Vercel (via CLI or GitHub integration)
- [ ] Configure custom domain in Vercel
- [ ] Verify HTTPS is working

### ✅ Step 4: Test Production
- [ ] Visit production URL in browser
- [ ] Create test account and sign in
- [ ] Close browser and reopen → verify still logged in
- [ ] Check DevTools for secure session cookie
- [ ] Review Vercel and Convex logs for errors

### ✅ Step 5: Invite Alpha Testers
- [ ] Create list of alpha testers
- [ ] Send them `ALPHA_TESTER_GUIDE.md` and production URL
- [ ] Collect feedback on auth experience
- [ ] Monitor logs for issues

---

## 📋 Quick Reference

| Task | File | Time |
|------|------|------|
| Learn deployment steps | `PRODUCTION_DEPLOYMENT.md` | 5 min |
| Alpha tester guide | `ALPHA_TESTER_GUIDE.md` | 1 min to share |
| Deploy Convex | CLI | 5 min |
| Deploy Vercel | CLI or GitHub | 5 min |
| Test auth flow | Manual | 5 min |
| Invite testers | Email | 5 min |

**Total: ~25 minutes to go live**

---

## 🔐 Security Reminders

Before inviting testers:
- [ ] NEXTAUTH_SECRET is unique and not in git
- [ ] All production URLs are HTTPS
- [ ] No credentials in code or `.env.local`
- [ ] Check `.gitignore` includes `.env*`

---

## 🚀 You're Ready!

Once Step 5 is complete, DendwriteAI will be live with:

✅ **Secure Authentication** - Bcrypt hashing + JWT sessions  
✅ **Persistent Login** - Users stay logged in for 30 days  
✅ **Multi-Tenant Architecture** - Each user's data is isolated  
✅ **Production-Ready** - Deployed on Vercel + Convex (industry standard)  

---

## Support & Resources

- **Convex Docs:** https://docs.convex.dev
- **Vercel Docs:** https://vercel.com/docs
- **NextAuth.js Docs:** https://next-auth.js.org
- **Your Documentation:** See `specs/002-create-or-update2/docs/`

---

**Questions? Check the docs or reach out to our team.**
