import type { Message } from './llm';
import { formatCastForPrompt } from './cast';
import type { Step1Data } from '@/components/dashboard/Step1';
import { getEpisodeTimeSlot, GNOMI_SERIES_FORMAT } from './gnomiFormat';

export type ArcPosition = 'opening' | 'early' | 'mid' | 'late' | 'finale';

export type EpisodeBlueprint = {
  episodeNumber: number;
  arcPosition: ArcPosition;
  scenario: string;
  triggerEvent: string;
  tone: string;
  seedsToPlant: string;
  payoffsFromEarlier: string;
  timeOfDay: string;
  sceneHeading: string;
  cliffhangerDirection: string;
};

export type SeasonContext = {
  world: string;
  characters: string;
  tone: string;
  arcBeginning: string;
  arcMiddle: string;
  arcEnding: string;
  seasonSummary: string;
  episodeBlueprints: EpisodeBlueprint[];
  raw: string;
};

function field(block: string, name: string): string {
  return block.match(new RegExp(`^${name}:\\s*(.+)$`, 'im'))?.[1]?.trim() ?? '';
}

function arcPositionFor(episodeNumber: number, episodeCount: number): ArcPosition {
  if (episodeCount === 1) return 'finale';
  if (episodeNumber === 1) return 'opening';
  if (episodeNumber === episodeCount) return 'finale';
  const p = (episodeNumber - 1) / (episodeCount - 1);
  if (p <= 0.33) return 'early';
  if (p <= 0.66) return 'mid';
  return 'late';
}

function defaultScenario(position: ArcPosition, n: number): string {
  const map: Record<ArcPosition, string> = {
    opening: 'The team is struggling — bad numbers, pressure from leadership',
    early: 'A failed attempt makes things worse; tension between characters',
    mid: 'Funny chaos erupts; someone quietly gains an edge with Gnomi',
    late: 'Crisis hits — everything looks like it will fail before the finale',
    finale: 'The season goal is achieved — payoff moment for the whole arc',
  };
  return map[position] ?? `Episode ${n} advances the linked story`;
}

export function buildSeasonContextMessages(
  step1Data: Step1Data,
  briefingContext: string
): Message[] {
  const { episodeCount } = step1Data;

  return [
    {
      role: 'system',
      content: `You are a showrunner defining a complete season BEFORE any scripts are written.
${GNOMI_SERIES_FORMAT}

CRITICAL: You must define the FULL story arc including the ENDING before Episode 1 is written.
Early episodes must plant seeds that pay off in later episodes. The writer of Episode 1 will know exactly how the season ends.`,
    },
    {
      role: 'user',
      content: `Creative briefing from the client (Step 2):
${briefingContext}

Cast:
${formatCastForPrompt(step1Data.cast)}

Season length: ${episodeCount} episodes

Define the complete season context. Output EXACTLY this structure:

WORLD: [Setting — where/when this takes place, workplace culture]
CHARACTERS: [Who they are, dynamics, who wants what]
TONE: [Succession meets The Office — dramatic + raw face-cam moments]
ARC_BEGINNING: [What state is the team in at the start? e.g. bad sales, chaos]
ARC_MIDDLE: [How does tension/comedy build? e.g. funny fails, small wins, rivalries]
ARC_ENDING: [How does the season END? e.g. they close the big sale — be specific. Episode 1 must plant seeds toward this.]
SEASON_SUMMARY: [2-3 sentences — the full story from ep 1 to ep ${episodeCount}]

Then for EACH episode (1 through ${episodeCount}):
---
EPISODE [number]
ARC_POSITION: [opening | early | mid | late | finale]
SCENARIO: [This episode's UNIQUE situation — different from every other episode]
TRIGGER_EVENT: [What kicks off this episode's conflict]
TONE: [This episode's emotional tone]
SEEDS_TO_PLANT: [Story details introduced now that pay off later — "none" for finale if only paying off]
PAYOFFS_FROM_EARLIER: [Callbacks to earlier episodes — "none" for opening]
CLIFFHANGER_DIRECTION: [How this episode ends unresolved to pull viewers to the next]
---

Every SCENARIO must be unique. The arc must progress: struggles → comedy/tension → crisis → payoff.`,
    },
  ];
}

export function buildDefaultSeasonContext(
  step1Data: Step1Data,
  briefingContext: string
): SeasonContext {
  const { episodeCount } = step1Data;
  const beats: EpisodeBlueprint[] = Array.from({ length: episodeCount }, (_, i) => {
    const n = i + 1;
    const pos = arcPositionFor(n, episodeCount);
    const time = getEpisodeTimeSlot(n);
    return {
      episodeNumber: n,
      arcPosition: pos,
      scenario: defaultScenario(pos, n),
      triggerEvent: n === 1 ? 'Leadership demands answers on bad numbers' : `Fallout from Episode ${n - 1}'s cliffhanger`,
      tone: pos === 'finale' ? 'Triumphant with a final hook' : pos === 'mid' ? 'Funny and tense' : 'Dramatic pressure',
      seedsToPlant: pos === 'opening' || pos === 'early' ? 'Introduce the tool/edge one character has' : 'none',
      payoffsFromEarlier: pos === 'opening' ? 'none' : `Reference events from episodes 1–${n - 1}`,
      timeOfDay: `${time.label} (${time.period})`,
      sceneHeading: time.sceneHeading,
      cliffhangerDirection: n < episodeCount ? `Unresolved beat forcing Episode ${n + 1}` : 'Season ends on a hook',
    };
  });

  const world = 'A high-pressure trading floor / sales office';
  const characters = formatCastForPrompt(step1Data.cast);
  const tone = 'Dramatic like Succession, face-cam moments like The Office';
  const arcBeginning = 'The team is underperforming — bad sales, leadership pressure';
  const arcMiddle = 'Funny interactions, failed attempts, quiet wins with Gnomi';
  const arcEnding = 'They close the deal / hit the target — the underdog is vindicated';
  const seasonSummary = `A ${episodeCount}-episode arc from struggle to payoff across one workday.`;

  const raw = serializeSeasonContext({
    world,
    characters,
    tone,
    arcBeginning,
    arcMiddle,
    arcEnding,
    seasonSummary,
    episodeBlueprints: beats,
  });

  return {
    world,
    characters,
    tone,
    arcBeginning,
    arcMiddle,
    arcEnding,
    seasonSummary,
    episodeBlueprints: beats,
    raw,
  };
}

function serializeSeasonContext(ctx: Omit<SeasonContext, 'raw'>): string {
  return `WORLD: ${ctx.world}
CHARACTERS: ${ctx.characters}
TONE: ${ctx.tone}
ARC_BEGINNING: ${ctx.arcBeginning}
ARC_MIDDLE: ${ctx.arcMiddle}
ARC_ENDING: ${ctx.arcEnding}
SEASON_SUMMARY: ${ctx.seasonSummary}

${ctx.episodeBlueprints
  .map(
    (b) => `---
EPISODE ${b.episodeNumber}
ARC_POSITION: ${b.arcPosition}
SCENARIO: ${b.scenario}
TRIGGER_EVENT: ${b.triggerEvent}
TONE: ${b.tone}
SEEDS_TO_PLANT: ${b.seedsToPlant}
PAYOFFS_FROM_EARLIER: ${b.payoffsFromEarlier}
CLIFFHANGER_DIRECTION: ${b.cliffhangerDirection}
---`
  )
  .join('\n\n')}`;
}

export function parseSeasonContext(
  raw: string,
  episodeCount: number,
  briefingContext: string
): SeasonContext {
  const defaults = buildDefaultSeasonContext(
    { episodeCount, cast: [] } as Step1Data,
    briefingContext
  ); // fallback field values only

  const world = raw.match(/^WORLD:\s*(.+)$/im)?.[1]?.trim() ?? defaults.world;
  const characters = raw.match(/^CHARACTERS:\s*(.+)$/im)?.[1]?.trim() ?? defaults.characters;
  const tone = raw.match(/^TONE:\s*(.+)$/im)?.[1]?.trim() ?? defaults.tone;
  const arcBeginning = raw.match(/^ARC_BEGINNING:\s*(.+)$/im)?.[1]?.trim() ?? defaults.arcBeginning;
  const arcMiddle = raw.match(/^ARC_MIDDLE:\s*(.+)$/im)?.[1]?.trim() ?? defaults.arcMiddle;
  const arcEnding = raw.match(/^ARC_ENDING:\s*(.+)$/im)?.[1]?.trim() ?? defaults.arcEnding;
  const seasonSummary = raw.match(/^SEASON_SUMMARY:\s*(.+)$/im)?.[1]?.trim() ?? defaults.seasonSummary;

  const blocks = raw.split(/---+/).filter((b) => /EPISODE\s+\d+/i.test(b));
  const parsed = new Map<number, EpisodeBlueprint>();

  for (const block of blocks) {
    const num = parseInt(block.match(/EPISODE\s+(\d+)/i)?.[1] ?? '0', 10);
    if (num < 1 || num > episodeCount) continue;
    const fb = defaults.episodeBlueprints[num - 1];
    const time = getEpisodeTimeSlot(num);
    const pos = (field(block, 'ARC_POSITION') || fb.arcPosition) as ArcPosition;

    parsed.set(num, {
      episodeNumber: num,
      arcPosition: ['opening', 'early', 'mid', 'late', 'finale'].includes(pos) ? pos : fb.arcPosition,
      scenario: field(block, 'SCENARIO') || fb.scenario,
      triggerEvent: field(block, 'TRIGGER_EVENT') || fb.triggerEvent,
      tone: field(block, 'TONE') || fb.tone,
      seedsToPlant: field(block, 'SEEDS_TO_PLANT') || fb.seedsToPlant,
      payoffsFromEarlier: field(block, 'PAYOFFS_FROM_EARLIER') || fb.payoffsFromEarlier,
      timeOfDay: `${time.label} (${time.period})`,
      sceneHeading: time.sceneHeading,
      cliffhangerDirection: field(block, 'CLIFFHANGER_DIRECTION') || fb.cliffhangerDirection,
    });
  }

  const episodeBlueprints = Array.from({ length: episodeCount }, (_, i) => {
    const n = i + 1;
    return parsed.get(n) ?? defaults.episodeBlueprints[n - 1];
  });

  return {
    world,
    characters,
    tone,
    arcBeginning,
    arcMiddle,
    arcEnding,
    seasonSummary,
    episodeBlueprints,
    raw,
  };
}

export function formatSeasonContextForPrompt(ctx: SeasonContext): string {
  return `WORLD: ${ctx.world}
CHARACTERS: ${ctx.characters}
TONE: ${ctx.tone}

FULL NARRATIVE ARC (you knew this ending before writing Episode 1):
- BEGINNING: ${ctx.arcBeginning}
- MIDDLE: ${ctx.arcMiddle}
- ENDING: ${ctx.arcEnding}

SEASON SUMMARY: ${ctx.seasonSummary}`;
}
