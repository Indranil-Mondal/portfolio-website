import { motion } from 'framer-motion';
import { Github, ArrowUpRight, Scale } from 'lucide-react';
import data from '../data/indranil_mondal_master.json';

const { open_source_repos, github_profile } = data;

export default function OpenSource() {
  return (
    <section id="open-source" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16 md:mb-20 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6"
          >
            Open Source · {open_source_repos.length} Repos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight"
            style={{ color: '#E1E0CC' }}
          >
            Plugins shipped to{' '}
            <span className="italic font-serif">the community.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-400 mt-5 sm:mt-6 max-w-2xl"
          >
            {github_profile.bio}
          </motion.p>
        </div>

        {/* Repo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {open_source_repos.map((repo, i) => (
            <motion.a
              key={repo.name}
              href={repo.github_url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              data-cursor-label="GitHub →"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-primary/30 rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                  <Github className="w-4 h-4 text-primary" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <h3
                className="text-base sm:text-lg font-medium leading-tight mb-2 break-words"
                style={{ color: '#E1E0CC' }}
              >
                {repo.name}
              </h3>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-5 flex-1">
                {repo.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {repo.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-[#2a2a2a] text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 pt-3 border-t border-[#1a1a1a]">
                <span className="font-mono">{repo.language.split(' ')[0]}</span>
                {repo.license && (
                  <span className="flex items-center gap-1">
                    <Scale className="w-3 h-3" /> {repo.license}
                  </span>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA to full profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <a
            href={github_profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(225, 224, 204, 0.7)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.7)')}
          >
            View all {github_profile.total_public_repos} repos on GitHub
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
