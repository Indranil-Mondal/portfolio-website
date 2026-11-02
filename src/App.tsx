import { MotionConfig } from 'framer-motion';
import Hero from './components/Hero';
import About from './components/About';
import Metrics from './components/Metrics';
import Features from './components/Features';
import CaseStudy from './components/CaseStudy';
import AILab from './components/AILab';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import OpenSource from './components/OpenSource';
import Contact, { SiteFooter } from './components/Contact';
import CustomCursor from './components/CustomCursor';

// The page title, meta description, Open Graph tags and JSON-LD are written into index.html at
// build time by the static SEO plugin in vite.config.ts, so nothing is set at runtime here.
// MotionConfig reducedMotion="user": framer-motion drops transform animations for visitors who
// prefer reduced motion (opacity fades remain).
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10001] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>
      <CustomCursor />
      <main id="main" className="bg-black text-white">
        <Hero />
        <About />
        <Metrics />
        <Features />
        <CaseStudy />
        <AILab />
        <Projects />
        <Experience />
        <Skills />
        <OpenSource />
        <Contact />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}
