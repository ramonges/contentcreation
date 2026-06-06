import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const reasons = [
  {
    icon: '🎭',
    title: 'Not an ad. A story.',
    desc: 'People skip ads. Nobody skips drama. Your product lives inside real human moments — not pitch decks.',
    color: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/20',
  },
  {
    icon: '🎬',
    title: 'Filmed in real conditions',
    desc: 'No studios. No actors reading off teleprompters. Real team. Real office. Real product use. Authentic vibes only.',
    color: 'from-red-500/20 to-pink-600/10',
    border: 'border-red-500/20',
  },
  {
    icon: '🚀',
    title: 'Built for virality',
    desc: 'Each episode is engineered for engagement — cliffhangers, relatable chaos, and a product that quietly saves the day.',
    color: 'from-blue-500/20 to-purple-600/10',
    border: 'border-blue-500/20',
  },
  {
    icon: '🤖',
    title: 'AI-powered scripts',
    desc: 'Our AI learns your company, your team, your product — and writes scripts that feel human, not generated.',
    color: 'from-green-500/20 to-teal-600/10',
    border: 'border-green-500/20',
  },
  {
    icon: '📱',
    title: 'Reel-ready output',
    desc: 'Every episode comes with a shooting script, shot list, and posting schedule. Just film and publish.',
    color: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/20',
  },
  {
    icon: '🎯',
    title: 'Your audience, hooked',
    desc: 'Season structure builds habit. Viewers come back for the next episode — and stay for the product.',
    color: 'from-pink-500/20 to-rose-600/10',
    border: 'border-pink-500/20',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function WhySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="why" className="relative bg-[#0A0A0F] py-32 px-6">
      {/* Separator line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-white/20" />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px bg-[#F5A623]" />
          <span className="text-[#F5A623] text-sm font-medium tracking-widest uppercase">Why choosing us</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-brand text-5xl md:text-6xl text-white mb-4 leading-tight"
        >
          Content that moves people.
          <br />
          <span className="text-white/40">Not just eyeballs.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-xl max-w-2xl mb-16"
        >
          Brands that feel like shows grow 3× faster. Here's why Season Content is the unfair advantage your competitors don't know about yet.
        </motion.p>

        {/* Cards grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${r.color} border ${r.border} backdrop-blur-sm group cursor-default`}
            >
              <div className="text-4xl mb-4">{r.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#F5A623] transition-colors">
                {r.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-white/10"
        >
          {[
            { value: '10×', label: 'more watch time than ads' },
            { value: '4.2×', label: 'higher brand recall' },
            { value: '82%', label: 'finish watching episodes' },
            { value: '3min', label: 'avg. time to first episode' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-brand text-4xl text-[#F5A623] mb-1">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
