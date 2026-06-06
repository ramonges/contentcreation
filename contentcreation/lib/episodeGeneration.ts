import type { Message } from './llm';
import { formatCastForPrompt } from './cast';
import type { Step1Data } from '@/components/dashboard/Step1';
import { GNOMI_SERIES_FORMAT, parseTitleAndLogline } from './gnomiFormat';
import {
  type SeasonContext,
  type EpisodeBlueprint,
  formatSeasonContextForPrompt,
  buildSeasonContextMessages,
  buildDefaultSeasonContext,
  parseSeasonContext,
} from './seasonContext';

export const SCRIPT_DURATION_SECONDS = 40;

export type PriorEpisodeScript = {
  episodeNumber: number;
  title: string;
  script: string;
};

export {
  buildSeasonContextMessages,
  buildDefaultSeasonContext,
  parseSeasonContext,
  formatSeasonContextForPrompt,
  type SeasonContext,
  type EpisodeBlueprint,
};

function formatPreviousScripts(scripts: PriorEpisodeScript[]): string {
  if (scripts.length === 0) {
    return 'None — this is Episode 1.';
  }
  return scripts
    .map(
      (ep) =>
        `========== EPISODE ${ep.episodeNumber}: "${ep.title}" ==========\n${ep.script}`
    )
    .join('\n\n');
}

function arcPositionGuidance(blueprint: EpisodeBlueprint, episodeCount: number): string {
  const { arcPosition, episodeNumber } = blueprint;
  const guides: Record<string, string> = {
    opening:
      'OPENING episode — establish the world and problem. Plant seeds for the ending. Do NOT resolve anything.',
    early:
      'EARLY season — show struggles, resistance, failed attempts. Reference the arc ending as a distant goal.',
    mid: 'MID season — funny interactions, rising tension, character dynamics shift. Build toward crisis.',
    late: 'LATE season — crisis before the finale. Stakes are highest. Pay off seeds from earlier episodes.',
    finale:
      `FINALE (Episode ${episodeNumber} of ${episodeCount}) — deliver the arc payoff: the season ending. Still end on a hook.`,
  };
  return guides[arcPosition] ?? guides.early;
}

/**
 * PHASE 2 — One API call per episode.
 * Includes: fixed season context + briefing + all prior scripts + this episode's blueprint.
 */
export function buildEpisodeScriptMessages(
  step1Data: Step1Data,
  briefingContext: string,
  seasonContext: SeasonContext,
  episodeNumber: number,
  previousScripts: PriorEpisodeScript[]
): Message[] {
  const { episodeCount } = step1Data;
  const blueprint = seasonContext.episodeBlueprints[episodeNumber - 1];

  return [
    {
      role: 'system',
      content: `${GNOMI_SERIES_FORMAT}

RUNTIME: Exactly ${SCRIPT_DURATION_SECONDS} seconds when performed.
- Part 1 — SCENE: ~25 seconds
- Part 2 — FACE-CAM CONFESSION: ~10 seconds
- Part 3 — CLIFFHANGER: ~5 seconds (unresolved — forces viewer to next episode)

You are writing Episode ${episodeNumber} of ${episodeCount}.
You already know how the season ENDS. Write this episode to serve that ending.`,
    },
    {
      role: 'user',
      content: `=== PHASE 1: SEASON CONTEXT (fixed — passed into every episode call) ===
${formatSeasonContextForPrompt(seasonContext)}

=== CLIENT BRIEFING (Step 2) ===
${briefingContext}

=== CAST ===
${formatCastForPrompt(step1Data.cast)}

=== PHASE 2: PREVIOUSLY GENERATED SCRIPTS (Episodes 1–${episodeNumber - 1}) ===
${formatPreviousScripts(previousScripts)}

=== THIS EPISODE: ${episodeNumber} of ${episodeCount} ===
ARC POSITION: ${blueprint.arcPosition.toUpperCase()}
${arcPositionGuidance(blueprint, episodeCount)}

SCENARIO (unique to this episode): ${blueprint.scenario}
TRIGGER EVENT: ${blueprint.triggerEvent}
EPISODE TONE: ${blueprint.tone}
SEEDS TO PLANT: ${blueprint.seedsToPlant}
PAYOFFS FROM EARLIER: ${blueprint.payoffsFromEarlier}
TIME OF DAY: ${blueprint.timeOfDay}
SCENE HEADING: ${blueprint.sceneHeading}
CLIFFHANGER DIRECTION: ${blueprint.cliffhangerDirection}

MANDATORY RULES:
1. ${SCRIPT_DURATION_SECONDS}-second runtime when performed aloud.
2. ${episodeNumber > 1 ? `Continue DIRECTLY from Episode ${episodeNumber - 1}'s cliffhanger. Same characters, consistent behavior.` : 'Open the season. Plant seeds for the ending: ' + seasonContext.arcEnding}
3. Format: SCENE → FACE-CAM CONFESSION → CLIFFHANGER (unresolved).
4. New scenario and dialogue — never copy a previous episode's scene.
5. Serve the season arc. You know the ending: ${seasonContext.arcEnding}

Format EXACTLY as:
TITLE: [Dramatic title]
LOGLINE: [One punchy sentence]
PART 1 — SCENE (~25 seconds):
[${blueprint.sceneHeading} — dialogue and action]
PART 2 — FACE-CAM CONFESSION (~10 seconds):
[Character to camera — raw, quotable]
PART 3 — CLIFFHANGER (~5 seconds):
[Hard cut — unresolved per: ${blueprint.cliffhangerDirection}]`,
    },
  ];
}

export function buildFallbackScript(
  episodeNumber: number,
  episodeCount: number,
  seasonContext: SeasonContext,
  cast: Step1Data['cast'],
  previousScripts: PriorEpisodeScript[]
): string {
  const blueprint = seasonContext.episodeBlueprints[episodeNumber - 1];
  const lead = cast[0] ?? { name: 'Alex', jobPosition: 'CEO', jobDescription: '' };
  const co = cast[1] ?? { name: 'Sam', jobPosition: 'Sales', jobDescription: '' };
  const boss = cast[2] ?? lead;

  const open =
    previousScripts.length > 0
      ? `[Continues from Episode ${episodeNumber - 1}]`
      : `[Season opens — ${seasonContext.arcBeginning}]`;

  return `TITLE: ${blueprint.scenario.split('—')[0].trim()}
LOGLINE: Episode ${episodeNumber} of ${episodeCount} — ${blueprint.arcPosition} phase.

PART 1 — SCENE (~25 seconds):
${blueprint.sceneHeading} — ${blueprint.timeOfDay}

${open}

[${blueprint.scenario}]

${boss.name.toUpperCase()}:
  ${blueprint.triggerEvent}

${co.name.toUpperCase()}:
  (quietly)
  Already on it.

PART 2 — FACE-CAM CONFESSION (~10 seconds):
[${co.name} to camera]

${co.name.toUpperCase()}:
  ${blueprint.arcPosition === 'finale' ? 'We actually did it.' : 'Same story. Different episode. Still not telling them how.'}

PART 3 — CLIFFHANGER (~5 seconds):
[Hard cut]

${boss.name.toUpperCase()}:
  ${blueprint.cliffhangerDirection}

[HARD CUT]`;
}

export { parseTitleAndLogline };
