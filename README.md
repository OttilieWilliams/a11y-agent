# a11y-agent

AI-powered accessibility auditing for any web project. Runs axe-core against your app on every PR and posts findings as a comment. Reply `/fix <category>` to have a Claude agent push fixes directly to the branch.

## How it works

1. PR is opened → GitHub Actions audits the running app with Playwright + axe-core
2. Findings are grouped by category and posted as a PR comment
3. Reply `/fix contrast` (or `/fix all`) on the comment
4. The fix agent reads your source files, applies minimal targeted fixes, and commits directly to the PR branch
5. Review the deploy preview — if the fix doesn't look right, reply `/revert-a11y` to undo it

## Quick start

**1. Add a config file to your project root:**

```json
{
  "startCommand": "npm run dev",
  "port": 3000,
  "paths": ["/", "/about", "/contact"],
  "wcag": "AA",
  "mode": "all"
}
```

For a static HTML/CSS site:
```json
{
  "startCommand": "npx serve . -l 3000",
  "port": 3000,
  "paths": ["/"],
  "wcag": "AA",
  "mode": "all"
}
```

**2. Copy the workflow templates into your project:**

```
.github/
  workflows/
    audit.yml   ← copy from workflow-templates/audit.yml
    fix.yml     ← copy from workflow-templates/fix.yml
```

**3. Add secrets to your GitHub repo** (Settings → Secrets and variables → Actions):

| Secret | Required for |
|---|---|
| `ANTHROPIC_API_KEY` | Fix agent |
| `GITHUB_TOKEN` | Auto-provided by Actions |

That's it. Open a PR and the audit runs automatically.

## Config options

| Option | Default | Description |
|---|---|---|
| `startCommand` | — | Command to start your app. Omit if the app is already running. |
| `port` | `3000` | Port to wait for before auditing. |
| `paths` | `["/"]` | URL paths to audit. |
| `wcag` | `"AA"` | WCAG conformance level: `"A"`, `"AA"`, or `"AAA"`. |
| `mode` | `"all"` | `"all"` reports every violation. `"new-only"` reports only violations not in the baseline (see below). |
| `extraRules` | `[]` | Additional axe-core tag names to include, e.g. `["best-practice"]` for checks beyond WCAG. |
| `aliases` | — | Custom shorthand names for axe categories (see below). |

## Commands

Run locally with `npx a11y-agent <command>`.

| Command | Description |
|---|---|
| `audit` | Run the audit and print findings to the terminal. |
| `baseline` | Write all current violations to `.a11y-baseline.json`. |
| `fix --category=<name>` | Run the audit silently, then apply AI fixes for the given category. |
| `revert --commit=<sha>` | Revert a specific fix commit and push. |

## Reverting a fix

The fix agent resolves violations but cannot verify the visual result. We recommend checking your deploy preview before merging to make sure the changes look right. If you want to undo the fix:

**From the PR comment** — reply `/revert-a11y` and the workflow will automatically revert the most recent fix commit and push.

**From the terminal:**
```
npx a11y-agent revert --commit=<sha>
```

Fix commits are labelled `[a11y-agent]` in the message, making them easy to find in the git log.

## Fix categories

Use these names with `/fix <category>` or `--category=<name>`:

| Name | Covers |
|---|---|
| `contrast` | Colour contrast failures |
| `alt-text` | Missing or empty image alt attributes |
| `labels` | Form inputs without labels |
| `aria` | Invalid ARIA roles and attributes |
| `structure` | Heading hierarchy, landmark issues |
| `keyboard` | Keyboard accessibility |
| `tables` | Table markup |
| `all` | Everything |

You can define additional aliases in `.a11y.config.json`:
```json
{
  "aliases": {
    "forms": "cat.forms"
  }
}
```

## Adopting on a large existing project

If your project already has accessibility debt, use `new-only` mode to only report violations introduced by new PRs:

1. Set `"mode": "new-only"` in `.a11y.config.json`
2. Run `npx a11y-agent baseline` locally — generates `.a11y-baseline.json` capturing all current violations
3. Commit `.a11y-baseline.json`
4. From this point, the audit only flags new violations

As you fix existing debt, re-run `npx a11y-agent baseline` to shrink the baseline and lock in the improvement.

## Design intent (optional)

Create an `ACCESSIBILITY.md` file in your project root to give the fix agent context about your design system — colour palette, minimum font sizes, which colour combinations are intentional. This helps it make better choices when fixing contrast issues.

```markdown
- Primary text colour: #161412 on light backgrounds
- Cream (#f5ecd6) is used as text on dark backgrounds only
- Tangerine (#ef6a2c) and moss (#6b8b3f) backgrounds require dark ink text
- Minimum font size for labels is 11px
```

## Stack examples

| Stack | `startCommand` |
|---|---|
| Static HTML/CSS | `npx serve . -l 3000` |
| Vite | `npx vite --port 3000` |
| Next.js | `npm run dev` |
| Create React App | `npm start` |
| Vue CLI | `npm run serve` |

For non-JS backends (Django, Rails, etc.), start your server separately and omit `startCommand` — the audit will connect to whatever is already running on the configured port.

## Requirements

- Node.js 18+
- An Anthropic API key (for the fix agent)
