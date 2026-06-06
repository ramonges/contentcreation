import { motion } from 'framer-motion';

export type Episode = {
  id: number;
  title: string;
  logline: string;
  script: string;
  thumbClass: string;
};

interface EpisodeCardProps {
  episode: Episode;
  onClick: () => void;
  index: number;
}

const DRAMA_ICONS = ['🎬', '💥', '😤', '🍿', '🔥', '👀', '😱', '🎭', '⚡', '🤯', '💀', '🚨'];

export default function EpisodeCard({ episode, onClick, index }: EpisodeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
    >
      {/* Thumbnail */}
      <div className={`relative h-44 ${episode.thumbClass} overflow-hidden`}>
        {/* Film strip perforations */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around bg-black/20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 bg-black/40 rounded-full mx-auto" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-around bg-black/20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 bg-black/40 rounded-full mx-auto" />
          ))}
        </div>

        {/* Episode number */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-mono">
          EP {String(episode.id).padStart(2, '0')}
        </div>

        {/* Drama icon */}
        <div className="absolute bottom-3 right-5 text-2xl">
          {DRAMA_ICONS[index % DRAMA_ICONS.length]}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-amber-600 transition-colors">
          {episode.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{episode.logline}</p>

        {/* Read script link */}
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 group-hover:text-amber-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Read script
        </div>
      </div>
    </motion.div>
  );
}
