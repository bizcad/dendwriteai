# Phase 5 Execution - Survey Answers

## DendWrite AI First Customer Setup (You!)

**Date**: 2026-01-16  
**Purpose**: Answer all 27 questions to validate the deployment plan  
**Status**: In Progress

---

## Instructions

For each question below:

1. **Answer it** with your actual information (or write "N/A" if not applicable)
2. **Note blockers** - If you can't answer it, explain why
3. **Document assumptions** - Mark anything that's a guess
4. **Mark encrypted fields** - Don't store real API keys/passwords in this file long-term

> 💡 **Tip**: Some answers may be "TBD" or "Not yet created" - that's fine! This is discovering what questions make sense.

---

## ANTHROPIC (5 Questions)

| Q#  | Question                                      | Your Answer                                                          | Notes/Blockers                                                                        |
| --- | --------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A1  | What is your Anthropic account email address? | **\*\*\*\***nstein@bizcadsystems.com**\*\*\*\***                     |                                                                                       |
| A2  | What is your password for Anthropic?          | [ENCRYPTED]stored in keepass                                         | Use actual password during automation                                                 |
| A3  | Do you have a phone number for 2FA?           | **\*\*\*\***949-394-3466**\*\*\*\***                                 | Is 2FA required/optional?                                                             |
| A4  | What is your Anthropic API Key?               | [GENERATED] "G:\repos\dendwriteai\ProjectSecrets\AnthropicApiKey.md" | Get from: https://console.anthropic.com/api_keys STORED IN UserSecrets.cs and Keepass |
| A5  | What is your plan tier?                       | **\*\*\*\***"Claude Pro ($20/month)**\*\*\*\***                      | Check billing page for current plan                                                   |

**Anthropic Blockers/Notes**:

✅ **RESOLVED**: Email delivery issues + API key rotation (2026-01-16)

**Blocker 1: Email Delivery Delay**

- **Issue**: Anthropic reported delivery delays with some email providers
- **Error message**: "We are experiencing delivery issues with some email providers and are working to resolve this. Check your junk/spam and quarantine folders and ensure that support@mail.anthropic.com is on your allowed senders list."
- **Solution**: Checked spam/junk folders, email eventually arrived with sign-in link
- **Verification**: Received code `685836` via email, verified on https://platform.claude.com/dashboard
- **Status**: RESOLVED - email eventually delivered after ~5 min delay
- **Automation impact**: Email verification step may have delays; allow 5-10 min buffer

**Blocker 2: API Key Rotation (Security)**

- **Issue**: Accidentally exposed API key in support ticket (Dec 2025)
- **Action taken**:
  1. Deleted compromised key from API Keys page
  2. Generated new API key (20260116)
  3. Stored securely in Keepass and UserSecrets.cs (QuestionManager)
- **Status**: RESOLVED - new key generated and stored
- **Automation impact**: API key must be rotated securely; never log or expose keys in error messages
- **Recommendation**: For customers, provide secure key storage guidance (environment variables, secrets manager)

**2FA Status**: 2FA appears **optional** on Anthropic (not mandatory for API access)

- Phone number provided but not validated for 2FA yet
- No indication 2FA would block automation at this stage

**Key Generation**: Instant (no delay)

- New key available immediately after generation
- No rate limiting observed

---

## VERCEL (6 Questions)

| Q#  | Question                                   | Your Answer                               | Notes/Blockers                              |
| --- | ------------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| V1  | What is your Vercel account email address? | nstein@bizcadsystems.com;bizcad@gmail.com |                                             |
| V2  | What is your password for Vercel?          | [ENCRYPTED] n/a                           | Use actual password during automation       |
| V3  | Do you have a GitHub account to connect?   | Yes                                       | It logs in auto with github                 |
| V4  | What is your Vercel API Token?             | [ENCRYPTED] blQdyVkUWS9iG9t7TsjvIVbj      | Get from: https://vercel.com/account/tokens |
| V5  | What is your desired Vercel project name?  | dendwriteai-prod                          | (e.g., dendwriteai-prod)                    |
| V6  | Do you want GitHub OAuth for user login?   | Yes                                       | For user auth in the app                    |
| V7  | What is your Vercel login                  | github                                    | auto login with GitHub                      |

**Vercel Blockers/Notes**:
Vercel internal id: oPgLuFW3DcSoDYygqDcGYEaF

- 2FA mandatory? **\_\_\_**
- Can create project via API? **\_\_\_**
- GitHub OAuth setup complexity? **\_\_\_**
- sms message verified.

---

## CONVEX (5 Questions)

| Q#  | Question                                   | Your Answer                        | Notes/Blockers                        |
| --- | ------------------------------------------ | ---------------------------------- | ------------------------------------- |
| C1  | What is your Convex account email address? | nstein@bizcadsystems.com           | auto login with GitHub                |
| C2  | What is your password for Convex?          | [ENCRYPTED]                        | Use actual password during automation |
| C3  | What is your desired Convex project name?  | dendwriteai-prod                   | (e.g., dendwriteai)                   |
| C4  | What is your Convex Deployment Key?        | [TBD - Get after project creation] | Get after project creation            |
| C5  | What is your Convex Production URL?        | [TBD - After deployment]           | Format: https://xxx.convex.cloud      |

**Convex Blockers/Notes**:
https://docs.convex.dev/auth
https://docs.convex.dev/auth/auth0#under-the-hood
https://docs.convex.dev/auth
https://docs.convex.dev/auth
Convex does not yet ship a built‑in authorization framework (like row‑level security). This is explicitly listed as a “future feature.” [Production status]
Instead, you implement authorization checks directly in your queries, mutations, and actions:
Check that the user is authenticated (e.g. ctx.auth.getUserIdentity() not null).
Enforce that the user can only access or modify data they’re allowed to. [Auth authorization; Backend best practices]
Example pattern from the docs: only the authenticated user can modify their own data, or only fetch rows where userId matches the current user. [Auth authorization; Application portal example]
The docs also recommend treating this as part of “hardening” your production app: always validate auth in backend functions, use roles/permissions stored in your own tables, and implement row-level checks in code. [Operational maturity]
https://stack.convex.dev/building-an-application-portal#authentication

- Account creation fast or delayed? **\_\_\_**
- Deployment key auto-generated or manual? **\_\_\_**

---

## GITHUB (6 Questions)

| Q#  | Question                                   | Your Answer                                                                   | Notes/Blockers         |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------- |
| G1  | Do you have a GitHub account?              | Yes                                                                           |                        |
| G2  | What is your GitHub username?              | bizcad                                                                        | (e.g., bizcad)         |
| G3  | What is your GitHub email address?         | nstein@bizcadsystems.com                                                      |                        |
| G4  | What is your GitHub Personal Access Token? | [ENCRYPTED]                                                                   | Scopes: repo, workflow |
| G5  | Do you have 2FA enabled on GitHub?         | Yes                                                                           | Major blocker if yes   |
| G6  | What is your repository name?              | [**\*\*\*\***\dendwriteai**\*\*\*\***](https://github.com/bizcad/dendwriteai) | (e.g., dendwriteai)    |

**GitHub Blockers/Notes**:

- 2FA blocks automation? **\_\_\_**
- PAT generation automated? **\_\_\_**

---

## DOMAIN (4 Questions)

| Q#  | Question                            | Your Answer                                                  | Notes/Blockers                       |
| --- | ----------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| D1  | Do you want to use a custom domain? | Yes                                                          | Phase 5 is async (optional)          |
| D2  | What is your custom domain name?    | **\*\*\*\***\dendwriteai.com**\*\*\*\*** and dendwriteai.net | (if yes to D1)                       |
| D3  | Which domain registrar do you use?  | **\*\*\*\**https://www.namesilo.com/login*\*\*\*\*\*\***     | (if yes to D1) GoDaddy/Namecheap/etc |
| D4  | Do you have nameserver access?      | Yes                                                          | (if yes to D1)                       |

**Domain Blockers/Notes**:

- DNS propagation time? **\_\_\_**
- Nameserver changes automated? **\_\_\_**
- Domain added 01/19/2026 11:15 PM Los Angeles time zone time.
- No DNS changes yet.
- No Custom email yet.

---

## DEPLOYMENT (4 Questions)

| Q#  | Question                                   | Your Answer                                              | Notes/Blockers                                |
| --- | ------------------------------------------ | -------------------------------------------------------- | --------------------------------------------- |
| DE1 | What is your target environment?           | Production                                               | Development/Staging/Production                |
| DE2 | Do you want production monitoring enabled? | No                                                       | Datadog/New Relic/etc?                        |
| DE3 | Do you want application logs enabled?      | No                                                       | CloudWatch/Datadog/etc?                       |
| DE4 | What is your NEXTAUTH_SECRET?              | [GENERATED] ZQsstItlAL30Nl5O0x8ri1Y6E2HK5BD9Zt/krfql3FY= | 32+ char random string - Generated 01/19/2026 |

**Deployment Blockers/Notes**:
= I do not know how to get a NEXTAUTH_SECRET

- Monitoring/logs vendor? **\_\_\_**
- NEXTAUTH_SECRET generation? **\_\_\_**

---

## SUMMARY

### Questions Successfully Answered

- [ ] All 27 answered
- [ ] 20+ answered with confidence
- [ ] <10 answered with blockers

### Major Blockers Discovered

1. ***
2. ***
3. ***

### Assumptions That Need Validation

1. ***
2. ***
3. ***

### Ready for Phase 1 Automation?

- [ ] Yes - all answers ready
- [ ] Partial - need to refine X questions
- [ ] No - too many blockers

---

## Next Steps

Once you complete this survey:

1. Review the blockers
2. Plan which questions to ask customers vs. which to guess
3. Decide if 2FA/CAPTCHA will force manual workflows
4. Prepare for Phase 1 (parallel account creation)
