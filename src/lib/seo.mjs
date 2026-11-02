// Pure SEO helpers with no imports. One implementation shared by src/lib/data.ts (browser),
// the static SEO plugin in vite.config.ts (build and dev) and scripts/audit-site.mjs (Node),
// so the page title and meta description are computed the same way everywhere.
// Types live in seo.d.mts next to this file.

// Public URL of the deployed portfolio on Vercel, used for the canonical link, og:url and the
// JSON-LD url. Defined once, here: the master JSON has no field for the site's own address.
// Note: portfolio-lake-eight.vercel.app (without the suffix) belongs to someone else.
export const SITE_URL = 'https://portfolio-lake-eight-jllbdy9lgz.vercel.app/';

export const META_DESCRIPTION_MAX = 155;

// Characters that should never dangle at the end of a cut description.
const TRAILING_FRAGMENT = /[\s,;:(\[{/&·–-]+$/u;
// Short connector words that read as a fragment when they end a cut description.
const DANGLING_WORD =
  /\s+(?:and|or|but|to|from|of|with|the|a|an|in|on|for|at|by|as|across|into|via|through|while)$/i;

/** `<name> | <headline>`: the document title. */
export function pageTitle(name, headline) {
  return `${String(name).trim()} | ${String(headline).trim()}`;
}

/**
 * The first `max` characters of `text`, cut at a word boundary, with trailing punctuation
 * fragments and dangling connector words removed. A complete sentence end ('.') is kept.
 */
export function metaDescriptionFrom(text, max = META_DESCRIPTION_MAX) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  // Look one character past the limit: if that character is a space, the word at the limit is whole.
  const window = clean.slice(0, max + 1);
  const lastSpace = window.lastIndexOf(' ');
  let out = lastSpace > 0 ? window.slice(0, lastSpace) : clean.slice(0, max);

  let previous;
  do {
    previous = out;
    out = out.replace(TRAILING_FRAGMENT, '').replace(DANGLING_WORD, '');
  } while (out !== previous);

  return out;
}
