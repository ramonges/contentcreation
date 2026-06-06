import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import AuthModal from '../AuthModal';

const steps = [
  {
    number: '01',
    title: 'Set the stage',
    subtitle: 'Cast your season',
    desc: 'Choose how many episodes in your season (1–12). Add your cast — your actual team members — with their real job titles. No actors needed.',
    details: [
      'Select 3 to 12 episodes per season',
      'Add team members: name + role (CEO, Designer, Sales, etc.)',
      'Define the tone: comedy, drama, thriller — or all three',
    ],
    visual: (
      <div className="space-y-3">
        {['Episodes per season', 'Cast members', 'Season tone'].map((label, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/60 text-sm">{label}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: i === 0 ? 8 : i === 1 ? 5 : 3 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-3 h-3 rounded-full ${j < (i === 0 ? 6 : i === 1 ? 3 : 2) ? 'bg-[#F5A623]' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    color: '#F5A623',
    bg: 'from-amber-500/10 to-orange-600/5',
  },
  {
    number: '02',
    title: 'Feed the AI',
    subtitle: 'Build your world',
    desc: 'Have a conversation with our AI agent. Tell it about your company, your product, your funniest work moments. The AI builds a creative brief from your answers.',
    details: [
      'Conversational AI — just talk naturally',
      'Describes your product\'s real use cases',
      'Identifies the most story-worthy moments',
    ],
    visual: (
      <div className="space-y-2 font-mono text-sm">
        {[
          { role: 'ai', msg: 'What does your product actually do at 2am on a Wednesday?' },
          { role: 'user', msg: 'It sends alerts when deals go cold. Our sales team panic-uses it.' },
          { role: 'ai', msg: 'Perfect. Who\'s the one who always ignores the alerts?' },
          { role: 'user', msg: 'lol that\'s Dan, our CEO' },
        ].map((m, i) => (
          <div key={i} className={`p-2.5 rounded-xl max-w-[85%] text-xs ${m.role === 'ai' ? 'bg-white/10 text-white/80' : 'ml-auto bg-[#F5A623]/20 text-[#F5A623]'}`}>
            {m.msg}
          </div>
        ))}
      </div>
    ),
    color: '#818CF8',
    bg: 'from-indigo-500/10 to-purple-600/5',
  },
  {
    number: '03',
    title: 'Your season drops',
    subtitle: 'Episodes, scripts, action',
    desc: 'The AI generates a full season of episodes — each with a title, logline, and shooting script. Drama-first. Product-native. Ready to film.',
    details: [
      'One card per episode with a dramatic title',
      'Full script with scene descriptions and dialogue',
      'Edit any episode in real-time via AI chat',
    ],
    visual: (
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: '"Dan stole my snacks"', ep: 'EP 01', color: 'from-purple-500 to-pink-600' },
          { title: '"The demo that wasn\'t"', ep: 'EP 02', color: 'from-amber-500 to-red-500' },
          { title: '"CEO gone rogue"', ep: 'EP 03', color: 'from-blue-500 to-teal-500' },
          { title: '"Slack at 2am"', ep: 'EP 04', color: 'from-green-500 to-emerald-500' },
        ].map((ep, i) => (
          <div key={i} className={`relative h-20 rounded-xl overflow-hidden bg-gradient-to-br ${ep.color} cursor-pointer hover:scale-105 transition-transform`}>
            <div className="absolute inset-0 p-2 flex flex-col justify-between">
              <span className="text-white/60 text-xs">{ep.ep}</span>
              <span className="text-white text-xs font-semibold leading-tight">{ep.title}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    color: '#34D399',
    bg: 'from-emerald-500/10 to-teal-600/5',
  },
];

export default function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <section id="process" className="relative bg-[#080810] py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-transparent to-[#0A0A0F] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-[#E63946]" />
            <span className="text-[#E63946] text-sm font-medium tracking-widest uppercase">The process</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-brand text-5xl md:text-6xl text-white mb-4"
          >
            Three steps.
            <br />
            <span className="text-white/40">One season.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xl max-w-xl mb-20"
          >
            From zero to full season script in under 10 minutes. Your real team, your real product, your real story.
          </motion.p>

          {/* Steps */}
          <div ref={ref} className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
              >
                {/* Content */}
                <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="font-brand text-6xl leading-none"
                      style={{ color: step.color, opacity: 0.3 }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: step.color }}>
                        {step.subtitle}
                      </div>
                      <h3 className="font-brand text-3xl text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-white/50 text-lg mb-6 leading-relaxed">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-3 text-white/60 text-sm">
                        <span className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border" style={{ borderColor: step.color }}>
                          <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3.5 6L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: step.color }} />
                          </svg>
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={`${i % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-3xl bg-gradient-to-br ${step.bg} border border-white/10 backdrop-blur-sm`}
                  >
                    {step.visual}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <button
              onClick={() => setAuthOpen(true)}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-[#F5A623] to-[#E63946] text-white font-bold text-xl hover:opacity-90 transition-opacity shadow-[0_0_60px_rgba(245,166,35,0.2)]"
            >
              Start building your season →
            </button>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
