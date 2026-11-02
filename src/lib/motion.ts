import type { MotionProps } from 'framer-motion';

/** The site's standard ease-out curve (cubic-bezier). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** The softer curve used by the pull-up headline animations. */
export const EASE_PULL_UP = [0.16, 1, 0.3, 1] as const;

export interface FadeUpOptions {
  /** Seconds before the entrance starts. Default 0. */
  delay?: number;
  /** Starting vertical offset in px. Default 20. */
  y?: number;
  /** Seconds. Default 0.6. */
  duration?: number;
  /** IntersectionObserver root margin. Default '-50px 0px -50px 0px' (vertical only: a single value also shrinks the box from the sides, so small elements near the left edge never trigger on mobile). */
  margin?: string;
}

/**
 * Props for the site's standard whileInView fade-up entrance. Spread onto any motion element:
 * `<motion.div {...fadeUp({ delay: 0.1 })}>`. Runs once. Under <MotionConfig reducedMotion="user">
 * the y offset is skipped for visitors who prefer reduced motion and only the fade remains.
 */
export function fadeUp({
  delay = 0,
  y = 20,
  duration = 0.6,
  margin = '-50px 0px -50px 0px',
}: FadeUpOptions = {}): Pick<MotionProps, 'initial' | 'whileInView' | 'viewport' | 'transition'> {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin },
    transition: { duration, delay, ease: EASE_OUT },
  };
}
