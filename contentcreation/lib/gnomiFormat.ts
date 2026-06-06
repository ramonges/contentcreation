import type { Message } from './llm';
import { formatCastForPrompt } from './cast';
import type { Step1Data } from '@/components/dashboard/Step1';

export const GNOMI_SERIES_FORMAT = `You are writing scripts for a short-form drama series on social media (TikTok / Instagram Reels). The format is modeled after Cluely's viral episode series.

FORMAT PER EPISODE:
- Total length: 40 seconds when performed
- Part 1 — SCENE (~25s): A tense, dramatic workplace moment between 2–3 characters. Dialogue-driven. No narration. Cinematic feel. Conflict is the engine.
- Part 2 — FACE-CAM CONFESSION (~10s): One character looks directly at camera. Delivers a raw, honest, slightly unhinged thought about what just happened. This is the most quotable moment of the episode.
- Part 3 — CLIFFHANGER (~5s): Hard cut. One unresolved line or a reaction shot. The episode must NOT resolve. The viewer has to watch the next one.

CHARACTER ARCHETYPES (map cast members to these roles where possible):
- The Dinosaur: Senior trader. 15 years on the desk. Has 6 Bloomberg terminals. Physically allergic to anything that runs on a phone. Loud, confident, wrong at the worst moments.
- The Gnomi User: Mid-level analyst or junior trader. Uses Gnomi quietly. Always one step ahead. Never brags — just lets the results speak.
- The Boss: Portfolio manager or MD. Only cares about P&L. Doesn't know (or care) how anyone gets their edge. Unknowingly rewards the Gnomi user every episode.
- The Convert: Optional arc character. Starts as a skeptic, gets humiliated by a missed call, secretly downloads Gnomi.

WHAT MAKES THE SERIES ADDICTIVE:
- Characters have a clear power dynamic (the cocky one vs. the stressed one)
- The product is the secret weapon one character has and the other doesn't
- Face-cam lines are brutally honest, slightly unhinged, very quotable
- Each episode ends mid-sentence or on a reaction that demands a follow-up
- The drama escalates episode-to-episode (stakes keep rising)

PRODUCT — GNOMI:
Gnomi is a finance AI assistant app. It gives users: a personalized market news feed by sector, ticker watchlists with news context (not just prices), AI-powered earnings call analysis, and an AI agent the user can chat with about how news affects their portfolio. It's like Bloomberg but it actually talks back. It makes you feel like the smartest person in the room.

TONE: Dramatic and intense like Succession, with face-cam moments that are raw and relatable like The Office. Gnomi is always the silent hero — never over-explained, just demonstrated through results.`;

export type PreviousEpisodeContext = {
  episodeNumber: number;
  title: string;
  logline: string;
  topic: string;
  timeOfDay: string;
  cliffhanger: string;
  script: string;
};

export type EpisodeTimeSlot = {
  label: string;
  period: string;
  sceneHeading: string;
  vibe: string;
};

/** One continuous workday — episode 1 is morning, 2 late morning, 3 lunch, etc. */
export const EPISODE_TIME_SLOTS: EpisodeTimeSlot[] = [
  { label: 'Early morning', period: '7-8 AM', sceneHeading: 'INT. TRADING FLOOR — EARLY MORNING', vibe: 'Pre-market. The building is quiet. The day has not broken yet.' },
  { label: 'Morning', period: '8-10 AM', sceneHeading: 'INT. TRADING FLOOR — MORNING', vibe: 'Market open. Phones ringing. The chaos begins.' },
  { label: 'Late morning', period: '10-11:30 AM', sceneHeading: 'INT. TRADING FLOOR — LATE MORNING', vibe: 'First calls are done. Pressure is building.' },
  { label: 'Lunch', period: '12-1 PM', sceneHeading: 'INT. OFFICE KITCHEN / TRADING FLOOR — LUNCH', vibe: 'Half the desk is at lunch. Something still goes wrong.' },
  { label: 'Early afternoon', period: '1-2:30 PM', sceneHeading: 'INT. TRADING FLOOR — EARLY AFTERNOON', vibe: 'Post-lunch. Energy dips — then a headline drops.' },
  { label: 'Mid afternoon', period: '2:30-4 PM', sceneHeading: 'INT. TRADING FLOOR — MID AFTERNOON', vibe: 'The desk is fully alive. Stakes are climbing.' },
  { label: 'Market close', period: '4-5 PM', sceneHeading: 'INT. TRADING FLOOR — LATE AFTERNOON', vibe: 'Final hour. Everyone feels the closing bell pressure.' },
  { label: 'Early evening', period: '5-7 PM', sceneHeading: 'INT. TRADING FLOOR — EARLY EVENING', vibe: 'Most people left. One desk light is still on.' },
  { label: 'Evening', period: '7-9 PM', sceneHeading: 'INT. TRADING FLOOR — EVENING', vibe: 'Dark floor. Emergency mode. Nobody should still be here.' },
  { label: 'Late night', period: '9-11 PM', sceneHeading: 'INT. TRADING FLOOR — LATE NIGHT', vibe: 'After-hours headline. The building is empty except this desk.' },
  { label: 'After hours', period: '11 PM+', sceneHeading: 'INT. TRADING FLOOR — AFTER HOURS', vibe: 'Silence. Just screens glowing. Something breaks.' },
  { label: 'Next morning', period: '7-8 AM next day', sceneHeading: 'INT. TRADING FLOOR — NEXT MORNING', vibe: 'Consequences land. The whole floor knows what happened.' },
];

export function getEpisodeTimeSlot(episodeNumber: number): EpisodeTimeSlot {
  const index = Math.min(episodeNumber - 1, EPISODE_TIME_SLOTS.length - 1);
  return EPISODE_TIME_SLOTS[index];
}

export type EpisodeBlueprint = {
  episodeNumber: number;
  title: string;
  topic: string;
  logline: string;
  opensWith: string;
  cliffhanger: string;
  arcNote: string;
  timeOfDay: string;
  sceneHeading: string;
  scenario?: string;
  narrativePhase?: string;
  linkFromPrevious?: string;
};

const DEFAULT_TOPICS = [
  'Earnings surprise — the desk is blindsided',
  'Fed day — rates move and someone is wrong',
  'A client call goes sideways live on speaker',
  'The Dinosaur dismisses Gnomi and pays for it',
  'After-hours headline — who saw it first?',
  'Portfolio review — the Boss only cares about P&L',
  'A missed ticker alert costs someone their bonus',
  'The Convert secretly downloads Gnomi',
  'Rival desk trash-talk escalates to a bet',
  'Quarter-end crunch — stakes at an all-time high',
  'The Dinosaur finally asks how Zoe knew',
  'Season finale — the whole floor finds out',
];

const DEFAULT_TITLES = [
  'Six Terminals, Zero Clue',
  'The Rate Hike Nobody Saw',
  'Speakerphone Apocalypse',
  "Bloomberg Won't Save You",
  'After Hours, After Everyone Left',
  'Show Me The Alpha',
  'You Missed The Alert',
  'Downloaded At Lunch',
  'Put Your P&L Where Your Mouth Is',
  'Quarter End Meltdown',
  'How Did You Know?',
  'The Secret Is Out',
];

const DEFAULT_LOGLINES = [
  'A pre-market earnings miss hits and only one person had the call summary ready.',
  'The Fed moves and the loudest voice on the desk is the most wrong.',
  'A client hears something they were never supposed to on speakerphone.',
  'Marcus mocks the phone app — then watches Zoe nail the trade.',
  'A headline drops at 8pm. The race to react begins before anyone else logs in.',
  'The PM wants numbers. Nobody asks how Zoe keeps winning.',
  "One ignored watchlist alert turns into the week's biggest loss.",
  'A skeptic gets burned and quietly opens the App Store.',
  'Trash talk becomes a live P&L bet with the whole floor watching.',
  'Quarter-end pressure breaks someone — and Gnomi quietly saves the day.',
  "The Dinosaur finally confronts Zoe. She doesn't gloat. She doesn't have to.",
  'The whole desk discovers the edge was in someone\'s pocket the whole time.',
];

function fieldFromBlock(block: string, field: string): string {
  const match = block.match(new RegExp(`^${field}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim() ?? '';
}

function timeFields(episodeNumber: number): Pick<EpisodeBlueprint, 'timeOfDay' | 'sceneHeading'> {
  const slot = getEpisodeTimeSlot(episodeNumber);
  return {
    timeOfDay: `${slot.label} (${slot.period})`,
    sceneHeading: slot.sceneHeading,
  };
}

export function buildDefaultBlueprints(episodeCount: number): EpisodeBlueprint[] {
  return Array.from({ length: episodeCount }, (_, i) => {
    const n = i + 1;
    const idx = i % DEFAULT_TOPICS.length;
    const time = timeFields(n);
    return {
      episodeNumber: n,
      title: DEFAULT_TITLES[idx],
      topic: DEFAULT_TOPICS[idx],
      logline: DEFAULT_LOGLINES[idx],
      opensWith:
        n === 1
          ? `Inciting incident — ${DEFAULT_TOPICS[idx]}`
          : `Picks up directly from Episode ${n - 1}'s cliffhanger`,
      cliffhanger:
        n < episodeCount
          ? `Unresolved tension that forces viewers to Episode ${n + 1}`
          : 'Season-ending reveal',
      arcNote: `Episode ${n} of ${episodeCount} — stakes escalate from the previous episode`,
      ...time,
    };
  });
}

export function parseSeasonOutline(outline: string, episodeCount: number): EpisodeBlueprint[] {
  const defaults = buildDefaultBlueprints(episodeCount);
  const blocks = outline.split(/---+/).filter((b) => /EPISODE\s+\d+/i.test(b));
  const parsed = new Map<number, EpisodeBlueprint>();

  for (const block of blocks) {
    const numMatch = block.match(/EPISODE\s+(\d+)/i);
    if (!numMatch) continue;
    const episodeNumber = parseInt(numMatch[1], 10);
    if (episodeNumber < 1 || episodeNumber > episodeCount) continue;

    const fallback = defaults[episodeNumber - 1];
    const time = timeFields(episodeNumber);
    parsed.set(episodeNumber, {
      episodeNumber,
      title: fieldFromBlock(block, 'TITLE') || fallback.title,
      topic: fieldFromBlock(block, 'TOPIC') || fallback.topic,
      logline: fieldFromBlock(block, 'LOGLINE') || fallback.logline,
      opensWith: fieldFromBlock(block, 'OPENS_WITH') || fallback.opensWith,
      cliffhanger: fieldFromBlock(block, 'CLIFFHANGER') || fallback.cliffhanger,
      arcNote: fieldFromBlock(block, 'ARC_NOTE') || fallback.arcNote,
      timeOfDay: fieldFromBlock(block, 'TIME_OF_DAY') || time.timeOfDay,
      sceneHeading: fieldFromBlock(block, 'SCENE_HEADING') || time.sceneHeading,
    });
  }

  return defaults.map((d) => parsed.get(d.episodeNumber) ?? d);
}

export function buildSeasonOutlineMessages(
  step1Data: Step1Data,
  companyContext: string
): Message[] {
  const { episodeCount } = step1Data;
  const seasonScope =
    episodeCount === 1
      ? 'This is a SINGLE-EPISODE season (1 episode only). Plan one complete, self-contained pilot episode with its own arc — still use the cliffhanger format.'
      : `This season has exactly ${episodeCount} episodes. Plan all ${episodeCount} — no more, no fewer. Each must have a DISTINCT topic and title.`;

  return [
    {
      role: 'system',
      content: `You are a showrunner planning a linked short-form drama season for Gnomi.
${GNOMI_SERIES_FORMAT}

Your job is to create a SEASON OUTLINE — a continuous syllabus where every episode is unique but the story escalates across the full season.`,
    },
    {
      role: 'user',
      content: `Company context from creative briefing:
${companyContext}

Cast (name, job position, day-to-day):
${formatCastForPrompt(step1Data.cast)}

${seasonScope}

CRITICAL: Each episode MUST have a different TOPIC, TITLE, and conflict. Never repeat the same plot twice. Episode 3 must feel nothing like Episode 1.

TIME-OF-DAY RULE: The season plays out across ONE continuous workday. Episode 1 = morning, Episode 2 = late morning/lunch, Episode 3 = afternoon, and so on through the day. Each episode must be set at a different time — never two episodes at the same time of day.

Create a season outline for exactly ${episodeCount} episode${episodeCount === 1 ? '' : 's'}. Each episode must have a DIFFERENT conflict/topic but form ONE continuous arc — cliffhangers link to the next episode and stakes rise through the day.

Format EXACTLY like this for each episode:
---
EPISODE [number]
TITLE: [Dramatic title — unique per episode]
TOPIC: [Specific focus — e.g. earnings day, Fed decision, missed call — MUST differ from every other episode]
TIME_OF_DAY: [e.g. Morning (8-10 AM), Lunch (12-1 PM), Early afternoon (1-2:30 PM) — must progress through the day]
SCENE_HEADING: [e.g. INT. TRADING FLOOR — MORNING]
LOGLINE: [One punchy sentence]
OPENS_WITH: [How this episode picks up from the previous cliffhanger — for Episode 1, the inciting incident]
CLIFFHANGER: [The unresolved ending that forces viewers to watch the next episode]
ARC_NOTE: [How stakes escalate from the previous episode]
---

Start with:
SEASON ARC: [2-3 sentences describing the full ${episodeCount}-episode story arc]

Then list exactly ${episodeCount} episode${episodeCount === 1 ? '' : 's'} (Episodes 1 through ${episodeCount} only).`,
    },
  ];
}

function formatForbiddenEpisodes(
  blueprint: EpisodeBlueprint,
  allBlueprints: EpisodeBlueprint[],
  previousEpisodes: PreviousEpisodeContext[]
): string {
  const otherPlans = allBlueprints
    .filter((b) => b.episodeNumber !== blueprint.episodeNumber)
    .map((b) => `  - Episode ${b.episodeNumber}: "${b.title}" — SCENARIO: ${b.scenario ?? b.topic} — TIME: ${b.timeOfDay}`)
    .join('\n');

  const written = previousEpisodes
    .map(
      (ep) =>
        `  - Episode ${ep.episodeNumber} (ALREADY WRITTEN): "${ep.title}" — TOPIC: ${ep.topic}\n    Cliffhanger: ${ep.cliffhanger}`
    )
    .join('\n');

  const sections = [];
  if (otherPlans) sections.push(`Other episodes in this ${allBlueprints.length}-episode season (DO NOT write these — different plots):\n${otherPlans}`);
  if (written) sections.push(`Episodes already scripted (DO NOT repeat dialogue, scenes, or conflicts):\n${written}`);

  return sections.length > 0
    ? sections.join('\n\n')
    : 'No other episodes — this is the only episode in the season.';
}

export function buildEpisodeScriptMessages(
  step1Data: Step1Data,
  companyContext: string,
  seasonArc: string,
  narrativeStructure: string,
  blueprint: EpisodeBlueprint,
  allBlueprints: EpisodeBlueprint[],
  previousEpisodes: PreviousEpisodeContext[]
): Message[] {
  const { episodeCount } = step1Data;
  const episodeNumber = blueprint.episodeNumber;
  const isOnlyEpisode = episodeCount === 1;
  const isFinale = episodeNumber === episodeCount;

  const lastEpisode = previousEpisodes[previousEpisodes.length - 1];
  const previousContext =
    previousEpisodes.length > 0
      ? previousEpisodes
          .map(
            (ep) =>
              `Episode ${ep.episodeNumber} — "${ep.title}" (SCENARIO: ${ep.topic}, TIME: ${ep.timeOfDay}): ${ep.logline}\nEnded with cliffhanger: ${ep.cliffhanger}`
          )
          .join('\n\n')
      : 'This is Episode 1 — no prior episodes.';

  const lastScriptSection =
    lastEpisode?.script
      ? `FULL SCRIPT OF PREVIOUS EPISODE (Episode ${lastEpisode.episodeNumber}) — you MUST continue directly from this. Same characters, same story, next moment in time:\n\n${lastEpisode.script.slice(-2500)}`
      : '';

  const scenarioLine = blueprint.scenario
    ? `SCENARIO (this episode's unique situation — different from all others): ${blueprint.scenario}`
    : `TOPIC: ${blueprint.topic}`;

  const seasonNote = isOnlyEpisode
    ? 'This season has ONLY 1 episode. Write one complete standalone pilot — unique conflict, full arc in 30-45 seconds.'
    : isFinale
    ? `This is the SEASON FINALE (Episode ${episodeNumber} of ${episodeCount}). Resolve the season arc while ending on a cliffhanger or hook for a potential next season.`
    : `This is Episode ${episodeNumber} of ${episodeCount}. Middle episodes must advance the linked story — pick up the last cliffhanger and end on a new one.`;

  return [
    {
      role: 'system',
      content: `You are a brilliant short-form drama writer for Gnomi's social series.
${GNOMI_SERIES_FORMAT}

You are writing Episode ${episodeNumber} of ${episodeCount} ONLY.
Every episode in a season must have a COMPLETELY DIFFERENT script — different topic, different scene, different dialogue, different face-cam line.
Never reuse or lightly reword a previous episode.`,
    },
    {
      role: 'user',
      content: `Company context (full Step 2 briefing):
${companyContext}

Cast:
${formatCastForPrompt(step1Data.cast)}

SEASON STORY ARC (the ONE linked story across all ${episodeCount} episodes):
${seasonArc}

HOW THE SEASON PROGRESSES:
${narrativeStructure}

${seasonNote}

THIS EPISODE'S ASSIGNMENT (Episode ${episodeNumber} of ${episodeCount} — write ONLY this one):
TITLE: ${blueprint.title}
${scenarioLine}
NARRATIVE_PHASE: ${blueprint.narrativePhase ?? 'rising'}
TIME_OF_DAY: ${blueprint.timeOfDay}
SCENE_HEADING: ${blueprint.sceneHeading}
LOGLINE: ${blueprint.logline}
CONTINUES_FROM: ${blueprint.linkFromPrevious ?? blueprint.opensWith}
MUST_END_WITH: ${blueprint.cliffhanger}
ARC_NOTE: ${blueprint.arcNote}

${formatForbiddenEpisodes(blueprint, allBlueprints, previousEpisodes)}

STORY SO FAR (summary of prior episodes):
${previousContext}

${lastScriptSection}

MANDATORY RULES:
1. Write Episode ${episodeNumber} ONLY — a completely NEW scene and dialogue, not a copy of any prior episode.
2. This episode's scenario is: "${blueprint.scenario ?? blueprint.topic}" — the entire scene must be about THIS specific situation.
3. ${episodeNumber > 1 ? `Open by continuing DIRECTLY from Episode ${episodeNumber - 1}'s cliffhanger. Reference what just happened.` : 'This opens the season — establish the problem (e.g. bad sales, chaos).'}
4. Set the scene at ${blueprint.timeOfDay}. Scene heading: ${blueprint.sceneHeading}.
5. Advance the season arc: ${blueprint.narrativePhase === 'payoff' ? 'This is the payoff — the goal is achieved.' : blueprint.narrativePhase === 'setup' ? 'Show the struggle/problem.' : 'Build tension and comedy toward the finale.'}
6. Do NOT repeat scenes, dialogue, or conflicts from other episodes.
7. ${isOnlyEpisode ? 'End with a cliffhanger cut.' : `End with a cliffhanger that sets up Episode ${episodeNumber + 1}.`}

Format your response EXACTLY as:
TITLE: [Use or improve: ${blueprint.title}]
LOGLINE: [Use or improve: ${blueprint.logline}]
PART 1 — SCENE:
[${blueprint.sceneHeading} — ${blueprint.timeOfDay}. Action, dialogue — 15-25 seconds performed. Topic: ${blueprint.topic}]
PART 2 — FACE-CAM CONFESSION:
[Character looks at camera, raw quotable line — 5-10 seconds]
PART 3 — CLIFFHANGER:
[Hard cut — unresolved line or reaction. Do NOT resolve the tension.]`,
    },
  ];
}

export function buildFallbackSeasonOutline(episodeCount: number): string {
  const blueprints = buildDefaultBlueprints(episodeCount);
  return `SEASON ARC: A ${episodeCount}-episode linked drama on the trading floor where Gnomi quietly gives one analyst an edge — each episode escalates stakes with a unique conflict.

${blueprints
  .map(
    (b) => `---
EPISODE ${b.episodeNumber}
TITLE: ${b.title}
TOPIC: ${b.topic}
TIME_OF_DAY: ${b.timeOfDay}
SCENE_HEADING: ${b.sceneHeading}
LOGLINE: ${b.logline}
OPENS_WITH: ${b.opensWith}
CLIFFHANGER: ${b.cliffhanger}
ARC_NOTE: ${b.arcNote}
---`
  )
  .join('\n\n')}`;
}

export function extractCliffhanger(script: string): string {
  const cliffMatch = script.match(
    /PART 3\s*[—–-]\s*CLIFFHANGER:?\s*([\s\S]+?)(?:\n\n|$)/i
  );
  if (cliffMatch) return cliffMatch[1].trim().slice(0, 300);

  const lines = script.trim().split('\n').filter(Boolean);
  return lines.slice(-3).join(' ').slice(0, 300);
}

export function parseTitleAndLogline(script: string): { title: string; logline: string } {
  const titleMatch = script.match(/^TITLE:\s*(.+)$/m);
  const loglineMatch = script.match(/^LOGLINE:\s*(.+)$/m);
  return {
    title: titleMatch?.[1]?.replace(/['"]/g, '').trim() ?? '',
    logline: loglineMatch?.[1]?.trim() ?? '',
  };
}
