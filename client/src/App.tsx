/**
 * Component: App
 * Responsibility: compose the page — nothing else.
 *
 * The section order is the conversion narrative of the original landing and is
 * kept exactly: hook (hero) → proof (stats) → offer (services) → how it works
 * (process) → evidence (portfolio, testimonials) → objections (FAQ) → ask
 * (contact).
 *
 * There is no router: the page is a single document navigated by anchors, so
 * adding one would ship a dependency to solve a problem the site does not have.
 */
import { Footer } from './components/layout/Footer.js';
import { Header } from './components/layout/Header.js';
import { SkipLink } from './components/layout/SkipLink.js';
import { WhatsAppFab } from './components/layout/WhatsAppFab.js';
import { Contact } from './components/sections/Contact.js';
import { Faq } from './components/sections/Faq.js';
import { Hero } from './components/sections/Hero.js';
import { Portfolio } from './components/sections/Portfolio.js';
import { Process } from './components/sections/Process.js';
import { Services } from './components/sections/Services.js';
import { Stats } from './components/sections/Stats.js';
import { Testimonials } from './components/sections/Testimonials.js';
import { Analytics } from "@vercel/analytics/next"

export function App() {
  return (
    <>
      {/* Must stay first: it has to be the first focusable element in the page. */}
      <SkipLink />
      <Analytics />


      <Header />

      {/*
        tabIndex={-1} makes <main> a valid focus target. Without it the skip link
        scrolls the page but leaves focus in the header, so the next Tab drops the
        user back into the navigation they just asked to skip.
      */}
      <main id="main" tabIndex={-1}>
        <Hero />
        <Stats />
        <Services />
        <Process />
        <Portfolio />
        <Testimonials />
        <Faq />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />
    </>
  );
}
