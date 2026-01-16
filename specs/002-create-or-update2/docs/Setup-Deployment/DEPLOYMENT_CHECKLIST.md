# Deployment Checklist: Multi-Tenancy + Auth

## Pre-Deployment

- [ ] Read `MULTI_TENANCY_SETUP.md` for full context
- [ ] Run `npm install` in `web/` directory
- [ ] Generate `AUTH_SECRET`:
  ```bash
  openssl rand -base64 32
  ```

## Environment Setup

- [ ] Create `web/.env.local`:
  ```
  NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
  AUTH_SECRET=<generated-secret-from-above>
  CONVEX_URL=https://your-deployment.convex.cloud
  ```

- [ ] Get your `NEXT_PUBLIC_CONVEX_URL` from Convex dashboard

## Convex Deployment

- [ ] Run `npx convex deploy` to push schema changes
- [ ] Verify new tables in Convex dashboard:
  - [ ] `users` table exists
  - [ ] All tables have `tenantId` field
  - [ ] `captures` table has `userId` field

## Testing (Local)

1. Start dev server:
   ```bash
   cd web
   npm run dev
   ```

2. Test signup flow:
   - [ ] Visit `http://localhost:3000`
   - [ ] Redirects to `/auth/signin` ✅
   - [ ] Click "Sign up"
   - [ ] Create account with name, email, password
   - [ ] Auto-login works ✅
   - [ ] Lands on home page ✅

3. Test main app:
   - [ ] Submit a capture ✅
   - [ ] See it in "Pending Captures" ✅
   - [ ] Click "Classify All" (or manually if no LLM setup) ✅

4. Test tenant isolation:
   - [ ] Open second browser/incognito window
   - [ ] Create another user account
   - [ ] Submit capture with second account
   - [ ] First account should NOT see second account's captures ✅

5. Test logout:
   - [ ] Click "Sign Out"
   - [ ] Redirects to `/auth/signin` ✅

## Production Deployment

### Option A: Vercel (Recommended for Next.js)
```bash
vercel deploy
```
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Test signup/login/captures in production

### Option B: Docker/VPS
```bash
npm run build
npm run start
```
- [ ] Ensure environment variables set
- [ ] Test endpoints

## Post-Deployment

- [ ] Monitor Convex for errors
- [ ] Monitor server logs
- [ ] Test signup with real email
- [ ] Invite alpha testers
- [ ] Collect feedback

## Data Considerations

⚠️ **Schema Migration Note**: If you had data from the old schema:
- Old captures won't have `tenantId` or `userId` (will cause errors)
- Consider starting fresh or running migration script
- Recommendation: Start fresh for POC

## Rollback Plan

If issues arise:
1. Keep old branch/deployment working
2. Revert to `NEXT_PUBLIC_CONVEX_URL` pointing to old deployment
3. Fix issue and redeploy

## Support

For issues:
1. Check browser console (F12) for client errors
2. Check Convex dashboard logs for mutation/query errors
3. Check Next.js server logs for API errors
4. Verify `.env.local` variables are set correctly
