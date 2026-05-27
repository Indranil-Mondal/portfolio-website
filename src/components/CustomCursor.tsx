import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

type Variant = 'default' | 'hover' | 'view';

export default function CustomCursor() {
  const [variant, setVariant] = useState<Variant>('default');
  const [label, setLabel] = useState('');
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [clicking, setClicking] = useState(false);

  // Raw mouse position — drives the inner dot instantly
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Spring-smoothed position — drives the outer ring with elastic lag
  const springConfig = { stiffness: 220, damping: 24, mass: 0.5 };
  const ringX = useSpring(x, springConfig);
  const ringY = useSpring(y, springConfig);

  // Disable on touch devices and when user prefers reduced motion
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(!touch && !reduced);
  }, []);

  // Toggle a global class so CSS can hide the native cursor only when this is active
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('cursor-none-active');
    return () => document.documentElement.classList.remove('cursor-none-active');
  }, [enabled]);

  // Mouse tracking + click + visibility
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [enabled, x, y]);

  // Hover-zone detection via event delegation — no need to attach listeners everywhere
  useEffect(() => {
    if (!enabled) return;
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      // Custom zones via data attributes win first
      const zone = t.closest<HTMLElement>('[data-cursor]');
      if (zone) {
        const v = zone.dataset.cursor as Variant;
        setVariant(['default', 'hover', 'view'].includes(v) ? v : 'default');
        setLabel(zone.dataset.cursorLabel || '');
        return;
      }

      // Auto-detect interactive elements
      if (t.closest('a, button, [role="button"], label')) {
        setVariant('hover');
        setLabel('');
        return;
      }

      setVariant('default');
      setLabel('');
    };
    document.addEventListener('mouseover', onOver);
    return () => document.removeEventListener('mouseover', onOver);
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = variant === 'view' ? 76 : variant === 'hover' ? 52 : 32;
  const showDot = variant === 'default';
  const ringFilled = variant === 'view';

  return (
    <>
      {/* INNER DOT — instant follow, white with mix-blend-difference */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{ x, y }}
        aria-hidden
      >
        <motion.div
          className="rounded-full"
          animate={{
            width: 8,
            height: 8,
            opacity: visible && showDot ? 1 : 0,
            scale: clicking ? 0.5 : 1,
          }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff',
            translateX: '-50%',
            translateY: '-50%',
            mixBlendMode: 'difference',
          }}
        />
      </motion.div>

      {/* OUTER RING — spring-lagged, grows on hover, fills with text on "view" */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: ringX, y: ringY }}
        aria-hidden
      >
        <motion.div
          className="rounded-full border flex items-center justify-center"
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: visible ? 1 : 0,
            scale: clicking ? 0.85 : 1,
            backgroundColor: ringFilled ? '#DEDBC8' : 'rgba(222, 219, 200, 0)',
            borderColor: ringFilled ? '#DEDBC8' : 'rgba(222, 219, 200, 0.45)',
          }}
          transition={{
            width: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2 },
            scale: { duration: 0.15 },
            backgroundColor: { duration: 0.3 },
            borderColor: { duration: 0.3 },
          }}
          style={{
            translateX: '-50%',
            translateY: '-50%',
            borderWidth: 1,
          }}
        >
          <AnimatePresence mode="wait">
            {variant === 'view' && label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}