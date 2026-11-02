import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download, Menu as MenuIcon, X } from 'lucide-react';
import WordsPullUp from './animations/WordsPullUp';
import { NAV_ITEMS, RESUME_DOWNLOADS, personal, professional_identity } from '../lib/data';
import { EASE_OUT, EASE_PULL_UP } from '../lib/motion';

const MENU_ID = 'site-menu';
const MENU_TITLE_ID = 'site-menu-title';
/** The inline nav list shows from Tailwind's lg breakpoint up; below it, the Menu button and sheet. */
const INLINE_NAV_QUERY = '(min-width: 1024px)';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const NAV_LINK_CLASS = 'text-[#E1E0CC]/80 transition-colors duration-200 hover:text-[#E1E0CC]';

const primaryResume = RESUME_DOWNLOADS[0];

/* ------------------------------------------------------------------ */
/* Mobile menu sheet (below lg)                                        */
/* ------------------------------------------------------------------ */

interface MenuSheetProps {
  /** restoreFocus: true returns focus to the Menu button (Escape, Close); false leaves it to the link jump. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * Full-screen black sheet listing the sections. A modal dialog: focus starts on the first link, Tab
 * and Shift+Tab stay inside, Escape closes it. Rendered in a portal on <body>, so the transformed nav
 * pill does not become the containing block of this fixed element.
 */
function MenuSheet({ onClose }: MenuSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  // False while the exit fade runs: the sheet stops trapping focus as soon as it starts closing.
  const isPresent = useIsPresent();

  useEffect(() => {
    if (!isPresent) return undefined;
    const sheet = sheetRef.current;
    if (!sheet) return undefined;

    if (!sheet.contains(document.activeElement)) {
      sheet.querySelector<HTMLElement>('nav a[href]')?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(true);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && sheet.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isPresent, onClose]);

  return (
    <motion.div
      ref={sheetRef}
      id={MENU_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MENU_TITLE_ID}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-contain bg-black lg:hidden"
    >
      <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
        <p
          id={MENU_TITLE_ID}
          className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]"
        >
          Menu
        </p>
        <button
          type="button"
          onClick={() => onClose(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#2a2a2a] px-4 text-sm text-[#E1E0CC] transition-colors duration-200 hover:border-primary/50"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          Close
        </button>
      </div>

      <nav aria-label="Sections" className="flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <ol className="border-t border-[#1a1a1a]">
          {NAV_ITEMS.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 + i * 0.04, ease: EASE_OUT }}
              className="border-b border-[#1a1a1a]"
            >
              <a
                href={item.href}
                onClick={() => onClose(false)}
                className={`group flex items-baseline gap-4 py-3 sm:py-4 text-3xl sm:text-5xl tracking-tight ${NAV_LINK_CLASS}`}
              >
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 text-[10px] sm:text-xs tracking-[0.2em] text-primary tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  {item.label}
                </span>
              </a>
            </motion.li>
          ))}
        </ol>
      </nav>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav pill                                                            */
/* ------------------------------------------------------------------ */

/**
 * The black pill hanging from the hero's top edge. From lg up it lists every section inline; below lg
 * it holds a Menu button that opens MenuSheet. While the sheet is open the page behind it is inert and
 * the body does not scroll.
 */
function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  }, []);

  // Scroll lock, background inert, and auto-close when the window widens to the inline-nav breakpoint.
  useEffect(() => {
    if (!open) return undefined;
    const { body } = document;
    const appRoot = document.getElementById('root');
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    appRoot?.setAttribute('inert', '');

    const inlineNav = window.matchMedia(INLINE_NAV_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu(false);
    };
    inlineNav.addEventListener('change', onBreakpoint);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      appRoot?.removeAttribute('inert');
      inlineNav.removeEventListener('change', onBreakpoint);
    };
  }, [open, closeMenu]);

  // Runs after the cleanup above has lifted `inert`, so the button can take focus again.
  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    menuButtonRef.current?.focus();
  }, [open]);

  return (
    <>
      <nav aria-label="Primary" className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="rounded-b-2xl bg-black px-2 py-1.5 md:rounded-b-3xl lg:px-8 lg:py-3">
          <ul className="hidden items-center gap-6 lg:flex xl:gap-10">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={item.href} className={`whitespace-nowrap text-sm ${NAV_LINK_CLASS}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? MENU_ID : undefined}
            className={`flex min-h-[40px] items-center gap-2 rounded-full px-4 text-xs sm:text-sm lg:hidden ${NAV_LINK_CLASS}`}
          >
            <MenuIcon aria-hidden="true" className="h-4 w-4" />
            Menu
          </button>
        </div>
      </nav>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? <MenuSheet key="site-menu" onClose={closeMenu} /> : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" aria-label="Introduction" className="p-4 md:p-6">
      <div className="relative flex min-h-[calc(100svh-2rem)] w-full flex-col justify-end overflow-hidden rounded-2xl bg-[#0a0a0a] md:min-h-[calc(100svh-3rem)] md:rounded-[2rem]">
        {/* Decorative background: gradient mesh, two slow drifting glows, noise and a vignette. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 20% 30%, rgba(70,50,30,0.55) 0%, transparent 55%),' +
                'radial-gradient(ellipse at 80% 70%, rgba(40,30,55,0.50) 0%, transparent 55%),' +
                'radial-gradient(ellipse at 50% 100%, rgba(120,90,55,0.30) 0%, transparent 60%),' +
                'linear-gradient(180deg, #0c0c0c 0%, #050505 100%)',
            }}
          />
          <motion.div
            className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #DEDBC8 0%, transparent 70%)' }}
            animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-32 h-[45rem] w-[45rem] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8a6a3a 0%, transparent 70%)' }}
            animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        <SiteNav />

        {/* Bottom-aligned content. pt-24 keeps it clear of the nav pill on short screens. */}
        <div className="relative z-10 px-4 pb-6 pt-24 md:px-8 md:pb-10 lg:px-12 lg:pb-12">
          <div className="grid grid-cols-12 items-end gap-4 md:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE_PULL_UP }}
                className="mb-5 sm:mb-6"
              >
                <p className="inline-flex max-w-full items-start gap-2.5 rounded-2xl border border-primary/30 bg-black/40 px-3 py-2 text-[11px] leading-snug text-primary backdrop-blur-sm sm:items-center sm:rounded-full sm:px-4 sm:text-xs">
                  <span aria-hidden="true" className="relative mt-[3px] flex h-2 w-2 shrink-0 sm:mt-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="min-w-0">{professional_identity.current_status}</span>
                </p>
              </motion.div>

              <div className="text-[#E1E0CC]">
                <WordsPullUp
                  text={personal.name}
                  showAsterisk
                  className="text-[19vw] sm:text-[18vw] md:text-[16vw] lg:text-[14vw] xl:text-[13vw] font-medium leading-[0.85] tracking-[-0.07em]"
                />
              </div>
            </div>

            <div className="col-span-12 flex flex-col gap-5 sm:gap-6 lg:col-span-4 lg:pb-4 lg:pl-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE_PULL_UP }}
                className="max-w-md text-sm text-primary/80 md:text-base"
                style={{ lineHeight: 1.4 }}
              >
                {professional_identity.headline}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: EASE_PULL_UP }}
                className="flex flex-wrap items-center gap-3"
              >
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-between gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 transition-all duration-300 hover:gap-3 sm:pl-6"
                >
                  <span className="text-sm font-medium text-black sm:text-base">Hire Me</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#E1E0CC] sm:h-5 sm:w-5" />
                  </span>
                </a>

                {primaryResume ? (
                  <a
                    href={primaryResume.href}
                    download
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-black/20 px-4 text-sm text-[#E1E0CC] backdrop-blur-sm transition-colors duration-300 hover:border-primary/60 hover:bg-primary/[0.06] sm:h-[52px] sm:px-6 sm:text-base"
                  >
                    <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Download resume
                    <span className="sr-only"> ({primaryResume.detail})</span>
                  </a>
                ) : null}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
