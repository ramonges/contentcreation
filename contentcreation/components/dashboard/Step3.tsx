import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import EpisodeCard, { Episode } from './EpisodeCard';
import { chatClient } from '@/lib/llmClient';
import { formatCastForPrompt } from '@/lib/cast';
import type { Step1Data } from './Step1';
import type { Message } from '@/lib/llm';

interface Step3Props {
  step1Data: Step1Data;
  companyContext: string;
  episodes: Episode[];
  onEpisodesChange: (episodes: Episode[]) => void;
  onViewEpisode: (id: number | null) => void;
  onBack: () => void;
}

const THUMB_CLASSES = [
  'ep-thumb-1', 'ep-thumb-2', 'ep-thumb-3', 'ep-thumb-4',
  'ep-thumb-5', 'ep-thumb-6', 'ep-thumb-7', 'ep-thumb-8',
  'ep-thumb-9', 'ep-thumb-10', 'ep-thumb-11', 'ep-thumb-12',
];

const FALLBACK_TITLES = [
  'Dan, the CEO Stole My Snacks',
  "The Demo That Wasn't",
  'CEO Gone Rogue',
  'Slack at 2AM',
  'The Password No One Knows',
  'Who Approved This Budget?',
  'Fire Drill or Real Fire?',
  'The Client Meeting From Hell',
  'Sprint Planning Gone Wrong',
  'The Intern Saved Us All',
  'Board Meeting Bloodbath',
  'Last Day Before Launch',
];

const FALLBACK_LOGLINES = [
  'A missing snack bag turns into a full HR investigation.',
  'The product demo crashes live on stage. Someone has to improvise.',
  'The CEO goes off-script on a podcast and breaks the internet.',
  'An emergency Slack message at 2AM turns into a three-hour drama.',
  'The whole team is locked out and the client is waiting.',
  'An intern approves a $50K spend by accident.',
  "Nobody knows if it's a drill until the fire truck shows up.",
  'A dream client turns into a 4-hour nightmare meeting.',
  'Sprint planning devolves into an existential crisis.',
  'The intern finds the bug no senior dev could for three weeks.',
  'The board wants answers. Nobody has them.',
  'Everything that can go wrong does — 24 hours before launch.',
];

function generateFallbackScript(episodeIndex: number, cast: Step1Data['cast'], title: string): string {
  const ep = episodeIndex + 1;
  const castStr = cast.map((m) => m.name).join(', ');
  const lead = cast[0] || { name: 'Alex', jobPosition: 'CEO', jobDescription: '' };
  const co = cast[1] || { name: 'Sam', jobPosition: 'Designer', jobDescription: '' };

  return `TITLE: ${title}
LOGLINE: ${FALLBACK_LOGLINES[episodeIndex % FALLBACK_LOGLINES.length]}

SCENE ${ep}: INT. OFFICE - MORNING

[The office is buzzing. ${castStr} are all at their desks. There's an unusual energy today.]

${lead.name.toUpperCase()}: (pulling up dashboard on screen) 
  Anyone else seeing this? The dashboard is showing yesterday's data.

${co.name.toUpperCase()}:
  That's not yesterday's data. That's last week's.

${lead.name.toUpperCase()}:
  (stares at screen for a long moment)
  ...okay. Okay. Nobody panic.

[Beat. Everyone visibly panics.]

SCENE ${ep + 1}: INT. MEETING ROOM - 10 MINUTES LATER

[The entire team has abandoned their desks and crammed into the meeting room.]

${lead.name.toUpperCase()}: 
  Right. We have a client presentation in 45 minutes. What do we actually know?

${co.name.toUpperCase()}:
  I know that my coffee is cold and I'm about to spiral.

[Someone's phone buzzes. It's the client. Early.]

${lead.name.toUpperCase()}: 
  (reading message)
  They're... in the lobby. They're early.

[Silence. A pen drops.]

SCENE ${ep + 2}: INT. LOBBY - IMMEDIATELY

[${lead.name} speed-walks to reception, refreshing the app furiously.]

${lead.name.toUpperCase()}: (muttering)
  Come on. Come on. Give me something to work with.

[The app loads. The data is there. Fresh, real-time, perfect.]

${lead.name.toUpperCase()}: (to themselves)
  There you are. Never doubted you for a second.

[The client walks through the door, smiling.]

CLIENT:
  Hope we're not too early!

${lead.name.toUpperCase()}: (professional calm restored)
  Perfect timing. We were just reviewing the latest numbers.

[Cut to: ${co.name} in the meeting room, refreshing their own screen, jaw dropping at the data.]

${co.name.toUpperCase()}: (texting)
  it's back?? how?? what did you DO

${lead.name.toUpperCase()}: (texting back)
  ...I just opened the app.

END OF EPISODE ${ep}`;
}

async function generateSingleEpisode(
  index: number,
  step1Data: Step1Data,
  companyContext: string
): Promise<Episode> {
  const i = index;
  const title = FALLBACK_TITLES[i % FALLBACK_TITLES.length];
  let logline = FALLBACK_LOGLINES[i % FALLBACK_LOGLINES.length];
  let script = '';

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a brilliant TV show writer. Write Episode ${i + 1} of ${step1Data.episodeCount} for this company's content season.

Cast (use their job positions and day-to-day responsibilities in scenes and dialogue):
${formatCastForPrompt(step1Data.cast)}

The product should be used naturally, never explained like a tutorial.
Episodes should feel like The Office meets Succession — real drama, real product use.

Format your response EXACTLY as:
TITLE: [Dramatic, funny title referencing the episode conflict]
LOGLINE: [One punchy sentence]
SCENE 1: [Scene heading]
[Description and dialogue in proper screenplay format]
Continue for 3-5 scenes.`,
    },
    {
      role: 'user',
      content: `Company context from briefing:\n${companyContext}\n\nGenerate episode ${i + 1} now.`,
    },
  ];

  try {
    script = await chatClient(messages);
    const titleMatch = script.match(/^TITLE:\s*(.+)$/m);
    const loglineMatch = script.match(/^LOGLINE:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].replace(/['"]/g, '');
    if (loglineMatch) logline = loglineMatch[1];
  } catch {
    script = generateFallbackScript(i, step1Data.cast, title);
  }

  return {
    id: i + 1,
    title,
    logline,
    script,
    thumbClass: THUMB_CLASSES[i % THUMB_CLASSES.length],
  };
}

export default function Step3({
  step1Data,
  companyContext,
  episodes,
  onEpisodesChange,
  onViewEpisode,
  onBack,
}: Step3Props) {
  const [generating, setGenerating] = useState(
    episodes.length < step1Data.episodeCount
  );
  const [generatingIndex, setGeneratingIndex] = useState(
    episodes.length > 0 ? episodes.length : 0
  );
  const episodesRef = useRef(episodes);
  episodesRef.current = episodes;

  useEffect(() => {
    if (episodesRef.current.length >= step1Data.episodeCount) {
      setGenerating(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setGenerating(true);
      let current = [...episodesRef.current];

      for (let i = current.length; i < step1Data.episodeCount; i++) {
        if (cancelled) return;
        setGeneratingIndex(i + 1);
        const ep = await generateSingleEpisode(i, step1Data, companyContext);
        if (cancelled) return;
        current = [...current, ep];
        onEpisodesChange(current);
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!cancelled) setGenerating(false);
    };

    run();
    return () => { cancelled = true; };
  }, []); // resume from episodes already saved in parent

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to briefing
        </button>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">
          Step 3 of 3
        </span>
        <h2 className="text-4xl font-brand text-gray-900 mb-2">Your season drops</h2>
        <p className="text-gray-500">
          {generating
            ? `Generating episode ${generatingIndex} of ${step1Data.episodeCount}...`
            : `${episodes.length} episodes ready. Click any episode to read the script.`}
        </p>
      </div>

      {generating && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
            />
            <span className="text-amber-700 font-medium text-sm">
              Writing episode {generatingIndex} of {step1Data.episodeCount}...
              {episodes.length > 0 && ` (${episodes.length} saved)`}
            </span>
          </div>
          <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              animate={{ width: `${(generatingIndex / step1Data.episodeCount) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {episodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {episodes.map((ep, i) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              index={i}
              onClick={() => onViewEpisode(ep.id)}
            />
          ))}
        </div>
      )}

      {generating && episodes.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: step1Data.episodeCount }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 h-56 animate-pulse" />
          ))}
        </div>
      )}

    </motion.div>
  );
}
