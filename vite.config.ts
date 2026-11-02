import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
// SITE_URL (the deployed address) and the title and description logic are defined once in
// src/lib/seo.mjs and shared with src/lib/data.ts and scripts/audit-site.mjs.
import { SITE_URL, metaDescriptionFrom, pageTitle } from './src/lib/seo.mjs';

const DATA_FILE = path.resolve(__dirname, 'src/data/indranil_mondal_master.json');
// index.html carries this marker where the generated tags go.
const SEO_MARKER = '<!--seo-tags-->';

// The slice of the master JSON the SEO tags read.
interface SeoSource {
  personal: {
    name: string;
    email: string;
    location: string;
    linkedin: string;
    github: string;
  };
  professional_identity: {
    title: string;
    headline: string;
    current_employer: string;
    summary: string;
  };
  skills: Record<string, string[] | undefined>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Keeps JSON-LD from closing its <script> early.
function safeJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function personJsonLd(data: SeoSource) {
  const { personal, professional_identity: identity, skills } = data;
  // personal.location reads "City, Region, Country".
  const parts = personal.location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const address: Record<string, string> = { '@type': 'PostalAddress' };
  if (parts[0]) address.addressLocality = parts[0];
  if (parts.length > 2) address.addressRegion = parts[1];
  if (parts.length > 1) address.addressCountry = parts[parts.length - 1];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personal.name,
    jobTitle: identity.title,
    worksFor: { '@type': 'Organization', name: identity.current_employer },
    address,
    email: personal.email,
    url: SITE_URL,
    sameAs: [personal.linkedin, personal.github].filter(Boolean),
    knowsAbout: [
      ...(skills.ai_tools_and_workflow ?? []).slice(0, 8),
      ...(skills.wordpress ?? []).slice(0, 6),
    ],
  };
}

function seoTags(data: SeoSource): string {
  const title = escapeHtml(pageTitle(data.personal.name, data.professional_identity.headline));
  const description = escapeHtml(metaDescriptionFrom(data.professional_identity.summary));
  const url = escapeHtml(SITE_URL);
  const siteName = escapeHtml(data.personal.name);
  const jsonLd = safeJson(personJsonLd(data)).replace(/\n/g, '\n    ');

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="index,follow" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<script type="application/ld+json">\n    ${jsonLd}\n    </script>`,
  ].join('\n    ');
}

/**
 * Static SEO: reads the master JSON at build and dev time and writes the title, meta description,
 * Open Graph, Twitter card, canonical link and a JSON-LD Person into index.html, so crawlers and
 * link previews see them before any JavaScript runs.
 */
function staticSeo(): Plugin {
  return {
    name: 'portfolio-static-seo',
    transformIndexHtml(html) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as SeoSource;
      const tags = seoTags(data);
      return html.includes(SEO_MARKER)
        ? html.replace(SEO_MARKER, tags)
        : html.replace('</head>', `    ${tags}\n  </head>`);
    },
  };
}

export default defineConfig({
  plugins: [react(), staticSeo()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
