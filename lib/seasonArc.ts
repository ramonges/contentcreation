import type { Message } from './llm';
import { formatCastForPrompt } from './cast';
import type { Step1Data } from '@/components/dashboard/Step1';
import {
  getEpisodeTimeSlot,
  type EpisodeBlueprint,
  GNOMI_SERIES_FORMAT,
} from './gnomiFormat';

export const SEASON_NARRATIVE_DIRECTIVE = `SEASON NARRATIVE RULES — every episode must follow ONE linked story:

The season is ONE continuous storyline across all episodes — not standalone sketches.
- EARLY EPISODES (setup): Show the problem. Struggles, bad numbers, resistance, chaos. The team is losing or failing.
- MIDDLE EPISODES (rising action): Funny interactions, small attempts, mixed results. Tension and comedy build. Characters clash. Gnomi quietly helps one person.
- LATE EPISODES (crisis): Everything looks like it will fail. Stakes are highest.
- FINAL EPISODE(S) (payoff): The goal is achieved (e.g. they close the sale, win the client, save the quarter) — but end on a cliffhanger hook.

Each episode = a DIFFERENT SCENARIO (unique scene, unique conflict, unique dialogue) but the SAME through-line.
Episode 2 must directly continue from Episode 1's cliffhanger. Episode 3 continues from Episode 2. And so on.
Never repeat the same scene or situation. Never reset the story.`;

export type NarrativePhase = 'setup' | 'rising' | 'comedy' | 'crisis' | 'payoff';

export type EpisodeBeat = {
  episodeNumber: number;
  narrativePhase: NarrativePhase;
  scenario: string;
  title: string;
  topic: string;
  logline: string;
  linkFromPrevious: string;
  cliffhangerGoal: string;
  timeOfDay: string;
  sceneHeading: string;
};

export type SeasonArcPlan = {
  seasonArc: string;
  narrativeStructure: string;
  beats: EpisodeBeat[];
};

const DEFAULT_SCENARIOS: Record<NarrativePhase, string[]> = {
  setup: [
    'Sales numbers are terrible — the boss demands answers before market open',
    'The team loses a client to a competitor and blames each other',
    'A product demo crashes in front of a prospect',
  ],
  rising: [
    'Someone tries an old-school approach and fails spectacularly',
    'A funny misunderstanding on a client call puts the deal at risk',
    'The skeptic mocks the new tool — then quietly needs it',
  ],
  comedy: [
    'Office chaos during lunch — someone says the wrong thing on speakerphone',
    'A bet between colleagues goes horribly wrong',
    'The loudest person on the desk is proven wrong in front of everyone',
  ],
  crisis: [
    'The biggest prospect threatens to walk — deadline is today',
    'Quarter-end numbers look impossible — someone may get fired',
    'A rival desk celebrates early and the pressure hits boiling point',
  ],
  payoff: [
    'The final pitch — everything rides on this moment',
    'They close the deal / hit the number — the room erupts',
    'The boss finally sees who had the edge all along',
  ],
};

function phaseForEpisode(episodeNumber: number, episodeCount: number): NarrativePhase {
  if (episodeCount === 1) return 'payoff';
  const progress = (episodeNumber - 1) / (episodeCount - 1);
  if (progress <= 0.25) return 'setup';
  if (progress <= 0.45) return 'rising';
  if (progress <= 0.7) return 'comedy';
  if (progress < 1) return 'crisis';
  return 'payoff';
}

function fieldFromBlock(block: string, field: string): string {
  const match = block.match(new RegExp(`^${field}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim() ?? '';
}

export function buildMasterSeasonPlanMessages(
  step1Data: Step1Data,
  companyContext: string
): Message[] {
  const { episodeCount } = step1Data;

  return [
    {
      role: 'system',
      content: `You are a showrunner creating a master season plan for a linked short-form drama series.
${GNOMI_SERIES_FORMAT}

${SEASON_NARRATIVE_DIRECTIVE}

Your output will be used to generate ${episodeCount} separate scripts — each unique but connected.`,
    },
    {
      role: 'user',
      content: `FULL CREATIVE BRIEFING (from Step 2 — use this to shape the season arc):
${companyContext}

Cast:
${formatCastForPrompt(step1Data.cast)}

Season length: ${episodeCount} episodes

Create a MASTER SEASON PLAN for exactly ${episodeCount} episodes.

First, define the season's through-line based on the briefing above. Example pattern: early episodes show bad sales/struggles → middle episodes have funny interactions and small wins/losses → final episode(s) they achieve the goal (e.g. close the sale). Adapt this to the company's actual story from the briefing.

Output format — follow EXACTLY:

SEASON_ARC: [2-4 sentences — the one story this whole season tells, start to finish]

NARRATIVE_STRUCTURE: [Describe how episodes 1 through ${episodeCount} progress: what happens in early eps, middle eps, final ep]

Then for EACH episode (${episodeCount} total):
---
EPISODE [number]
NARRATIVE_PHASE: [setup | rising | comedy | crisis | payoff]
SCENARIO: [This episode's UNIQUE situation — must differ from every other episode. Be specific.]
TITLE: [Dramatic episode title]
TOPIC: [One-line conflict focus]
LOGLINE: [One punchy sentence]
LINK_FROM_PREVIOUS: [For ep 1: "Season opener — inciting incident". For ep 2+: exactly how this continues from the previous episode's cliffhanger]
CLIFFHANGER_GOAL: [What unresolved tension ends this episode and pulls viewers to the next]
TIME_OF_DAY: [Progress through one workday — ep 1 morning, ep 2 late morning/lunch, ep 3 afternoon, etc.]
---

List exactly ${episodeCount} episodes. Every SCENARIO must be different.`,
    },
  ];
}

export function buildDefaultSeasonPlan(episodeCount: number): SeasonArcPlan {
  const beats: EpisodeBeat[] = Array.from({ length: episodeCount }, (_, i) => {
    const n = i + 1;
    const phase = phaseForEpisode(n, episodeCount);
    const scenarios = DEFAULT_SCENARIOS[phase];
    const scenario = scenarios[i % scenarios.length];
    const time = getEpisodeTimeSlot(n);

    return {
      episodeNumber: n,
      narrativePhase: phase,
      scenario,
      title: `Episode ${n}: ${scenario.split('—')[0].trim()}`,
      topic: scenario,
      logline: scenario,
      linkFromPrevious:
        n === 1
          ? 'Season opener — the team is struggling and the pressure starts'
          : `Direct continuation from Episode ${n - 1}'s cliffhanger — stakes have risen`,
      cliffhangerGoal:
        n < episodeCount
          ? `Unresolved tension that pulls the audience into Episode ${n + 1}`
          : 'The goal is achieved but a new hook teases what comes next',
      timeOfDay: `${time.label} (${time.period})`,
      sceneHeading: time.sceneHeading,
    };
  });

  return {
    seasonArc: `A ${episodeCount}-episode arc: the team struggles early (bad sales, chaos), navigates funny and tense middle episodes, and ${episodeCount > 1 ? 'in the finale' : ''} achieves their goal.`,
    narrativeStructure:
      episodeCount <= 2
        ? 'Open with the problem, close with the payoff.'
        : `Episodes 1–${Math.ceil(episodeCount * 0.3)}: setup and struggles. Episodes ${Math.ceil(episodeCount * 0.3) + 1}–${Math.ceil(episodeCount * 0.7)}: rising action and funny beats. Episodes ${Math.ceil(episodeCount * 0.7) + 1}–${episodeCount}: crisis and payoff.`,
    beats,
  };
}

export function parseSeasonPlan(raw: string, episodeCount: number): SeasonArcPlan {
  const defaults = buildDefaultSeasonPlan(episodeCount);
  const seasonArc = raw.match(/^SEASON_ARC:\s*(.+)$/im)?.[1]?.trim() ?? defaults.seasonArc;
  const narrativeStructure =
    raw.match(/^NARRATIVE_STRUCTURE:\s*(.+)$/im)?.[1]?.trim() ?? defaults.narrativeStructure;

  const blocks = raw.split(/---+/).filter((b) => /EPISODE\s+\d+/i.test(b));
  const parsed = new Map<number, EpisodeBeat>();

  for (const block of blocks) {
    const numMatch = block.match(/EPISODE\s+(\d+)/i);
    if (!numMatch) continue;
    const episodeNumber = parseInt(numMatch[1], 10);
    if (episodeNumber < 1 || episodeNumber > episodeCount) continue;

    const fallback = defaults.beats[episodeNumber - 1];
    const time = getEpisodeTimeSlot(episodeNumber);
    const phase = (fieldFromBlock(block, 'NARRATIVE_PHASE') || fallback.narrativePhase) as NarrativePhase;

    parsed.set(episodeNumber, {
      episodeNumber,
      narrativePhase: ['setup', 'rising', 'comedy', 'crisis', 'payoff'].includes(phase)
        ? phase
        : fallback.narrativePhase,
      scenario: fieldFromBlock(block, 'SCENARIO') || fallback.scenario,
      title: fieldFromBlock(block, 'TITLE') || fallback.title,
      topic: fieldFromBlock(block, 'TOPIC') || fieldFromBlock(block, 'SCENARIO') || fallback.topic,
      logline: fieldFromBlock(block, 'LOGLINE') || fallback.logline,
      linkFromPrevious: fieldFromBlock(block, 'LINK_FROM_PREVIOUS') || fallback.linkFromPrevious,
      cliffhangerGoal: fieldFromBlock(block, 'CLIFFHANGER_GOAL') || fallback.cliffhangerGoal,
      timeOfDay: fieldFromBlock(block, 'TIME_OF_DAY') || `${time.label} (${time.period})`,
      sceneHeading: time.sceneHeading,
    });
  }

  return {
    seasonArc,
    narrativeStructure,
    beats: defaults.beats.map((d) => parsed.get(d.episodeNumber) ?? d),
  };
}

export function beatToBlueprint(beat: EpisodeBeat, episodeCount: number): EpisodeBlueprint {
  return {
    episodeNumber: beat.episodeNumber,
    title: beat.title,
    topic: beat.topic,
    logline: beat.logline,
    opensWith: beat.linkFromPrevious,
    cliffhanger: beat.cliffhangerGoal,
    arcNote: `${beat.narrativePhase.toUpperCase()} phase — ${beat.scenario}`,
    timeOfDay: beat.timeOfDay,
    sceneHeading: beat.sceneHeading,
    scenario: beat.scenario,
    narrativePhase: beat.narrativePhase,
    linkFromPrevious: beat.linkFromPrevious,
  };
}

export function seasonPlanToRaw(plan: SeasonArcPlan): string {
  return `SEASON_ARC: ${plan.seasonArc}

NARRATIVE_STRUCTURE: ${plan.narrativeStructure}

${plan.beats
  .map(
    (b) => `---
EPISODE ${b.episodeNumber}
NARRATIVE_PHASE: ${b.narrativePhase}
SCENARIO: ${b.scenario}
TITLE: ${b.title}
TOPIC: ${b.topic}
LOGLINE: ${b.logline}
LINK_FROM_PREVIOUS: ${b.linkFromPrevious}
CLIFFHANGER_GOAL: ${b.cliffhangerGoal}
TIME_OF_DAY: ${b.timeOfDay}
---`
  )
  .join('\n\n')}`;
}
