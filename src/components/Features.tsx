import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useRef } from 'react';
import { SECTION_IDS, hasCaseStudy, projects, statusTone, type Project } from '../lib/data';
import { EASE_OUT, EASE_PULL_UP, fadeUp } from '../lib/motion';
import ExternalLink from './ui/ExternalLink';
import StatusBadge from './ui/StatusBadge';

// The grid has four slots: the first four featured projects, topped up in JSON order when fewer
// are featured. Every project is rendered in full in the Projects section below.
const SLOTS = 4;
const CHECKLIST_ITEMS = 4;
const HEADING_ID = 'featured-heading';

function featuredCards(): Project[] {
  const featured = projects.filter((project) => project.featured);
  if (featured.length >= SLOTS) return featured.slice(0, SLOTS);
  return [...featured, ...projects.filter((project) => !project.featured)].slice(0, SLOTS);
}

const CARDS = featuredCards();

// Header lines (UI copy).
const HEADER_LINES: ReadonlyArray<{ text: string; className: string }> = [
  { text: 'Studio-grade engineering for production platforms.', className: 'text-[#E1E0CC]' },
  { text: 'Built for performance. Powered by AI-augmented delivery.', className: 'text-gray-400' },
];

/** The title with a closing full stop, unless it already ends in punctuation. */
function withFullStop(title: string): string {
  return /[.!?]$/.test(title.trim()) ? title : `${title}.`;
}

interface CardLinkTarget {
  external: boolean;
  href: string;
  label: string;
}

/**
 * "View live" only when there is a live_url and the status itself says live; any other live_url
 * gets the neutral "Visit site". Without a live_url: the case study when there is one, else the grid.
 */
function cardLink(project: Project): CardLinkTarget {
  if (project.live_url) {
    const saysLive = statusTone(project.status) === 'success' && /\blive\b/i.test(project.status);
    return { external: true, href: project.live_url, label: saysLive ? 'View live' : 'Visit site' };
  }
  if (hasCaseStudy(project)) {
    return { external: false, href: `#${SECTION_IDS.caseStudy}`, label: 'Case study' };
  }
  return { external: false, href: `#${SECTION_IDS.work}`, label: 'Read more' };
}

function CardLink({ project, className = '' }: { project: Project; className?: string }) {
  const link = cardLink(project);
  const classes = `group/link inline-flex items-center gap-2 text-xs sm:text-sm text-[#E1E0CC] hover:text-primary transition-colors duration-200 ${className}`;
  const content = (
    <>
      <span>
        {link.label}
        <span className="sr-only">: {project.title}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className={`w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1 ${
          link.external ? '-rotate-45' : ''
        }`}
      />
    </>
  );

  return link.external ? (
    <ExternalLink href={link.href} className={classes}>
      {content}
    </ExternalLink>
  ) : (
    <a href={link.href} className={classes}>
      {content}
    </a>
  );
}

/** h2 whose words pull up one by one (the WordsPullUpMultiStyle motion, kept as phrasing content). */
function PullUpHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px 0px -50px 0px' });

  return (
    <h2
      id={HEADING_ID}
      ref={ref}
      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight"
    >
      {HEADER_LINES.map((line, lineIndex) => {
        const words = line.text.split(' ').filter(Boolean);
        return (
          <span key={line.text} className={`block ${lineIndex > 0 ? 'mt-1' : ''}`}>
            {words.map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`}>
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className={`inline-block ${line.className}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: lineIndex * 0.2 + wordIndex * 0.08,
                      ease: EASE_PULL_UP,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
                {wordIndex < words.length - 1 ? ' ' : null}
              </span>
            ))}
            {/* Keeps a space between the lines in the heading's text */}
            {lineIndex < HEADER_LINES.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </h2>
  );
}

interface FeatureCardProps {
  project: Project;
  index: number;
}

function FeatureCard({ project, index }: FeatureCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px 0px -100px 0px' });

  const checklistItems = project.stack.slice(0, CHECKLIST_ITEMS);
  const numberLabel = String(index + 1).padStart(2, '0');
  const titleId = `featured-${project.id}-title`;

  // The first card is the "hero card", with a gradient-mesh visual.
  const isHeroCard = index === 0;

  return (
    <motion.article
      ref={ref}
      aria-labelledby={titleId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE_OUT }}
      className={`relative h-full min-h-[420px] lg:min-h-0 rounded-2xl overflow-hidden flex flex-col ${
        isHeroCard ? '' : 'bg-[#212121] p-6 sm:p-7'
      }`}
    >
      {isHeroCard ? (
        <>
          {/* Animated gradient mesh (decorative) */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(140,110,60,0.55) 0%, transparent 60%),' +
                'radial-gradient(ellipse at 70% 80%, rgba(60,40,80,0.55) 0%, transparent 60%),' +
                'linear-gradient(180deg, #1a1410 0%, #050505 100%)',
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #DEDBC8 0%, transparent 70%)' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 noise-overlay opacity-[0.4] mix-blend-overlay pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />

          <div className="relative z-10 mt-auto p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.18em] mb-3 text-[#E1E0CC]/85">{project.type}</p>
            <StatusBadge status={project.status} className="mb-4" />
            <h3
              id={titleId}
              className="text-2xl sm:text-3xl font-medium leading-tight text-[#E1E0CC] break-words"
            >
              {withFullStop(project.title)}
            </h3>
            <p className="text-xs sm:text-sm text-[#E1E0CC]/80 mt-2">{project.client}</p>
            <CardLink project={project} className="mt-5" />
          </div>
        </>
      ) : (
        <>
          {/* Number badge (decorative) */}
          <div
            aria-hidden="true"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2c2c2c] flex items-center justify-center mb-5"
          >
            <span className="text-sm sm:text-base font-medium text-[#E1E0CC]">{numberLabel}</span>
          </div>

          <h3
            id={titleId}
            className="text-xl sm:text-2xl font-medium leading-tight mb-1 text-[#E1E0CC] break-words"
          >
            {withFullStop(project.title)}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            <span aria-hidden="true">({numberLabel}) · </span>
            {project.client}
          </p>

          <StatusBadge status={project.status} className="self-start mb-5" />

          {/* Checklist from the project's stack */}
          <ul className="flex flex-col gap-2.5 mb-6">
            {checklistItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                <span className="text-gray-400 text-xs sm:text-sm leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          <CardLink project={project} className="mt-auto self-start" />
        </>
      )}
    </motion.article>
  );
}

export default function Features() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="min-h-screen bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6 relative"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-4xl mx-auto">
          <PullUpHeading />
        </div>

        {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:min-h-[480px]">
          {CARDS.map((project, i) => (
            <FeatureCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <motion.div {...fadeUp({ y: 10 })} className="text-center mt-12 sm:mt-16">
          <a
            href={`#${SECTION_IDS.work}`}
            className="group inline-flex items-center gap-2 text-sm text-[#E1E0CC]/70 hover:text-[#E1E0CC] transition-colors duration-200"
          >
            See all {projects.length} projects
            <ArrowRight
              aria-hidden="true"
              className="w-4 h-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
