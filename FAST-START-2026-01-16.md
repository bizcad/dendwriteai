# 🚀 Tomorrow's Fast Start TODO (2026-01-16)

## ✅ **Phase: Build & Test Playwright Automation Scripts**

**Goal**: Implement first Playwright scripts for signup automation + begin QuestionManager integration

---

## 🎯 **Morning Tasks (Priority 1 - Do First)**

### Quick Review of Yesterday's Deliverables (30 min)

- [ ] **Confirm all specifications understood**
  - Quick scan of SETUP-SPECIFICATIONS-INDEX.md
  - Run Setup-Workflow-Notebook.ipynb if not done yesterday
  - Verify you understand: 27 questions, 10 tasks, 6 phases, 27-32 min critical path

- [ ] **Confirm VALIDATION-ANSWERS.md completed**
  - Do you have answers to:
    - [ ] CAPTCHA locations (Anthropic? Vercel? GitHub?)
    - [ ] 2FA blocking points
    - [ ] Email verification delays
    - [ ] "Account already exists" handling
  - If not, spend 15 min doing quick research on each platform

---

## 💻 **Late Morning Tasks (Priority 2 - Playwright Setup)**

### Create Playwright Project (60 min)

- [ ] **Initialize Playwright in project**

  ```bash
  # In workspace root
  npm init -y
  npm install --save-dev @playwright/test
  npx playwright install
  ```

- [ ] **Create project structure**

  ```
  scripts/
  ├── signup/
  │   ├── playwright.config.ts       (Playwright configuration)
  │   ├── anthropic-signup.spec.ts   (1.1 automation script)
  │   ├── vercel-signup.spec.ts      (1.2 automation script - WIP)
  │   ├── convex-signup.spec.ts      (1.3 automation script - WIP)
  │   └── github-pat.spec.ts         (1.4 automation script - WIP)
  └── utils/
      ├── error-handling.ts          (Error recovery)
      ├── browser-pool.ts            (Manage 4 concurrent browsers)
      └── question-manager-sync.ts   (QuestionManager integration - WIP)
  ```

- [ ] **Create playwright.config.ts**
  - Set timeout: 30s per task
  - Enable headless: false (so you can see what's happening)
  - Set viewport: 1280x720
  - Save screenshots on failure: `test-results/`
  - Save videos: `test-results/videos/`

- [ ] **Create browser-pool.ts utility**
  - Manage up to 4 concurrent browser instances (Phase 1 parallel tasks)
  - Track busy/available browsers
  - Support: acquireBrowser(), releaseBrowser()
  - Clean up: closeBrowsers() on shutdown

---

## 🔧 **Afternoon Tasks (Priority 3 - First Script)**

### Build Script 1.1: Anthropic Signup (120 min)

- [ ] **anthropic-signup.spec.ts structure**

  ```typescript
  test("1.1 - Anthropic Account Signup & Get API Key", async ({ page }) => {
    // 1. Navigate to console.anthropic.com
    // 2. Handle cookie consent if appears
    // 3. Click "Sign Up" button
    // 4. Fill email input (from QuestionManager)
    // 5. Fill password input (from QuestionManager)
    // 6. Click signup submit
    // 7. If 2FA appears:
    //    - Screenshot
    //    - Pause with message: "Complete 2FA in browser, then press Enter"
    //    - Wait for user input
    // 8. If email verification required:
    //    - Pause with message: "Check email, click verification link, then press Enter"
    //    - Wait for user input
    // 9. Navigate to API keys page (https://console.anthropic.com/account/keys)
    // 10. Extract API key from page
    // 11. Return: { apiKey: "sk-ant-v0-...", email: "...", timestamp: ISO8601 }
  });
  ```

- [ ] **Error handling for common obstacles**
  - [ ] What if: CAPTCHA appears? (screenshot + pause)
  - [ ] What if: "Email already registered"? (clear state and retry with new email)
  - [ ] What if: Rate limited? (wait & retry)
  - [ ] What if: Element not found? (page UI changed - screenshot & halt)

- [ ] **Test locally**
  - Run: `npm test -- anthropic-signup.spec.ts`
  - Use staging/throwaway Anthropic account (not your real one)
  - Test both paths:
    - [ ] Success path (full signup flow)
    - [ ] 2FA path (if enabled on test account)

- [ ] **Document findings**
  - How long did signup actually take? (record in VALIDATION-ANSWERS.md)
  - Where were the waiting points? (DOM waits, network waits)
  - Did CAPTCHA or 2FA block automation? (note in error-handling.ts)
  - What selectors are fragile? (might change) - mark in code comments

---

## 📊 **Late Afternoon Tasks (Priority 4 - Integration Start)**

### Begin QuestionManager Integration (60 min)

- [ ] **Create question-manager-sync.ts**
  - Function: `getQuestionAnswers(topic: string)` → fetch from QuestionManager
  - Function: `saveAnswers(topic: string, answers: object)` → save to QuestionManager encrypted
  - For now: Mock implementation (hardcoded test data) while script debugging
  - Add TODO: "Switch from mock to real QuestionManager API when endpoint ready"

- [ ] **Update anthropic-signup.spec.ts to use questions**

  ```typescript
  // Instead of hardcoded email/password
  const answers = await getQuestionAnswers("Anthropic");
  const email = answers["anthropic-email"];
  const password = answers["anthropic-password"];
  ```

- [ ] **Plan for questions storage**
  - Where will passwords/tokens be stored during script execution?
  - Temporary in-memory? Environment variables? QuestionManager?
  - Document approach in scripts/utils/question-manager-sync.ts

---

## 📝 **End of Day Checkpoint**

Before you leave, commit your work:

```bash
git add -A
git commit -m "feat: Implement Playwright setup automation scripts

- Initialize Playwright project with configuration
- Create project structure (scripts/signup/, scripts/utils/)
- Implement 1.1-anthropic-signup.spec.ts (mostly complete)
- Build browser-pool.ts for concurrent browser management
- Add error-handling.ts framework for CAPTCHA/2FA/rate limits
- Create question-manager-sync.ts (mock implementation)
- Document findings: timing, obstacles, fragile selectors

Tested: anthropic-signup against staging account
Next: Test 1.2-1.4 scripts, then full parallel execution"
```

---

## 🎯 **Success Criteria for Tomorrow**

You'll know you're done when:

✅ Playwright initialized in project
✅ Project structure created (scripts/signup/ + utils)
✅ Script 1.1 written and tested (against real Anthropic)
✅ Error handling framework documented
✅ Browser pool utility created
✅ QuestionManager integration mocked out
✅ Actual timing measurements taken
✅ All findings documented in VALIDATION-ANSWERS.md
✅ Code committed to GitHub

**Expected time: 5-6 hours**

---

## 📌 **If You Get Stuck**

- **Playwright selector not working?** → Use Playwright Inspector: `npx playwright codegen` on the page
- **Page won't load?** → Check if site has rate limiting (might need VPN or proxy)
- **2FA blocking?** → Use Playwright's `pause()` to freeze and wait for user
- **CAPTCHA appears?** → Screenshot + pause (manual solve required)
- **Email verification?** → Pause and wait for user to click verification link

---

## 🔗 **Key Files for Today**

```
VALIDATION-ANSWERS.md                 ← Must have from yesterday
scripts/signup/
  ├── playwright.config.ts            ← Create
  ├── anthropic-signup.spec.ts        ← Create & test
  └── vercel-signup.spec.ts           ← Create (WIP for later)
scripts/utils/
  ├── browser-pool.ts                 ← Create
  ├── error-handling.ts               ← Create
  └── question-manager-sync.ts        ← Create (mock for now)
```

---

## 💡 **Mental Model for Today**

Think of it like this:

**Yesterday**: Finished comprehensive specifications (the blueprint)  
**Today**: Build first working scripts (Playwright + Anthropic signup)
**Tomorrow**: Test scripts against all platforms + Vercel/Convex/GitHub
**Next week**: Full orchestrator + parallel execution + end-to-end

Today is where theory meets reality. You'll discover:

- What actually works with Playwright
- Where manual intervention is needed (2FA, CAPTCHA, email)
- Real timing vs estimates
- Fragile selectors that might break

This is your **hands-on validation**.

---

**Good luck! Document everything you learn about the real signup flows.** 🚀

**Pro tip**: Keep a window open with the signup page + Playwright Inspector side-by-side. When a selector fails, use Inspector to find the right one in real-time.
