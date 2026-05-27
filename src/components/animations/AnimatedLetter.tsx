import { motion, MotionValue, useTransform } from 'framer-motion';

interface AnimatedLetterProps {
  char: string;
  index: number;
  totalChars: number;
  scrollProgress: MotionValue<number>;
}

/**
 * Single character whose opacity transitions from 0.2 to 1 based on a parent's
 * scroll progress. Each char has a small window inside the overall progress so the
 * text reveals character-by-character as the section scrolls into view.
 *
 * charProgress = index / totalChars
 * Reveal range: [charProgress - 0.1, charProgress + 0.05]
 */
export default function AnimatedLetter({
  char,
  index,
  totalChars,
  scrollProgress,
}: AnimatedLetterProps) {
  const charProgress = index / Math.max(totalChars, 1);
  const opacity = useTransform(
    scrollProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1]
  );

  // Preserve spaces as actual spaces so the line wraps naturally
  if (char === ' ') {
    return <>{' '}</>;
  }

  return <motion.span style={{ opacity, display: 'inline-block' }}>{char}</motion.span>;
}
