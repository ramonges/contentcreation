import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import EpisodeCard, { Episode } from './EpisodeCard';
import { chatClient } from '@/lib/llmClient';
import {
  buildEpisodeScriptMessages,
  buildFallbackScript,
  buildSeasonContextMessages,
  buildDefaultSeasonContext,
  parseSeasonContext,
  parseTitleAndLogline,
  SCRIPT_DURATION_SECONDS,
  type PriorEpisodeScript,
  type SeasonContext,
} from '@/lib/episodeGeneration';
import type { Step1Data } from './Step1';

interface Step3Props {
  step1Data: Step1Data;
  companyContext: string;
  episodes: Episode[];
  seasonOutline: string;
  seasonPlan: string;
  generatedForEpisodeCount: number | null;
  generationBatchId: string | null;
  generatedForBatchId: string | null;
  onEpisodesChange: (
    episodes: Episode[],
    seasonPlan?: string,
    generatedForEpisodeCount?: number,
    generatedForBatchId?: string | null
  ) => void;
  onViewEpisode: (id: number | null) => void;
  onBack: () => void;
}

const THUMB_CLASSES = [
  'ep-thumb-1', 'ep-thumb-2', 'ep-thumb-3', 'ep-thumb-4',
  'ep-thumb-5', 'ep-thumb-6', 'ep-thumb-7', 'ep-thumb-8',
  'ep-thumb-9', 'ep-thumb-10', 'ep-thumb-11', 'ep-thumb-12',
];

type GenerationPhase = 'idle' | 'phase1' | 'phase2';

/** PHASE 1 — Define full season context (arc + ending) before any script. */
async function runPhase1(
  step1Data: Step1Data,
  briefingContext: string,
  savedPlan: string
): Promise<SeasonContext> {
  let raw = savedPlan.trim();
  if (!raw) {
    try {
      raw = await chatClient(buildSeasonContextMessages(step1Data, briefingContext));
    } catch {
      raw = buildDefaultSeasonContext(step1Data, briefingContext).raw;
    }
  }
  return parseSeasonContext(raw, step1Data.episodeCount, briefingContext);
}

/** PHASE 2 — One API call per episode with season context + all prior scripts. */
async function runPhase2Episode(
  episodeNumber: number,
  step1Data: Step1Data,
  briefingContext: string,
  seasonContext: SeasonContext,
  previousScripts: PriorEpisodeScript[]
): Promise<Episode> {
  let title = `Episode ${episodeNumber}`;
  let logline = '';
  let script = '';

  try {
    script = await chatClient(
      buildEpisodeScriptMessages(
        step1Data,
        briefingContext,
        seasonContext,
        episodeNumber,
        previousScripts
      )
    );
    const parsed = parseTitleAndLogline(script);
    if (parsed.title) title = parsed.title;
    if (parsed.logline) logline = parsed.logline;
  } catch {
    script = buildFallbackScript(
      episodeNumber,
      step1Data.episodeCount,
      seasonContext,
      step1Data.cast,
      previousScripts
    );
    const parsed = parseTitleAndLogline(script);
    title = parsed.title || title;
    logline = parsed.logline || seasonContext.episodeBlueprints[episodeNumber - 1].scenario;
  }

  return {
    id: episodeNumber,
    title,
    logline,
    script,
    thumbClass: THUMB_CLASSES[(episodeNumber - 1) % THUMB_CLASSES.length],
  };
}

export default function Step3({
  step1Data,
  companyContext,
  episodes,
  seasonPlan: savedSeasonContext,
  generatedForEpisodeCount,
  generationBatchId,
  generatedForBatchId,
  onEpisodesChange,
  onViewEpisode,
  onBack,
}: Step3Props) {
  const targetCount = step1Data.episodeCount;
  const briefingComplete = generationBatchId !== null && companyContext.trim().length > 0;
  const batchMismatch =
    generationBatchId !== null &&
    generatedForBatchId !== null &&
    generatedForBatchId !== generationBatchId;
  const countMismatch =
    generatedForEpisodeCount !== null && generatedForEpisodeCount !== targetCount;
  const needsGeneration =
    briefingComplete &&
    (batchMismatch || countMismatch || episodes.length < targetCount);

  const [generating, setGenerating] = useState(needsGeneration);
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [generatingIndex, setGeneratingIndex] = useState(
    episodes.length > 0 ? episodes.length : 0
  );

  const episodesRef = useRef(episodes);
  const seasonContextRef = useRef(savedSeasonContext);
  episodesRef.current = episodes;
  seasonContextRef.current = savedSeasonContext;

  useEffect(() => {
    if (!briefingComplete || !needsGeneration) {
      setGenerating(false);
      setPhase('idle');
      return;
    }

    let cancelled = false;

    const run = async () => {
      setGenerating(true);
      let current = batchMismatch || countMismatch ? [] : [...episodesRef.current];
      let contextRaw = batchMismatch || countMismatch ? '' : seasonContextRef.current;

      // ── PHASE 1: Season arc (1 API call) ──
      setPhase('phase1');
      setGeneratingIndex(0);

      const seasonContext = await runPhase1(step1Data, companyContext, contextRaw);
      if (cancelled) return;

      contextRaw = seasonContext.raw;
      onEpisodesChange(current, contextRaw, targetCount, generationBatchId);

      // ── PHASE 2: Sequential episodes (X API calls) ──
      setPhase('phase2');

      for (let i = current.length; i < targetCount; i++) {
        if (cancelled) return;

        const episodeNumber = i + 1;
        setGeneratingIndex(episodeNumber);

        const previousScripts: PriorEpisodeScript[] = current.map((ep) => ({
          episodeNumber: ep.id,
          title: ep.title,
          script: ep.script,
        }));

        const ep = await runPhase2Episode(
          episodeNumber,
          step1Data,
          companyContext,
          seasonContext,
          previousScripts
        );
        if (cancelled) return;

        current = [...current, ep];
        onEpisodesChange(current, contextRaw, targetCount, generationBatchId);
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!cancelled) {
        setGenerating(false);
        setPhase('idle');
      }
    };

    run();
    return () => { cancelled = true; };
  }, [targetCount, needsGeneration, briefingComplete, generationBatchId]);

  if (!briefingComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <h2 className="text-3xl font-brand text-gray-900 mb-3">Finish the briefing first</h2>
        <p className="text-gray-500 mb-8">
          Complete Step 2 and click Generate. Phase 1 defines the season arc; Phase 2 writes each episode.
        </p>
        <button type="button" onClick={onBack} className="px-6 py-3 rounded-2xl bg-black text-white font-semibold hover:bg-amber-500 hover:text-black transition-all">
          ← Back to Step 2
        </button>
      </motion.div>
    );
  }

  const totalApiCalls = 1 + targetCount;
  const completedCalls = phase === 'phase1' ? 0 : generatingIndex;
  const progressPercent = phase === 'phase1' ? 2 : ((1 + generatingIndex) / totalApiCalls) * 100;

  const statusText =
    phase === 'phase1'
      ? 'Phase 1 — Defining season arc (world, characters, ending)...'
      : `Phase 2 — Episode ${generatingIndex}/${targetCount} (${SCRIPT_DURATION_SECONDS}s script)`;

  const contextText =
    generatingIndex === 0 && phase === 'phase2'
      ? 'Season context + briefing'
      : generatingIndex === 1
      ? 'Season context + briefing (no prior scripts)'
      : `Season context + briefing + episodes 1–${generatingIndex - 1}`;

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
            ? statusText
            : `${episodes.length} episode${episodes.length === 1 ? '' : 's'} ready.`}
        </p>
      </div>

      {generating && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
            />
            <span className="text-amber-700 font-medium text-sm">{statusText}</span>
          </div>
          {phase === 'phase2' && (
            <p className="text-amber-600/80 text-xs mb-3 ml-8">
              API call {1 + generatingIndex} of {totalApiCalls} — includes: {contextText}
            </p>
          )}
          <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {episodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {episodes.map((ep, i) => (
            <EpisodeCard key={ep.id} episode={ep} index={i} onClick={() => onViewEpisode(ep.id)} />
          ))}
        </div>
      )}

      {generating && episodes.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: targetCount }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 h-56 animate-pulse" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
