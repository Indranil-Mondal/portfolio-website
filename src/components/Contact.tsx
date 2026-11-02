import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Github,
  Hourglass,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import ExternalLink from './ui/ExternalLink';
import {
  RESUME_DOWNLOADS,
  availability,
  contact_preferences,
  handleFromUrl,
  mailtoHref,
  noticePeriod,
  personal,
  professional_identity,
  telHref,
} from '../lib/data';
import { fadeUp } from '../lib/motion';

const HEADING_ID = 'contact-heading';
const COPY_RESET_MS = 2500;

type CopyTarget = 'email' | 'phone';

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

interface ContactCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  /** Opens in a new tab through ExternalLink (LinkedIn, GitHub). */
  external?: boolean;
  /** Optional control beside the link, e.g. a copy button. Kept outside the <a>. */
  action?: ReactNode;
}

function ContactCard({ icon, label, value, href, external = false, action }: ContactCardProps) {
  const linkClass =
    'flex min-w-0 flex-1 items-center gap-3 sm:gap-4 rounded-lg p-2 sm:p-2.5';
  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] text-primary"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-0.5">
          {label}
        </span>
        <span className="block text-xs sm:text-sm font-medium text-[#E1E0CC] [overflow-wrap:anywhere]">
          {value}
        </span>
      </span>
      {external ? (
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-gray-400 transition-colors duration-300 group-hover/card:text-primary"
        />
      ) : null}
    </>
  );

  return (
    <div className="group/card flex items-center gap-2 rounded-xl border border-[#1a1a1a] bg-[#0e0e0e]/80 p-2 pr-2.5 sm:p-2.5 sm:pr-3 backdrop-blur-sm transition-colors duration-300 hover:border-[#2a2a2a] focus-within:border-primary/40">
      {external ? (
        <ExternalLink href={href} className={linkClass}>
          {content}
        </ExternalLink>
      ) : (
        <a href={href} className={linkClass}>
          {content}
        </a>
      )}
      {action}
    </div>
  );
}

interface CopyButtonProps {
  /** What is copied, for the accessible name: 'email address', 'phone number'. */
  what: string;
  copied: boolean;
  onCopy: () => void;
}

function CopyButton({ what, copied, onCopy }: CopyButtonProps) {
  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
        copied
          ? 'border-primary/40 text-primary'
          : 'border-[#2a2a2a] text-gray-400 hover:border-primary/40 hover:text-[#E1E0CC]'
      }`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only">{copied ? 'Copied' : 'Copy'}</span>
      <span className="sr-only"> {what}</span>
    </button>
  );
}

function PulseDot() {
  return (
    <span aria-hidden="true" className="relative mt-[3px] flex h-2 w-2 shrink-0 sm:mt-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Contact() {
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async (target: CopyTarget, text: string, what: string) => {
    window.clearTimeout(resetTimer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setAnnouncement(`Copied: ${what}`);
    } catch {
      setCopied(null);
      setAnnouncement(`Could not copy the ${what}. Please select it and copy it manually.`);
    }
    resetTimer.current = window.setTimeout(() => {
      setCopied(null);
      setAnnouncement('');
    }, COPY_RESET_MS);
  };

  const notice = noticePeriod();
  const openTo = availability();
  const { email, phone, linkedin, github, preferred_contact: preferredContact } = contact_preferences;

  return (
    <section
      id="contact"
      aria-labelledby={HEADING_ID}
      className="bg-black pt-20 sm:pt-28 md:pt-36 pb-10 sm:pb-14 px-4 md:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-28 relative overflow-hidden">
          {/* Atmospheric mesh */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 80% 20%, rgba(120,90,55,0.30) 0%, transparent 60%),' +
                'radial-gradient(ellipse at 20% 90%, rgba(60,40,80,0.30) 0%, transparent 60%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 noise-overlay opacity-[0.15] mix-blend-overlay pointer-events-none"
          />

          <div className="relative">
            {/* Current status */}
            <motion.div {...fadeUp({ y: 10 })} className="mb-8 sm:mb-10">
              <p className="inline-flex max-w-full items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs leading-snug text-primary sm:items-center sm:rounded-full sm:text-sm">
                <PulseDot />
                <span className="min-w-0">{professional_identity.current_status}</span>
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h2
              id={HEADING_ID}
              {...fadeUp({ delay: 0.1, duration: 0.7 })}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight max-w-3xl text-[#E1E0CC]"
            >
              Let&apos;s build something{' '}
              <span className="italic font-serif">production-grade.</span>
            </motion.h2>

            {preferredContact ? (
              <motion.p
                {...fadeUp({ delay: 0.2, y: 10 })}
                className="text-sm sm:text-base text-gray-400 mt-5 sm:mt-6 max-w-xl leading-relaxed"
              >
                Preferred contact: <span className="text-[#E1E0CC]">{preferredContact}</span>
              </motion.p>
            ) : null}

            {/* Primary CTA */}
            <motion.div {...fadeUp({ delay: 0.3, duration: 0.7 })} className="mt-8 sm:mt-10">
              <a
                href={mailtoHref(email)}
                className="group inline-flex items-center justify-between gap-2 bg-primary rounded-full pl-5 sm:pl-6 pr-1.5 py-1.5 transition-all duration-300 hover:gap-3"
              >
                <span className="text-black font-medium text-sm sm:text-base">Send me an email</span>
                <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5 text-[#E1E0CC]" />
                </span>
              </a>
            </motion.div>

            {/* Contact cards */}
            <motion.div
              {...fadeUp({ delay: 0.1 })}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-10 sm:mt-14"
            >
              <ContactCard
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={email}
                href={mailtoHref(email)}
                action={
                  <CopyButton
                    what="email address"
                    copied={copied === 'email'}
                    onCopy={() => void copy('email', email, 'email address')}
                  />
                }
              />
              <ContactCard
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={phone}
                href={telHref(phone)}
                action={
                  <CopyButton
                    what="phone number"
                    copied={copied === 'phone'}
                    onCopy={() => void copy('phone', phone, 'phone number')}
                  />
                }
              />
              {linkedin ? (
                <ContactCard
                  icon={<Linkedin className="w-4 h-4" />}
                  label="LinkedIn"
                  value={handleFromUrl(linkedin)}
                  href={linkedin}
                  external
                />
              ) : null}
              {github ? (
                <ContactCard
                  icon={<Github className="w-4 h-4" />}
                  label="GitHub"
                  value={handleFromUrl(github)}
                  href={github}
                  external
                />
              ) : null}
            </motion.div>
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>

            {/* Availability, notice period, location and languages */}
            <motion.div
              {...fadeUp({ delay: 0.1 })}
              className="mt-10 sm:mt-14 grid gap-8 sm:grid-cols-2"
            >
              {openTo.length > 0 || notice !== null ? (
                <div>
                  {openTo.length > 0 ? (
                    <>
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                        Availability
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {openTo.map((item) => (
                          <li
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1.5 text-xs text-primary"
                          >
                            <Check aria-hidden="true" className="h-3 w-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {notice !== null ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400">
                      <Hourglass aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                      Notice period: <span className="text-[#E1E0CC]">{notice}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 text-sm text-gray-400 sm:pt-7">
                {personal.location ? (
                  <p className="inline-flex items-start gap-2">
                    <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      <span className="sr-only">Location: </span>
                      {personal.location}
                    </span>
                  </p>
                ) : null}
                {personal.languages.length > 0 ? (
                  <p className="inline-flex items-start gap-2">
                    <Languages aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      <span className="sr-only">Languages: </span>
                      {personal.languages.join(' · ')}
                    </span>
                  </p>
                ) : null}
              </div>
            </motion.div>

            {/* Resume downloads */}
            {RESUME_DOWNLOADS.length > 0 ? (
              <motion.div {...fadeUp({ delay: 0.1 })} className="mt-10 sm:mt-14">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Download my resume
                </p>
                <ul className="flex flex-col sm:flex-row flex-wrap gap-3">
                  {RESUME_DOWNLOADS.map((resume) => (
                    <li key={resume.href}>
                      <a
                        href={resume.href}
                        download
                        className="group inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/[0.04] py-1.5 pl-1.5 pr-5 transition-colors duration-300 hover:border-primary/60 hover:bg-primary/[0.08]"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-black transition-transform duration-300 group-hover:scale-105"
                        >
                          <Download className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="sr-only">Download </span>
                          <span className="text-sm font-medium text-[#E1E0CC]">{resume.label}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5">{resume.detail}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Page footer. App renders it after <main> so it is the page-level contentinfo landmark. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-black px-4 md:px-6 pb-10 sm:pb-14">
      <div className="max-w-6xl mx-auto border-t border-[#1a1a1a] pt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between text-xs text-gray-400 px-2">
        <div className="flex flex-col gap-1.5 leading-relaxed">
          <p>
            &copy; {year} {personal.name} · {professional_identity.title}
          </p>
          {professional_identity.tagline ? <p>{professional_identity.tagline}</p> : null}
          <p>Built with React, Vite, Tailwind and Framer Motion.</p>
        </div>
        <a
          href="#top"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#2a2a2a] px-3.5 py-2 text-[#E1E0CC]/80 transition-colors duration-200 hover:border-primary/40 hover:text-[#E1E0CC]"
        >
          <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
          Back to top
        </a>
      </div>
    </footer>
  );
}
