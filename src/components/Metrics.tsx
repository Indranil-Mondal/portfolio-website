import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import data from '../data/indranil_mondal_master.json';

const { key_metrics } = data;

/**
 * Parses a metric value string into:
 *  - prefix (e.g., "~" or "")
 *  - numericTarget (parsed number for CountUp)
 *  - suffix (e.g., "+", "×", "%", or a complex tail like " → 250")
 *  - isCountable: whether to animate the number or just display the string
 */
function parseMetricValue(value: string): {
  prefix: string;
  numericTarget: number;
  suffix: string;
  isCountable: boolean;
  raw: string;
} {
  // Complex values like "3,000 → 250" or "40–60%" — show as-is, no count animation
  if (value.includes('→') || value.includes('–')) {
    return { prefix: '', numericTarget: 0, suffix: '', isCountable: false, raw: value };
  }

  const prefixMatch = value.match(/^[^\d]*/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const rest = value.slice(prefix.length);

  const numMatch = rest.match(/^([\d,.]+)/);
  if (!numMatch) {
    return { prefix: '', numericTarget: 0, suffix: '', isCountable: false, raw: value };
  }
  const numericTarget = parseFloat(numMatch[1].replace(/,/g, ''));
  const suffix = rest.slice(numMatch[1].length);

  return { prefix, numericTarget, suffix, isCountable: !isNaN(numericTarget), raw: value };
}

function CountUp({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    target < 10 ? latest.toFixed(1) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, target, {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => controls.stop();
    }
  }, [inView, motionValue, target]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      {prefix && <span>{prefix}</span>}
      <motion.span>{rounded}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

export default function Metrics() {
  return (
    <section className="bg-black py-20 sm:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-10 sm:mb-14 text-center"
        >
          By the Numbers
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a] rounded-2xl md:rounded-3xl overflow-hidden border border-[#1a1a1a]">
          {key_metrics.map((metric, i) => {
            const parsed = parseMetricValue(metric.value);
            return (
              <motion.div
                key={metric.metric}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-[#0c0c0c] p-6 sm:p-8 md:p-10 flex flex-col gap-2 min-h-[160px] sm:min-h-[200px] transition-colors duration-300 hover:bg-[#141414]"
              >
                <div
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight"
                  style={{ color: '#E1E0CC' }}
                >
                  {parsed.isCountable ? (
                    <CountUp
                      target={parsed.numericTarget}
                      prefix={parsed.prefix}
                      suffix={parsed.suffix}
                    />
                  ) : (
                    <span>{parsed.raw}</span>
                  )}
                </div>
                <div className="mt-auto pt-2">
                  <p className="text-primary/90 text-xs sm:text-sm font-medium leading-snug">
                    {metric.metric}
                  </p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 leading-snug">
                    {metric.context}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
