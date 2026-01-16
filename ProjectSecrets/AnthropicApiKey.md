## Prompt
I am trying to call into an Anthropic model from a convex function. Claude is running locally to my machine. Convex wants my api key.  When I put it into my code it can see it, but not when I put it into an environment variable.  If I put it in code, github us smart enough to recognize that it is a dangerous value and rejects my commit. (thank you github).  Which environment variable can canvas see that can read that api key so I can make my call into the model?

## Answer  
Hey Nick — a couple of key Convex/Claude gotchas are biting you here. Short version:

*   **Convex functions don’t read your laptop’s shell env vars.** They run **on Convex’s servers** (unless you’re using a *local* Convex deployment), so any secrets must be set as **Convex deployment environment variables** and read with `process.env` *inside* your Convex function. [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables), [\[docs.convex.dev\]](https://docs.convex.dev/functions)
*   For Anthropic, the conventional variable name is **`ANTHROPIC_API_KEY`**. [\[support.claude.com\]](https://support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code), [\[aider.chat\]](https://aider.chat/docs/llms/anthropic.html)
*   Also: Convex functions can only call external services from an **`action`** (not a query/mutation). [\[docs.convex.dev\]](https://docs.convex.dev/functions)

Below is a crisp setup that avoids committing secrets and works in both dev and prod.

***

## 1) Put your key in Convex’s **deployment** environment

**Option A — CLI (good for CI, avoids the dashboard):**

```bash
# Dev deployment
npx convex env set ANTHROPIC_API_KEY sk-ant-...

# Production deployment
npx convex env set ANTHROPIC_API_KEY sk-ant-... --prod
```

You can list or fetch them later:

```bash
npx convex env list
npx convex env get ANTHROPIC_API_KEY
```

These are stored by Convex and exposed at runtime as `process.env.ANTHROPIC_API_KEY` to your functions. [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables), [\[deepwiki.com\]](https://deepwiki.com/get-convex/convex-js/4.5-environment-management)

**Option B — Dashboard (point-and-click):**  
Open your project → **Settings → Environment Variables** → Add `ANTHROPIC_API_KEY` and its value. Variables become available to running functions immediately. [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables), [\[deepwiki.com\]](https://deepwiki.com/get-convex/stripe/2.3-environment-configuration)

> Why your local `.env` didn’t work: Convex’s server-side runtime doesn’t see your workstation’s env. Only variables configured in the deployment (via CLI/dashboard) are available to functions. [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables)

***

## 2) Use an **Action** to call Anthropic (server-side)

Create an action in `convex/anthropic.ts`:

```ts
// convex/anthropic.ts
import { action } from "convex/server";

export const callClaude = action({
  args: { prompt: "string" },
  handler: async (ctx, { prompt }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in Convex env");

    // Standard Anthropic Messages API request:
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return data;
  },
});
```

Why an **action**: only actions can make external `fetch` calls; queries/mutations are restricted to the Convex DB. [\[docs.convex.dev\]](https://docs.convex.dev/functions)

***

## 3) Call it from your client

```ts
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export default function AskClaude() {
  const callClaude = useAction(api.anthropic.callClaude);
  // ...
  // await callClaude({ prompt: "Your text" });
}
```

No keys go to the browser; they stay server-side in Convex.

***

## Important clarification about “Claude running locally”

If you truly mean “Claude is running locally on my machine” (e.g., `localhost:port`), **Convex cloud cannot reach your localhost**. You have three options:

1.  **Use Anthropic’s hosted API** as shown above (recommended).
2.  **Run a local Convex deployment** (`npx convex dev --local`) so your action and your local Claude are on the same machine/network during dev. (Not for production.) [\[docs.convex.dev\]](https://docs.convex.dev/cli/local-deployments)
3.  **Expose your local Claude endpoint** to the public internet (ngrok, Cloudflare Tunnel) and lock it down. (Security-heavy; not recommended unless you know exactly what you’re doing.)

***

## Why GitHub blocked your commit (and how this flow avoids it)

GitHub’s secret scanning recognizes Anthropic keys and will block/alert on commits containing them. By storing the key in Convex’s deployment env and reading via `process.env`, your repo contains **no plaintext secrets**, so commits pass cleanly. (Anthropic itself also recommends env/secret storage rather than in-code literals.) [\[support.claude.com\]](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure)

***

## Quick checklist & pitfalls

*   [ ] Set `ANTHROPIC_API_KEY` in **Convex deployment env** (dev & prod). [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables)
*   [ ] Use an **action** for external API calls. [\[docs.convex.dev\]](https://docs.convex.dev/functions)
*   [ ] Don’t expect `localhost` services to be reachable from Convex cloud. Use hosted Anthropic API, a local Convex deployment, or tunnel. [\[docs.convex.dev\]](https://docs.convex.dev/cli/local-deployments)
*   [ ] Never commit keys; let Convex env hold them. [\[docs.convex.dev\]](https://docs.convex.dev/production/environment-variables), [\[support.claude.com\]](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure)

***

If you paste a small snippet of your current Convex function (redact keys), I’ll map it 1:1 to an `action` with `process.env.ANTHROPIC_API_KEY` and get you unblocked. Also, do you need this to work with **Claude Code** as well, or only plain Anthropic API calls from Convex? (If you’re mixing in Claude Code tooling, the env var is still `ANTHROPIC_API_KEY`.) [\[support.claude.com\]](https://support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code)
