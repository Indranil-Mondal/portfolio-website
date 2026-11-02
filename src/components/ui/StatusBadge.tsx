import { statusTone, type StatusTone } from '../../lib/data';

// Subtle tones on black. Every text colour is at least 6.8:1 against its own tinted pill on
// backgrounds from #000 to #212121, so the small uppercase label stays well above WCAG AA (4.5:1).
const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  success: {
    pill: 'text-[#9CCBA5] bg-[#9CCBA5]/[0.08] border-[#9CCBA5]/25',
    dot: 'bg-[#9CCBA5]',
  },
  progress: {
    pill: 'text-primary bg-primary/[0.08] border-primary/25',
    dot: 'bg-primary',
  },
  test: {
    pill: 'text-[#DDB97A] bg-[#DDB97A]/[0.08] border-[#DDB97A]/25',
    dot: 'bg-[#DDB97A]',
  },
  rnd: {
    pill: 'text-[#C3B4E3] bg-[#C3B4E3]/[0.08] border-[#C3B4E3]/25',
    dot: 'bg-[#C3B4E3]',
  },
  neutral: {
    pill: 'text-gray-400 bg-white/[0.03] border-[#2a2a2a]',
    dot: 'bg-gray-400',
  },
};

export interface StatusBadgeProps {
  /** The status string exactly as stored in the JSON (e.g. project.status). Rendered verbatim. */
  status: string;
  /** Extra classes for the root element (spacing, alignment). */
  className?: string;
}

/**
 * Small rounded pill that shows a status verbatim with a tone dot. The root carries
 * data-status-badge (counted by scripts/audit-site.mjs) and data-tone.
 */
export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const tone = statusTone(status);
  const classes = TONE_CLASSES[tone];

  return (
    <span
      data-status-badge=""
      data-tone={tone}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] leading-none ${classes.pill} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${classes.dot}`} />
      <span className="sr-only">Status: </span>
      <span className="min-w-0">{status}</span>
    </span>
  );
}
