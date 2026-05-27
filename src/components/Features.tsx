import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useRef } from 'react';
import WordsPullUpMultiStyle from './animations/WordsPullUpMultiStyle';
import data from '../data/indranil_mondal_master.json';

const { projects, notable_technical_achievements } = data;

// Top 4 featured projects → matches the 4-card grid slot count.
// Note: ALL 13 projects are rendered fully in the Projects section below.
const featured = projects.filter((p) => p.featured).slice(0, 4);

// Header lines, in real Indranil context
const HEADER_SEGMENTS_LINE_1 = [
  {
    text: 'Studio-grade engineering for production platforms.',
    className: 'text-[#E1E0CC]',
  },
];
const HEADER_SEGMENTS_LINE_2 = [
  {
    text: 'Built for performance. Powered by AI-augmented delivery.',
    className: 'text-gray-500',
  },
];

interface FeatureCardProps {
  project: (typeof projects)[number];
  index: number;
  totalCards: number;
}

function FeatureCard({ project, index, totalCards }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // 4 stack items → 4 checklist items. If fewer, use what's available.
  const checklistItems = project.stack.slice(0, 4);
  const numberLabel = String(index + 1).padStart(2, '0');

  // Card 1 (index 0) becomes the "hero card" with a gradient-mesh visual instead of a video
  const isHeroCard = index === 0;
  const linkUrl = project.live_url || project.github_url || '#work';
  const isExternal = !!(project.live_url || project.github_url);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative rounded-2xl overflow-hidden flex flex-col ${
        isHeroCard ? 'min-h-[420px] lg:min-h-0' : 'bg-[#212121] p-6 sm:p-7 min-h-[420px] lg:min-h-0'
      }`}
      style={{ height: '100%' }}
    >
      {isHeroCard ? (
        <>
          {/* Animated gradient mesh visual (replaces design's video URL — no invented URLs) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(140,110,60,0.55) 0%, transparent 60%),' +
                'radial-gradient(ellipse at 70% 80%, rgba(60,40,80,0.55) 0%, transparent 60%),' +
                'linear-gradient(180deg, #1a1410 0%, #050505 100%)',
            }}
          />
          <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #DEDBC8 0%, transparent 70%)' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 noise-overlay opacity-[0.4] mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="relative z-10 mt-auto p-6 sm:p-7">
            <p
              className="text-xs uppercase tracking-[0.18em] mb-2 opacity-80"
              style={{ color: '#E1E0CC' }}
            >
              {project.type}
            </p>
            <p
              className="text-2xl sm:text-3xl font-medium leading-tight"
              style={{ color: '#E1E0CC' }}
            >
              {project.title}.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Icon: number badge (replaces design's image URLs — escape rule) */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2c2c2c] flex items-center justify-center mb-5">
            <span
              className="text-sm sm:text-base font-medium"
              style={{ color: '#E1E0CC' }}
            >
              {numberLabel}
            </span>
          </div>

          {/* Title + number */}
          <h3
            className="text-xl sm:text-2xl font-medium leading-tight mb-1"
            style={{ color: '#E1E0CC' }}
          >
            {project.title}.
          </h3>
          <p className="text-xs text-gray-500 mb-5">({numberLabel}) · {project.client}</p>

          {/* Checklist items from real stack */}
          <ul className="flex flex-col gap-2.5 mb-6">
            {checklistItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  className="w-4 h-4 mt-0.5 shrink-0 text-primary"
                  strokeWidth={2.5}
                />
                <span className="text-gray-400 text-xs sm:text-sm leading-snug">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Learn more link */}
          <a
            href={linkUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="group/link inline-flex items-center gap-2 text-xs sm:text-sm mt-auto transition-colors duration-200"
            style={{ color: '#E1E0CC' }}
          >
            <span>{isExternal ? 'View live' : 'Learn more'}</span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
              style={{ transform: 'rotate(-45deg)' }}
            />
          </a>
        </>
      )}
    </motion.div>
  );
}

export default function Features() {
  // Pad up to 4 cards if there are fewer featured projects (defensive)
  const cards = featured.length >= 4 ? featured.slice(0, 4) : [
    ...featured,
    ...projects.filter((p) => !p.featured).slice(0, 4 - featured.length),
  ];

  return (
    <section className="min-h-screen bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 max-w-4xl mx-auto">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight">
            <WordsPullUpMultiStyle segments={HEADER_SEGMENTS_LINE_1} className="block" />
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight mt-1">
            <WordsPullUpMultiStyle segments={HEADER_SEGMENTS_LINE_2} className="block" delay={0.2} />
          </div>
        </div>

        {/* 4-column card grid (1 col mobile → 2 col tablet → 4 col desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]">
          {cards.map((project, i) => (
            <FeatureCard key={project.id} project={project} index={i} totalCards={cards.length} />
          ))}
        </div>

        {/* Anchor text linking to the full project grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(225, 224, 204, 0.7)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.7)')}
          >
            See all {projects.length} projects
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              style={{ transform: 'rotate(-45deg)' }}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
