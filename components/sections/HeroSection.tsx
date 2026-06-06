import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AuthModal from '../AuthModal';

const filmFrames = [
  { label: 'EP 01', title: '"Dan stole my snacks"', color: 'from-purple-600 to-pink-600' },
  { label: 'EP 02', title: '"The demo that wasn\'t"', color: 'from-amber-500 to-red-600' },
  { label: 'EP 03', title: '"CEO gone rogue"', color: 'from-blue-500 to-teal-500' },
  { label: 'EP 04', title: '"Slack at 2am"', color: 'from-green-500 to-emerald-600' },
];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <>
      <section
        id="hero"
        ref={ref}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F]"
      >
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#F5A623]/8 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E63946]/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Film strip top decoration */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center overflow-hidden opacity-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-8 h-8 mx-1 border border-white/30 rounded-sm" />
          ))}
        </div>

        <motion.div
          style={{ y, opacity }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm backdrop-blur-sm"
          >
            🎬 Transform your brand into a content series
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-brand text-7xl md:text-9xl text-white leading-none tracking-tight mb-6"
          >
            Season{' '}
            <span className="shimmer-text">Content</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-xl md:text-2xl max-w-2xl leading-relaxed mb-10"
          >
            Turn your social media presence into a{' '}
            <span className="text-white font-medium">movie</span>. Real people. Real use. 
            Real drama.{' '}
            <span className="text-[#F5A623]">Not another ad.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <button
              onClick={() => setAuthOpen(true)}
              className="group px-8 py-4 rounded-full bg-[#F5A623] text-black font-bold text-lg hover:bg-white transition-all duration-300 shadow-[0_0_40px_rgba(245,166,35,0.3)] hover:shadow-[0_0_60px_rgba(245,166,35,0.5)]"
            >
              <span className="flex items-center gap-2">
                Start your first season
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <a
              href="#why"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#why')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full border border-white/20 text-white/80 font-medium text-lg hover:border-white/40 hover:text-white transition-all duration-200"
            >
              See how it works
            </a>
          </motion.div>

          {/* Episode preview strip */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20 flex gap-4 overflow-x-auto pb-4 max-w-full"
          >
            {filmFrames.map((frame, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex-shrink-0 w-48 h-28 rounded-2xl overflow-hidden relative cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${frame.color} opacity-80`} />
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  <span className="text-white/70 text-xs font-mono">{frame.label}</span>
                  <span className="text-white text-sm font-semibold leading-snug">{frame.title}</span>
                </div>
                {/* Film perforations */}
                <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="w-2 h-2 bg-black/40 rounded-full mx-auto" />
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="w-2 h-2 bg-black/40 rounded-full mx-auto" />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex flex-col items-center gap-2 text-white/30 text-xs"
          >
            <span>Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Film strip bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center overflow-hidden opacity-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-8 h-8 mx-1 border border-white/30 rounded-sm" />
          ))}
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
