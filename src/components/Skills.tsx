import { motion } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';
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
import { fadeUp } from '../lib/motion';
import SectionHeader from './ui/SectionHeader';

const HEADING_ID = `${SECTION_IDS.skills}-heading`;

const GROUPS = skillGroups();
const TOTAL_SKILLS = GROUPS.reduce((sum, group) => sum + group.items.length, 0);

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

function ChipGroup({ title, items, delay }: { title: string; items: string[]; delay: number }) {
  return (
    <motion.div {...fadeUp({ delay, margin: '-80px 0px -80px 0px' })} className={cardClass}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className={eyebrowClass}>{title}</h3>
        <Count shown={items.length} total={items.length} noun="items" />
      </div>
      <ul className="flex flex-wrap gap-1.5 sm:gap-2">
        {items.map((item) => (
          <li key={item} className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full bg-[#1a1a1a] text-gray-300">
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
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

        {/* Currently learning */}
        {currently_learning.length > 0 ? (
          <motion.div
            {...fadeUp({ margin: '-80px 0px -80px 0px' })}
            className="mt-3 sm:mt-4 rounded-2xl border border-dashed border-[#3a3a3a] p-5 sm:p-6 md:p-7"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className={`${eyebrowClass} flex items-center gap-2`}>
                <Sparkles aria-hidden="true" className="w-3.5 h-3.5" /> Currently learning
              </h3>
              <Count shown={currently_learning.length} total={currently_learning.length} noun="items" />
            </div>
            <ul className="flex flex-wrap gap-1.5 sm:gap-2">
              {currently_learning.map((item) => (
                <li key={item} className={`${pillClass} border-dashed border-primary/40 text-[#E1E0CC]`}>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        {/* Industries, platforms, geography */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div className="md:col-span-2">
            <ChipGroup title="Industries served" items={industries_served} delay={0} />
          </div>
          <ChipGroup title="Platforms" items={platforms_worked_on} delay={0.08} />
          <ChipGroup title="Client geography" items={geography_of_clients} delay={0.16} />
        </div>
      </div>
    </section>
  );
}
