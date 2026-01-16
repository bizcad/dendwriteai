# Setup Workflow Definition

## Overview

This document defines the setup automation workflow as a series of idempotent, parallelizable tasks. Each task is self-contained and can be executed independently or as part of the larger orchestration.

---

## Workflow Diagram (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> INIT: Start Setup
    
    INIT --> PHASE1: Phase 1: Account Creation
    
    PHASE1 --> ANTH: Anthropic Signup
    PHASE1 --> VERCEL: Vercel Signup
    PHASE1 --> CONVEX: Convex Signup
    PHASE1 --> GITHUB: GitHub Token
    
    ANTH --> ANTH_CHECK: Verify API Key
    ANTH_CHECK --> ANTH_OK: ✓ Ready
    ANTH_CHECK --> ANTH_FAIL: ✗ Failed
    ANTH_FAIL --> ANTH_RETRY{Retry?}
    ANTH_RETRY --> ANTH: Yes
    ANTH_RETRY --> MANUAL: No (Manual)
    
    VERCEL --> VERCEL_CHECK: Verify Token
    VERCEL_CHECK --> VERCEL_OK: ✓ Ready
    VERCEL_CHECK --> VERCEL_FAIL: ✗ Failed
    VERCEL_FAIL --> VERCEL_RETRY{Retry?}
    VERCEL_RETRY --> VERCEL: Yes
    VERCEL_RETRY --> MANUAL: No (Manual)
    
    CONVEX --> CONVEX_CHECK: Verify Key
    CONVEX_CHECK --> CONVEX_OK: ✓ Ready
    CONVEX_CHECK --> CONVEX_FAIL: ✗ Failed
    CONVEX_FAIL --> CONVEX_RETRY{Retry?}
    CONVEX_RETRY --> CONVEX: Yes
    CONVEX_RETRY --> MANUAL: No (Manual)
    
    GITHUB --> GITHUB_CHECK: Verify Token
    GITHUB_CHECK --> GITHUB_OK: ✓ Ready
    GITHUB_CHECK --> GITHUB_FAIL: ✗ Failed
    GITHUB_FAIL --> GITHUB_RETRY{Retry?}
    GITHUB_RETRY --> GITHUB: Yes
    GITHUB_RETRY --> MANUAL: No (Manual)
    
    ANTH_OK --> PHASE2
    VERCEL_OK --> PHASE2
    CONVEX_OK --> PHASE2
    GITHUB_OK --> PHASE2
    
    PHASE2 --> DOMAIN_Q: Phase 2: Config Gathering
    DOMAIN_Q --> DOMAIN_CHECK{Custom Domain?}
    DOMAIN_CHECK -->|Yes| DOMAIN_INFO: Collect Domain Info
    DOMAIN_CHECK -->|No| DOMAIN_SKIP: Skip Domain Config
    DOMAIN_INFO --> DEPLOY_CONFIG: Collect Deployment Config
    DOMAIN_SKIP --> DEPLOY_CONFIG
    
    DEPLOY_CONFIG --> PHASE3: Phase 3: Backend Deployment
    PHASE3 --> CONVEX_DEPLOY: Deploy Convex Backend
    CONVEX_DEPLOY --> CONVEX_LIVE: Get Production URL
    CONVEX_LIVE --> CONVEX_VERIFY: Verify Deployment
    CONVEX_VERIFY --> CONVEX_OK2{Success?}
    CONVEX_OK2 -->|Yes| PHASE4
    CONVEX_OK2 -->|No| CONVEX_FAIL2: Deployment Failed
    
    CONVEX_FAIL2 --> CONVEX_DEBUG: Check Logs
    CONVEX_DEBUG --> CONVEX_DEPLOY
    
    PHASE4 --> VERCEL_SETUP: Phase 4: Frontend Setup
    VERCEL_SETUP --> VERCEL_ENVARS: Set Environment Variables
    VERCEL_ENVARS --> VERCEL_BUILD: Deploy Frontend
    VERCEL_BUILD --> VERCEL_LIVE: Get Live URL
    VERCEL_LIVE --> VERCEL_VERIFY: Verify Deployment
    VERCEL_VERIFY --> VERCEL_OK3{Success?}
    VERCEL_OK3 -->|Yes| PHASE5
    VERCEL_OK3 -->|No| VERCEL_FAIL3: Deployment Failed
    
    VERCEL_FAIL3 --> VERCEL_DEBUG: Check Logs
    VERCEL_DEBUG --> VERCEL_BUILD
    
    PHASE5 --> DNS_Q: Phase 5: Domain Config
    DNS_Q --> DNS_CHECK{Custom Domain?}
    DNS_CHECK -->|Yes| DNS_UPDATE: Update Nameservers
    DNS_CHECK -->|No| DNS_SKIP: Skip DNS
    DNS_UPDATE --> DNS_WAIT: Wait for Propagation
    DNS_WAIT --> DNS_VERIFY: Verify DNS
    DNS_SKIP --> PHASE6
    DNS_VERIFY --> PHASE6: Phase 6: Testing
    
    PHASE6 --> TEST_AUTH: Test Auth Flow
    TEST_AUTH --> TEST_CAPTURE: Test Capture
    TEST_CAPTURE --> TEST_CLASSIFY: Test Classification
    TEST_CLASSIFY --> TEST_COMPLETE{All Tests Pass?}
    TEST_COMPLETE -->|Yes| COMPLETE: Setup Complete! ✓
    TEST_COMPLETE -->|No| TEST_FAIL: Tests Failed
    TEST_FAIL --> TEST_DEBUG: Review Error Logs
    TEST_DEBUG --> TEST_FIX: Fix Issue
    TEST_FIX --> TEST_AUTH
    
    MANUAL --> COMPLETE
    [*] --> COMPLETE
```

---

## Task Specification Format

Each task follows this structure:

```typescript
interface WorkflowTask {
  // Identification
  id: string;                          // Unique task identifier (e.g., "1.1-anthropic-signup")
  name: string;                        // Human-readable name
  phase: number;                       // Which phase (1-6)
  description: string;                 // What the task does
  
  // Timing & Dependencies
  estimatedDuration: string;           // How long it takes (e.g., "3-5 min")
  dependencies: string[];              // Task IDs this depends on (empty if none)
  parallelizableWith: string[];        // Task IDs that can run concurrently
  
  // Data Flow
  inputs: {                            // What the task needs
    questionIds: string[];             // Which questions from QuestionManager
    systemInputs: Record<string, any>;
  };
  outputs: {                           // What the task produces
    questionIds: string[];             // Questions answered/generated
    secrets: Record<string, string>;   // Encrypted values (API keys, tokens)
    config: Record<string, any>;       // Configuration values
  };
  
  // Execution
  automation: {
    type: 'automated' | 'manual' | 'hybrid';  // Playwright? User? Both?
    script?: string;                   // Reference to automation script
    userPrompt?: string;               // What to ask user if hybrid
  };
  
  // Error Handling
  errorHandling: {
    retryable: boolean;                // Can we retry this?
    retryCount: number;                // Max retries
    retryDelay: string;                // Delay between retries (exponential backoff)
    fallback: string;                  // What to do if all retries fail
  };
  
  // Validation
  validation: {
    checks: Array<{
      name: string;
      validate: (output: any) => Promise<boolean>;
    }>;
    errorMessage: string;
  };
  
  // Metadata
  tags: string[];                      // Labels (e.g., "account-creation", "blocker")
  documentation?: string;              // Link to detailed docs
}
```

---

## Detailed Task Specifications

### Phase 1: Parallel Account Creation

#### Task 1.1: Anthropic Account Signup

```json
{
  "id": "1.1-anthropic-signup",
  "name": "Create Anthropic Account & Get API Key",
  "phase": 1,
  "description": "Automated: Create Anthropic account, handle 2FA if needed, retrieve API key",
  
  "estimatedDuration": "3-5 minutes",
  "dependencies": [],
  "parallelizableWith": ["1.2-vercel-signup", "1.3-convex-signup", "1.4-github-token"],
  
  "inputs": {
    "questionIds": ["anthropic-email", "anthropic-password", "anthropic-phone"],
    "systemInputs": {
      "baseUrl": "https://console.anthropic.com"
    }
  },
  
  "outputs": {
    "questionIds": ["anthropic-api-key", "anthropic-plan-tier"],
    "secrets": {
      "anthropic-api-key": "STORE_ENCRYPTED"
    },
    "config": {
      "anthropic-account-created-timestamp": "ISO8601"
    }
  },
  
  "automation": {
    "type": "hybrid",
    "script": "scripts/signup/anthropic-signup.playwright.ts",
    "userPrompt": "If 2FA required, check your phone and enter the code in the browser window"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 3,
    "retryDelay": "exponential-10s",
    "fallback": "manual-browser-redirect"
  },
  
  "validation": {
    "checks": [
      {
        "name": "API Key Format",
        "validate": "key.startsWith('sk-ant-v0-')"
      },
      {
        "name": "API Key Valid",
        "validate": "await testAnthropicConnection(key)"
      }
    ],
    "errorMessage": "API key validation failed. Please verify it in Anthropic console."
  },
  
  "tags": ["account-creation", "api-key", "blocker"],
  "documentation": "SETUP-QUESTIONS.md#anthropic"
}
```

#### Task 1.2: Vercel Account Signup

```json
{
  "id": "1.2-vercel-signup",
  "name": "Create Vercel Account & Get API Token",
  "phase": 1,
  "description": "Automated: Create Vercel account, retrieve API token, optionally connect GitHub",
  
  "estimatedDuration": "3-5 minutes",
  "dependencies": [],
  "parallelizableWith": ["1.1-anthropic-signup", "1.3-convex-signup", "1.4-github-token"],
  
  "inputs": {
    "questionIds": ["vercel-email", "vercel-password", "vercel-use-github-oauth"],
    "systemInputs": {
      "baseUrl": "https://vercel.com"
    }
  },
  
  "outputs": {
    "questionIds": ["vercel-api-token", "vercel-project-name"],
    "secrets": {
      "vercel-api-token": "STORE_ENCRYPTED"
    },
    "config": {
      "vercel-account-created-timestamp": "ISO8601",
      "github-oauth-configured": "boolean"
    }
  },
  
  "automation": {
    "type": "hybrid",
    "script": "scripts/signup/vercel-signup.playwright.ts",
    "userPrompt": "If 2FA required or GitHub OAuth needed, complete in browser"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 3,
    "retryDelay": "exponential-10s",
    "fallback": "manual-browser-redirect"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Token Format",
        "validate": "token.startsWith('vercel_')"
      },
      {
        "name": "Token Valid",
        "validate": "await testVercelConnection(token)"
      }
    ],
    "errorMessage": "Vercel token validation failed. Please check account settings."
  },
  
  "tags": ["account-creation", "api-token", "blocker"],
  "documentation": "SETUP-QUESTIONS.md#vercel"
}
```

#### Task 1.3: Convex Account Signup

```json
{
  "id": "1.3-convex-signup",
  "name": "Create Convex Account & Get Deployment Key",
  "phase": 1,
  "description": "Automated: Create Convex Cloud account, retrieve deployment key for backend",
  
  "estimatedDuration": "3-5 minutes",
  "dependencies": [],
  "parallelizableWith": ["1.1-anthropic-signup", "1.2-vercel-signup", "1.4-github-token"],
  
  "inputs": {
    "questionIds": ["convex-email", "convex-password", "convex-project-name"],
    "systemInputs": {
      "baseUrl": "https://dashboard.convex.dev"
    }
  },
  
  "outputs": {
    "questionIds": ["convex-deployment-key"],
    "secrets": {
      "convex-deployment-key": "STORE_ENCRYPTED"
    },
    "config": {
      "convex-project-created-timestamp": "ISO8601"
    }
  },
  
  "automation": {
    "type": "hybrid",
    "script": "scripts/signup/convex-signup.playwright.ts",
    "userPrompt": "If email verification required, check inbox for confirmation link"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 3,
    "retryDelay": "exponential-10s",
    "fallback": "manual-browser-redirect"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Deployment Key Format",
        "validate": "key.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(key)"
      },
      {
        "name": "Deployment Key Valid",
        "validate": "await testConvexAuth(key)"
      }
    ],
    "errorMessage": "Convex deployment key validation failed. Please generate a new key."
  },
  
  "tags": ["account-creation", "deployment-key", "blocker"],
  "documentation": "SETUP-QUESTIONS.md#convex"
}
```

#### Task 1.4: GitHub Personal Access Token

```json
{
  "id": "1.4-github-token",
  "name": "Generate GitHub Personal Access Token",
  "phase": 1,
  "description": "Automated: Login to GitHub, generate PAT with repo + actions scopes",
  
  "estimatedDuration": "2-3 minutes",
  "dependencies": [],
  "parallelizableWith": ["1.1-anthropic-signup", "1.2-vercel-signup", "1.3-convex-signup"],
  
  "inputs": {
    "questionIds": ["github-username", "github-email"],
    "systemInputs": {
      "baseUrl": "https://github.com",
      "requiredScopes": ["repo", "workflow", "write:repo_hook"]
    }
  },
  
  "outputs": {
    "questionIds": ["github-personal-access-token", "github-repository-name"],
    "secrets": {
      "github-personal-access-token": "STORE_ENCRYPTED"
    },
    "config": {
      "github-2fa-enabled": "boolean",
      "github-token-created-timestamp": "ISO8601"
    }
  },
  
  "automation": {
    "type": "hybrid",
    "script": "scripts/signup/github-pat.playwright.ts",
    "userPrompt": "If 2FA required, enter code shown on GitHub"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 3,
    "retryDelay": "exponential-10s",
    "fallback": "manual-github-redirect"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Token Format",
        "validate": "token.startsWith('ghp_') || token.startsWith('github_pat_')"
      },
      {
        "name": "Token Valid",
        "validate": "await testGitHubConnection(token)"
      }
    ],
    "errorMessage": "GitHub token validation failed. Verify token scopes in GitHub settings."
  },
  
  "tags": ["account-creation", "api-token", "optional"],
  "documentation": "SETUP-QUESTIONS.md#github"
}
```

---

### Phase 2: Configuration Gathering

#### Task 2.1: Domain Configuration (Conditional)

```json
{
  "id": "2.1-domain-config",
  "name": "Gather Custom Domain Information",
  "phase": 2,
  "description": "Conditional: Ask about custom domain, registrar, nameserver access",
  
  "estimatedDuration": "2-3 minutes",
  "dependencies": ["1.1-anthropic-signup", "1.2-vercel-signup", "1.3-convex-signup", "1.4-github-token"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["domain-use-custom"],
    "systemInputs": {}
  },
  
  "outputs": {
    "questionIds": ["domain-name", "domain-registrar", "domain-has-access"],
    "secrets": {},
    "config": {
      "domain-custom": "boolean",
      "domain-registrar-type": "string"
    }
  },
  
  "automation": {
    "type": "manual",
    "userPrompt": "Do you want to use a custom domain? (yes/no)"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 1,
    "retryDelay": "manual",
    "fallback": "skip-domain-config"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Domain Format (if custom)",
        "validate": "/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/.test(domain) || !useCustom"
      }
    ],
    "errorMessage": "Invalid domain format. Please enter a valid domain (e.g., myapp.com)."
  },
  
  "tags": ["configuration", "conditional", "manual"],
  "documentation": "SETUP-QUESTIONS.md#domain"
}
```

#### Task 2.2: Deployment Configuration

```json
{
  "id": "2.2-deployment-config",
  "name": "Gather Deployment & Environment Settings",
  "phase": 2,
  "description": "Manual: Ask about target environment, monitoring, logging preferences",
  
  "estimatedDuration": "1-2 minutes",
  "dependencies": ["2.1-domain-config"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": [],
    "systemInputs": {}
  },
  
  "outputs": {
    "questionIds": ["deployment-environment", "monitoring-enabled", "logging-enabled"],
    "secrets": {
      "nextauth-secret": "GENERATED"
    },
    "config": {
      "environment": "development|staging|production",
      "monitoring": "boolean",
      "logging": "boolean"
    }
  },
  
  "automation": {
    "type": "manual",
    "userPrompt": "Select your target environment and monitoring preferences"
  },
  
  "errorHandling": {
    "retryable": false,
    "retryCount": 0,
    "retryDelay": "none",
    "fallback": "use-defaults"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Valid Environment",
        "validate": "['development', 'staging', 'production'].includes(env)"
      }
    ],
    "errorMessage": "Invalid environment. Please select development, staging, or production."
  },
  
  "tags": ["configuration", "manual"],
  "documentation": "SETUP-QUESTIONS.md#deployment"
}
```

---

### Phase 3: Backend Deployment

#### Task 3.1: Deploy Convex Backend

```json
{
  "id": "3.1-convex-deploy",
  "name": "Deploy Convex Backend to Production",
  "phase": 3,
  "description": "Automated: Run 'convex deploy', verify deployment, get production URL",
  
  "estimatedDuration": "5-7 minutes",
  "dependencies": ["1.3-convex-signup", "2.2-deployment-config"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["convex-deployment-key"],
    "systemInputs": {
      "repoPath": ".",
      "convexPath": "./convex"
    }
  },
  
  "outputs": {
    "questionIds": ["convex-production-url"],
    "secrets": {},
    "config": {
      "convex-deployed-timestamp": "ISO8601",
      "convex-version": "string"
    }
  },
  
  "automation": {
    "type": "automated",
    "script": "scripts/deploy/convex-deploy.ts"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 3,
    "retryDelay": "exponential-15s",
    "fallback": "manual-deploy-instructions"
  },
  
  "validation": {
    "checks": [
      {
        "name": "URL Format",
        "validate": "url.includes('.convex.cloud')"
      },
      {
        "name": "Deployment Healthy",
        "validate": "await testConvexDeployment(url)"
      }
    ],
    "errorMessage": "Convex deployment failed. Check logs above for details."
  },
  
  "tags": ["deployment", "backend", "blocker"],
  "documentation": "PRODUCTION_DEPLOYMENT.md#convex"
}
```

---

### Phase 4: Frontend Deployment

#### Task 4.1: Create Vercel Project & Set Environment Variables

```json
{
  "id": "4.1-vercel-project-setup",
  "name": "Create Vercel Project & Configure Environment",
  "phase": 4,
  "description": "Automated: Create Vercel project, set all required env vars including Convex URL",
  
  "estimatedDuration": "2-3 minutes",
  "dependencies": ["1.2-vercel-signup", "3.1-convex-deploy"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["vercel-api-token", "vercel-project-name", "convex-production-url"],
    "systemInputs": {
      "githubToken": "from 1.4-github-token",
      "repoUrl": "derived from github-repository-name"
    }
  },
  
  "outputs": {
    "questionIds": ["vercel-project-id"],
    "secrets": {},
    "config": {
      "vercel-env-vars-set": "boolean",
      "vercel-github-connected": "boolean"
    }
  },
  
  "automation": {
    "type": "automated",
    "script": "scripts/deploy/vercel-project-setup.ts"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 2,
    "retryDelay": "exponential-10s",
    "fallback": "manual-vercel-setup"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Project Created",
        "validate": "projectId && projectId.length > 0"
      },
      {
        "name": "Env Vars Set",
        "validate": "await verifyVercelEnvVars(projectId, requiredVars)"
      }
    ],
    "errorMessage": "Vercel project setup failed. Verify credentials in Vercel dashboard."
  },
  
  "tags": ["deployment", "frontend", "blocker"],
  "documentation": "PRODUCTION_DEPLOYMENT.md#vercel"
}
```

#### Task 4.2: Deploy Frontend to Vercel

```json
{
  "id": "4.2-vercel-deploy",
  "name": "Deploy Frontend to Vercel",
  "phase": 4,
  "description": "Automated: Trigger Vercel build & deployment from main branch",
  
  "estimatedDuration": "3-5 minutes",
  "dependencies": ["4.1-vercel-project-setup"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["vercel-api-token", "vercel-project-id"],
    "systemInputs": {
      "branch": "main"
    }
  },
  
  "outputs": {
    "questionIds": ["vercel-live-url"],
    "secrets": {},
    "config": {
      "vercel-deployed-timestamp": "ISO8601",
      "vercel-build-time": "string"
    }
  },
  
  "automation": {
    "type": "automated",
    "script": "scripts/deploy/vercel-deploy.ts"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 2,
    "retryDelay": "exponential-15s",
    "fallback": "manual-vercel-deploy"
  },
  
  "validation": {
    "checks": [
      {
        "name": "URL Format",
        "validate": "url.includes('vercel.app') || url.includes(customDomain)"
      },
      {
        "name": "Frontend Responds",
        "validate": "await testFrontendHealthy(url)"
      }
    ],
    "errorMessage": "Vercel deployment failed. Check build logs in Vercel dashboard."
  },
  
  "tags": ["deployment", "frontend", "blocker"],
  "documentation": "PRODUCTION_DEPLOYMENT.md#vercel"
}
```

---

### Phase 5: Domain Configuration

#### Task 5.1: Configure Custom Domain DNS

```json
{
  "id": "5.1-dns-config",
  "name": "Configure Custom Domain DNS (Conditional)",
  "phase": 5,
  "description": "Manual + Async: Guide user to update nameservers, verify DNS propagation",
  
  "estimatedDuration": "5 min setup + 2-48h propagation",
  "dependencies": ["2.1-domain-config", "4.2-vercel-deploy"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["domain-name", "domain-registrar", "vercel-live-url"],
    "systemInputs": {
      "nameserverTargets": "Vercel's nameservers (auto-generated)"
    }
  },
  
  "outputs": {
    "questionIds": ["domain-propagated"],
    "secrets": {},
    "config": {
      "dns-configured-timestamp": "ISO8601",
      "dns-propagation-check-timestamp": "ISO8601"
    }
  },
  
  "automation": {
    "type": "manual",
    "userPrompt": "Update your domain registrar's nameservers to point to Vercel"
  },
  
  "errorHandling": {
    "retryable": false,
    "retryCount": 0,
    "retryDelay": "none",
    "fallback": "use-vercel-url-for-now"
  },
  
  "validation": {
    "checks": [
      {
        "name": "DNS Propagated",
        "validate": "await checkDNSPropagation(domainName)"
      }
    ],
    "errorMessage": "DNS not yet propagated. This is normal - can take 2-48 hours. You can use the Vercel URL in the meantime."
  },
  
  "tags": ["domain", "manual", "async", "optional"],
  "documentation": "SETUP-QUESTIONS.md#domain"
}
```

---

### Phase 6: End-to-End Testing & Validation

#### Task 6.1: Comprehensive System Testing

```json
{
  "id": "6.1-e2e-testing",
  "name": "End-to-End System Testing",
  "phase": 6,
  "description": "Automated: Run auth flow, capture, classification tests",
  
  "estimatedDuration": "5-10 minutes",
  "dependencies": ["4.2-vercel-deploy"],
  "parallelizableWith": [],
  
  "inputs": {
    "questionIds": ["vercel-live-url", "anthropic-api-key"],
    "systemInputs": {
      "testEmail": "test-setup-{timestamp}@example.com",
      "testPassword": "generated-strong-password"
    }
  },
  
  "outputs": {
    "questionIds": [],
    "secrets": {},
    "config": {
      "tests-passed": "boolean",
      "auth-working": "boolean",
      "capture-working": "boolean",
      "classification-working": "boolean",
      "test-timestamp": "ISO8601"
    }
  },
  
  "automation": {
    "type": "automated",
    "script": "scripts/test/e2e-tests.playwright.ts"
  },
  
  "errorHandling": {
    "retryable": true,
    "retryCount": 2,
    "retryDelay": "exponential-20s",
    "fallback": "manual-testing-guide"
  },
  
  "validation": {
    "checks": [
      {
        "name": "Auth Flow",
        "validate": "signupAndLogin successful"
      },
      {
        "name": "Capture Submission",
        "validate": "can submit and retrieve capture"
      },
      {
        "name": "Classification",
        "validate": "classification processes without error"
      }
    ],
    "errorMessage": "Tests failed. Review error logs to diagnose."
  },
  
  "tags": ["testing", "validation", "blocker"],
  "documentation": "PRODUCTION_DEPLOYMENT.md#testing"
}
```

---

## Workflow Orchestration Logic

```typescript
interface WorkflowOrchestrator {
  // Execute task with dependency checking
  executeTask(taskId: string): Promise<TaskResult>;
  
  // Check if task dependencies are met
  canExecuteTask(taskId: string): boolean;
  
  // Execute multiple tasks in parallel
  executeParallel(taskIds: string[]): Promise<TaskResult[]>;
  
  // Execute tasks sequentially
  executeSequential(taskIds: string[]): Promise<TaskResult[]>;
  
  // Store outputs in QuestionManager
  saveOutputs(taskId: string, outputs: TaskOutput): Promise<void>;
  
  // Retrieve task result
  getTaskResult(taskId: string): Promise<TaskResult | null>;
  
  // Handle task failure with retry/fallback logic
  handleTaskFailure(taskId: string, error: Error): Promise<void>;
}

// Phase execution example
async function runFullSetup() {
  // Phase 1: Run 4 tasks in parallel
  await orchestrator.executeParallel([
    "1.1-anthropic-signup",
    "1.2-vercel-signup", 
    "1.3-convex-signup",
    "1.4-github-token"
  ]);
  
  // Phase 2: Run 2 tasks sequentially
  await orchestrator.executeSequential([
    "2.1-domain-config",
    "2.2-deployment-config"
  ]);
  
  // Phase 3: Backend deploy
  await orchestrator.executeTask("3.1-convex-deploy");
  
  // Phase 4: Frontend setup and deploy
  await orchestrator.executeSequential([
    "4.1-vercel-project-setup",
    "4.2-vercel-deploy"
  ]);
  
  // Phase 5: DNS (async, optional)
  if (customDomainEnabled) {
    orchestrator.executeTask("5.1-dns-config"); // Fire and forget
  }
  
  // Phase 6: Testing
  await orchestrator.executeTask("6.1-e2e-testing");
  
  console.log("✓ Setup Complete!");
}
```

---

## Integration Points with QuestionManager

1. **Question Retrieval**: Load questions from QuestionManager by ID
2. **Answer Validation**: Use QuestionManager's validation rules
3. **Answer Storage**: Save task outputs as answers in SurveyAnswers
4. **Conditional Logic**: Use QuestionManager's ConditionalLogic field for branching
5. **Audit Trail**: All steps logged with timestamps and user info
6. **Encryption**: Secrets stored encrypted per QuestionManager security model

