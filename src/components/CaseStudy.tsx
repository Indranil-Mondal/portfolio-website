import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  FileCode,
  Quote,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { SECTION_IDS, caseStudyProject, isExternalUrl, type CaseStudyProject } from '../lib/data';
import { EASE_OUT, fadeUp } from '../lib/motion';
import ExternalLink from './ui/ExternalLink';
import SectionHeader from './ui/SectionHeader';
import StatusBadge from './ui/StatusBadge';

// Case study of the first project that carries a case_study block. Every fact comes from that
// project in the JSON; the part labels, "Step", "Outcome" and the link label are UI copy.

const SECTION_ID = SECTION_IDS.caseStudy;
const HEADING_ID = `${SECTION_ID}-heading`;

type PartKey = 'problem' | 'approach' | 'results';

const PART_LABELS: Record<PartKey, string> = {
  problem: 'Problem',
  approach: 'Approach',
  results: 'Results',
};

const partId = (key: PartKey) => `${SECTION_ID}-${key}`;

/** Icons for the approach steps, cycled when there are more steps than icons. */
const STEP_ICONS: ReadonlyArray<LucideIcon> = [FileCode, BrainCircuit, ShieldCheck, Server];

const EYEBROW = 'text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]';
const META_LABEL = 'text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400';
const CARD =
  'rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] transition-colors duration-300 hover:border-[#2a2a2a]';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A leading figure such as "1,640", "86.1%", "~65k" or "29 of 29", followed by a space,
 * punctuation or the end of the sentence.
 */
const LEADING_FIGURE = /^(~?\d[\d.,]*%?(?:\s+of\s+\d[\d.,]*%?)?)(?=[\s,;:]|$)/;

/** Splits "1,640 pages built" into { figure: "1,640", rest: "pages built" }; figure is null without one. */
function splitLeadingFigure(sentence: string): { figure: string | null; rest: string } {
  const text = sentence.trim();
  const match = LEADING_FIGURE.exec(text);
  if (!match) return { figure: null, rest: text };
  const figure = match[1].replace(/[.,]+$/, '');
  const rest = text.slice(figure.length).replace(/^[\s,;:]+/, '');
  return { figure, rest };
}

/** "site.com: Big Migration" becomes { main: "site.com:", accent: "Big Migration" } for the serif accent. */
function splitTitle(title: string): { main: string; accent: string | null } {
  const index = title.indexOf(': ');
  if (index <= 0) return { main: title, accent: null };
  const accent = title.slice(index + 2).trim();
  return accent ? { main: title.slice(0, index + 1), accent } : { main: title, accent: null };
}

/**
 * The part whose block crosses a thin band just above the middle of the viewport. Keeps the last
 * value while the band sits in a gap between parts.
 */
function useActivePart(parts: PartKey[]): PartKey | null {
  const [active, setActive] = useState<PartKey | null>(parts[0] ?? null);
  const signature = parts.join('|');

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    const keys = signature ? (signature.split('|') as PartKey[]) : [];
    const elements = keys
      .map((key) => document.getElementById(partId(key)))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = entry.target.getAttribute('data-part') as PartKey | null;
          if (key) setActive(key);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [signature]);

  return active;
}

function PartHeading({ id, index, children }: { id: string; index: number | null; children: ReactNode }) {
  return (
    <motion.h3 id={id} {...fadeUp({ y: 10 })} className={`flex items-center gap-3 mb-6 sm:mb-8 ${EYEBROW}`}>
      {index !== null ? (
        <span aria-hidden="true" className="font-mono tabular-nums">
          {pad(index)}
        </span>
      ) : null}
      <span aria-hidden="true" className="h-px w-8 bg-primary/40" />
      <span>{children}</span>
    </motion.h3>
  );
}

function ProgressRail({ parts, active }: { parts: PartKey[]; active: PartKey | null }) {
  const activeIndex = Math.max(0, active ? parts.indexOf(active) : 0);

  return (
    <nav aria-label="Case study parts" className="sticky top-28">
      <div aria-hidden="true" className="mb-8 flex items-end gap-2">
        <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="absolute bottom-0 left-0 block font-serif italic text-8xl leading-[0.85] text-[#E1E0CC]"
            >
              {pad(activeIndex + 1)}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="pb-1 font-mono text-xs text-gray-400 tabular-nums">/ {pad(parts.length)}</span>
      </div>

      <ol className="border-l border-[#1a1a1a]">
        {parts.map((part, i) => {
          const isActive = part === active;
          return (
            <li key={part} className="relative">
              {isActive ? (
                <motion.span
                  layoutId="case-study-rail-marker"
                  aria-hidden="true"
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute -left-px top-0 h-full w-0.5 bg-primary"
                />
              ) : null}
              <a
                href={`#${partId(part)}`}
                aria-current={isActive ? 'location' : undefined}
                className={`flex items-baseline gap-3 py-3 pl-5 transition-colors duration-300 ${
                  isActive ? 'text-[#E1E0CC]' : 'text-gray-400 hover:text-[#E1E0CC]'
                }`}
              >
                <span aria-hidden="true" className="font-mono text-[11px] tabular-nums">
                  {pad(i + 1)}
                </span>
                <span className="text-xl xl:text-2xl tracking-tight">{PART_LABELS[part]}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ProjectMeta({ cs }: { cs: CaseStudyProject }) {
  const liveUrl = isExternalUrl(cs.live_url) ? cs.live_url : null;
  const stackLabelId = `${SECTION_ID}-stack-label`;

  return (
    <motion.div
      {...fadeUp({ delay: 0.15 })}
      className="mb-16 sm:mb-20 md:mb-28 rounded-2xl border border-[#1a1a1a] bg-[#101010] p-5 sm:p-6 md:p-8"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <div className="min-w-0">
            <dt className={`mb-2 ${META_LABEL}`}>Client</dt>
            <dd className="text-sm sm:text-base text-[#E1E0CC] break-words">{cs.client}</dd>
          </div>
          <div>
            <dt className={`mb-2 ${META_LABEL}`}>Year</dt>
            <dd className="text-sm sm:text-base text-[#E1E0CC]">{cs.year}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={cs.status} />
          {liveUrl ? (
            <ExternalLink
              href={liveUrl}
              className="group/live inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] px-5 py-2.5 text-sm text-[#E1E0CC] transition-colors duration-300 hover:border-primary hover:bg-primary hover:text-black"
            >
              Visit live site
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover/live:-translate-y-0.5 group-hover/live:translate-x-0.5"
              />
            </ExternalLink>
          ) : null}
        </div>
      </div>

      {cs.stack.length > 0 ? (
        <div className="mt-6 border-t border-[#1a1a1a] pt-6">
          <p id={stackLabelId} className={`mb-3 ${META_LABEL}`}>
            Stack
          </p>
          <ul aria-labelledby={stackLabelId} className="flex flex-wrap gap-1.5 sm:gap-2">
            {cs.stack.map((tech, i) => (
              <li
                key={`${i}-${tech}`}
                className="max-w-full rounded-full border border-[#2a2a2a] px-2.5 py-1 text-[10px] sm:text-xs text-gray-400 [overflow-wrap:anywhere]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.div>
  );
}

function CaseStudySection({ cs }: { cs: CaseStudyProject }) {
  const study = cs.case_study;
  const problem = (study.problem ?? '').trim();
  const approach = study.approach ?? [];
  const results = study.results ?? [];
  const outcome = (cs.outcome ?? '').trim();
  const highlights = cs.highlights ?? [];

  const parts: PartKey[] = [];
  if (problem) parts.push('problem');
  if (approach.length > 0) parts.push('approach');
  if (results.length > 0 || outcome) parts.push('results');

  const active = useActivePart(parts);
  const numberOf = (key: PartKey) => parts.indexOf(key) + 1;
  const { main, accent } = splitTitle(cs.title);
  const hasRail = parts.length > 1;

  return (
    <section
      id={SECTION_ID}
      aria-labelledby={HEADING_ID}
      className="relative bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          id={HEADING_ID}
          eyebrow="Case Study"
          title={main}
          accent={accent ?? undefined}
          description={cs.description}
        />

        <ProjectMeta cs={cs} />

        {parts.length > 0 ? (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {hasRail ? (
              <div className="hidden lg:col-span-3 lg:block">
                <ProgressRail parts={parts} active={active} />
              </div>
            ) : null}

            <div
              className={`min-w-0 space-y-16 sm:space-y-20 md:space-y-28 ${
                hasRail ? 'lg:col-span-9' : 'lg:col-span-12'
              }`}
            >
              {problem ? (
                <div id={partId('problem')} data-part="problem" className="scroll-mt-28">
                  <PartHeading id={`${partId('problem')}-heading`} index={numberOf('problem')}>
                    {PART_LABELS.problem}
                  </PartHeading>
                  <motion.div {...fadeUp({ delay: 0.1 })} className="relative">
                    <Quote
                      aria-hidden="true"
                      strokeWidth={1.25}
                      className="mb-4 h-8 w-8 text-primary/40 sm:mb-6 sm:h-10 sm:w-10"
                    />
                    <p className="font-serif italic text-[1.75rem] leading-[1.15] tracking-tight text-[#E1E0CC] sm:text-4xl md:text-[2.75rem] lg:text-5xl">
                      {problem}
                    </p>
                  </motion.div>
                </div>
              ) : null}

              {approach.length > 0 ? (
                <div id={partId('approach')} data-part="approach" className="scroll-mt-28">
                  <PartHeading id={`${partId('approach')}-heading`} index={numberOf('approach')}>
                    {PART_LABELS.approach}
                  </PartHeading>
                  <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {approach.map((step, i) => {
                      const Icon = STEP_ICONS[i % STEP_ICONS.length];
                      return (
                        <motion.li
                          key={`${i}-${step}`}
                          {...fadeUp({ delay: (i % 2) * 0.1, y: 30 })}
                          className={`flex flex-col gap-6 p-5 sm:p-6 md:p-7 hover:bg-[#121212] ${CARD}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span
                              aria-hidden="true"
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#161616] sm:h-12 sm:w-12"
                            >
                              <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                            </span>
                            <span
                              aria-hidden="true"
                              className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400 tabular-nums"
                            >
                              Step {pad(i + 1)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#E1E0CC]/90 sm:text-[15px]">{step}</p>
                        </motion.li>
                      );
                    })}
                  </ol>
                </div>
              ) : null}

              {results.length > 0 || outcome ? (
                <div id={partId('results')} data-part="results" className="scroll-mt-28">
                  <PartHeading id={`${partId('results')}-heading`} index={numberOf('results')}>
                    {PART_LABELS.results}
                  </PartHeading>

                  {results.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      {results.map((result, i) => {
                        const { figure, rest } = splitLeadingFigure(result);
                        return (
                          <motion.li
                            key={`${i}-${result}`}
                            {...fadeUp({ delay: (i % 2) * 0.1, y: 30 })}
                            className={`relative flex min-h-[200px] flex-col justify-between gap-8 overflow-hidden p-6 sm:min-h-[240px] sm:p-7 md:p-8 ${CARD}`}
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/[0.06] blur-3xl"
                            />
                            <span
                              aria-hidden="true"
                              className="relative font-mono text-[11px] text-gray-400 tabular-nums"
                            >
                              {pad(i + 1)}
                            </span>
                            {figure ? (
                              <p className="relative">
                                <span className="block break-words text-5xl font-normal leading-none tracking-tight text-[#E1E0CC] tabular-nums sm:text-6xl lg:text-7xl">
                                  {figure}
                                </span>{' '}
                                {rest ? (
                                  <span className="mt-4 block text-sm leading-relaxed text-gray-400 sm:text-base">
                                    {rest}
                                  </span>
                                ) : null}
                              </p>
                            ) : (
                              <p className="relative font-serif italic text-2xl leading-snug text-[#E1E0CC] sm:text-3xl">
                                {result}
                              </p>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {outcome ? (
                    <motion.div
                      {...fadeUp({ delay: 0.1 })}
                      className="mt-3 rounded-2xl border border-[#1a1a1a] bg-[#101010] p-6 sm:mt-4 sm:p-7 md:p-8"
                    >
                      <p className={`mb-3 ${EYEBROW}`}>Outcome</p>
                      <p className="border-l-2 border-primary/30 pl-4 text-lg leading-snug text-[#E1E0CC] sm:text-xl md:text-2xl">
                        {outcome}
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {highlights.length > 0 ? (
          <div className="mt-16 sm:mt-20 md:mt-28 lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-3">
              <PartHeading id={`${SECTION_ID}-highlights-heading`} index={null}>
                Highlights
              </PartHeading>
            </div>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] p-6 sm:gap-y-5 sm:p-8 md:grid-cols-2 lg:col-span-9">
              {highlights.map((item, i) => (
                <motion.li
                  key={`${i}-${item}`}
                  {...fadeUp({ delay: (i % 2) * 0.06, y: 10 })}
                  className="flex items-start gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                  >
                    <Check className="h-3 w-3 text-primary" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 text-sm leading-relaxed text-gray-400 sm:text-[15px]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Renders nothing when no project in the JSON has a case_study. */
export default function CaseStudy() {
  const cs = caseStudyProject();
  if (!cs) return null;
  return <CaseStudySection cs={cs} />;
}
