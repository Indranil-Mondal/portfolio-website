import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import data from '../data/indranil_mondal_master.json';

const { employment, education, leadership_and_soft_skills } = data;

export default function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.7', 'end 0.3'],
  });
  const lineScaleY = useTransform(timelineProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
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
            Experience
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight"
            style={{ color: '#E1E0CC' }}
          >
            The work behind{' '}
            <span className="italic font-serif">the numbers.</span>
          </motion.h2>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Static background track */}
          <div className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-[#1a1a1a]" />
          {/* Animated progress line — draws downward as user scrolls through the section */}
          <motion.div
            className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/70 to-primary/30 origin-top"
            style={{ scaleY: lineScaleY }}
          />

          <div className="space-y-12 sm:space-y-16">
            {employment.map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="relative md:pl-10"
              >
                {/* Dot */}
                <div className="hidden md:block absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-4 border-black" />

                <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8 md:p-10">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-2">
                        <Briefcase className="inline w-3.5 h-3.5 mr-2 -mt-0.5" />
                        {job.period.from} — {job.period.to}
                      </p>
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight"
                        style={{ color: '#E1E0CC' }}
                      >
                        {job.company}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-400 mt-1">
                        {job.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {job.location} · {job.employment_type}
                      </p>
                    </div>
                  </div>

                  {/* All bullets, no truncation */}
                  <ul className="space-y-3 mt-6 sm:mt-8">
                    {job.responsibilities_and_achievements.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-xs sm:text-sm text-gray-400 leading-relaxed"
                      >
                        <span className="text-primary/60 mt-1 shrink-0 font-mono text-[10px]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education + Leadership row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-12 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8"
          >
            <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Education
            </p>
            <div className="space-y-5">
              {education.map((edu) => (
                <div key={edu.institution}>
                  <h4
                    className="text-base sm:text-lg font-medium"
                    style={{ color: '#E1E0CC' }}
                  >
                    {edu.degree}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{edu.institution}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {edu.type}
                    {'location' in edu && edu.location ? ` · ${edu.location}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8"
          >
            <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Leadership & Soft Skills
            </p>
            <ul className="space-y-2.5">
              {leadership_and_soft_skills.map((skill) => (
                <li
                  key={skill}
                  className="text-xs sm:text-sm text-gray-400 leading-snug flex gap-2"
                >
                  <span className="text-primary/60">→</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
