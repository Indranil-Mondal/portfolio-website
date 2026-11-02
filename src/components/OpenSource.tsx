import { motion } from 'framer-motion';
import { ArrowUpRight, Github, Scale } from 'lucide-react';
import { SECTION_IDS, github_profile, open_source_repos } from '../lib/data';
import { fadeUp } from '../lib/motion';
import ExternalLink from './ui/ExternalLink';
import SectionHeader from './ui/SectionHeader';

const HEADING_ID = `${SECTION_IDS.openSource}-heading`;
const MAX_TAGS = 4;

// GitHub's linguist colours, keyed on the first word of repo.language.
const LANGUAGE_COLORS: Record<string, string> = {
  PHP: '#4F5D95',
  JavaScript: '#F1E05A',
  Python: '#3572A5',
  TypeScript: '#3178C6',
};
const FALLBACK_LANGUAGE_COLOR = '#9CA3AF';

function languageColor(language: string): string {
  const firstWord = language.trim().split(/\s+/)[0] ?? '';
  return LANGUAGE_COLORS[firstWord] ?? FALLBACK_LANGUAGE_COLOR;
}

export default function OpenSource() {
  return (
    <section
      id={SECTION_IDS.openSource}
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          id={HEADING_ID}
          eyebrow={`Open Source · ${open_source_repos.length} Repos`}
          title="Tools and plugins,"
          accent="built in the open."
          description={github_profile.bio}
        />

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {open_source_repos.map((repo, i) => (
            <motion.li
              key={repo.github_url}
              {...fadeUp({ delay: (i % 3) * 0.08, margin: '-80px 0px -80px 0px' })}
              className="min-w-0"
            >
              <ExternalLink
                href={repo.github_url}
                data-cursor="view"
                data-cursor-label="GitHub"
                className="group flex h-full flex-col rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] p-5 sm:p-6 md:p-7 transition-colors duration-300 hover:border-[#2a2a2a] hover:bg-[#141414]"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                    <Github aria-hidden="true" className="w-4 h-4 text-primary" />
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="w-4 h-4 text-gray-400 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>

                <h3 className="font-mono text-sm sm:text-base font-medium leading-snug mb-2 text-[#E1E0CC] break-words [overflow-wrap:anywhere]">
                  {repo.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-5 flex-1">
                  {repo.description}
                </p>

                {repo.tags.length > 0 ? (
                  <ul aria-label="Tags" className="flex flex-wrap gap-1.5 mb-4">
                    {repo.tags.slice(0, MAX_TAGS).map((tag) => (
                      <li
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-[#2a2a2a] text-gray-400"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-400 pt-3 border-t border-[#1a1a1a]">
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: languageColor(repo.language) }}
                    />
                    <span className="sr-only">Language: </span>
                    {repo.language}
                  </span>
                  {repo.license ? (
                    <span className="inline-flex items-center gap-1">
                      <Scale aria-hidden="true" className="w-3 h-3" />
                      <span className="sr-only">License: </span>
                      {repo.license}
                    </span>
                  ) : null}
                </div>
              </ExternalLink>
            </motion.li>
          ))}
        </ul>

        <motion.div {...fadeUp({ y: 10 })} className="text-center mt-12 sm:mt-16">
          <ExternalLink
            href={github_profile.url}
            className="group inline-flex items-center gap-2 text-sm text-[#E1E0CC]/70 hover:text-[#E1E0CC] transition-colors duration-200"
          >
            View all {github_profile.total_public_repos} repos on GitHub
            <ArrowUpRight
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </ExternalLink>
        </motion.div>
      </div>
    </section>
  );
}
