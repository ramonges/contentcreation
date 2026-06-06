import { useState } from 'react';
import { motion } from 'framer-motion';

export type CastMember = {
  id: string;
  name: string;
  jobPosition: string;
  jobDescription: string;
};

export type Step1Data = {
  episodeCount: number;
  cast: CastMember[];
};

const DEFAULT_CAST: CastMember[] = [
  { id: '1', name: '', jobPosition: '', jobDescription: '' },
  { id: '2', name: '', jobPosition: '', jobDescription: '' },
];

const EPISODE_MIN = 1;
const EPISODE_MAX = 12;

function episodeTickPosition(value: number) {
  return ((value - EPISODE_MIN) / (EPISODE_MAX - EPISODE_MIN)) * 100;
}

interface Step1Props {
  initialData?: Step1Data;
  onComplete: (data: Step1Data) => void;
}

export default function Step1({ initialData, onComplete }: Step1Props) {
  const [episodeCount, setEpisodeCount] = useState(initialData?.episodeCount ?? 6);
  const [cast, setCast] = useState<CastMember[]>(initialData?.cast ?? DEFAULT_CAST);

  const addCastMember = () => {
    setCast([...cast, { id: Date.now().toString(), name: '', jobPosition: '', jobDescription: '' }]);
  };

  const removeCastMember = (id: string) => {
    if (cast.length <= 1) return;
    setCast(cast.filter((m) => m.id !== id));
  };

  const updateCastMember = (
    id: string,
    field: keyof Pick<CastMember, 'name' | 'jobPosition' | 'jobDescription'>,
    value: string
  ) => {
    setCast(cast.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const canProceed = cast.every((m) => m.name.trim() && m.jobPosition.trim());

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComplete({ episodeCount, cast });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <motion.div
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-10">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-4">
          Step 1 of 3
        </span>
        <h2 className="text-4xl font-brand text-gray-900 mb-3">Set the stage</h2>
        <p className="text-gray-500 text-lg">
          Choose your season structure and introduce your cast — names, job positions, and what each person actually does.
        </p>
      </div>

      {/* Episode count */}
      <div className="mb-10 p-6 rounded-2xl bg-gray-50 border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Episodes per season
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative pt-1">
            <input
              type="range"
              min={EPISODE_MIN}
              max={EPISODE_MAX}
              value={episodeCount}
              onChange={(e) => setEpisodeCount(parseInt(e.target.value))}
              className="episode-slider w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="relative mt-3 h-5">
              {Array.from({ length: EPISODE_MAX }, (_, i) => i + EPISODE_MIN).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEpisodeCount(value)}
                  className={`absolute -translate-x-1/2 text-xs transition-colors ${
                    value === episodeCount
                      ? 'text-amber-600 font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={{ left: `${episodeTickPosition(value)}%` }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex flex-col items-center justify-center shadow-md shadow-amber-200">
            <span className="text-white font-brand text-3xl leading-none">{episodeCount}</span>
            <span className="text-white/70 text-xs">eps</span>
          </div>
        </div>
        <p className="mt-3 text-gray-400 text-sm">
          {episodeCount <= 3
            ? 'A short miniseries — great for a product launch.'
            : episodeCount <= 6
            ? 'A perfect half-season. Binge-worthy.'
            : 'A full season — your audience will be hooked for weeks.'}
        </p>
      </div>

      {/* Cast */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Cast members
        </label>
        <p className="text-gray-400 text-sm mb-4">
          Add real people from your team. Job positions and day-to-day details help the AI write believable scenes.
        </p>

        <div className="space-y-4">
          {cast.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 items-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-3">
                <span className="text-gray-400 text-xs font-medium">{i + 1}</span>
              </div>
              <div className="flex-1 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dan"
                      value={member.name}
                      onChange={(e) => updateCastMember(member.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Job position</label>
                    <input
                      type="text"
                      placeholder="e.g. CEO, Head of Sales"
                      value={member.jobPosition}
                      onChange={(e) => updateCastMember(member.id, 'jobPosition', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    What they do day-to-day
                    <span className="text-gray-400 font-normal ml-1">(optional but helps the AI)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Runs morning standups, approves budgets, always forgets to mute on Zoom..."
                    value={member.jobDescription}
                    onChange={(e) => updateCastMember(member.id, 'jobDescription', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeCastMember(member.id)}
                disabled={cast.length <= 1}
                className="mt-3 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCastMember}
          disabled={cast.length >= 8}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add cast member {cast.length >= 8 ? '(max 8)' : ''}
        </button>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed}
        className="w-full py-4 rounded-2xl bg-black text-white font-semibold text-lg hover:bg-amber-500 hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-black/10"
      >
        Continue to briefing →
      </button>
    </motion.div>
  );
}
