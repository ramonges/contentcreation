import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
  { label: 'Why Choosing Us', href: '#why' },
  { label: 'The Process', href: '#process' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`flex items-center justify-between rounded-full px-4 py-2 transition-all duration-300 ${
              scrolled
                ? 'bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10 shadow-2xl'
                : 'bg-[#0A0A0F]/60 backdrop-blur-md border border-white/5'
            }`}
          >
            {/* Logo pill */}
            <a
              href="#hero"
              onClick={(e) => handleNav(e, '#hero')}
              className="rugby-pill group cursor-pointer hover:bg-[#3A3A5A] transition-colors duration-200"
            >
              <span className="font-brand text-white text-lg tracking-wide group-hover:text-[#F5A623] transition-colors">
                Season Content
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNav(e, item.href)}
                  className="rugby-pill text-white/80 text-sm font-medium hover:text-white hover:bg-[#3A3A5A] transition-all duration-200 cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => setAuthOpen(true)}
                className="ml-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold border-2 border-black hover:bg-[#F5A623] hover:border-[#F5A623] transition-all duration-200 shadow-sm"
              >
                Build your content season
              </button>
            </nav>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden rugby-pill text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden mt-2 rounded-2xl bg-[#0A0A0F]/95 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-3"
              >
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNav(e, item.href)}
                    className="text-white/80 text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold border-2 border-black hover:bg-[#F5A623] hover:border-[#F5A623] transition-all"
                >
                  Build your content season
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
