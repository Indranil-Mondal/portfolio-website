import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, ChevronDown, GraduationCap, Sparkles } from 'lucide-react';
import {
  SECTION_IDS,
  education,
  employment,
  leadership_and_soft_skills,
  periodLabel,
  type Employment,
} from '../lib/data';
import { EASE_OUT, fadeUp } from '../lib/motion';
import SectionHeader from './ui/SectionHeader';

const HEADING_ID = `${SECTION_IDS.experience}-heading`;

/** Achievements shown before the "Show all" disclosure. */
const VISIBLE_ACHIEVEMENTS = 5;

const cardClass = 'bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl';
const eyebrowClass = 'text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]';

function AchievementItem({ text, index }: { text: string; index: number }) {
  return (
    <li className="flex gap-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
      <span aria-hidden="true" className="text-primary/70 mt-1 shrink-0 font-mono text-[10px]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span>{text}</span>
    </li>
  );
}

function JobCard({ job, index }: { job: Employment; index: number }) {
  const titleId = `job-${index}-title`;
  const achievements = job.responsibilities_and_achievements;
  const shown = achievements.slice(0, VISIBLE_ACHIEVEMENTS);
  const rest = achievements.slice(VISIBLE_ACHIEVEMENTS);

  return (
    <motion.article
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px 0px -100px 0px' }}
      transition={{ duration: 0.7, delay: Math.min(index, 3) * 0.1, ease: EASE_OUT }}
      className="relative md:pl-10"
    >
      {/* Timeline dot */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute left-0 top-12 w-4 h-4 rounded-full bg-primary border-4 border-black"
      />

      <div className={`${cardClass} p-6 sm:p-8 md:p-10`}>
        <p
          className={`${eyebrowClass} inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] px-3 py-1.5 mb-4`}
        >
          <Briefcase aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
          {periodLabel(job.period)}
        </p>
        <h3
          id={titleId}
          className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[#E1E0CC] break-words"
        >
          {job.company}
        </h3>
        <p className="text-sm sm:text-base text-[#E1E0CC]/85 mt-1">{job.role}</p>
        <p className="text-xs text-gray-400 mt-1">
          {job.location} · {job.employment_type}
        </p>

        <ul className="space-y-3 mt-6 sm:mt-8">
          {shown.map((bullet, i) => (
            <AchievementItem key={bullet} text={bullet} index={i} />
          ))}
        </ul>

        {rest.length > 0 ? (
          <details className="group/ach mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#2a2a2a] px-3.5 py-2 mt-2 text-xs sm:text-sm text-[#E1E0CC] hover:border-[#3a3a3a] hover:text-primary transition-colors duration-200 [&::-webkit-details-marker]:hidden">
              <span className="group-open/ach:hidden">Show all {achievements.length} achievements</span>
              <span className="hidden group-open/ach:inline">Show fewer achievements</span>
              <span className="sr-only">: {job.company}</span>
              <ChevronDown
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-200 group-open/ach:rotate-180"
              />
            </summary>
            <ul className="space-y-3 mt-5">
              {rest.map((bullet, i) => (
                <AchievementItem key={bullet} text={bullet} index={VISIBLE_ACHIEVEMENTS + i} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </motion.article>
  );
}

export default function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.7', 'end 0.3'],
  });
  const lineScaleY = useTransform(timelineProgress, [0, 1], [0, 1]);

  return (
    <section
      id={SECTION_IDS.experience}
      aria-labelledby={HEADING_ID}
      className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader id={HEADING_ID} eyebrow="Experience" title="The work behind" accent="the numbers." />

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Static track */}
          <div aria-hidden="true" className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-[#1a1a1a]" />
          {/* Progress line: draws downward while the section scrolls (static under reduced motion) */}
          <motion.div
            aria-hidden="true"
            className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/70 to-primary/30 origin-top"
            style={{ scaleY: reduceMotion ? 1 : lineScaleY }}
          />

          <div className="space-y-12 sm:space-y-16">
            {employment.map((job, i) => (
              <JobCard key={`${job.company}-${job.period.from}`} job={job} index={i} />
            ))}
          </div>
        </div>

        {/* Education + leadership */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-12 sm:mt-16">
          <motion.div {...fadeUp({ margin: '-80px 0px -80px 0px' })} className={`${cardClass} p-6 sm:p-8`}>
            <h3 className={`${eyebrowClass} mb-5 flex items-center gap-2`}>
              <GraduationCap aria-hidden="true" className="w-3.5 h-3.5" /> Education
            </h3>
            <ul className="space-y-5">
              {education.map((edu) => (
                <li key={`${edu.degree}-${edu.institution}`}>
                  <h4 className="text-base sm:text-lg font-medium text-[#E1E0CC]">{edu.degree}</h4>
                  <p className="text-sm text-gray-400 mt-1">{edu.institution}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {edu.type}
                    {edu.location ? ` · ${edu.location}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp({ margin: '-80px 0px -80px 0px', delay: 0.1 })} className={`${cardClass} p-6 sm:p-8`}>
            <h3 className={`${eyebrowClass} mb-5 flex items-center gap-2`}>
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5" /> Leadership &amp; Soft Skills
            </h3>
            <ul className="space-y-2.5">
              {leadership_and_soft_skills.map((skill) => (
                <li key={skill} className="text-xs sm:text-sm text-gray-400 leading-snug flex gap-2">
                  <span aria-hidden="true" className="text-primary/70">
                    →
                  </span>
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
