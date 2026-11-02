import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { featuredMetrics, isCountable, type CountableMetric } from '../lib/data';
import { EASE_OUT, fadeUp } from '../lib/motion';

const HEADING_ID = 'metrics-heading';

/** Fixed en-US grouping so the counter lands exactly on the JSON value ('1,640', '86.1'). */
function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts from 0 to metric.count_to once the number scrolls into view, with the metric's prefix,
 * suffix and decimals. Visitors who prefer reduced motion get the final number straight away.
 * Screen readers read metric.value once instead of the moving digits.
 */
function CountUp({ metric }: { metric: CountableMetric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  // Shrink the viewport at the bottom only: an all-sides margin would never "see" a narrow number
  // sitting within 80px of the left edge on a phone.
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const decimals = Math.max(0, Math.floor(metric.decimals ?? 0));
  const target = metric.count_to;

  const progress = useMotionValue(reduceMotion ? target : 0);
  const display = useTransform(
    progress,
    (latest) => `${metric.prefix ?? ''}${formatNumber(latest, decimals)}${metric.suffix ?? ''}`,
  );

  useEffect(() => {
    if (reduceMotion) {
      progress.set(target);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(progress, target, { duration: 1.8, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, reduceMotion, progress, target]);

  return (
    <span ref={ref}>
      <motion.span aria-hidden="true" className="tabular-nums">
        {display}
      </motion.span>
      <span className="sr-only">{metric.value}</span>
    </span>
  );
}

export default function Metrics() {
  const metrics = featuredMetrics();
  if (metrics.length === 0) return null;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          id={HEADING_ID}
          {...fadeUp({ y: 10 })}
          className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-10 sm:mb-14 text-center"
        >
          By the Numbers
        </motion.h2>

        <ul role="list" className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a] rounded-2xl md:rounded-3xl overflow-hidden border border-[#1a1a1a]">
          {metrics.map((metric, i) => (
            <motion.li
              key={metric.label}
              {...fadeUp({ delay: (i % 4) * 0.08 })}
              className="bg-[#0e0e0e] p-5 sm:p-8 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-2 min-h-[160px] sm:min-h-[200px] transition-colors duration-300 hover:bg-[#141414]"
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#E1E0CC] break-words">
                {isCountable(metric) ? <CountUp metric={metric} /> : metric.value}
              </p>
              <div className="mt-auto pt-2">
                <p className="text-primary/90 text-xs sm:text-sm font-medium leading-snug">
                  {metric.label}
                </p>
                {metric.context ? (
                  <p className="text-gray-400 text-[11px] sm:text-xs mt-1 leading-snug">
                    {metric.context}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
