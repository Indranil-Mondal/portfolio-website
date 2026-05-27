import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import data from '../data/indranil_mondal_master.json';

const { projects } = data;

export default function Projects() {
  const gridVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section id="work" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
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
            Selected Work · {projects.length} Projects
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight"
            style={{ color: '#E1E0CC' }}
          >
            Production platforms,{' '}
            <span className="italic font-serif">end-to-end ownership.</span>
          </motion.h2>
        </div>

        {/* Project grid — featured projects span 2 columns on desktop */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {projects.map((project) => (
            <motion.article
              key={project.id}
              variants={cardVariants}
              data-cursor="view"
              data-cursor-label="Case Study"
              className="group relative bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300 flex flex-col h-full"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-primary/70">
                    {project.type}
                  </span>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3" strokeWidth={2.5} />
                      Featured
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600 font-mono">
                  {String(project.id).padStart(2, '0')}
                </span>
              </div>

              {/* Title */}
              <h3
                className="text-lg sm:text-xl md:text-2xl font-medium leading-tight mb-2"
                style={{ color: '#E1E0CC' }}
              >
                {project.title}
              </h3>

              {/* Client */}
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Client: <span className="text-gray-400">{project.client}</span>
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-5">
                {project.description}
              </p>

              {/* Outcome */}
              <div className="border-l-2 border-primary/30 pl-3 sm:pl-4 mb-5 sm:mb-6">
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary/70 mb-1">
                  Outcome
                </p>
                <p className="text-xs sm:text-sm text-primary/90 leading-snug">
                  {project.outcome}
                </p>
              </div>

              {/* Stack chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full border border-[#2a2a2a] text-gray-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Footer links */}
              <div className="flex items-center gap-4 mt-auto pt-1">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/lnk inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors duration-200"
                    style={{ color: '#E1E0CC' }}
                  >
                    Live
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5" />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/lnk inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    GitHub
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/lnk:translate-x-0.5 group-hover/lnk:-translate-y-0.5" />
                  </a>
                )}
                {!project.live_url && !project.github_url && (
                  <span className="text-xs text-gray-600 italic">Internal · case study on request</span>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
