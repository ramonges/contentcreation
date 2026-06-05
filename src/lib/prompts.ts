export const FORMAT_BRIEF = `FORMAT PER EPISODE:
- Total length: 30–45 seconds when performed
- Part 1 — SCENE (15–25s): A tense, dramatic workplace moment between 2–3 characters. Dialogue-driven. No narration. Cinematic feel. Conflict is the engine.
- Part 2 — FACE-CAM CONFESSION (5–10s): One character looks directly at camera. Delivers a raw, honest, slightly unhinged thought about what just happened. This is the most quotable moment of the episode.
- Part 3 — CLIFFHANGER (3s): Hard cut. One unresolved line or a reaction shot. The episode must NOT resolve. The viewer has to watch the next one.

CHARACTERS:
- Marcus (The Dinosaur): Senior trader, 15 years experience, 6 Bloomberg terminals, hates mobile apps, loud, overconfident, wrong at key moments.
- Zoe (The Gnomi User): Junior analyst, always calm, uses Gnomi quietly on her phone, always one step ahead, never rubs it in — she doesn't have to.
- David (The Boss / PM): Only cares about returns, doesn't ask how anyone gets their edge, keeps praising Zoe without realizing why.

PRODUCT — GNOMI:
Gnomi is a finance AI assistant app. It gives users: a personalized market news feed by sector, ticker watchlists with news context (not just prices), AI-powered earnings call analysis, and an AI agent the user can chat with about how news affects their portfolio. It's like Bloomberg but it actually talks back. It makes you feel like the smartest person in the room.

TONE: Dramatic and intense like Succession, with face-cam moments that are raw and relatable like The Office. The product (Gnomi) is always the silent hero — never over-explained, just demonstrated through results.

FORMAT DNA (Cluely-style):
- Clear power dynamic: cocky Marcus vs. stressed-underdog Zoe
- Gnomi is Zoe's secret weapon Marcus doesn't have
- Face-cam lines are brutally honest, slightly unhinged, very quotable
- Each episode ends mid-sentence or on a reaction that demands a follow-up
- Drama escalates episode-to-episode — stakes keep rising`;

export function buildSyllabusPrompt(seasonTopic: string, episodeCount: number): string {
  return `You are a showrunner planning a short-form drama series for social media (TikTok / Instagram Reels) about finance professionals.

${FORMAT_BRIEF}

SEASON TOPIC: ${seasonTopic}
TOTAL EPISODES: ${episodeCount}

Create a season syllabus with exactly ${episodeCount} episodes. Each episode must have a DISTINCT plot beat — not variations of the same scene. Episodes must form ONE continuous season arc where:
- Episode 1 opens the conflict
- Middle episodes escalate stakes and deepen character dynamics
- Each cliffhanger directly sets up the next episode
- The Gnomi user's edge becomes harder for Marcus to ignore over time
- David (the Boss) keeps unknowingly rewarding Zoe

Return ONLY valid JSON in this exact shape:
{
  "seasonTitle": "string",
  "seasonArc": "2-3 sentence overview of the full season story",
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "episode title",
      "topic": "specific finance event (earnings, Fed day, etc.)",
      "plotBeat": "what happens in this episode — unique to this episode",
      "cliffhangerSeed": "the unresolved moment that carries into the next episode",
      "gnomiMoment": "how Gnomi gives Zoe an edge in this episode"
    }
  ]
}

The episodes array must contain exactly ${episodeCount} objects with episodeNumber from 1 to ${episodeCount}.`;
}

export function buildEpisodeScriptPrompt(params: {
  seasonTopic: string;
  episodeCount: number;
  seasonArc: string;
  outline: {
    episodeNumber: number;
    title: string;
    topic: string;
    plotBeat: string;
    cliffhangerSeed: string;
    gnomiMoment: string;
  };
  previousEpisodesContext: string;
}): string {
  const { seasonTopic, episodeCount, seasonArc, outline, previousEpisodesContext } = params;
  const isFirstEpisode = outline.episodeNumber === 1;
  const isLastEpisode = outline.episodeNumber === episodeCount;

  const continuitySection = isFirstEpisode
    ? "This is EPISODE 1 — establish the world, characters, and central tension."
    : `CONTINUITY FROM PRIOR EPISODES (you MUST pick up from here):
${previousEpisodesContext}

This is EPISODE ${outline.episodeNumber} of ${episodeCount}. Open by paying off or immediately continuing the previous episode's cliffhanger. Do NOT repeat prior scenes.`;

  const endingSection = isLastEpisode
    ? "This is the SEASON FINALE — deliver a satisfying payoff while leaving room for a future season."
    : `End on this cliffhanger seed: "${outline.cliffhangerSeed}"
The cliffhanger MUST be unresolved and force the viewer to watch episode ${outline.episodeNumber + 1}.`;

  return `You are writing scripts for a short-form drama series on social media (TikTok / Instagram Reels). The format is modeled after Cluely's viral episode series.

${FORMAT_BRIEF}

SEASON TOPIC: ${seasonTopic}
SEASON ARC: ${seasonArc}

EPISODE ${outline.episodeNumber} OF ${episodeCount}: "${outline.title}"
EPISODE TOPIC: ${outline.topic}
PLOT BEAT: ${outline.plotBeat}
GNOMI MOMENT: ${outline.gnomiMoment}

${continuitySection}

${endingSection}

Write the full script for ONLY this episode. Include scene direction, dialogue, face-cam line, and cliffhanger cut. Make the face-cam confession extremely quotable — something a finance person would screenshot and send to their group chat.

Structure your response with these exact section headers:
## SCENE
(scene direction and dialogue)

## FACE-CAM
(character name and confession line)

## CLIFFHANGER
(unresolved cut)

## FULL SCRIPT
(combined readable script)`;
}
