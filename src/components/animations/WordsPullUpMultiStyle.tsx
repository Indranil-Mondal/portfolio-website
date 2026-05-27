import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  delay?: number;
}

/**
 * Takes an array of {text, className} segments, splits all into individual words
 * while preserving per-word className. Same pull-up animation as WordsPullUp.
 * Words are wrapped in an inline-flex flex-wrap container.
 */
export default function WordsPullUpMultiStyle({
  segments,
  className = '',
  delay = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  // Flatten all segments into a single ordered word list, each carrying its own className
  const allWords: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(' ').forEach((word) => {
      if (word.length > 0) {
        allWords.push({ word, className: seg.className });
      }
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {allWords.map((item, i) => (
        <span
          key={`${item.word}-${i}`}
          className="inline-block overflow-hidden"
          style={{ marginRight: '0.22em' }}
        >
          <motion.span
            className={`inline-block ${item.className ?? ''}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
