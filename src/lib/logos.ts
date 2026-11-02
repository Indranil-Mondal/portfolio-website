/**
 * Brand marks for the tools in the JSON, from Simple Icons (CC0 SVG paths, npm "simple-icons").
 * A logo is shown only when its pattern matches a skill or platform that the JSON lists, so the
 * logo strip can never show a tool the owner does not claim. Tools without a Simple Icons mark
 * (e.g. OpenCart, ACF, Twig) simply have no logo.
 */
import {
  siAstro,
  siBootstrap,
  siClaude,
  siCloudflare,
  siCpanel,
  siCss,
  siCursor,
  siDocker,
  siElementor,
  siFigma,
  siGit,
  siGithub,
  siGnubash,
  siGoogleanalytics,
  siGooglegemini,
  siGooglesearchconsole,
  siGoogletagmanager,
  siGsap,
  siGutenberg,
  siHtml5,
  siHubspot,
  siJavascript,
  siJquery,
  siLighthouse,
  siLinux,
  siLmstudio,
  siMariadb,
  siModelcontextprotocol,
  siMysql,
  siNginx,
  siNodedotjs,
  siPaypal,
  siPhp,
  siPuppeteer,
  siPython,
  siQwen,
  siRazorpay,
  siReact,
  siShopify,
  siSquarespace,
  siStripe,
  siSwiper,
  siTailwindcss,
  siTypescript,
  siUbuntu,
  siWebflow,
  siWix,
  siWoocommerce,
  siWordpress,
  siZoho,
  type SimpleIcon,
} from 'simple-icons';
import { platforms_worked_on, skills } from './data';

export type Logo = Pick<SimpleIcon, 'title' | 'path' | 'slug'>;

/** Display order: WordPress and web first, then AI, cloud, commerce and marketing. */
const CANDIDATES: ReadonlyArray<{ icon: SimpleIcon; match: RegExp }> = [
  { icon: siWordpress, match: /^WordPress$/ },
  { icon: siElementor, match: /\bElementor\b/ },
  { icon: siWoocommerce, match: /\bWooCommerce\b/ },
  { icon: siGutenberg, match: /\bGutenberg\b/ },
  { icon: siPhp, match: /^PHP$/ },
  { icon: siJavascript, match: /\bJavaScript\b/ },
  { icon: siTypescript, match: /\bTypeScript\b/ },
  { icon: siReact, match: /\bReact\b/ },
  { icon: siAstro, match: /^Astro$/ },
  { icon: siTailwindcss, match: /\bTailwind CSS\b/ },
  { icon: siHtml5, match: /\bHTML5\b/ },
  { icon: siCss, match: /\bCSS3\b/ },
  { icon: siGsap, match: /\bGSAP\b/ },
  { icon: siJquery, match: /\bjQuery\b/ },
  { icon: siBootstrap, match: /\bBootstrap\b/ },
  { icon: siSwiper, match: /\bSwiper\b/ },
  { icon: siMysql, match: /\bMySQL\b/ },
  { icon: siMariadb, match: /\bMariaDB\b/ },
  { icon: siNodedotjs, match: /\bNode\.js\b/ },
  { icon: siPython, match: /\bPython\b/ },
  { icon: siGnubash, match: /^Bash$/ },
  { icon: siClaude, match: /\bClaude\b/ },
  { icon: siModelcontextprotocol, match: /\bModel Context Protocol\b/ },
  { icon: siCursor, match: /\bCursor\b/ },
  { icon: siGooglegemini, match: /\bGemini\b/ },
  { icon: siQwen, match: /\bQwen/ },
  { icon: siLmstudio, match: /\bLM Studio\b/ },
  { icon: siCloudflare, match: /\bCloudflare\b/ },
  { icon: siGit, match: /\bGit\b/ },
  { icon: siGithub, match: /\bGitHub\b/ },
  { icon: siNginx, match: /\bNGINX\b/ },
  { icon: siLinux, match: /\bLinux\b/ },
  { icon: siUbuntu, match: /\bUbuntu\b/ },
  { icon: siDocker, match: /\bDocker\b/ },
  { icon: siCpanel, match: /\bcPanel\b/ },
  { icon: siPuppeteer, match: /\bPuppeteer\b/ },
  { icon: siLighthouse, match: /\bLighthouse\b/ },
  { icon: siHubspot, match: /\bHubSpot\b/ },
  { icon: siGoogletagmanager, match: /\bGoogle Tag Manager\b/ },
  { icon: siGoogleanalytics, match: /\bGoogle Analytics\b/ },
  { icon: siGooglesearchconsole, match: /\bGoogle Search Console\b/ },
  { icon: siZoho, match: /\bZoho\b/ },
  { icon: siStripe, match: /^Stripe$/ },
  { icon: siPaypal, match: /^PayPal$/ },
  { icon: siRazorpay, match: /^Razorpay$/ },
  { icon: siWebflow, match: /\bWebflow\b/ },
  { icon: siShopify, match: /\bShopify\b/ },
  { icon: siWix, match: /^Wix$/ },
  { icon: siSquarespace, match: /^Squarespace$/ },
  { icon: siFigma, match: /\bFigma\b/ },
];

const CLAIMED: string[] = [...Object.values(skills).flat(), ...platforms_worked_on];

function toLogo(icon: SimpleIcon): Logo {
  return { title: icon.title, path: icon.path, slug: icon.slug };
}

/** Logos for every tool the JSON claims, in display order. */
export function stackLogos(): Logo[] {
  return CANDIDATES.filter(({ match }) => CLAIMED.some((item) => match.test(item))).map(({ icon }) => toLogo(icon));
}

/** The logo for one name from the JSON (a platform, say), or null when Simple Icons has none. */
export function logoFor(name: string): Logo | null {
  const hit = CANDIDATES.find(({ match }) => match.test(name));
  return hit ? toLogo(hit.icon) : null;
}
