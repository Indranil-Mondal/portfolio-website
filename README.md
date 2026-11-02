# Indranil Mondal · Portfolio

A dark, cinematic personal portfolio for Indranil Mondal, Senior WordPress Developer and
AI-augmented full-stack engineer. Every human-readable fact on the page comes from
`src/data/indranil_mondal_master.json`; the components hold layout and UI microcopy only.

## Stack
- React 18, Vite 5, TypeScript (strict)
- Tailwind CSS 3 (`text-primary` = #DEDBC8, `font-serif` = Instrument Serif)
- framer-motion for entrances, scroll-linked reveals and layout animation; lucide-react icons
- Google Fonts: Almarai (global) and Instrument Serif italic (accent)

## Commands
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and production build into dist/
npm run preview   # serve dist/
npm run audit     # build, serve, screenshot at 1440/768/375 px and run the content checks
```
`npm run audit` drives a local Chrome or Edge through puppeteer-core (set `BROWSER_PATH` to use
another browser). It writes `.audit/screens/<width>.png` plus one image per section, and exits 1 if
any check fails: every project, repo, job bullet, skill and AI Lab item rendered; a status badge on
every project; no em dashes; safe new-tab links; no retired claims; the notice-period toggle; both
resume PDFs served; one h1; static SEO in `dist/index.html`; no horizontal scroll at 375 px; no
console errors.

## Content is generated: do not hand-edit it
- `src/data/indranil_mondal_master.json` and `public/resume/*.pdf` are generated from a private
  master file by its sync script. Edit the master, run the sync, then rebuild. Hand edits here are
  overwritten and fail the owner's drift check.
- The page title, meta description, Open Graph tags, canonical link and JSON-LD Person are written
  into `index.html` at build time by the `portfolio-static-seo` plugin in `vite.config.ts`.

## Structure
```
src/
  data/indranil_mondal_master.json   generated content (public copy)
  lib/data.ts                        the only import of the JSON; typed helpers
  lib/seo.mjs                        title and description rules shared by Vite and the audit
  lib/motion.ts                      easing and the fadeUp() entrance
  components/ui/                     StatusBadge, SectionHeader, ExternalLink
  components/                        Hero, About, Metrics, Features, CaseStudy, AILab, Projects,
                                     Experience, Skills, OpenSource, Contact (+ SiteFooter)
  App.tsx                            section order, skip link, MotionConfig
scripts/audit-site.mjs               the audit
public/resume/                       generated resume PDFs
```

## Design system
- Background `#000000`; cards `#101010` / `#0e0e0e` with `#1a1a1a` borders (`#2a2a2a` on hover)
- Primary text `#E1E0CC`; body text `text-gray-400` (gray-500 and darker fail 4.5:1 here)
- Almarai for display and body, Instrument Serif italic for accent phrases
- Eyebrows: `text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]`
- Motion easing `[0.22, 1, 0.36, 1]` and `[0.16, 1, 0.3, 1]`; viewport margins are vertical only

## Content rules
- Status honesty: every project and the case study show `project.status` as a badge.
- Clients appear exactly as stored; unnamed clients stay unnamed. Links render only when non-null.
- First person singular; no em dashes anywhere (code comments included).
- The notice period renders only while `professional_identity.show_notice_period` is true.

## Accessibility
- Skip link, landmarks, one h1, labelled sections, visible focus rings
- Mobile menu is a focus-trapped dialog (Escape closes it); filter tabs use `aria-pressed`
- External links open in a new tab with `rel="noopener noreferrer"` and a screen-reader hint
- `prefers-reduced-motion` respected through `MotionConfig` and CSS
