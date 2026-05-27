import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WordsPullUp from './animations/WordsPullUp';
import data from '../data/indranil_mondal_master.json';

const { personal, professional_identity } = data;

// Nav items adapted from "Our story / Collective / Workshops / Programs / Inquiries"
// to portfolio-appropriate labels per SYSTEM_PROMPT.json escape rules.
const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Contact', href: '#contact' },
];

// First 2 sentences of the summary make a punchy hero blurb
const heroBlurb =
  professional_identity.summary.split('. ').slice(0, 2).join('. ') + '.';

export default function Hero() {
  return (
    <section className="h-screen p-4 md:p-6 relative">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#0a0a0a]">
        {/* Atmospheric gradient mesh background (replaces the spec's video URL —
            escape rule: do NOT invent video URLs). Maintains dark cinematic mood. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, rgba(70,50,30,0.55) 0%, transparent 55%),' +
              'radial-gradient(ellipse at 80% 70%, rgba(40,30,55,0.50) 0%, transparent 55%),' +
              'radial-gradient(ellipse at 50% 100%, rgba(120,90,55,0.30) 0%, transparent 60%),' +
              'linear-gradient(180deg, #0c0c0c 0%, #050505 100%)',
          }}
        />

        {/* Slow drifting accent shapes — subtle cinematic motion */}
        <motion.div
          className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #DEDBC8 0%, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-32 w-[45rem] h-[45rem] rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #8a6a3a 0%, transparent 70%)' }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />

        {/* Gradient overlay top→bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Navbar: black pill hanging from the top edge */}
        <nav className="absolute top-0 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20">
          <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2.5 md:px-8 md:py-3 w-full sm:w-auto">
            <ul className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 md:gap-12 lg:gap-14">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  {/* Added the missing <a here */}
                  <a
                    href={item.href}
                    className="text-xs md:text-sm transition-colors duration-200 whitespace-nowrap"
                    style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Bottom-aligned hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 lg:px-12 pb-6 md:pb-10 lg:pb-12">
          <div className="grid grid-cols-12 gap-4 md:gap-6 items-end">
            {/* Left: giant heading — personal.name */}
            <div className="col-span-12 lg:col-span-8" style={{ color: '#E1E0CC' }}>
              <WordsPullUp
                text={personal.name}
                showAsterisk
                className="text-[19vw] sm:text-[18vw] md:text-[16vw] lg:text-[14vw] xl:text-[13vw] 2xl:text-[13vw] font-medium leading-[0.85] tracking-[-0.07em]"
              />
            </div>

            {/* Right: description + CTA */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 sm:gap-6 lg:pl-4 lg:pb-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-primary/70 text-xs sm:text-sm md:text-base max-w-md"
                style={{ lineHeight: 1.4 }}
              >
                {heroBlurb}
              </motion.p>

              <motion.a
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                href="#contact"
                className="group inline-flex items-center justify-between gap-2 bg-primary rounded-full pl-5 sm:pl-6 pr-1.5 py-1.5 self-start transition-all duration-300 hover:gap-3"
              >
                <span className="text-black font-medium text-sm sm:text-base">
                  Hire Me
                </span>
                <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: '#E1E0CC' }}
                  />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
