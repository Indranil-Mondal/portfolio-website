import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export interface SectionHeaderProps {
  /** id of the <h2>. Point the section's aria-labelledby at it, e.g. id="work-heading". */
  id: string;
  /** Small uppercase label above the heading (UI copy, or a count from the JSON). */
  eyebrow: ReactNode;
  /** Heading text in the regular face. */
  title: ReactNode;
  /** Optional phrase after the title, set in Instrument Serif italic. */
  accent?: ReactNode;
  /** Optional paragraph under the heading (gray-400). */
  description?: ReactNode;
  /** 'left' (default) or 'center'. */
  align?: 'left' | 'center';
  /** Extra classes for the wrapper (e.g. to change the bottom margin). */
  className?: string;
}

/**
 * Eyebrow + h2 (+ optional italic serif accent and description), matching the existing
 * section headers: whileInView fade-up, once, ease [0.22, 1, 0.36, 1].
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  accent,
  description,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={`mb-12 sm:mb-16 md:mb-20 max-w-3xl ${centered ? 'mx-auto text-center' : ''} ${className}`}
    >
      <motion.p
        {...fadeUp({ y: 10 })}
        className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        id={id}
        {...fadeUp({ delay: 0.1, duration: 0.7 })}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight text-[#E1E0CC] break-words"
      >
        {title}
        {accent ? (
          <>
            {' '}
            <span className="italic font-serif">{accent}</span>
          </>
        ) : null}
      </motion.h2>
      {description ? (
        <motion.p
          {...fadeUp({ delay: 0.2, y: 10 })}
          className={`text-sm sm:text-base text-gray-400 mt-5 sm:mt-6 max-w-2xl leading-relaxed ${centered ? 'mx-auto' : ''}`}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
