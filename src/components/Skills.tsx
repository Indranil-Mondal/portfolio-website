import { motion } from 'framer-motion';
import data from '../data/indranil_mondal_master.json';

const { skills, platforms_worked_on, industries_served, geography_of_clients } = data;

// Category display names — human-readable labels for the JSON keys
const CATEGORY_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  backend_and_architecture: 'Backend & Architecture',
  ecommerce_and_payments: 'eCommerce & Payments',
  frontend: 'Frontend',
  performance_and_seo: 'Performance & SEO',
  devops_and_infrastructure: 'DevOps & Infrastructure',
  ai_tools_and_workflow: 'AI Tools & Workflow',
  platforms_and_apis: 'Platforms & APIs',
  other_tools: 'Other Tools',
};

// Per SYSTEM_PROMPT: filter the AI tools list — last item is a description, not a tool name
const cleanCategoryItems = (key: string, items: string[]): string[] => {
  if (key === 'ai_tools_and_workflow') {
    return items.filter(
      (tool) => !tool.includes('expert-level') && !tool.includes('context engineering')
    );
  }
  return items;
};

export default function Skills() {
  const categories = Object.entries(skills) as [string, string[]][];

  return (
    <section id="skills" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
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
            The Stack
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight"
            style={{ color: '#E1E0CC' }}
          >
            Skills built across{' '}
            <span className="italic font-serif">production reality.</span>
          </motion.h2>
        </div>

        {/* Skill categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map(([key, list], i) => {
            const items = cleanCategoryItems(key, list);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.6,
                  delay: (i % 3) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-[#0e0e0e] hover:bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a] rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3
                    className="text-base sm:text-lg font-medium tracking-tight"
                    style={{ color: '#E1E0CC' }}
                  >
                    {CATEGORY_LABELS[key] || key}
                  </h3>
                  <span className="text-[10px] sm:text-xs text-gray-600 font-mono">
                    {String(items.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#2a2a2a] text-gray-400 hover:text-primary hover:border-primary/40 transition-colors duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Platforms + Industries + Geography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 md:p-7"
          >
            <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4">
              Platforms
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {platforms_worked_on.map((p) => (
                <span
                  key={p}
                  className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full bg-[#1a1a1a] text-gray-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 md:p-7"
          >
            <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4">
              Industries Served
            </p>
            <ul className="space-y-1.5">
              {industries_served.map((ind) => (
                <li key={ind} className="text-xs sm:text-sm text-gray-400 leading-snug">
                  · {ind}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5 sm:p-6 md:p-7"
          >
            <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4">
              Client Geography
            </p>
            <ul className="space-y-1.5">
              {geography_of_clients.map((country) => (
                <li key={country} className="text-xs sm:text-sm text-gray-400 leading-snug">
                  · {country}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
