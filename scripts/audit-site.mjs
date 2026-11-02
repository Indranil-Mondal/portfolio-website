#!/usr/bin/env node
// Site audit. Builds the site, serves dist/ with vite preview, loads it in a real browser at 1440,
// 768 and 375 px wide, saves full-page screenshots to .audit/screens/<width>.png and checks the
// rendered page against src/data/indranil_mondal_master.json (content coverage, status badges,
// em dashes, link safety, retired claims, notice period, resume PDFs, h1, static SEO, horizontal
// scroll, console errors).
//
// Usage:  npm run audit                 build first, then audit
//         npm run audit -- --no-build   audit the existing dist/
// Env:    BROWSER_PATH=<Chrome or Edge executable>  (default: Edge, then Chrome, standard paths)
//
// Prints "ok <check>" or "FAIL <check>: details" per check; exits 1 if any check fails.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { metaDescriptionFrom, pageTitle } from '../src/lib/seo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'indranil_mondal_master.json');
const SCREEN_DIR = path.join(ROOT, '.audit', 'screens');

const HOST = '127.0.0.1';
const PORT = 4317;
const BASE_URL = `http://${HOST}:${PORT}/`;
const VIEWPORT_WIDTHS = [1440, 768, 375];
const VIEWPORT_HEIGHT = 900;
const CONTENT_WIDTH = 1440;
const MOBILE_WIDTH = 375;

const RESUME_PDFS = [
  '/resume/Indranil_Mondal_Resume.pdf',
  '/resume/Indranil_Mondal_Master_Resume.pdf',
];
const RETIRED_STRINGS = [
  'Kolkata, West Bengal',
  '60 days',
  '1,679',
  '27B',
  'indranil-mondal-26b053a7',
  'Hyderabad',
  'Zscaler',
  'battle card',
];
const BROWSER_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const EM_DASH = '\u2014';
const TEXT_EXTENSIONS = new Set([
  '.html', '.htm', '.js', '.mjs', '.cjs', '.css', '.json', '.txt', '.svg', '.xml', '.map', '.md',
  '.webmanifest',
]);

const IS_WINDOWS = process.platform === 'win32';
const ARGS = new Set(process.argv.slice(2));
const SKIP_BUILD = ARGS.has('--no-build');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Reporting                                                           */
/* ------------------------------------------------------------------ */

const results = [];

function record(name, ok, details = '') {
  results.push({ name, ok, details });
  console.log(ok ? `ok ${name}` : `FAIL ${name}: ${details}`);
}

function clip(text, max = 90) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 3)}...` : flat;
}

/* ------------------------------------------------------------------ */
/* Text matching                                                       */
/* ------------------------------------------------------------------ */

const SPACES = /[\s\u00a0\u2007\u2009\u202f]+/g;
// innerText applies text-transform and splits words animated one span at a time, so compare
// case-insensitively, first with collapsed whitespace and then with whitespace removed.
const normalise = (text) => String(text).replace(SPACES, ' ').trim().toLowerCase();
const squash = (text) => String(text).replace(SPACES, '').toLowerCase();

function makeMatcher(haystack) {
  const spaced = normalise(haystack);
  const squashed = squash(haystack);
  return (needle) => spaced.includes(normalise(needle)) || squashed.includes(squash(needle));
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/* ------------------------------------------------------------------ */
/* Child processes                                                     */
/* ------------------------------------------------------------------ */

// Puts node_modules/.bin on PATH so `vite` resolves even when this runs outside npm.
function childEnv() {
  const env = { ...process.env };
  const pathKey = Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
  env[pathKey] = [path.join(ROOT, 'node_modules', '.bin'), env[pathKey] ?? ''].join(path.delimiter);
  return env;
}

function runCommand(command) {
  return new Promise((resolve) => {
    const child = spawn(command, { cwd: ROOT, shell: true, stdio: 'inherit', env: childEnv() });
    child.on('error', () => resolve(1));
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

let server = null;
let serverLog = '';
let serverStopped = false;

function serverRunning() {
  return server !== null && server.exitCode === null && server.signalCode === null;
}

function startPreview() {
  const command = `vite preview --port ${PORT} --strictPort --host ${HOST}`;
  server = spawn(command, {
    cwd: ROOT,
    shell: true,
    // POSIX: own process group, so the whole tree can be killed at once.
    detached: !IS_WINDOWS,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: childEnv(),
  });
  const collect = (chunk) => {
    serverLog = (serverLog + chunk.toString()).slice(-4000);
  };
  server.stdout.on('data', collect);
  server.stderr.on('data', collect);
}

function stopPreview() {
  if (serverStopped || server === null || server.pid === undefined) return;
  serverStopped = true;
  if (!serverRunning()) return;
  if (IS_WINDOWS) {
    // shell:true starts cmd.exe, which starts node/vite: kill the whole tree.
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      // Already gone.
    }
  }
}

process.on('exit', stopPreview);
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    stopPreview();
    process.exit(130);
  });
}

async function waitForPreview(timeoutMs = 30000) {
  const started = Date.now();
  // Wait for vite to print its own URL, so a different server already on the port is never audited.
  // Vite colours the URL (the port is bold), so strip ANSI escape sequences before matching.
  const announced = `${HOST}:${PORT}`;
  const plainLog = () => serverLog.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '');
  while (Date.now() - started < timeoutMs) {
    if (!serverRunning()) {
      throw new Error(`vite preview exited early (port ${PORT} busy?):\n${plainLog().trim()}`);
    }
    if (plainLog().includes(announced)) {
      try {
        const response = await fetch(BASE_URL);
        if (response.ok) return;
      } catch {
        // Not accepting connections yet.
      }
    }
    await sleep(250);
  }
  throw new Error(`vite preview did not answer on ${BASE_URL} within ${timeoutMs / 1000}s:\n${plainLog().trim()}`);
}

/* ------------------------------------------------------------------ */
/* Browser                                                             */
/* ------------------------------------------------------------------ */

// BROWSER_PATH if set, otherwise every existing default browser in preference order.
function browserCandidates() {
  const fromEnv = process.env.BROWSER_PATH;
  if (fromEnv) {
    if (fs.existsSync(fromEnv)) return [fromEnv];
    throw new Error(`BROWSER_PATH does not exist: ${fromEnv}`);
  }
  const found = BROWSER_CANDIDATES.filter((candidate) => fs.existsSync(candidate));
  if (found.length === 0) {
    throw new Error(`No browser found. Set BROWSER_PATH. Tried: ${BROWSER_CANDIDATES.join(', ')}`);
  }
  return found;
}

// Launches the first candidate that starts. Falls through to the next one because headless Edge
// can exit at once on some machines while Chrome works.
async function launchBrowser() {
  const failures = [];
  for (const executablePath of browserCandidates()) {
    try {
      const browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--hide-scrollbars', '--no-first-run', '--no-default-browser-check'],
      });
      console.log(`> browser: ${executablePath}`);
      return browser;
    } catch (error) {
      const reason = String(error?.message ?? error).split('\n')[0];
      failures.push(`${executablePath}: ${reason}`);
      console.log(`> could not launch ${executablePath} (${reason})`);
    }
  }
  throw new Error(`No browser could be launched. ${failures.join('; ')}`);
}

// Scrolls down in half-viewport steps so every whileInView entrance fires, then to the very bottom.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.5));
    let y = 0;
    // Re-read the height every step: the page can grow as sections mount.
    while (y < document.documentElement.scrollHeight - window.innerHeight) {
      y += step;
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      await wait(140);
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'instant' });
    await wait(200);
  });
}

async function collectDom(page) {
  return page.evaluate(() => ({
    badgeCount: document.querySelectorAll('[data-status-badge]').length,
    h1s: Array.from(document.querySelectorAll('h1')).map((h) => (h.textContent ?? '').trim().slice(0, 60)),
    newTabLinks: Array.from(document.querySelectorAll('a[target="_blank"]')).map((a) => ({
      href: a.getAttribute('href') ?? '',
      rel: a.getAttribute('rel') ?? '',
    })),
  }));
}

async function collectOverflow(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    if (scrollWidth <= viewportWidth) return { viewportWidth, scrollWidth, offenders: [] };

    // An ancestor (other than html/body) that clips or scrolls on x contains its children.
    const contained = (el) => {
      for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') return true;
      }
      return false;
    };
    const describe = (el) => {
      const id = el.id ? `#${el.id}` : '';
      const classes = typeof el.className === 'string' && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 4).join('.')}`
        : '';
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return `${el.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ''}`;
    };

    const overflowing = new Set();
    for (const el of document.body.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > viewportWidth + 0.5 && !contained(el)) overflowing.add(el);
    }
    // Report only the outermost offenders.
    const offenders = Array.from(overflowing)
      .filter((el) => !overflowing.has(el.parentElement))
      .slice(0, 15)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return `${describe(el)} (right ${Math.round(rect.right)}px, width ${Math.round(rect.width)}px)`;
      });
    return { viewportWidth, scrollWidth, offenders };
  });
}

/* ------------------------------------------------------------------ */
/* dist/ scanning                                                      */
/* ------------------------------------------------------------------ */

function listFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}

function emDashesInDist() {
  const hits = [];
  for (const file of listFiles(DIST)) {
    if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const text = fs.readFileSync(file, 'utf8');
    const first = text.indexOf(EM_DASH);
    if (first === -1) continue;
    const count = text.split(EM_DASH).length - 1;
    const context = text.slice(Math.max(0, first - 40), first + 40);
    hits.push(`${path.relative(ROOT, file)} (${count}x, e.g. "${clip(context, 80)}")`);
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/* Checks                                                              */
/* ------------------------------------------------------------------ */

function expectedContent(data) {
  const ai = data.ai_engineering ?? {};
  const servers = ai.mcp_servers_built ?? [];
  return [
    ['project title', (data.projects ?? []).map((p) => p.title)],
    ['open_source_repos name', (data.open_source_repos ?? []).map((r) => r.name)],
    ['employment bullet', (data.employment ?? []).flatMap((job) => job.responsibilities_and_achievements ?? [])],
    ['skill', Object.values(data.skills ?? {}).flat()],
    ['currently_learning', data.currently_learning ?? []],
    ['claude_code_plugins name', (ai.claude_code_plugins ?? []).map((p) => p.name)],
    ['agent_skills name', (ai.agent_skills ?? []).map((s) => s.name)],
    ['mcp_servers_built name', servers.map((s) => s.name)],
    ['mcp tool_name', servers.flatMap((s) => s.tool_names ?? [])],
    ['mcp_integrations name', (ai.mcp_integrations ?? []).map((i) => i.name)],
    ['multi_agent_workflows example', ai.multi_agent_workflows?.examples ?? []],
    ['local_llm.model', ai.local_llm?.model ? [ai.local_llm.model] : []],
    ['education degree', (data.education ?? []).map((e) => e.degree)],
    ['language', data.personal?.languages ?? []],
  ];
}

function checkContent(data, has) {
  const missing = [];
  let total = 0;
  for (const [group, items] of expectedContent(data)) {
    for (const item of items) {
      if (typeof item !== 'string' || item.trim() === '') continue;
      total += 1;
      if (!has(item)) missing.push(`[${group}] ${clip(item)}`);
    }
  }
  record(
    'a-content-coverage',
    missing.length === 0,
    `${missing.length} of ${total} strings missing from innerText at ${CONTENT_WIDTH}px:\n    - ${missing.join('\n    - ')}`,
  );
}

function checkBadges(data, dom) {
  const needed = (data.projects ?? []).length + 1;
  record(
    'b-status-badges',
    dom.badgeCount >= needed,
    `${dom.badgeCount} [data-status-badge] elements, need at least ${needed} (projects + case study)`,
  );
}

function checkEmDashes(innerText) {
  const problems = [];
  const index = innerText.indexOf(EM_DASH);
  if (index !== -1) {
    const count = innerText.split(EM_DASH).length - 1;
    problems.push(`innerText has ${count}, e.g. "${clip(innerText.slice(Math.max(0, index - 40), index + 40), 80)}"`);
  }
  const distHits = emDashesInDist();
  if (distHits.length > 0) problems.push(`dist/: ${distHits.join('; ')}`);
  record('c-no-em-dash', problems.length === 0, problems.join(' | '));
}

function checkNewTabLinks(domByWidth) {
  const bad = [];
  for (const [width, dom] of domByWidth) {
    for (const link of dom.newTabLinks) {
      const rel = link.rel.toLowerCase().split(/\s+/);
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
        bad.push(`[${width}] ${link.href} (rel="${link.rel}")`);
      }
    }
  }
  const unique = [...new Set(bad)];
  record('d-new-tab-rel', unique.length === 0, `target=_blank without rel noopener noreferrer: ${unique.join(', ')}`);
}

function checkRetired(has) {
  const found = RETIRED_STRINGS.filter((text) => has(text));
  record('e-retired-strings', found.length === 0, `retired strings rendered: ${found.map((t) => `"${t}"`).join(', ')}`);
}

function checkNoticePeriod(data, has) {
  const identity = data.professional_identity ?? {};
  const notice = typeof identity.notice_period === 'string' ? identity.notice_period.trim() : '';
  const shouldShow = identity.show_notice_period === true;
  if (!notice) {
    record('f-notice-period', !shouldShow, 'show_notice_period is true but notice_period is empty in the JSON');
    return;
  }
  const shown = has(notice);
  record(
    'f-notice-period',
    shown === shouldShow,
    shouldShow
      ? `show_notice_period is true but "${notice}" is not rendered`
      : `show_notice_period is not true but "${notice}" is rendered`,
  );
}

async function checkResumePdfs() {
  const problems = [];
  for (const pdf of RESUME_PDFS) {
    try {
      const response = await fetch(new URL(pdf, BASE_URL));
      const type = response.headers.get('content-type') ?? '';
      const bytes = new Uint8Array(await response.arrayBuffer());
      const magic = String.fromCharCode(...bytes.slice(0, 4));
      if (response.status !== 200) problems.push(`${pdf}: HTTP ${response.status}`);
      else if (!type.toLowerCase().startsWith('application/pdf')) problems.push(`${pdf}: content-type "${type}"`);
      else if (magic !== '%PDF') problems.push(`${pdf}: body is not a PDF`);
    } catch (error) {
      problems.push(`${pdf}: ${error.message}`);
    }
  }
  record('g-resume-pdfs', problems.length === 0, problems.join('; '));
}

function checkSingleH1(domByWidth) {
  const problems = [];
  for (const [width, dom] of domByWidth) {
    if (dom.h1s.length !== 1) {
      problems.push(`[${width}] ${dom.h1s.length} h1 elements${dom.h1s.length ? `: ${dom.h1s.map((t) => `"${t}"`).join(', ')}` : ''}`);
    }
  }
  record('h-single-h1', problems.length === 0, problems.join('; '));
}

function checkStaticSeo(data) {
  const file = path.join(DIST, 'index.html');
  if (!fs.existsSync(file)) {
    record('i-static-seo', false, 'dist/index.html not found');
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const problems = [];

  const expectedTitle = pageTitle(data.personal.name, data.professional_identity.headline);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
  if (title !== expectedTitle) problems.push(`title is ${title === null ? 'missing' : `"${title}"`}, expected "${expectedTitle}"`);

  const expectedDescription = metaDescriptionFrom(data.professional_identity.summary);
  const descriptionMatch =
    html.match(/<meta\s+name=["']description["']\s+content="([^"]*)"/i) ??
    html.match(/<meta\s+content="([^"]*)"\s+name=["']description["']/i);
  const description = descriptionMatch ? decodeEntities(descriptionMatch[1]) : null;
  if (description !== expectedDescription) {
    problems.push(`meta description is ${description === null ? 'missing' : `"${clip(description, 200)}"`}, expected "${expectedDescription}"`);
  }

  const ldMatch = html.match(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/i);
  if (!ldMatch) {
    problems.push('no JSON-LD script');
  } else {
    try {
      const ld = JSON.parse(ldMatch[1]);
      if (ld['@type'] !== 'Person') problems.push(`JSON-LD @type is "${ld['@type']}", expected "Person"`);
      if (ld.name !== data.personal.name) problems.push(`JSON-LD name is "${ld.name}"`);
    } catch (error) {
      problems.push(`JSON-LD does not parse: ${error.message}`);
    }
  }
  record('i-static-seo', problems.length === 0, problems.join('; '));
}

function checkHorizontalScroll(overflow) {
  if (!overflow) {
    record('j-no-horizontal-scroll-375', false, `no measurement at ${MOBILE_WIDTH}px`);
    return;
  }
  const { viewportWidth, scrollWidth, offenders } = overflow;
  record(
    'j-no-horizontal-scroll-375',
    scrollWidth <= viewportWidth,
    `scrollWidth ${scrollWidth}px > innerWidth ${viewportWidth}px. Overflowing elements:\n    - ${
      offenders.length ? offenders.join('\n    - ') : '(none found outside clipping containers)'
    }`,
  );
}

function checkConsole(consoleErrors) {
  const unique = [...new Set(consoleErrors)];
  record('k-no-console-errors', unique.length === 0, `${unique.length} error(s):\n    - ${unique.join('\n    - ')}`);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  if (!SKIP_BUILD) {
    console.log('> npm run build');
    const code = await runCommand('npm run build');
    record('build', code === 0, `npm run build exited with code ${code}`);
    if (code !== 0) return;
  } else if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    record('build', false, '--no-build given but dist/index.html does not exist');
    return;
  }

  console.log(`> vite preview on ${BASE_URL}`);
  startPreview();
  try {
    await waitForPreview();
  } catch (error) {
    record('preview-server', false, error.message);
    // The static SEO check reads dist/ only, so it can still run.
    checkStaticSeo(data);
    return;
  }

  fs.mkdirSync(SCREEN_DIR, { recursive: true });
  const browser = await launchBrowser();

  const consoleErrors = [];
  const domByWidth = new Map();
  let innerText = '';
  let overflow = null;

  try {
    for (const width of VIEWPORT_WIDTHS) {
      const page = await browser.newPage();
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const where = message.location()?.url ? ` (${message.location().url})` : '';
        consoleErrors.push(`[${width}] ${message.text()}${where}`);
      });
      page.on('pageerror', (error) => {
        consoleErrors.push(`[${width}] page error: ${error?.message ?? String(error)}`);
      });

      await page.setViewport({ width, height: VIEWPORT_HEIGHT, deviceScaleFactor: 1 });
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
      await scrollThrough(page);
      await sleep(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await sleep(300);

      const screenshot = path.join(SCREEN_DIR, `${width}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      console.log(`> screenshot ${path.relative(ROOT, screenshot)}`);
      // Chrome cannot paint one capture taller than about 16,384 px and repeats the top of the page
      // past that, so also save every section on its own: <width>-<nn>-<id>.png.
      const sections = await page.$$('main > section, main > div > section, body footer');
      for (const [i, handle] of sections.entries()) {
        const id = (await handle.evaluate((el) => el.id || el.tagName.toLowerCase())) || `part${i}`;
        const box = await handle.boundingBox();
        if (!box || box.height < 2) continue;
        await handle.screenshot({ path: path.join(SCREEN_DIR, `${width}-${String(i).padStart(2, '0')}-${id}.png`) });
      }

      domByWidth.set(width, await collectDom(page));
      if (width === CONTENT_WIDTH) {
        // Content inside a closed <details> is in the DOM but missing from innerText, so open every
        // disclosure first (after the screenshot, which should show the page as a visitor sees it).
        innerText = await page.evaluate(async () => {
          document.querySelectorAll('details').forEach((d) => { d.open = true; });
          await new Promise((resolve) => setTimeout(resolve, 300));
          return document.body.innerText;
        });
      }
      if (width === MOBILE_WIDTH) overflow = await collectOverflow(page);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const has = makeMatcher(innerText);
  checkContent(data, has);
  checkBadges(data, domByWidth.get(CONTENT_WIDTH));
  checkEmDashes(innerText);
  checkNewTabLinks(domByWidth);
  checkRetired(has);
  checkNoticePeriod(data, has);
  await checkResumePdfs();
  checkSingleH1(domByWidth);
  checkStaticSeo(data);
  checkHorizontalScroll(overflow);
  checkConsole(consoleErrors);
}

let exitCode = 0;
try {
  await main();
} catch (error) {
  record('audit-run', false, error?.stack ?? String(error));
} finally {
  stopPreview();
  const failed = results.filter((result) => !result.ok);
  console.log(`\n${results.length} checks: ${results.length - failed.length} ok, ${failed.length} failed`);
  exitCode = failed.length > 0 ? 1 : 0;
}
process.exit(exitCode);
