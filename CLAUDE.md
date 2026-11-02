# Portfolio site: notes for AI sessions

Personal portfolio of Indranil Mondal (he/him). React 18, Vite 5, TypeScript, Tailwind 3,
framer-motion. Deployed on Vercel from `main`; any other branch gets a Vercel preview.

## Rules
- **Never edit `src/data/indranil_mondal_master.json` or `public/resume/*.pdf`.** They are generated
  from a private master file. Content changes go there, then its sync script regenerates these.
- **All facts come from the JSON** through `src/lib/data.ts`. Components may only add UI microcopy;
  no hardcoded names, URLs, numbers, employers or locations.
- **Status honesty:** every project and the case study show `project.status` via `StatusBadge`;
  never write or imply live, launched or production unless the status says so.
- **No em dashes** (U+2014) anywhere, including comments. En dashes are fine in ranges.
- **Keep the look:** cream on black "Prisma" style (see README "Design system"). The owner chose it
  over a redesign on 2026-11-03.
- First person singular; unnamed clients stay unnamed; links only when the URL is non-null.

## Before you hand back
```bash
npx tsc --noEmit
npm run audit      # must end "N checks: N ok, 0 failed"; screenshots in .audit/screens/
```
Look at the per-section screenshots, not only the full-page ones: Chrome repeats content past
about 16,384 px in a single capture.

Push to a branch first; `main` only after the owner approves the Vercel preview.
