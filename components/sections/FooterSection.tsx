import { motion } from 'framer-motion';

export default function FooterSection() {
  return (
    <footer className="relative bg-[#060608] border-t border-white/5 py-16 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#F5A623]/3 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="font-brand text-3xl text-white mb-3">Season Content</div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Transform your social media presence into a cinematic content experience. Real teams. Real products. Real drama.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-3">
              {['Why Choosing Us', 'The Process', 'Pricing', 'Case Studies'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/40 text-sm hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/40 text-sm hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-white/30 text-sm">
            © 2026 Season Content. All rights reserved.
          </p>

          {/* Trusted by Gnomi */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <span className="text-white/30 text-sm font-medium">Trusted by</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <img
                src="/gnomi-logo.png"
                alt="Gnomi"
                width={80}
                height={20}
                className="object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </motion.div>

          {/* Legal links */}
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a key={link} href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
