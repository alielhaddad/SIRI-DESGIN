'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; category?: string; location?: string; image_url?: string; description?: string };
type Client = { id: string; name: string; logo_url?: string; note?: string };
type Settings = { phone?: string; whatsapp?: string; email?: string; address?: string; facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; about?: string };

const defaults: Settings = {
  address: 'Cairo, Egypt',
  about: 'We turn your ideas into balanced spaces where beauty, comfort, and function come together. From understanding your needs and shaping the concept to selecting materials and overseeing execution, every detail matters.',
};

const heroImage = '/projects/dnp-storefront.webp';
const services = [
  { no: '01', title: 'Complete Fit-Out', desc: 'End-to-end execution with clear stages, carefully selected materials, and quality you can see in every detail.', image: '/projects/fitout-display-wide.webp', tag: 'FINISHING' },
  { no: '02', title: 'Interior Design', desc: 'Thoughtful space planning, colors, and furnishings that reflect your personality and support your lifestyle.', image: '/projects/dnp-interior.webp', tag: 'INTERIOR DESIGN' },
  { no: '03', title: 'Decor & Lighting', desc: 'Considered visual details and lighting that give every space its own character and atmosphere.', image: '/projects/alura-arches.webp', tag: 'DECOR & LIGHTING' },
  { no: '04', title: 'Renovation & Upgrades', desc: 'We give existing spaces a fresh start through smarter layouts and more refined, comfortable results.', image: '/projects/site-counter-finish.webp', tag: 'RENOVATION' },
];


export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioLoadError, setPortfolioLoadError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('.sd-nav');
    const updateNav = () => nav?.classList.toggle('sd-scrolled', window.scrollY > 24);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    return () => window.removeEventListener('scroll', updateNav);
  }, []);

  // Re-observe reveal elements whenever Supabase adds project/client cards.
  // Without this effect, dynamically-loaded cards keep opacity: 0 forever.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.sd-reveal:not(.sd-visible)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('sd-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('sd-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [projects, clients]);

  useEffect(() => {
    if (!supabase) {
      setPortfolioLoadError('The website is not connected to its database. Check the Supabase environment variables in Vercel.');
      return;
    }
    let alive = true;
    (async () => {
      const [p, c, s] = await Promise.all([
        supabase.from('projects').select('id,title,category,location,image_url,description').eq('published', true).order('created_at', { ascending: false }).limit(50),
        supabase.from('clients').select('id,name,logo_url,note').eq('active', true).order('created_at', { ascending: false }).limit(12),
        supabase.from('site_settings').select('value').eq('id', 'main').maybeSingle(),
      ]);
      if (!alive) return;
      if (p.error) {
        console.error('Siri Designs portfolio query failed:', p.error);
        setProjects([]);
        setPortfolioLoadError('Projects could not be loaded. Check public read access and make sure at least one project is published.');
      } else {
        setPortfolioLoadError('');
        setProjects((p.data || []) as Project[]);
      }
      if (c.data) setClients(c.data as Client[]);
      if (s.data?.value) setSettings({ ...defaults, ...s.data.value });
    })();
    return () => { alive = false; };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setBusy(true); setError(''); setSent(false);
    if (!supabase) { setError('The inquiry form is currently unavailable. Please contact us by phone or WhatsApp.'); setBusy(false); return; }
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get('name') || '').trim(), phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim(), service: String(form.get('service') || ''),
      budget: String(form.get('budget') || ''), details: String(form.get('details') || '').trim(), status: 'new',
    };
    const { error: insertError } = await supabase.from('customer_requests').insert(payload);
    if (insertError) setError('We could not submit your request. Please try again or contact us directly.');
    else { setSent(true); formEl.reset(); }
    setBusy(false);
  }

  const aboutText = settings.about && !/[\u0600-\u06FF]/.test(settings.about) ? settings.about : defaults.about;
  const addressText = settings.address && !/[\u0600-\u06FF]/.test(settings.address) ? settings.address : defaults.address;
  const whatsapp = settings.whatsapp?.replace(/\D/g, '');
  const socialLinks: { name: string; url: string; short: string }[] = [];
  if (settings.facebook) socialLinks.push({ name: 'Facebook', url: settings.facebook, short: 'FB' });
  if (settings.instagram) socialLinks.push({ name: 'Instagram', url: settings.instagram, short: 'IG' });
  if (settings.tiktok) socialLinks.push({ name: 'TikTok', url: settings.tiktok, short: 'TK' });
  if (settings.linkedin) socialLinks.push({ name: 'LinkedIn', url: settings.linkedin, short: 'IN' });
  const navItems = [['#about', 'About'], ['#services', 'Services'], ['#projects', 'Our Work'], ['#clients', 'Clients'], ['#contact', 'Contact']];

  return <main className="sd-site">
    <header className="sd-nav">
      <div className="sd-nav-inner">
        <a href="#home" className="sd-brand" aria-label="Siri Designs - Home">
          <Image src="/logo.png" alt="Siri Designs" width={62} height={58} priority />
          <span><b>Siri Designs</b><small>INTERIOR · FINISHING · DECOR</small></span>
        </a>
        <nav className={menuOpen ? 'sd-links sd-links-open' : 'sd-links'} aria-label="Main navigation">
          {navItems.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="sd-nav-action" href="#request">Let's Talk <span>↗</span></a>
        <button className="sd-menu-toggle" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><span/><span/></button>
      </div>
    </header>

    <section id="home" className="sd-hero">
      <div className="sd-hero-photo" style={{ backgroundImage: `url("${heroImage}")` }}/>
      <div className="sd-hero-shade"/>
      <div className="sd-container sd-hero-layout">
        <div className="sd-hero-copy">
          <div className="sd-kicker sd-hero-kicker"><i/> SIRI DESIGNS <span>—</span> INTERIOR STUDIO</div>
          <h1>Your space.<br/><em>A different feeling.</em></h1>
          <p>We design and deliver spaces that tell your story. A clear vision, considered details, and a seamless experience from the first idea to the final touch.</p>
          <div className="sd-hero-actions"><a href="#projects" className="sd-btn sd-btn-light">Explore Our Work <span>↙</span></a><a href="#request" className="sd-text-btn">Start Your Project <span>←</span></a></div>
          <div className="sd-hero-footnote"><span/> Designed Around Your Life</div>
        </div>
        <div className="sd-hero-side" aria-hidden="true">
          <div className="sd-outline-number">01</div>
          <div className="sd-hero-caption"><b>Spaces<br/>with meaning.</b><span>DESIGNED AROUND YOU</span></div>
          <div className="sd-vertical-word">SIRI / DESIGNS</div>
        </div>
      </div>
      <a className="sd-scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><i>↓</i></a>
    </section>

    <div className="sd-marquee" aria-label="Siri Designs services"><div className="sd-marquee-track">{Array.from({ length: 2 }).map((_, i) => <span key={i}>INTERIOR DESIGN <b>✳</b> FINISHING <b>✳</b> DECORATION <b>✳</b> SPACES THAT FEEL LIKE YOU <b>✳</b> </span>)}</div></div>

    <section className="sd-about sd-section" id="about">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">01 / ABOUT US</span><span className="sd-section-aside">OUR DESIGN PHILOSOPHY</span></div>
        <div className="sd-about-grid">
          <div className="sd-about-title sd-reveal"><span className="sd-mini-label">THE SIRI APPROACH</span><h2>Beauty is more<br/>than what you see.<br/><em>It is what you feel.</em></h2></div>
          <div className="sd-about-content sd-reveal"><p>{aboutText}</p><p className="sd-about-sub">We balance function and visual appeal to make every space comfortable, considered, and personal.</p><a href="#contact" className="sd-underlink">Discover Our Approach <span>↙</span></a><div className="sd-about-stamp"><b>S</b><span>DETAILS<br/>MATTER</span></div></div>
        </div>
        <div className="sd-process sd-reveal"><div><b>01</b><span>We listen and understand your vision</span></div><div><b>02</b><span>We plan and design with care</span></div><div><b>03</b><span>We build and oversee every detail</span></div><div><b>04</b><span>We deliver a space you love</span></div></div>
      </div>
    </section>

    <section id="services" className="sd-services sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">02 / WHAT WE DO</span><span className="sd-section-aside">Our Services</span></div>
        <div className="sd-heading-row sd-reveal"><h2>From the first <em>idea,</em><br/>to the final detail.</h2><p>Every stage of your project deserves attention. We bring planning, design sensibility, and professional execution together.</p></div>
        <div className="sd-service-grid">{services.map((service) => <article className="sd-service-card sd-reveal" key={service.no}>
          <div className="sd-service-image" style={{ backgroundImage: `url("${service.image}")` }}><span className="sd-service-tag">{service.tag}</span><span className="sd-service-no">{service.no}</span></div>
          <div className="sd-service-info"><h3>{service.title}</h3><p>{service.desc}</p><a href="#request" aria-label={`Request ${service.title}`}>Explore Service <span>↙</span></a></div>
        </article>)}</div>
      </div>
    </section>

    <section className="sd-projects sd-section" id="projects">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">03 / SELECTED WORK</span><span className="sd-section-aside">Selected Projects</span></div>
        <div className="sd-heading-row sd-reveal"><h2>Our work<br/><em>speaks for itself.</em></h2><p>Every project is a new beginning, and every detail is part of a story worth seeing.</p></div>
        {portfolioLoadError ? <div className="sd-project-empty sd-reveal sd-visible"><span className="sd-empty-symbol">!</span><div><b>Our projects are temporarily unavailable.</b><p>{portfolioLoadError}</p></div></div> : projects.length ? <div className="sd-project-grid">{projects.map((p, i) => <article className={`sd-project-card sd-reveal sd-project-${i % 3}`} key={p.id}>
          <div className="sd-project-image">{p.image_url ? <img src={p.image_url} alt={`${p.title} — ${p.category || 'Project'}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async"/> : <div className="sd-project-empty-image">SIRI / PROJECT</div>}<span className="sd-project-count">{String(i + 1).padStart(2, '0')}</span></div>
          <div className="sd-project-info"><div><span>{p.category || 'Project'}</span><h3>{p.title}</h3>{p.location && <small>{p.location}</small>}</div><span className="sd-project-arrow">↙</span></div>
          {p.description && <p className="sd-project-desc">{p.description}</p>}
        </article>)}</div> : <div className="sd-project-empty sd-reveal"><span className="sd-empty-symbol">✳</span><div><b>Our next stories start here.</b><p>Add projects, photos, and descriptions in the admin dashboard and they will appear here automatically.</p></div><a href="#request">Become Our Next Project <span>↙</span></a></div>}
      </div>
    </section>

    <section className="sd-clients sd-section" id="clients">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">04 / OUR CLIENTS</span><span className="sd-section-aside">Clients & Partners</span></div>
        <div className="sd-heading-row sd-reveal"><h2>Trust is the foundation<br/><em>of every space.</em></h2><p>Strong partnerships begin with understanding and grow through commitment and attention to detail.</p></div>
        {clients.length ? <div className="sd-client-row">{clients.map((c) => <article className="sd-client-card sd-reveal" key={c.id}>{c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy"/> : <b>{c.name}</b>}{c.logo_url && <span>{c.name}</span>}{c.note && <small>{c.note}</small>}</article>)}</div> : <div className="sd-client-note sd-reveal"><span>✳</span> Client names and logos will appear here once they are added in the admin dashboard.</div>}
      </div>
    </section>

    <section className="sd-quote"><div className="sd-container sd-quote-inner"><span className="sd-index">SIRI DESIGN PHILOSOPHY</span><p>We do not just design spaces<br/>to be seen… <em>we design spaces to be felt.</em></p><a href="#request">Let's Talk About Your Space <span>↙</span></a><div className="sd-quote-mark">“</div></div></section>

    <section id="request" className="sd-contact sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">05 / START A PROJECT</span><span className="sd-section-aside">Start a Project</span></div>
        <div className="sd-contact-grid">
          <div className="sd-contact-copy sd-reveal"><span className="sd-mini-label">LET'S CREATE SOMETHING BEAUTIFUL</span><h2>Have an idea?<br/><em>We are ready.</em></h2><p>Tell us about the space you have in mind. Share a few project details and our team will get in touch to help you take the first step.</p>
            <div className="sd-direct-contact"><span>Direct Contact</span>{settings.phone ? <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a> : <b>Add your phone number in the admin dashboard</b>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{addressText && <small>{addressText}</small>}</div>
          </div>
          <form className="sd-form sd-reveal" onSubmit={submit}>
            <div className="sd-form-head"><div><span>PROJECT INQUIRY</span><h3>Tell Us About Your Project</h3></div><b>01 — 05</b></div>
            <div className="sd-form-row"><label>Full Name *<input name="name" required maxLength={100} placeholder="Your name"/></label><label>Phone Number *<input name="phone" required type="tel" maxLength={30} placeholder="Your phone number"/></label></div>
            <div className="sd-form-row"><label>Email Address<input name="email" type="email" maxLength={150} placeholder="name@example.com"/></label><label>Service Required *<select name="service" required defaultValue=""><option value="" disabled>Select a service</option><option>Complete Fit-Out</option><option>Interior Design</option><option>Decor & Lighting</option><option>Renovation & Upgrades</option><option>Other</option></select></label></div>
            <label>Estimated Budget<select name="budget" defaultValue=""><option value="">Optional</option><option>Under EGP 100,000</option><option>EGP 100,000 – 300,000</option><option>EGP 300,000 – 700,000</option><option>Over EGP 700,000</option><option>Still to be determined</option></select></label>
            <label>Project Details<textarea name="details" rows={3} maxLength={3000} placeholder="Space type, location, and anything else you would like to share..."/></label>
            {error && <p className="sd-form-error" role="alert">{error}</p>}{sent && <p className="sd-form-success" role="status">Your request has been submitted successfully. Thank you for choosing Siri Designs. Our team will contact you soon.</p>}
            <button className="sd-submit" disabled={busy}>{busy ? 'Submitting your request...' : 'Submit Project Inquiry'} <span>↙</span></button><small className="sd-privacy">Your information is secure and will only be used to follow up on your inquiry.</small>
          </form>
        </div>
      </div>
    </section>

    <footer className="sd-footer" id="contact"><div className="sd-container"><div className="sd-footer-main">
      <div className="sd-footer-brand"><Image src="/logo.png" alt="Siri Designs" width={100} height={88}/><b>Siri Designs</b><p>We design spaces that feel like you.</p></div>
      <div><h4>Explore</h4><a href="#about">About</a><a href="#services">Services</a><a href="#projects">Selected Work</a><a href="#clients">Clients</a></div>
      <div><h4>Contact</h4>{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<p>{addressText}</p></div>
      <div><h4>Follow Us</h4>{socialLinks.map(({ name, url, short }) => <a className="sd-social-link" key={name} href={url} target="_blank" rel="noreferrer"><span>{short}</span>{name} ↗</a>)}{whatsapp && <a className="sd-social-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><span>WA</span>WhatsApp ↗</a>}{!socialLinks.length && !whatsapp && <p>Add social links in the admin dashboard</p>}</div>
    </div><div className="sd-footer-bottom"><span>© {new Date().getFullYear()} Siri Designs. All rights reserved.</span><span>Designed by <b>Tech Relation</b></span></div></div></footer>
    {whatsapp && <a className="sd-whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="Contact us on WhatsApp"><span>WhatsApp</span><b>↗</b></a>}
  </main>;
}
