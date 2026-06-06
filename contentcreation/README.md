# Season Content

Vite + React app for generating linked short-form episode scripts with Claude.

## Local development

```bash
cd contentcreation   # inner app folder (where package.json lives)
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

### 1. Project settings (pick ONE option)

This repo has a **nested layout** (`contentcreation/contentcreation/`). A 404 usually means Vercel is pointing at the wrong folder.

**Option A — Deploy from repo root (recommended, zero config)**

Leave **Root Directory** empty (`.`). The root `vercel.json` builds the inner app automatically.

| Setting | Value |
|---------|--------|
| **Root Directory** | *(leave blank)* |
| **Build / Output** | Set by root `vercel.json` |

**Option B — Deploy from inner folder**

| Setting | Value |
|---------|--------|
| **Root Directory** | `contentcreation` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

Do **not** mix both — if you set Root Directory to `contentcreation`, ignore the outer `vercel.json`.

### 2. Environment variables

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Variable | Required | Notes |
|----------|----------|--------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key. Never commit this. |

Apply to **Production**, **Preview**, and **Development**.

### 3. API route (production)

Locally, `/api/claude` is handled by Vite middleware. On Vercel it runs as a serverless function:

- `api/claude.ts` — proxies requests to Anthropic (keeps your API key server-side)

### 4. Deploy

**Option A — GitHub**

1. Push the repo to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import the repo
3. Set Root Directory to `contentcreation`
4. Add `ANTHROPIC_API_KEY`
5. Deploy

**Option B — CLI**

```bash
cd contentcreation
npm i -g vercel
vercel login
vercel
# Follow prompts; set root to this folder if asked
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

### 5. After deploy

- App URL serves the React SPA from `dist`
- `POST /api/claude` must return JSON `{ content: "..." }` for script generation to work
- Episode generation makes multiple API calls (1 season plan + 1 per episode); allow ~60s per call on Pro plans

### Troubleshooting

| Issue | Fix |
|-------|-----|
| `ANTHROPIC_API_KEY is not set` | Add env var in Vercel and redeploy |
| **404 NOT_FOUND** on homepage | Root Directory wrong — use Option A (blank) or Option B (`contentcreation`) |
| 404 on page refresh | `vercel.json` rewrites send routes to `index.html` |
| 404 on `/api/claude` | `ANTHROPIC_API_KEY` missing, or `api/claude.ts` not at deploy root |
| Build fails | Run `cd contentcreation && npm run build` locally first |
