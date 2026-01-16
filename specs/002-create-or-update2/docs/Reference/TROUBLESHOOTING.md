# Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Login Issues

#### "User not found" error
**Cause**: User doesn't exist or email doesn't match
**Solution**:
1. Verify user was created - check Convex dashboard → users table
2. Make sure you're using the correct email
3. Try signing up with a new account
4. Check Convex logs for mutation errors

#### "Invalid password" error
**Cause**: Password doesn't match hash
**Solution**:
1. Verify password is correct (case-sensitive)
2. Ensure password was hashed before submission
3. Check browser console for client-side errors
4. Try resetting with new account

#### "Session not persisting" (logged out immediately)
**Cause**: AUTH_SECRET not set or invalid
**Solution**:
1. Check `.env.local` has `AUTH_SECRET` set
2. Verify it's at least 32 characters long
3. Generate new secret: `openssl rand -base64 32`
4. Clear browser cookies: Settings → Privacy → Clear cookies
5. Restart dev server

#### Redirect loop between /signin and /
**Cause**: Session exists but user data can't be fetched
**Solution**:
1. Clear browser cookies
2. Check Convex cloud status
3. Verify NEXT_PUBLIC_CONVEX_URL is correct
4. Check browser network tab for failed requests

---

### 🔴 Sign-Up Issues

#### "Email already exists"
**Cause**: That email address is already registered
**Solution**:
1. Use a different email
2. If testing, use email format: `user+timestamp@example.com`
3. To clear test data, delete from Convex dashboard (caution!)

#### Password validation fails
**Cause**: Password doesn't meet requirements
**Solution**:
- Password must be at least 8 characters
- Try simpler password without special chars initially: `password123`

#### Sign-up page shows blank form
**Cause**: NextAuth not initialized or client-side error
**Solution**:
1. Open browser console (F12)
2. Check for JS errors
3. Verify page source loads correctly
4. Restart dev server: `npm run dev`

---

### 🔴 Database & Convex Issues

#### "Convex mutation failed" / "Cannot read tenantId"
**Cause**: Schema not deployed or fields missing
**Solution**:
1. Run `npx convex deploy` in project root
2. Wait for deployment to complete
3. Verify in Convex dashboard:
   - [ ] `users` table exists
   - [ ] `captures` has `tenantId` field
   - [ ] All other tables have `tenantId` field
4. Refresh browser and try again

#### "NEXT_PUBLIC_CONVEX_URL not set"
**Cause**: Missing environment variable
**Solution**:
1. Create/update `web/.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   AUTH_SECRET=your-secret
   CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```
2. Get URL from Convex dashboard
3. Restart dev server

#### "Cross-origin request blocked"
**Cause**: CORS issue between Next.js and Convex
**Solution**:
1. Verify `NEXT_PUBLIC_CONVEX_URL` doesn't have trailing slash
2. Ensure it's the full HTTPS URL
3. Check Convex dashboard → Settings → Deployment
4. If still failing, clear browser cache

---

### 🔴 Data Issues

#### New user doesn't see their data
**Cause**: Data has wrong tenantId or old data without tenantId
**Solution**:
1. Submit new capture after signup (fresh data with correct tenantId)
2. Check Convex dashboard → captures table → filter by tenantId
3. Verify user._id and capture.userId match

#### "Unauthorized: Capture does not belong to this tenant"
**Cause**: Trying to access another user's data
**Solution**:
1. This is expected! It's the security working
2. Make sure you're accessing your own data
3. If legitimate issue, check tenantId in session

#### Captures not appearing after submission
**Cause**: Real-time query not updating or wrong filter
**Solution**:
1. Refresh page (Ctrl+R / Cmd+R)
2. Check browser console for errors
3. Verify capture was inserted: Convex dashboard → captures table
4. Check that tenantId matches current user's tenantId

---

### 🔴 Classification Issues

#### "Classify All" button disabled or does nothing
**Cause**: No pending captures OR missing ANTHROPIC_API_KEY
**Solution**:
1. Submit a capture first to create pending item
2. Wait for page to update
3. For classification to work, ensure:
   - [ ] `ANTHROPIC_API_KEY` set in Convex environment
   - [ ] Run: `npx convex env set ANTHROPIC_API_KEY sk-ant-...`
4. Without API key, mutation will fail silently

#### Classification succeeds but data doesn't update
**Cause**: Real-time query lag
**Solution**:
1. Wait 2-3 seconds
2. Refresh page
3. Check Convex logs for errors
4. Verify classified data in Convex dashboard (inboxLog table)

---

### 🔴 Development Server Issues

#### Port 3000 already in use
**Cause**: Another process using port 3000
**Solution**:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### "Module not found" error
**Cause**: Dependencies not installed or imports wrong
**Solution**:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Hot reload not working
**Cause**: File watcher issue
**Solution**:
1. Stop dev server (Ctrl+C)
2. Clear `.next` folder: `rm -rf .next`
3. Restart: `npm run dev`

---

### 🔴 Deployment Issues

#### Vercel deployment fails
**Cause**: Missing environment variables
**Solution**:
1. Go to Vercel dashboard → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_CONVEX_URL` (public)
   - `AUTH_SECRET` (secret)
   - `CONVEX_URL` (secret)
3. Redeploy

#### Works locally but not in production
**Cause**: Environment mismatch
**Solution**:
1. Verify all `.env` variables are set in production
2. Check Convex logs for API errors
3. Check browser console in production for JS errors
4. Verify Convex deployment URL is production (not dev)

---

### 🟡 Performance Issues

#### Slow login
**Cause**: Bcrypt hashing takes time (intentional)
**Solution**:
- This is normal! Bcrypt is slow for security
- Local: ~200-500ms
- Production: similar
- Not a bug, it's working correctly

#### Slow page load
**Cause**: Convex query slow or loading many records
**Solution**:
1. Check Convex logs for slow queries
2. Verify indexes are created (tenantId indexes)
3. Reduce records shown per page (add pagination)
4. Use query filters more aggressively

---

### 🟡 Security Concerns

#### "What if someone finds AUTH_SECRET?"
**Solution**:
1. In `.env.local` - not exposed (stays on machine)
2. In Vercel - use secrets manager
3. Generate new secret and rotate: `openssl rand -base64 32`
4. All sessions become invalid (users need to re-login)

#### "Can users see other users' data?"
**Answer**: No
- All queries filtered by tenantId at database level
- API layer checks ownership
- Would need to:
  1. Compromise Convex credentials (not possible)
  2. Know another user's tenantId (random GUID)
  3. Both would need to fail for access to work

---

## Debugging Tips

### Enable Verbose Logging

**Browser Console** (F12):
```javascript
// See Convex query/mutation results
localStorage.setItem('DEBUG', 'convex/*')
```

**Convex Logs**:
1. Go to Convex Dashboard
2. Click your deployment
3. View "Logs" tab
4. Search for errors/mutations

**Next.js Server Logs**:
- Terminal where you ran `npm run dev`
- Shows API errors and build issues
- Look for red [ERR] messages

### Manual Testing Steps

1. **Clear everything**:
   ```bash
   # Clear browser cache
   # Delete cookies
   # Delete localStorage
   # Restart dev server
   ```

2. **Test signup fresh**:
   - Use unique email: `test+$(date +%s)@example.com`
   - Use simple password: `password123`
   - Watch browser console and server logs

3. **Verify DB state**:
   - Convex Dashboard → users table
   - Search for your email
   - Check tenantId field populated

4. **Test queries**:
   - After signup, submit capture
   - Check Convex Dashboard → captures table
   - Filter by your tenantId
   - Verify entry exists

---

## Still Stuck?

1. **Check logs in this order**:
   - Browser console (F12)
   - Network tab (failed requests?)
   - Convex dashboard logs
   - Next.js server terminal

2. **Restart everything**:
   ```bash
   npm run dev  # Stop and start server
   Refresh page in browser
   Clear cookies
   ```

3. **Nuclear option** (fresh start):
   ```bash
   cd web
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

4. **Verify prerequisites**:
   - [ ] Convex deployed (`npx convex deploy`)
   - [ ] `.env.local` has all 3 variables
   - [ ] Convex auth table exists
   - [ ] npm packages installed (`npm install`)

---

## Getting Help

**For Convex issues**:
- Check [docs.convex.dev](https://docs.convex.dev)
- Discord: [convex.dev/community](https://convex.dev/community)

**For NextAuth issues**:
- Check [next-auth.js.org](https://next-auth.js.org)
- GitHub issues: [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth)

**For Next.js issues**:
- Check [nextjs.org/docs](https://nextjs.org/docs)
- GitHub issues: [vercel/next.js](https://github.com/vercel/next.js)
