import { useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Metrics from './components/Metrics';
import Features from './components/Features';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Experience from './components/Experience';
import OpenSource from './components/OpenSource';
import Contact from './components/Contact';
import CustomCursor from './components/CustomCursor';
import data from './data/indranil_mondal_master.json';

export default function App() {
  const { personal, professional_identity } = data;

  // Dynamically set page title and meta description from JSON — never hardcoded
  useEffect(() => {
    document.title = `${personal.name} — ${professional_identity.title}`;

    const summarySnippet = professional_identity.summary.slice(0, 155);
    const metaDescription = `${professional_identity.years_experience} years, ${professional_identity.total_sites_delivered} production sites. ${summarySnippet}...`;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', metaDescription);
  }, [personal.name, professional_identity]);

  return (
    <main className="bg-black text-white">
      <CustomCursor />
      <Hero />
      <About />
      <Metrics />
      <Features />
      <Projects />
      <Skills />
      <Experience />
      <OpenSource />
      <Contact />
    </main>
  );
}
