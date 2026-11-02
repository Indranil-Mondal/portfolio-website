// The one place the site reads its content from. Every human-readable string about Indranil comes
// from src/data/indranil_mondal_master.json, which is GENERATED from a private master by
// D:\resume\tools\sync.py: never edit the JSON by hand. Components import from this module only.
import rawData from '../data/indranil_mondal_master.json';
import { META_DESCRIPTION_MAX, SITE_URL, metaDescriptionFrom, pageTitle } from './seo.mjs';

/* ------------------------------------------------------------------ */
/* Raw data                                                            */
/* ------------------------------------------------------------------ */

export const data = rawData;

// `_meta` is build information and is never rendered, so it has no named export.
export const {
  personal,
  professional_identity,
  education,
  employment,
  skills,
  currently_learning,
  key_metrics,
  projects,
  open_source_repos,
  ai_engineering,
  leadership_and_soft_skills,
  github_profile,
  notable_technical_achievements,
  platforms_worked_on,
  industries_served,
  geography_of_clients,
  contact_preferences,
} = rawData;

/* ------------------------------------------------------------------ */
/* Types (inferred from the JSON, so they follow the generated file)   */
/* ------------------------------------------------------------------ */

export type SiteData = typeof rawData;
export type Personal = SiteData['personal'];
export type ProfessionalIdentity = SiteData['professional_identity'];
export type Education = SiteData['education'][number];
export type Employment = SiteData['employment'][number];
export type Period = Employment['period'];
export type KeyMetric = SiteData['key_metrics'][number];
export type Project = SiteData['projects'][number];
export type CaseStudy = NonNullable<Project['case_study']>;
export type CaseStudyProject = Project & { case_study: CaseStudy };
export type OpenSourceRepo = SiteData['open_source_repos'][number];
export type AiEngineering = SiteData['ai_engineering'];
export type ClaudeCodePlugin = AiEngineering['claude_code_plugins'][number];
export type AgentSkill = AiEngineering['agent_skills'][number];
export type McpServer = AiEngineering['mcp_servers_built'][number];
export type McpIntegration = AiEngineering['mcp_integrations'][number];
export type SkillKey = keyof SiteData['skills'];
export type CountableMetric = KeyMetric & { count_to: number };

export type StatusTone = 'success' | 'progress' | 'test' | 'rnd' | 'neutral';

export interface SkillGroup {
  key: string;
  label: string;
  items: string[];
}

export interface ProjectLink {
  /** 'site' = project.live_url, 'source' = project.github_url, 'reference' = an entry of project.references. */
  kind: 'site' | 'source' | 'reference';
  href: string;
}

export interface ResumeDownload {
  href: string;
  label: string;
  detail: string;
}

/* ------------------------------------------------------------------ */
/* UI constants (microcopy and paths, not content about Indranil)      */
/* ------------------------------------------------------------------ */

export { SITE_URL };

/** Section ids, used as nav anchors and as the `id` of each <section>. */
export const SECTION_IDS = {
  about: 'about',
  caseStudy: 'case-study',
  aiLab: 'ai-lab',
  work: 'work',
  experience: 'experience',
  skills: 'skills',
  openSource: 'open-source',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/** Navigation items in page order. Labels are UI copy. */
export const NAV_ITEMS: ReadonlyArray<{ id: SectionId; label: string; href: string }> = [
  { id: SECTION_IDS.about, label: 'About', href: `#${SECTION_IDS.about}` },
  { id: SECTION_IDS.caseStudy, label: 'Case Study', href: `#${SECTION_IDS.caseStudy}` },
  { id: SECTION_IDS.aiLab, label: 'AI Lab', href: `#${SECTION_IDS.aiLab}` },
  { id: SECTION_IDS.work, label: 'Work', href: `#${SECTION_IDS.work}` },
  { id: SECTION_IDS.experience, label: 'Experience', href: `#${SECTION_IDS.experience}` },
  { id: SECTION_IDS.skills, label: 'Skills', href: `#${SECTION_IDS.skills}` },
  { id: SECTION_IDS.openSource, label: 'Open Source', href: `#${SECTION_IDS.openSource}` },
  { id: SECTION_IDS.contact, label: 'Contact', href: `#${SECTION_IDS.contact}` },
];

/** The two resume PDFs served from public/resume (generated files: never edit them). */
export const RESUME_DOWNLOADS: ReadonlyArray<ResumeDownload> = [
  { href: '/resume/Indranil_Mondal_Resume.pdf', label: 'Resume', detail: '2 pages · PDF' },
  { href: '/resume/Indranil_Mondal_Master_Resume.pdf', label: 'Full resume', detail: '3 pages · PDF' },
];

/** Spread onto any <a> that opens a new tab (pair it with the sr-only "(opens in a new tab)" note). */
export const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Screen-reader note appended to every link that opens a new tab. */
export const NEW_TAB_NOTE = '(opens in a new tab)';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Visual tone for a project or tool status. The less-claiming tone wins when a status could match
 * several (test mode and R&D are checked before success), so nothing reads as live by accident.
 */
export function statusTone(status: string): StatusTone {
  const s = status.trim();
  if (/test mode/i.test(s)) return 'test';
  if (/\bR&D\b/i.test(s)) return 'rnd';
  if (/pre-?launch|working on staging|staging|built \(local\)/i.test(s)) return 'progress';
  if (/\blive\b|\bdelivered\b|\bin use\b|\bin daily use\b/i.test(s)) return 'success';
  return 'neutral';
}

/** Type guard: the project carries a case study. */
export function hasCaseStudy(project: Project): project is CaseStudyProject {
  return project.case_study != null;
}

/** The first project with a case_study, or undefined if the JSON has none (render nothing then). */
export function caseStudyProject(): CaseStudyProject | undefined {
  return projects.find(hasCaseStudy);
}

/** key_metrics entries marked featured, in JSON order. */
export function featuredMetrics(): KeyMetric[] {
  return key_metrics.filter((metric) => metric.featured);
}

/** True when the metric may be animated (count_to is a number). Otherwise render metric.value as is. */
export function isCountable(metric: KeyMetric): metric is CountableMetric {
  return typeof metric.count_to === 'number' && Number.isFinite(metric.count_to);
}

/** Filter tabs for the work grid: 'All' followed by each project.type in first-seen order. */
export function projectTypes(): string[] {
  const seen: string[] = [];
  for (const project of projects) {
    if (!seen.includes(project.type)) seen.push(project.type);
  }
  return ['All', ...seen];
}

/** Projects for a filter tab ('All' returns every project). */
export function filterProjects(type: string): Project[] {
  return type === 'All' ? projects : projects.filter((project) => project.type === type);
}

/** Non-null links of a project, in the order site, source, references. */
export function projectLinks(project: Project): ProjectLink[] {
  const links: ProjectLink[] = [];
  if (project.live_url) links.push({ kind: 'site', href: project.live_url });
  if (project.github_url) links.push({ kind: 'source', href: project.github_url });
  for (const href of project.references ?? []) {
    if (href) links.push({ kind: 'reference', href });
  }
  return links;
}

const SKILL_GROUP_ORDER: ReadonlyArray<readonly [string, string]> = [
  ['ai_tools_and_workflow', 'AI Engineering'],
  ['local_llm_and_fine_tuning', 'Local LLMs & Fine-Tuning'],
  ['wordpress', 'WordPress'],
  ['frontend', 'Frontend'],
  ['backend_and_architecture', 'Backend & Architecture'],
  ['testing_and_quality', 'Testing & Quality'],
  ['devops_and_infrastructure', 'Cloud & DevOps'],
  ['marketing_automation_and_crm', 'Marketing Tech & CRM'],
  ['ecommerce_and_payments', 'eCommerce & Payments'],
  ['performance_and_seo', 'Performance & SEO'],
  ['platforms_and_apis', 'Platforms & APIs'],
  ['other_tools', 'Other Tools'],
];

/** 'foo_and_bar' to 'Foo & Bar'. */
export function humanizeKey(key: string): string {
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => (word === 'and' ? '&' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

/**
 * Every skills category with its full item list: the known keys in the fixed order above, then any
 * other key the JSON gains later, labelled by humanizeKey. Categories missing from the JSON are skipped.
 */
export function skillGroups(): SkillGroup[] {
  const all = skills as Record<string, string[]>;
  const known = new Set(SKILL_GROUP_ORDER.map(([key]) => key));
  const ordered: SkillGroup[] = SKILL_GROUP_ORDER.filter(([key]) => Array.isArray(all[key])).map(
    ([key, label]) => ({ key, label, items: all[key] }),
  );
  const extra: SkillGroup[] = Object.keys(all)
    .filter((key) => !known.has(key) && Array.isArray(all[key]))
    .map((key) => ({ key, label: humanizeKey(key), items: all[key] }));
  return [...ordered, ...extra];
}

/** Last non-empty path segment of a URL, e.g. a LinkedIn or GitHub handle. */
export function handleFromUrl(url: string): string {
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    // Not an absolute URL: use the string itself.
  }
  const segments = path.split('/').filter((segment) => segment.trim() !== '');
  return segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : url;
}

/** Initials of a name: first letter of the first and last word ('Indranil Mondal' gives 'IM'). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/** Document title: personal.name + ' | ' + professional_identity.headline. */
export function siteTitle(): string {
  return pageTitle(personal.name, professional_identity.headline);
}

/** First 155 characters of professional_identity.summary, cut at a word boundary. */
export function metaDescription(): string {
  return metaDescriptionFrom(professional_identity.summary, META_DESCRIPTION_MAX);
}

/** The notice period, or null when professional_identity.show_notice_period is not true. */
export function noticePeriod(): string | null {
  return professional_identity.show_notice_period === true ? professional_identity.notice_period : null;
}

/** professional_identity.availability (e.g. relocation and remote), as stored. */
export function availability(): string[] {
  return professional_identity.availability;
}

/** A period range for display: 'from – to' with an en dash. */
export function periodLabel(period: { from: string; to: string }): string {
  return `${period.from} \u2013 ${period.to}`;
}

/** True for absolute http(s) URLs, which should open in a new tab. */
export function isExternalUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

/** Hostname without 'www.', for showing a link's destination ('https://www.identos.com/' gives 'identos.com'). */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

/** mailto: href for an email address. */
export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}

/** tel: href for a phone number, keeping only digits and a leading '+' ('+91 7003812278' gives 'tel:+917003812278'). */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}
