import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface WordsPullUpProps {
  text: string;
  className?: string;
  delay?: number;
  showAsterisk?: boolean;
}

/**
 * Splits text into words. Each word slides up (y:20 → 0) with a staggered delay of 0.08s.
 * Triggered once when the heading enters the viewport.
 *
 * showAsterisk: if true, places a superscript "*" right after the LAST character
 * of the final word — matches the Prisma design's asterisk-after-final-letter detail.
 */
export default function WordsPullUp({
  text,
  className = '',
  delay = 0,
  showAsterisk = false,
}: WordsPullUpProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const words = text.split(' ');
  const lastIndex = words.length - 1;

  return (
    <h1 ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const isLast = i === lastIndex;
        return (
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden"
            style={{ marginRight: i === lastIndex ? 0 : '0.18em' }}
          >
            <motion.span
              className="inline-block relative"
              initial={{ y: 20, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: delay + i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {isLast && showAsterisk && (
                <span
                  className="absolute"
                  style={{
                    top: '0.65em',
                    right: '-0.3em',
                    fontSize: '0.31em',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}
