# contentcreation

Git repo root. The Vite app lives in **`contentcreation/`** (inner folder).

## Deploy on Vercel

**Root Directory:** leave **blank** (deploy from this repo root).

The root `vercel.json` builds the inner app and serves `contentcreation/dist`.

Add **`ANTHROPIC_API_KEY`** in Vercel → Settings → Environment Variables, then redeploy.

See `contentcreation/README.md` for full local dev + deploy docs.
