/** Public URL of the deployed portfolio (canonical, og:url, JSON-LD url). */
export declare const SITE_URL: string;
/** Maximum length of the meta description. */
export declare const META_DESCRIPTION_MAX: number;
/** `<name> | <headline>`: the document title. */
export declare function pageTitle(name: string, headline: string): string;
/** First `max` (default 155) characters of `text`, cut at a word boundary, no trailing fragments. */
export declare function metaDescriptionFrom(text: string, max?: number): string;
