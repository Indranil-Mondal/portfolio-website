import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Github, MapPin, ArrowRight } from 'lucide-react';
import data from '../data/indranil_mondal_master.json';

const { personal, professional_identity, contact_preferences } = data;

export default function Contact() {
  return (
    <section id="contact" className="bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] px-6 sm:px-10 md:px-16 py-16 sm:py-20 md:py-28 relative overflow-hidden">
          {/* Atmospheric mesh */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(ellipse at 80% 20%, rgba(120,90,55,0.30) 0%, transparent 60%),' +
                'radial-gradient(ellipse at 20% 90%, rgba(60,40,80,0.30) 0%, transparent 60%)',
            }}
          />
          <div className="absolute inset-0 noise-overlay opacity-[0.15] mix-blend-overlay pointer-events-none" />

          <div className="relative">
            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8 sm:mb-10"
            >
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs sm:text-sm text-primary">
                {professional_identity.current_status}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[0.95] tracking-tight max-w-3xl"
              style={{ color: '#E1E0CC' }}
            >
              Let's build something{' '}
              <span className="italic font-serif">production-grade.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-gray-400 mt-5 sm:mt-6 max-w-xl leading-relaxed"
            >
              Notice period: {professional_identity.notice_period}. Open to remote work.
              Willing to relocate to {professional_identity.willing_to_relocate.join(', ')}.
              Preferred contact: {contact_preferences.preferred_contact}.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 sm:mt-10"
            >
              <a
                href={`mailto:${contact_preferences.email}`}
                className="group inline-flex items-center justify-between gap-2 bg-primary rounded-full pl-5 sm:pl-6 pr-1.5 py-1.5 transition-all duration-300 hover:gap-3"
              >
                <span className="text-black font-medium text-sm sm:text-base">
                  Send me an email
                </span>
                <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: '#E1E0CC' }}
                  />
                </span>
              </a>
            </motion.div>

            {/* Contact grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-10 sm:mt-14">
              <ContactCard
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={contact_preferences.email}
                href={`mailto:${contact_preferences.email}`}
              />
              <ContactCard
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={contact_preferences.phone}
                href={`tel:${contact_preferences.phone.replace(/\s/g, '')}`}
              />
              <ContactCard
                icon={<Linkedin className="w-4 h-4" />}
                label="LinkedIn"
                value="indranil-mondal"
                href={contact_preferences.linkedin}
                external
              />
              <ContactCard
                icon={<Github className="w-4 h-4" />}
                label="GitHub"
                value="Indranil-Mondal"
                href={contact_preferences.github}
                external
              />
            </div>

            {/* Location + languages */}
            <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-3 sm:gap-8 text-xs sm:text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {personal.location}
              </span>
              <span>Languages: {personal.languages.join(' · ')}</span>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <footer className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600 px-2">
          <p>
            © {new Date().getFullYear()} {personal.name}. Built with React + Vite + Tailwind.
          </p>
          <p>{professional_identity.tagline}</p>
        </footer>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-3 sm:gap-4 bg-[#0c0c0c]/80 hover:bg-[#161616]/80 border border-[#1a1a1a] hover:border-primary/40 rounded-xl p-4 sm:p-5 transition-all duration-300 backdrop-blur-sm"
    >
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mb-0.5">
          {label}
        </p>
        <p
          className="text-xs sm:text-sm font-medium truncate"
          style={{ color: '#E1E0CC' }}
        >
          {value}
        </p>
      </div>
    </a>
  );
}
