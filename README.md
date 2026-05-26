# Indranil Mondal — Portfolio

A dark, cinematic, production-grade personal portfolio for **Indranil Mondal**, Senior WordPress Fullstack Engineer & Technical Project Lead.

Built per the Prisma visual blueprint, with **100% of human-readable content sourced from `src/data/indranil_mondal_master.json`** — the single source of truth. No hardcoded names, no invented placeholders.

---

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS 3** (with custom `primary: #DEDBC8` and `font-serif: Instrument Serif`)
- **framer-motion** for all animations (pull-up text, scroll-linked opacity reveals, staggered card entrances)
- **lucide-react** for icons
- **Google Fonts**: Almarai (global) + Instrument Serif italic (accent)

---

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Other commands

```bash
npm run build     # Type-check + production build
npm run preview   # Preview the production build
npm run lint      # TypeScript check only
```

---

## Architecture

```
src/
├── data/
│   └── indranil_mondal_master.json   ← single source of truth
├── components/
│   ├── animations/
│   │   ├── WordsPullUp.tsx           ← per-word pull-up, supports asterisk
│   │   ├── WordsPullUpMultiStyle.tsx ← multi-segment pull-up (mixed styles)
│   │   └── AnimatedLetter.tsx        ← scroll-linked char opacity
│   ├── Hero.tsx                      ← name as giant heading
│   ├── About.tsx                     ← multi-style + scroll-revealed body
│   ├── Metrics.tsx                   ← all 8 key_metrics with CountUp
│   ├── Features.tsx                  ← top 4 featured projects, card grid
│   ├── Projects.tsx                  ← ALL 13 projects, no truncation
│   ├── Skills.tsx                    ← all 9 skill categories + industries
│   ├── Experience.tsx                ← both jobs + ALL bullets, education, leadership
│   ├── OpenSource.tsx                ← all 6 open-source repos
│   └── Contact.tsx                   ← real email/phone/LinkedIn/GitHub
├── App.tsx                           ← assembles all sections
├── main.tsx                          ← React entry
└── index.css                         ← Tailwind + noise textures + global font
```

---

## Design System

- **Background:** `#000000` global; `#101010` for About/Contact cards; `#0e0e0e` for grid cards
- **Primary text:** `#E1E0CC` (Tailwind utility `text-primary` = `#DEDBC8`)
- **Gray text:** `text-gray-400` (body), `text-gray-500` / `text-gray-600` (meta)
- **Borders:** `#1a1a1a` → `#2a2a2a` on hover
- **Typography:** Almarai (display + body) with Instrument Serif italic for accent lines
- **Noise textures:** SVG fractal noise on the hero and Features section
- **Motion easing:** `[0.16, 1, 0.3, 1]` and `[0.22, 1, 0.36, 1]` (custom cubic-bezier)

---

## Data Binding

Every component imports the master JSON once at the top:

```ts
import data from '../data/indranil_mondal_master.json';
const { personal, projects, skills, ... } = data;
```

To update content, edit `src/data/indranil_mondal_master.json` only. No code changes needed.

---

## Notes on the Original Prisma Spec

The Prisma design prompt referenced external video and image URLs. Per the SYSTEM_PROMPT escape rules, I did **not** invent or include external personal-asset URLs. Instead, I replaced them with:

- **Atmospheric gradient meshes** + animated blur shapes (Hero, Features card 1, Contact)
- **Number badges** in place of icon images (Features cards 2/3/4)

Every other visual element from the spec — noise overlay, rounded-2xl inset frame, hanging navbar pill, multi-style heading, scroll-revealed body, pull-up animations, staggered card entrances — is implemented faithfully.

---

## Accessibility

- `prefers-reduced-motion` respected (all animations disabled or reduced)
- All external links use `target="_blank" rel="noopener noreferrer"`
- Semantic landmarks (`<section>`, `<nav>`, `<footer>`, `<article>`)
- Color contrast meets WCAG AA on the cream/black palette
