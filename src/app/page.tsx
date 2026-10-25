import SiteNav from '@/components/site/SiteNav';
import Hero from '@/components/site/Hero';
import FeaturedCarousel from '@/components/site/FeaturedCarousel';
import WorkGallery from '@/components/site/WorkGallery';
import About from '@/components/site/About';
import Services from '@/components/site/Services';
import Process from '@/components/site/Process';
import Testimonials from '@/components/site/Testimonials';
import Contact from '@/components/site/Contact';
import SiteFooter from '@/components/site/SiteFooter';
import { getPublicPortfolio } from '@/services/portfolio';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const portfolio = await getPublicPortfolio();

  return (
    <>
      <SiteNav />
      <main>
        <Hero profile={portfolio.profile} featured={portfolio.featured} />
        <section id="work" className="section wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">A FEW THINGS I’VE CUT</div>
              <h2>Selected work<span className="accent">.</span></h2>
            </div>
            <p>A selection of edits shaped by rhythm, feeling, and the details that make a story yours.</p>
          </div>
          <FeaturedCarousel items={portfolio.featured} categories={portfolio.categories} />
          <div className="library-head">
            <div className="eyebrow">BROWSE THE FULL LIBRARY</div>
            <h3>Works & videos</h3>
          </div>
          <WorkGallery items={portfolio.projects} categories={portfolio.categories} />
        </section>
        <About profile={portfolio.profile} />
        <Services offerings={portfolio.offerings} />
        <Process steps={portfolio.profile.process} />
        <Testimonials items={portfolio.testimonials} />
        <Contact profile={portfolio.profile} />
      </main>
      <SiteFooter profile={portfolio.profile} />
    </>
  );
}
