// How far down the page each section starts, in screens, at a desktop and a phone viewport.
// Used to decide the section order from a recruiter's point of view (2026-11-08): a section
// that starts 20 screens down is, in practice, not seen by someone skimming.
//
//   npm run depth                       # the production site
//   npm run depth -- http://localhost:4173/   # a local `npm run preview` (Vite listens on ::1, so
//                                             # use "localhost", not 127.0.0.1)
//
// Set BROWSER_PATH to use another Chromium-based browser.
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { SITE_URL } from '../src/lib/seo.mjs';

const url = process.argv[2] ?? SITE_URL;
const VIEWPORTS = [
  [1440, 900],
  [375, 812],
];
const BROWSERS = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter((path) => path && existsSync(path));

if (BROWSERS.length === 0) {
  console.error('No browser found: set BROWSER_PATH to a Chrome or Edge executable.');
  process.exit(1);
}

const browser = await puppeteer.launch({ executablePath: BROWSERS[0], headless: true });
try {
  console.log(`> ${url} with ${BROWSERS[0]}`);
  for (const [width, height] of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    // Reduced motion: entrance animations finish at once, so the layout is final when measured.
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll('main section')]
        .filter((section) => section.parentElement?.closest('section') == null)
        .map((section) => {
          const box = section.getBoundingClientRect();
          const heading = section.querySelector('h1, h2')?.textContent?.trim() ?? '';
          return { label: section.id || heading.slice(0, 36), top: box.top + scrollY, height: box.height };
        }),
    );
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`\n${width} x ${height}: page is ${(total / height).toFixed(1)} screens`);
    for (const row of rows) {
      const screens = (row.top / height).toFixed(1).padStart(5);
      console.log(`  ${row.label.padEnd(38)} starts at screen ${screens}  (${Math.round(row.height)} px tall)`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
