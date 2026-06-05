# Gnomi Content Creation

Short-form drama episode script generator for the Gnomi social media series.

## What it does

1. **Season syllabus** — Generates a continuous arc with N distinct episode outlines (plot beats, cliffhangers, Gnomi moments).
2. **Per-episode scripts** — Generates a unique script for each episode, passing prior cliffhangers and context so episodes link together.
3. **Format compliance** — Every script follows the Cluely-style structure: Scene → Face-cam confession → Cliffhanger.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How multi-episode linking works

- Selecting **1 episode** generates a single self-contained arc.
- Selecting **10 episodes** generates a 10-beat syllabus, then loops through each outline with:
  - `episodeNumber` and `totalEpisodes` in the prompt
  - The episode's unique plot beat from the syllabus
  - Context from all previous episodes' cliffhangers

Each episode is a separate LLM call with different inputs — they cannot produce the same script.

## API

`POST /api/generate`

```json
{
  "seasonTopic": "Earnings season on the trading desk",
  "episodeCount": 10
}
```
