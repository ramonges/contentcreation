# Season Content

Vite + React app for generating linked short-form episode scripts with Claude.

## Project structure

Everything lives at the **repo root**:

```
├── api/claude.ts      # Vercel serverless function
├── app/               # (legacy Next scaffold — unused)
├── src/               # React app entry
├── components/
├── lib/
├── package.json
├── vercel.json
└── .env               # local only — not deployed
```

## Local development

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

### 1. Project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | *(leave blank — deploy from repo root)* |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

`vercel.json` at the repo root configures SPA routing and the API route.

### 2. Environment variables

In Vercel → **Settings** → **Environment Variables**:

| Variable | Required |
|----------|----------|
| `ANTHROPIC_API_KEY` | Yes |

Apply to Production, Preview, and Development. Never commit `.env`.

### 3. Deploy

```bash
git push
# or: npx vercel --prod
```

### Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 NOT_FOUND | Root Directory must be **blank** (not a subfolder) |
| API errors | Add `ANTHROPIC_API_KEY` in Vercel and redeploy |
| Page refresh 404 | `vercel.json` rewrites routes to `index.html` |
