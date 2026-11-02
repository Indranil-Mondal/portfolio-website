import { Fragment, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import {
  Briefcase,
  CalendarClock,
  Globe,
  GraduationCap,
  Hourglass,
  Languages,
  Layers,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';
import AnimatedLetter from './animations/AnimatedLetter';
import {
  availability,
  education,
  noticePeriod,
  personal,
  platforms_worked_on,
  professional_identity,
} from '../lib/data';
import { fadeUp } from '../lib/motion';

const HEADING_ID = 'about-heading';

// Multi-style heading: name (regular), title (italic serif accent), then the delivery counts.
const HEADING_SEGMENTS = [
  { text: `I am ${personal.name},`, className: 'font-normal' },
  { text: `a ${professional_identity.title}.`, className: 'italic font-serif' },
  {
    text: `I have built ${professional_identity.total_sites_delivered} production sites and ${professional_identity.custom_plugins_built} custom plugins.`,
    className: 'font-normal',
  },
];
const HEADING_TEXT = HEADING_SEGMENTS.map((segment) => segment.text).join(' ');

// The scroll-revealed body. Letters are grouped per word (nowrap) so a word never breaks mid-line;
// `start` is each word's offset in the full string, which drives the per-letter reveal window.
const SUMMARY = professional_identity.summary;
const SUMMARY_WORDS = (() => {
  let offset = 0;
  return SUMMARY.split(' ').map((word) => {
    const start = offset;
    offset += word.length + 1;
    return { word, start };
  });
})();

interface Fact {
  key: string;
  label: string;
  icon: LucideIcon;
  value: ReactNode;
}

function buildFacts(): Fact[] {
  const facts: Fact[] = [];
  const notice = noticePeriod();
  const open = availability();

  if (personal.location) {
    facts.push({ key: 'location', label: 'Location', icon: MapPin, value: personal.location });
  }
  facts.push({
    key: 'now',
    label: 'Now',
    icon: Briefcase,
    value: `${professional_identity.current_role} at ${professional_identity.current_employer}`,
  });
  facts.push({
    key: 'experience',
    label: 'Experience',
    icon: CalendarClock,
    value: `${professional_identity.years_experience} years`,
  });
  if (notice !== null) {
    facts.push({ key: 'notice', label: 'Notice period', icon: Hourglass, value: notice });
  }
  if (open.length > 0) {
    facts.push({ key: 'availability', label: 'Availability', icon: Globe, value: open.join(' · ') });
  }
  if (personal.languages.length > 0) {
    facts.push({
      key: 'languages',
      label: 'Languages',
      icon: Languages,
      value: personal.languages.join(' · '),
    });
  }
  if (platforms_worked_on.length > 0) {
    facts.push({
      key: 'platforms',
      label: 'Platforms',
      icon: Layers,
      value: (
        <ul className="flex flex-wrap gap-1.5">
          {platforms_worked_on.map((platform) => (
            <li
              key={platform}
              className="rounded-full border border-[#2a2a2a] bg-white/[0.03] px-2.5 py-1 text-[11px] sm:text-xs leading-none text-[#E1E0CC]/90"
            >
              {platform}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (education.length > 0) {
    facts.push({
      key: 'education',
      label: 'Education',
      icon: GraduationCap,
      value: (
        <ul className="flex flex-col gap-1.5">
          {education.map((entry) => (
            <li key={`${entry.degree}-${entry.institution}`}>
              {entry.degree}
              <span className="text-gray-400">, {entry.institution}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }
  return facts;
}

const FACTS = buildFacts();

// The last fact stretches across whatever columns its row leaves empty, so the grid never ends in a
// blank cell (the notice-period toggle changes the count). Class names are spelled out for Tailwind.
const SM_SPAN: Record<number, string> = { 2: 'sm:col-span-2' };
const LG_SPAN: Record<number, string> = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4' };
function lastCellSpan(index: number, count: number): string {
  if (index !== count - 1) return '';
  const sm = count % 2 === 0 ? 1 : 2;
  const lg = count % 4 === 0 ? 1 : 4 - (count % 4) + 1;
  return [SM_SPAN[sm] ?? '', LG_SPAN[lg]].filter(Boolean).join(' ');
}

export default function About() {
  const reduceMotion = useReducedMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  return (
    <section
      id="about"
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-28">
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-8 sm:mb-10 text-center">
          About
        </p>

        {/* The heading for assistive tech; the animated word-by-word version below is visual only. */}
        <h2 id={HEADING_ID} className="sr-only">
          {HEADING_TEXT}
        </h2>
        <div aria-hidden="true" className="text-center text-[#E1E0CC]">
          <WordsPullUpMultiStyle
            segments={HEADING_SEGMENTS}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9]"
          />
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20">
          {/* Summary: revealed letter by letter on scroll; a plain copy carries it for screen readers. */}
          <div
            ref={bodyRef}
            className="max-w-3xl mx-auto text-sm md:text-base text-[#DEDBC8]"
            style={{ lineHeight: 1.7 }}
          >
            {reduceMotion ? (
              <p>{SUMMARY}</p>
            ) : (
              <>
                <p className="sr-only">{SUMMARY}</p>
                <p aria-hidden="true">
                  {SUMMARY_WORDS.map(({ word, start }, w) => (
                    <Fragment key={start}>
                      {w > 0 ? ' ' : null}
                      <span className="whitespace-nowrap">
                        {word.split('').map((char, c) => (
                          <AnimatedLetter
                            key={c}
                            char={char}
                            index={start + c}
                            totalChars={SUMMARY.length}
                            scrollProgress={scrollYProgress}
                          />
                        ))}
                      </span>
                    </Fragment>
                  ))}
                </p>
              </>
            )}
          </div>

          {/* Facts sit in an even grid under the summary (like the metrics band), so both blocks span
              the full card width instead of two side-by-side columns of different heights. */}
          <motion.dl
            {...fadeUp({ delay: 0.1 })}
            className="mt-12 sm:mt-16 grid gap-px overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#1a1a1a] sm:grid-cols-2 lg:grid-cols-4"
          >
            {FACTS.map(({ key, label, icon: Icon, value }, i) => (
              <div
                key={key}
                className={`flex min-w-0 flex-col gap-3 bg-[#0c0c0c] p-5 sm:p-6 ${lastCellSpan(i, FACTS.length)}`}
              >
                <dt className="flex items-center gap-2.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {label}
                </dt>
                <dd className="min-w-0 text-sm leading-relaxed text-[#E1E0CC] break-words">{value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
