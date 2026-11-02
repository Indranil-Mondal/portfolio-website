import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { EXTERNAL_LINK_PROPS, NEW_TAB_NOTE } from '../../lib/data';

export interface ExternalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> {
  /** Absolute URL from the JSON. Only render this component when the URL is non-null. */
  href: string;
  children: ReactNode;
}

/**
 * An <a> that opens in a new tab: target="_blank", rel="noopener noreferrer" and an sr-only
 * "(opens in a new tab)". If you pass aria-label, the note is appended to it instead, because an
 * aria-label replaces the link's text for screen readers. Mark decorative icons aria-hidden.
 */
const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(function ExternalLink(
  { href, children, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      {...rest}
      {...EXTERNAL_LINK_PROPS}
      aria-label={ariaLabel ? `${ariaLabel} ${NEW_TAB_NOTE}` : undefined}
    >
      {children}
      {ariaLabel ? null : <span className="sr-only"> {NEW_TAB_NOTE}</span>}
    </a>
  );
});

export default ExternalLink;
