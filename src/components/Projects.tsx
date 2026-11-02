import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronDown, Github, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  SECTION_IDS,
  displayHost,
  filterProjects,
  hasCaseStudy,
  projectTypes,
  projects,
  type Project,
} from '../lib/data';
import { EASE_OUT } from '../lib/motion';
import ExternalLink from './ui/ExternalLink';
import SectionHeader from './ui/SectionHeader';
import StatusBadge from './ui/StatusBadge';

const HEADING_ID = `${SECTION_IDS.work}-heading`;
const FILTER_LABEL_ID = `${SECTION_IDS.work}-filter-label`;

// projectTypes() starts with 'All', which filterProjects() treats as every project.
const TYPES = projectTypes();
const DEFAULT_TYPE = TYPES[0];
const TYPE_COUNTS = new Map(TYPES.map((type) => [type, filterProjects(type).length] as const));

/** Columns of the widest (xl) grid; every card is one column wide so rows stay even. */
const XL_COLUMNS = 3;

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Path (and query) of a reference URL, without a trailing slash; '' for the site root. */
function referencePath(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`.replace(/\/$/, '');
  } catch {
    return '';
  }
}

const eyebrowClass = 'text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary/80';

function ProjectCardBody({ project }: { project: Project }) {
  const titleId = `project-${project.id}-title`;
  const highlights = project.highlights ?? [];
  const references = (project.references ?? []).filter(Boolean);
  const hasMore = highlights.length > 0 || references.length > 0;
  const hasPublicLink = Boolean(project.live_url || project.github_url);

  return (
    <>
      {/* Meta row: type, status, featured, year */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 sm:mb-5">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-primary/80">{project.type}</span>
        <StatusBadge status={project.status} />
        {project.featured ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Star aria-hidden="true" className="w-3 h-3" strokeWidth={2.5} />
            Featured
          </span>
        ) : null}
        {project.year ? (
          <span className="ml-auto text-[10px] sm:text-xs font-mono text-gray-400">{project.year}</span>
        ) : null}
      </div>

      <h3
        id={titleId}
        className="text-lg sm:text-xl md:text-2xl font-medium leading-tight mb-2 text-[#E1E0CC] break-words"
      >
        {project.title}
      </h3>

      <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        for <span className="text-[#E1E0CC]/90">{project.client}</span>
      </p>

      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-5">{project.description}</p>

      {/* Outcome callout */}
      <div className="border-l-2 border-primary/30 pl-3 sm:pl-4 mb-5 sm:mb-6">
        <p className={`${eyebrowClass} mb-1`}>Outcome</p>
        <p className="text-xs sm:text-sm text-primary/90 leading-snug">{project.outcome}</p>
      </div>

      {/* Stack */}
      <ul aria-label="Stack" className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full border border-[#2a2a2a] text-gray-400"
          >
            {tech}
          </li>
        ))}
      </ul>

      {/* Highlights and references (native disclosure, content stays in the DOM) */}
      {hasMore ? (
        <details className="group/more mb-5 sm:mb-6 rounded-xl border border-[#1a1a1a] bg-black/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#E1E0CC] hover:text-primary transition-colors duration-200 [&::-webkit-details-marker]:hidden">
            <span>
              More details
              <span className="sr-only">: {project.title}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="w-4 h-4 shrink-0 transition-transform duration-200 group-open/more:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 pt-1 space-y-5">
            {highlights.length > 0 ? (
              <div>
                <h4 className={`${eyebrowClass} mb-3`}>Highlights</h4>
                <ul className="space-y-2">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2.5 text-xs sm:text-sm text-gray-400 leading-relaxed">
                      <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {references.length > 0 ? (
              <div>
                <h4 className={`${eyebrowClass} mb-3`}>References</h4>
                <ul className="space-y-2">
                  {references.map((url) => (
                    <li key={url} className="text-xs sm:text-sm leading-relaxed">
                      <ExternalLink
                        href={url}
                        className="group/ref [overflow-wrap:anywhere] text-[#E1E0CC] hover:text-primary transition-colors duration-200"
                      >
                        {displayHost(url)}
                        <span className="text-gray-400">{referencePath(url)}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="ml-1 inline-block h-3.5 w-3.5 align-[-2px] transition-transform duration-300 group-hover/ref:translate-x-0.5 group-hover/ref:-translate-y-0.5"
                        />
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      {/* Links */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-auto pt-1">
        {hasCaseStudy(project) ? (
          <a
            href={`#${SECTION_IDS.caseStudy}`}
            className="group/lnk inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#E1E0CC] hover:text-primary transition-colors duration-200"
          >
            <span>
              Case study
              <span className="sr-only">: {project.title}</span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover/lnk:translate-x-0.5"
            />
          </a>
        ) : null}
        {project.live_url ? (
          <ExternalLink
            href={project.live_url}
            className="group/lnk inline-flex min-w-0 items-center gap-1.5 text-xs sm:text-sm text-[#E1E0CC] hover:text-primary transition-colors duration-200"
          >
            <span className="[overflow-wrap:anywhere]">{displayHost(project.live_url)}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5"
            />
          </ExternalLink>
        ) : null}
        {project.github_url ? (
          <ExternalLink
            href={project.github_url}
            className="group/lnk inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors duration-200"
          >
            <Github aria-hidden="true" className="w-3.5 h-3.5" />
            <span>
              GitHub
              <span className="sr-only">: {project.title}</span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5"
            />
          </ExternalLink>
        ) : null}
        {!hasPublicLink ? <span className="text-xs text-gray-400">Details on request</span> : null}
      </div>
    </>
  );
}

export default function Projects() {
  const [activeType, setActiveType] = useState<string>(DEFAULT_TYPE);

  const visible = useMemo(() => filterProjects(activeType), [activeType]);

  const resultText =
    activeType === DEFAULT_TYPE
      ? `Showing all ${plural(visible.length, 'project', 'projects')}`
      : `Showing ${visible.length} of ${plural(projects.length, 'project', 'projects')} in ${activeType}`;

  return (
    <section
      id={SECTION_IDS.work}
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          id={HEADING_ID}
          eyebrow={`Selected Work · ${projects.length} Projects`}
          title="Production platforms,"
          accent="end-to-end ownership."
        />

        {/* Filter tabs */}
        <div className="mb-8 sm:mb-10">
          <p id={FILTER_LABEL_ID} className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
            Filter by type
          </p>
          <div role="group" aria-labelledby={FILTER_LABEL_ID} className="flex flex-wrap gap-2">
            {TYPES.map((type) => {
              const active = type === activeType;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveType(type)}
                  className={`relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs sm:text-sm transition-colors duration-200 ${
                    active
                      ? 'border-primary text-black'
                      : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-[#E1E0CC]'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="work-filter-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <span className="relative">{type}</span>
                  <span className={`relative font-mono text-[10px] ${active ? 'text-black/70' : 'text-gray-400'}`}>
                    <span className="sr-only">, </span>
                    {TYPE_COUNTS.get(type) ?? 0}
                    <span className="sr-only"> {TYPE_COUNTS.get(type) === 1 ? 'project' : 'projects'}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" aria-atomic="true" className="text-xs sm:text-sm text-gray-400 mt-4">
            {resultText}
          </p>
        </div>

        {/* Project grid: featured cards may span two columns on xl */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.article
                key={project.id}
                layout="position"
                aria-labelledby={`project-${project.id}-title`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px 0px -60px 0px' }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                transition={{
                  duration: 0.55,
                  delay: (i % XL_COLUMNS) * 0.06,
                  ease: EASE_OUT,
                  layout: { duration: 0.4, ease: EASE_OUT },
                }}
                className={`group relative flex flex-col h-full min-w-0 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-2xl p-5 sm:p-6 md:p-7 transition-colors duration-300`}
              >
                <ProjectCardBody project={project} />
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
