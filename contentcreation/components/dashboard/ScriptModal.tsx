import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatClient } from '@/lib/llmClient';
import type { Episode } from './EpisodeCard';

interface ScriptModalProps {
  episode: Episode | null;
  onClose: () => void;
  onScriptUpdate: (episodeId: number, newScript: string) => void;
}

export default function ScriptModal({ episode, onClose, onScriptUpdate }: ScriptModalProps) {
  const [modRequest, setModRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const scriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (episode) {
      setScript(episode.script);
      setModRequest('');
    }
  }, [episode?.id, episode?.script]);

  const handleModify = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!modRequest.trim() || !episode || loading) return;

    setLoading(true);
    try {
      const newScript = await chatClient([
        {
          role: 'system',
          content: 'You are a TV script editor. Modify the script based on the request. Return ONLY the full modified script, no commentary.',
        },
        {
          role: 'user',
          content: `Original script:\n${script}\n\nModification: ${modRequest}\n\nReturn the full modified script:`,
        },
      ]);
      setScript(newScript);
      onScriptUpdate(episode.id, newScript);
      setModRequest('');
    } catch {
      // fallback: append note to script
      const modified = `${script}\n\n[EDIT NOTE: ${modRequest}]`;
      setScript(modified);
      onScriptUpdate(episode.id, modified);
      setModRequest('');
    } finally {
      setLoading(false);
    }
  };

  const formatScript = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('TITLE:')) {
        return <h2 key={i} className="text-2xl font-bold text-gray-900 mb-2 mt-4">{trimmed.replace('TITLE:', '').trim()}</h2>;
      }
      if (trimmed.startsWith('LOGLINE:')) {
        return <p key={i} className="text-gray-500 italic mb-6">{trimmed.replace('LOGLINE:', '').trim()}</p>;
      }
      if (trimmed.startsWith('SCENE ') || trimmed.match(/^(INT\.|EXT\.|SCENE)/)) {
        return <h3 key={i} className="text-sm font-bold uppercase tracking-wider text-amber-600 mt-8 mb-3">{trimmed}</h3>;
      }
      if (trimmed.match(/^[A-Z][A-Z\s]+:/) && !trimmed.includes('SCENE')) {
        const colonIdx = trimmed.indexOf(':');
        const speaker = trimmed.slice(0, colonIdx);
        const dialogue = trimmed.slice(colonIdx + 1).trim();
        return (
          <div key={i} className="mb-3 pl-4 border-l-2 border-gray-200">
            <span className="text-xs font-bold uppercase text-gray-500 block mb-0.5">{speaker}</span>
            <span className="text-gray-800">{dialogue}</span>
          </div>
        );
      }
      if (trimmed.startsWith('[') || trimmed.startsWith('(')) {
        return <p key={i} className="text-gray-400 italic text-sm my-1">{trimmed}</p>;
      }
      if (!trimmed) return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-700 leading-relaxed mb-2">{trimmed}</p>;
    });
  };

  return (
    <AnimatePresence>
      {episode && (
        <motion.div
          key={episode.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full md:max-w-3xl bg-white md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`relative h-20 ${episode.thumbClass} flex-shrink-0`}>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-6">
                <div>
                  <span className="text-white/60 text-xs font-mono">EP {String(episode.id).padStart(2, '0')}</span>
                  <h2 className="text-white font-bold text-lg leading-tight">{episode.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Script content */}
            <div ref={scriptRef} className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-none prose-sm">
                {formatScript(script)}
              </div>
            </div>

            {/* Bottom edit bar */}
            <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live script editor</span>
              </div>
              <div className="flex gap-3 items-end">
                <textarea
                  rows={2}
                  value={modRequest}
                  onChange={(e) => setModRequest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleModify(e);
                    }
                  }}
                  placeholder="Make it more dramatic... add a twist where Dan gets fired... make it funnier..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleModify}
                  disabled={!modRequest.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-amber-500 transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    'Rewrite'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
