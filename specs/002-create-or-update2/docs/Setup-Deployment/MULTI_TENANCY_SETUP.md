# Multi-Tenancy & Authentication Setup

## Summary of Changes

This implementation adds secure multi-tenant authentication to DendwriteAI, enabling safe external access for alpha testers.

## What's New

### 1. **Convex Schema Updates** (`convex/schema.ts`)
- Added `users` table with email, name, passwordHash, and tenantId
- Added `tenantId` to all existing tables (captures, people, projects, ideas, admin, lowConfidence, inboxLog)
- Added `userId` to captures table
- Added indexes for efficient tenant filtering

### 2. **Authentication** 
- **NextAuth.js** - Email/password authentication with bcrypt hashing
- **Session Management** - User sessions stored and managed securely
- **Password Security** - Bcrypt hashing on client & server sides

### 3. **Convex Functions**

#### New: `convex/auth.ts`
- `register()` - Create new user with unique tenant ID
- `getUserByEmail()` - Fetch user for auth verification
- `getCurrentUser()` - Get session user info

#### Updated: `convex/captures.ts`
- All queries now filter by `tenantId`
- submitCapture requires userId and tenantId
- Added getPendingCaptures query

#### Updated: `convex/process.ts`
- classifyAllPending now filters by tenantId
- All database operations respect tenant boundaries

### 4. **Frontend Pages**

#### New Auth Pages
- `/auth/signup` - User registration with validation
- `/auth/signin` - Login with email & password

#### Updated: Main Page (`/`)
- Protected route - redirects to signin if unauthenticated
- Displays user name and sign-out button
- All operations pass userId and tenantId
- Only shows user's own data

### 5. **API Routes**
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/auth/register` - Registration endpoint (calls Convex mutation)
- `/api/auth/user` - User lookup for authentication

## Security Features

✅ **Tenant Isolation** - Each user has unique tenantId; all queries filtered by tenant
✅ **Password Security** - Bcrypt hashing with 10 salt rounds
✅ **Session Protection** - NextAuth.js manages secure sessions
✅ **Route Protection** - Unauthenticated users redirected to signin
✅ **Data Ownership** - Users can only access their own captures and classifications

## Installation

1. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

2. **Set environment variables** (`.env.local`)
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   AUTH_SECRET=your-secret-key-here
   ```

3. **Deploy Convex schema** (if not automatic)
   ```bash
   npx convex deploy
   ```

## Testing

1. **Start dev server**
   ```bash
   cd web
   npm run dev
   ```

2. **Sign up** at `http://localhost:3000/auth/signup`
3. **Create account** - you'll be auto-logged in
4. **Submit captures** - they're scoped to your tenant
5. **Classify** - processes only your pending captures

## Next Steps

- [ ] Add OAuth (Google, GitHub) as alternative auth
- [ ] Add user profile management
- [ ] Add tenant settings/admin panel
- [ ] Add role-based access control (RBAC)
- [ ] Add audit logging for compliance

## Key Design Decisions

1. **Automatic Tenant Creation** - Each new user gets a unique tenant ID (no admin setup required)
2. **Email + Password Auth** - Simple, works offline; OAuth can be added later
3. **Bcryptjs** - Pure JS implementation, works in both Node and browser
4. **NextAuth.js** - Industry standard, handles sessions automatically

## Troubleshooting

**"User not found" on login**
- Ensure Convex schema has been deployed
- Check that user exists in Convex dashboard

**"NEXT_PUBLIC_CONVEX_URL not set"**
- Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local`

**Session not persisting**
- Check AUTH_SECRET is set in `.env.local`
- Clear browser cookies and try again
