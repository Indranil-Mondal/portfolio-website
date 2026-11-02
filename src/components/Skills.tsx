import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  SECTION_IDS,
  currently_learning,
  geography_of_clients,
  industries_served,
  platforms_worked_on,
  skillGroups,
  type SkillGroup,
} from '../lib/data';
import { logoFor, stackLogos } from '../lib/logos';
import { fadeUp } from '../lib/motion';
import LogoMarquee, { LogoMark } from './ui/LogoMarquee';
import SectionHeader from './ui/SectionHeader';

const HEADING_ID = `${SECTION_IDS.skills}-heading`;

const GROUPS = skillGroups();
const TOTAL_SKILLS = GROUPS.reduce((sum, group) => sum + group.items.length, 0);

// Logo strip: every tool the JSON claims that has a brand mark, split across two rows.
const LOGOS = stackLogos();
const HALF = Math.ceil(LOGOS.length / 2);
const LOGO_ROWS = [LOGOS.slice(0, HALF), LOGOS.slice(HALF)];

/** "Sweden (Aliq.se)" gives { main: 'Sweden', note: 'Aliq.se' }; text without a trailing note stays whole. */
function splitNote(text: string): { main: string; note: string | null } {
  const match = text.match(/^(.*?)\s*\(([^()]*)\)$/);
  return match ? { main: match[1], note: match[2] } : { main: text, note: null };
}

function ordinal(i: number): string {
  return String(i + 1).padStart(2, '0');
}

const cardClass =
  'bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-2xl p-5 sm:p-6 md:p-7 transition-colors duration-300';
const pillClass = 'text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border';
const eyebrowClass = 'text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]';

interface VisibleGroup extends SkillGroup {
  /** Every item of the group, for the count. */
  total: number;
}

/**
 * Groups and items matching the query (case-insensitive substring). A group whose label matches
 * keeps all its items. An empty query returns every group in full.
 */
function filterGroups(query: string): VisibleGroup[] {
  if (!query) return GROUPS.map((group) => ({ ...group, total: group.items.length }));
  return GROUPS.map((group) => {
    const labelMatches = group.label.toLowerCase().includes(query);
    const items = labelMatches ? group.items : group.items.filter((item) => item.toLowerCase().includes(query));
    return { ...group, items, total: group.items.length };
  }).filter((group) => group.items.length > 0);
}

/** The text with the first occurrence of the query wrapped in <mark>. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const start = text.toLowerCase().indexOf(query);
  if (start === -1) return text;
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-primary/25 text-[#E1E0CC]">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

function Count({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <span className="text-[10px] sm:text-xs text-gray-400 font-mono shrink-0">
      {shown === total ? String(total).padStart(2, '0') : `${shown}/${total}`}
      <span className="sr-only">
        {' '}
        {shown === total ? noun : `of ${total} ${noun} match`}
      </span>
    </span>
  );
}

export default function Skills() {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => filterGroups(normalized), [normalized]);
  const matchCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  const statusText = normalized
    ? matchCount > 0
      ? `${matchCount} of ${TOTAL_SKILLS} skills match “${query.trim()}”`
      : `No skills match “${query.trim()}”`
    : `${TOTAL_SKILLS} skills across ${GROUPS.length} categories`;

  return (
    <section
      id={SECTION_IDS.skills}
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader id={HEADING_ID} eyebrow="The Stack" title="Skills built across" accent="production reality." />

        {/* Logo strip of the tools I work with (brand marks from Simple Icons) */}
        {LOGOS.length > 0 ? (
          <motion.div
            {...fadeUp({ margin: '-60px 0px -60px 0px' })}
            role="region"
            aria-label="Tools I work with"
            className="-mx-4 md:-mx-6 mb-12 sm:mb-16 flex flex-col gap-5 sm:gap-6 border-y border-[#1a1a1a] py-6 sm:py-8"
          >
            <LogoMarquee logos={LOGO_ROWS[0]} seconds={70} />
            {LOGO_ROWS[1].length > 0 ? <LogoMarquee logos={LOGO_ROWS[1]} reverse seconds={80} /> : null}
          </motion.div>
        ) : null}

        {/* Search */}
        <div role="search" className="mb-8 sm:mb-10 max-w-md">
          <label htmlFor={inputId} className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
            Search skills
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setQuery('');
              }}
              placeholder="Type a tool or technology"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={`${inputId}-status`}
              className="w-full rounded-full border border-[#2a2a2a] bg-[#0e0e0e] py-2.5 pl-10 pr-11 text-sm text-[#E1E0CC] placeholder:text-gray-400 hover:border-[#3a3a3a] focus:border-primary/60 transition-colors duration-200 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-[#E1E0CC] hover:bg-[#1a1a1a] transition-colors duration-200"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <p id={`${inputId}-status`} aria-live="polite" aria-atomic="true" className="text-xs text-gray-400 mt-3">
            {statusText}
          </p>
        </div>

        {/* Skill categories: two-column masonry on large screens */}
        <div className="lg:columns-2 lg:gap-4">
          {visibleGroups.map((group, i) => (
            <motion.div
              key={group.key}
              {...fadeUp({ delay: (i % 2) * 0.08, margin: '-80px 0px -80px 0px' })}
              className={`${cardClass} mb-3 sm:mb-4 break-inside-avoid`}
            >
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                <h3 className="text-base sm:text-lg font-medium tracking-tight text-[#E1E0CC]">
                  {highlight(group.label, normalized)}
                </h3>
                <Count shown={group.items.length} total={group.total} noun="skills" />
              </div>
              <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                {group.items.map((skill) => {
                  const matched = normalized !== '' && skill.toLowerCase().includes(normalized);
                  return (
                    <li
                      key={skill}
                      className={`${pillClass} ${
                        matched ? 'border-primary/50 text-[#E1E0CC]' : 'border-[#2a2a2a] text-gray-400'
                      }`}
                    >
                      {highlight(skill, normalized)}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        {normalized && matchCount === 0 ? (
          <div className={`${cardClass} text-sm text-gray-400`}>
            Nothing in the stack matches that yet.{' '}
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#E1E0CC] underline underline-offset-4 hover:text-primary"
            >
              Show every skill
            </button>
          </div>
        ) : null}

        {/* Beyond the stack: each block has its own form so the end of the section does not repeat
            the chip cards above. */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
          {currently_learning.length > 0 ? (
            <motion.div
              {...fadeUp({ margin: '-80px 0px -80px 0px' })}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/25 bg-[#0e0e0e] p-6 sm:p-8 lg:col-span-5"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
                style={{ background: 'radial-gradient(circle, #DEDBC8 0%, transparent 70%)' }}
              />
              <h3 className={`${eyebrowClass} relative flex items-center gap-2.5`}>
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Currently learning
              </h3>
              <ul className="relative mt-8 flex flex-1 flex-col justify-end gap-6">
                {currently_learning.map((item) => {
                  const { main, note } = splitNote(item);
                  return (
                    <li key={item}>
                      <p className="font-serif italic text-4xl sm:text-5xl leading-[0.95] text-[#E1E0CC]">{main}</p>
                      {note ? <p className="mt-3 font-mono text-xs sm:text-sm text-gray-400">({note})</p> : null}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : null}

          <motion.div
            {...fadeUp({ delay: 0.08, margin: '-80px 0px -80px 0px' })}
            className={`${cardClass} ${currently_learning.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className={eyebrowClass}>Client geography</h3>
              <Count shown={geography_of_clients.length} total={geography_of_clients.length} noun="countries" />
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
              {geography_of_clients.map((country, i) => {
                const { main, note } = splitNote(country);
                return (
                  <li key={country} className="flex items-baseline gap-4 border-b border-[#1a1a1a] py-3.5">
                    <span className="font-mono text-[10px] text-gray-400">{ordinal(i)}</span>
                    <span className="text-2xl sm:text-3xl tracking-tight text-[#E1E0CC]">{main}</span>
                    {note ? <span className="text-xs text-gray-400">({note})</span> : null}
                  </li>
                );
              })}
            </ol>
          </motion.div>

          <motion.div {...fadeUp({ margin: '-80px 0px -80px 0px' })} className={`${cardClass} lg:col-span-12`}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className={eyebrowClass}>Industries served</h3>
              <Count shown={industries_served.length} total={industries_served.length} noun="industries" />
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
              {industries_served.map((industry, i) => {
                const { main, note } = splitNote(industry);
                return (
                  <li key={industry} className="flex gap-4 border-b border-[#1a1a1a] py-4">
                    <span className="pt-0.5 font-mono text-[10px] text-gray-400">{ordinal(i)}</span>
                    <span className="min-w-0">
                      <span className="block text-sm sm:text-base leading-snug text-[#E1E0CC]">{main}</span>
                      {note ? <span className="mt-1 block text-xs text-gray-400">({note})</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          </motion.div>

          <motion.div {...fadeUp({ margin: '-80px 0px -80px 0px' })} className="mt-6 sm:mt-8 lg:col-span-12">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <h3 className={eyebrowClass}>Platforms I ship on</h3>
              <Count shown={platforms_worked_on.length} total={platforms_worked_on.length} noun="platforms" />
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-7">
              {platforms_worked_on.map((platform) => {
                const logo = logoFor(platform);
                return (
                  <li
                    key={platform}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] max-sm:[&:last-child:nth-child(odd)]:col-span-2 px-3 py-6 sm:py-8 text-[#E1E0CC]/70 transition-colors duration-300 hover:border-[#2a2a2a] hover:bg-[#141414] hover:text-[#E1E0CC]"
                  >
                    {logo ? (
                      <LogoMark logo={logo} className="h-7 w-7 sm:h-8 sm:w-8" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-current font-serif italic text-lg"
                      >
                        {platform.charAt(0)}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm">{platform}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
