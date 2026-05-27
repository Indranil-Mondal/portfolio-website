import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';
import AnimatedLetter from './animations/AnimatedLetter';
import data from '../data/indranil_mondal_master.json';

const { personal, professional_identity, employment, geography_of_clients } = data;

// The multi-style heading: name (normal) + title (italic serif accent) + a real skills line.
// Built from JSON. The italic middle clause is the professional_identity.title.
const HEADING_SEGMENTS = [
  { text: `I am ${personal.name},`, className: 'font-normal' },
  { text: `a ${professional_identity.title}.`, className: 'italic font-serif' },
  {
    text: `I have built ${professional_identity.total_sites_delivered} production sites and ${professional_identity.custom_plugins_built} custom plugins.`,
    className: 'font-normal',
  },
];

// Scroll-reveal body — uses real summary content stitched with first job context.
const firstJob = employment[0];
const bodyText =
  `Over the last ${professional_identity.years_experience} years, I have shipped ${professional_identity.international_projects} international projects across ${geography_of_clients.slice(0, 3).join(', ')}. ` +
  `At ${firstJob.company}, I own end-to-end delivery — from client calls and requirement analysis to architecture, QA, and on-time launches.`;

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const chars = bodyText.split('');
  const totalChars = chars.length;

  return (
    <section id="about" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-28 text-center">
        {/* Top label */}
        <p
          className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-8 sm:mb-10"
        >
          About
        </p>

        {/* Multi-style heading */}
        <div style={{ color: '#E1E0CC' }}>
          <WordsPullUpMultiStyle
            segments={HEADING_SEGMENTS}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9]"
          />
        </div>

        {/* Scroll-revealed body paragraph */}
        <div
          ref={ref}
          className="mt-10 sm:mt-14 md:mt-16 text-xs sm:text-sm md:text-base max-w-2xl mx-auto"
          style={{ color: '#DEDBC8', lineHeight: 1.7 }}
        >
          {chars.map((char, i) => (
            <AnimatedLetter
              key={`${char}-${i}`}
              char={char}
              index={i}
              totalChars={totalChars}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
