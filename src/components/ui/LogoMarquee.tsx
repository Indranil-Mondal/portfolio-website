import type { Logo } from '../../lib/logos';

/** A single brand mark as inline SVG; decorative because the name is printed beside it. */
export function LogoMark({ logo, className = 'h-5 w-5' }: { logo: Logo; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`shrink-0 fill-current ${className}`}>
      <path d={logo.path} />
    </svg>
  );
}

function Row({ logos }: { logos: Logo[] }) {
  return (
    <ul className="flex shrink-0 items-center">
      {logos.map((logo) => (
        <li
          key={logo.slug}
          className="flex items-center gap-2.5 px-5 sm:px-7 text-[#E1E0CC]/60 transition-colors duration-300 hover:text-[#E1E0CC]"
        >
          <LogoMark logo={logo} className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="whitespace-nowrap text-xs sm:text-sm">{logo.title}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Endless horizontal strip of logos. The list is rendered twice and the track slides by half its
 * width (see .marquee-track in index.css), so the loop is seamless; the second copy is hidden from
 * assistive tech. Hover pauses it; with reduced motion it stops and becomes a scrollable row.
 */
export default function LogoMarquee({
  logos,
  reverse = false,
  seconds = 60,
}: {
  logos: Logo[];
  reverse?: boolean;
  seconds?: number;
}) {
  return (
    <div className="marquee group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="marquee-track flex w-max"
        data-reverse={reverse ? '' : undefined}
        style={{ ['--marquee-duration' as string]: `${seconds}s` }}
      >
        <Row logos={logos} />
        <div aria-hidden="true" className="marquee-copy flex shrink-0">
          <Row logos={logos} />
        </div>
      </div>
    </div>
  );
}
