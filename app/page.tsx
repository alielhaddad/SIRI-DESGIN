'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; category?: string; location?: string; image_url?: string; description?: string };
type Client = { id: string; name: string; logo_url?: string; note?: string };
type Settings = { phone?: string; whatsapp?: string; email?: string; address?: string; facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; about?: string };

const defaults: Settings = {
  address: 'القاهرة، مصر',
  about: 'نحوّل أفكارك إلى مساحات متوازنة تجمع بين الجمال والراحة والوظيفة. نهتم بكل تفصيلة، من فهم احتياجك ورسم الفكرة إلى اختيار الخامات ومتابعة التنفيذ.',
};

const heroImage = '/projects/dnp-storefront.webp';
const services = [
  { no: '01', title: 'التشطيبات المتكاملة', desc: 'تنفيذ متكامل بمراحل واضحة، وخامات مختارة بعناية، وجودة تلاحظها في كل تفصيلة.', image: '/projects/fitout-display-wide.webp', tag: 'FINISHING' },
  { no: '02', title: 'التصميم الداخلي', desc: 'تخطيط ذكي للمساحات والألوان والأثاث يعكس شخصيتك ويخدم أسلوب حياتك.', image: '/projects/dnp-interior.webp', tag: 'INTERIOR DESIGN' },
  { no: '03', title: 'الديكورات والإضاءة', desc: 'تفاصيل بصرية وإضاءة مدروسة تمنح كل مساحة إحساسها وهويتها الخاصة.', image: '/projects/alura-arches.webp', tag: 'DECOR & LIGHTING' },
  { no: '04', title: 'تجديد وتطوير المساحات', desc: 'نمنح المساحات القائمة بداية جديدة باستغلال أفضل ونتيجة أكثر أناقة وراحة.', image: '/projects/site-counter-finish.webp', tag: 'RENOVATION' },
];


export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
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

    const targets = document.querySelectorAll<HTMLElement>('.sd-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('sd-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('sd-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      targets.forEach((el) => observer.observe(el));
      return () => { observer.disconnect(); window.removeEventListener('scroll', updateNav); };
    }
    return () => window.removeEventListener('scroll', updateNav);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    (async () => {
      const [p, c, s] = await Promise.all([
        supabase.from('projects').select('id,title,category,location,image_url,description').eq('published', true).order('created_at', { ascending: false }).limit(50),
        supabase.from('clients').select('id,name,logo_url,note').eq('active', true).order('created_at', { ascending: false }).limit(12),
        supabase.from('site_settings').select('value').eq('id', 'main').maybeSingle(),
      ]);
      if (!alive) return;
      if (p.data) setProjects(p.data as Project[]);
      if (c.data) setClients(c.data as Client[]);
      if (s.data?.value) setSettings({ ...defaults, ...s.data.value });
    })();
    return () => { alive = false; };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setBusy(true); setError(''); setSent(false);
    if (!supabase) { setError('نموذج استقبال الطلبات غير متصل حاليًا. يرجى التواصل معنا عبر الهاتف أو واتساب.'); setBusy(false); return; }
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get('name') || '').trim(), phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim(), service: String(form.get('service') || ''),
      budget: String(form.get('budget') || ''), details: String(form.get('details') || '').trim(), status: 'new',
    };
    const { error: insertError } = await supabase.from('customer_requests').insert(payload);
    if (insertError) setError('لم نتمكن من إرسال الطلب الآن. حاول مرة أخرى أو تواصل معنا مباشرة.');
    else { setSent(true); formEl.reset(); }
    setBusy(false);
  }

  const whatsapp = settings.whatsapp?.replace(/\D/g, '');
  const socialLinks: { name: string; url: string; short: string }[] = [];
  if (settings.facebook) socialLinks.push({ name: 'Facebook', url: settings.facebook, short: 'FB' });
  if (settings.instagram) socialLinks.push({ name: 'Instagram', url: settings.instagram, short: 'IG' });
  if (settings.tiktok) socialLinks.push({ name: 'TikTok', url: settings.tiktok, short: 'TK' });
  if (settings.linkedin) socialLinks.push({ name: 'LinkedIn', url: settings.linkedin, short: 'IN' });
  const navItems = [['#about', 'عن الشركة'], ['#services', 'خدماتنا'], ['#projects', 'أعمالنا'], ['#clients', 'عملاؤنا'], ['#contact', 'تواصل معنا']];

  return <main className="sd-site">
    <header className="sd-nav">
      <div className="sd-nav-inner">
        <a href="#home" className="sd-brand" aria-label="Siri Designs - الرئيسية">
          <Image src="/logo.png" alt="Siri Designs" width={62} height={58} priority />
          <span><b>Siri Designs</b><small>INTERIOR · FINISHING · DECOR</small></span>
        </a>
        <nav className={menuOpen ? 'sd-links sd-links-open' : 'sd-links'} aria-label="التنقل الرئيسي">
          {navItems.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <a className="sd-nav-action" href="#request">خلينا نبدأ <span>↗</span></a>
        <button className="sd-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><span/><span/></button>
      </div>
    </header>

    <section id="home" className="sd-hero">
      <div className="sd-hero-photo" style={{ backgroundImage: `url("${heroImage}")` }}/>
      <div className="sd-hero-shade"/>
      <div className="sd-container sd-hero-layout">
        <div className="sd-hero-copy">
          <div className="sd-kicker sd-hero-kicker"><i/> SIRI DESIGNS <span>—</span> INTERIOR STUDIO</div>
          <h1>مساحتك…<br/><em>بروح مختلفة.</em></h1>
          <p>نصمم وننفّذ مساحات تحكي عنك. رؤية واضحة، تفاصيل مدروسة، وتجربة متكاملة من أول فكرة لحد آخر لمسة.</p>
          <div className="sd-hero-actions"><a href="#projects" className="sd-btn sd-btn-light">اكتشف أعمالنا <span>↙</span></a><a href="#request" className="sd-text-btn">ابدأ مشروعك <span>←</span></a></div>
          <div className="sd-hero-footnote"><span/> تصميم يليق بتفاصيل حياتك</div>
        </div>
        <div className="sd-hero-side" aria-hidden="true">
          <div className="sd-outline-number">01</div>
          <div className="sd-hero-caption"><b>Spaces<br/>with meaning.</b><span>DESIGNED AROUND YOU</span></div>
          <div className="sd-vertical-word">SIRI / DESIGNS</div>
        </div>
      </div>
      <a className="sd-scroll-cue" href="#about"><span>SCROLL TO EXPLORE</span><i>↓</i></a>
    </section>

    <div className="sd-marquee" aria-label="خدمات Siri Designs"><div className="sd-marquee-track">{Array.from({ length: 2 }).map((_, i) => <span key={i}>INTERIOR DESIGN <b>✳</b> FINISHING <b>✳</b> DECORATION <b>✳</b> SPACES THAT FEEL LIKE YOU <b>✳</b> </span>)}</div></div>

    <section className="sd-about sd-section" id="about">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">01 / ABOUT US</span><span className="sd-section-aside">فلسفتنا في التصميم</span></div>
        <div className="sd-about-grid">
          <div className="sd-about-title sd-reveal"><span className="sd-mini-label">THE SIRI APPROACH</span><h2>الجمال مش<br/>شكل وبس،<br/><em>ده إحساس.</em></h2></div>
          <div className="sd-about-content sd-reveal"><p>{settings.about || defaults.about}</p><p className="sd-about-sub">بنوازن بين الشكل العملي والجمال البصري، علشان كل مساحة تكون مريحة، واضحة، وقريبة منك.</p><a href="#contact" className="sd-underlink">اعرف أكتر عنّا <span>↙</span></a><div className="sd-about-stamp"><b>S</b><span>DETAILS<br/>MATTER</span></div></div>
        </div>
        <div className="sd-process sd-reveal"><div><b>01</b><span>نسمعك ونفهم رؤيتك</span></div><div><b>02</b><span>نخطط ونصمم بعناية</span></div><div><b>03</b><span>ننّفذ ونتابع التفاصيل</span></div><div><b>04</b><span>نسلّم مساحة تحبها</span></div></div>
      </div>
    </section>

    <section id="services" className="sd-services sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">02 / WHAT WE DO</span><span className="sd-section-aside">خدماتنا</span></div>
        <div className="sd-heading-row sd-reveal"><h2>من أول <em>فكرة،</em><br/>لآخر تفصيلة.</h2><p>كل مرحلة في مشروعك ليها اهتمامها. بنقدّم حلول متكاملة تجمع بين التخطيط، الذوق، والتنفيذ المحترف.</p></div>
        <div className="sd-service-grid">{services.map((service) => <article className="sd-service-card sd-reveal" key={service.no}>
          <div className="sd-service-image" style={{ backgroundImage: `url("${service.image}")` }}><span className="sd-service-tag">{service.tag}</span><span className="sd-service-no">{service.no}</span></div>
          <div className="sd-service-info"><h3>{service.title}</h3><p>{service.desc}</p><a href="#request" aria-label={`اطلب خدمة ${service.title}`}>اطلب الخدمة <span>↙</span></a></div>
        </article>)}</div>
      </div>
    </section>

    <section className="sd-projects sd-section" id="projects">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">03 / SELECTED WORK</span><span className="sd-section-aside">سابقة الأعمال</span></div>
        <div className="sd-heading-row sd-reveal"><h2>أعمالنا بتحكي<br/><em>عنّا.</em></h2><p>كل مشروع بداية جديدة، وكل تفصيلة فيه جزء من حكاية تستحق تتشاف.</p></div>
        {projects.length ? <div className="sd-project-grid">{projects.map((p, i) => <article className={`sd-project-card sd-reveal sd-project-${i % 3}`} key={p.id}>
          <div className="sd-project-image">{p.image_url ? <img src={p.image_url} alt={`${p.title} — ${p.category || 'مشروع'}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async"/> : <div className="sd-project-empty-image">SIRI / PROJECT</div>}<span className="sd-project-count">{String(i + 1).padStart(2, '0')}</span></div>
          <div className="sd-project-info"><div><span>{p.category || 'مشروع'}</span><h3>{p.title}</h3>{p.location && <small>{p.location}</small>}</div><span className="sd-project-arrow">↙</span></div>
          {p.description && <p className="sd-project-desc">{p.description}</p>}
        </article>)}</div> : <div className="sd-project-empty sd-reveal"><span className="sd-empty-symbol">✳</span><div><b>هنا تبدأ حكاياتنا القادمة.</b><p>أضف مشروعاتك وصورها وأوصافها من لوحة الإدارة لتظهر هنا تلقائيًا.</p></div><a href="#request">كن مشروعنا القادم <span>↙</span></a></div>}
      </div>
    </section>

    <section className="sd-clients sd-section" id="clients">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">04 / OUR CLIENTS</span><span className="sd-section-aside">عملاؤنا وشركاء النجاح</span></div>
        <div className="sd-heading-row sd-reveal"><h2>الثقة أساس<br/><em>كل مساحة.</em></h2><p>العلاقات الناجحة بتبدأ بفهم حقيقي، وبتكبر بالالتزام والاهتمام.</p></div>
        {clients.length ? <div className="sd-client-row">{clients.map((c) => <article className="sd-client-card sd-reveal" key={c.id}>{c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy"/> : <b>{c.name}</b>}{c.logo_url && <span>{c.name}</span>}{c.note && <small>{c.note}</small>}</article>)}</div> : <div className="sd-client-note sd-reveal"><span>✳</span> سيتم عرض أسماء وشعارات العملاء هنا بعد إضافتها من لوحة الإدارة.</div>}
      </div>
    </section>

    <section className="sd-quote"><div className="sd-container sd-quote-inner"><span className="sd-index">SIRI DESIGN PHILOSOPHY</span><p>مش بنصمم مكان<br/>يتشاف وبس… <em>بنصمم مكان يتحس.</em></p><a href="#request">خلينا نحكي عن مساحتك <span>↙</span></a><div className="sd-quote-mark">“</div></div></section>

    <section id="request" className="sd-contact sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">05 / START A PROJECT</span><span className="sd-section-aside">ابدأ مشروعك</span></div>
        <div className="sd-contact-grid">
          <div className="sd-contact-copy sd-reveal"><span className="sd-mini-label">LET'S CREATE SOMETHING BEAUTIFUL</span><h2>عندك فكرة؟<br/><em>إحنا جاهزين.</em></h2><p>احكيلنا عن المساحة اللي بتحلم بيها. ابعت تفاصيل مشروعك، وفريقنا هيتواصل معاك علشان نبدأ أول خطوة.</p>
            <div className="sd-direct-contact"><span>تواصل مباشر</span>{settings.phone ? <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a> : <b>أضف رقم التواصل من لوحة الإدارة</b>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.address && <small>{settings.address}</small>}</div>
          </div>
          <form className="sd-form sd-reveal" onSubmit={submit}>
            <div className="sd-form-head"><div><span>PROJECT INQUIRY</span><h3>احكيلنا عن مشروعك</h3></div><b>01 — 05</b></div>
            <div className="sd-form-row"><label>الاسم بالكامل *<input name="name" required maxLength={100} placeholder="اسمك"/></label><label>رقم الموبايل *<input name="phone" required type="tel" maxLength={30} placeholder="01xxxxxxxxx"/></label></div>
            <div className="sd-form-row"><label>البريد الإلكتروني<input name="email" type="email" maxLength={150} placeholder="name@example.com"/></label><label>نوع الخدمة *<select name="service" required defaultValue=""><option value="" disabled>اختار الخدمة</option><option>تشطيبات متكاملة</option><option>تصميم داخلي</option><option>ديكورات وإضاءة</option><option>تجديد وتطوير</option><option>أخرى</option></select></label></div>
            <label>الميزانية التقريبية<select name="budget" defaultValue=""><option value="">اختياري</option><option>أقل من 100,000 جنيه</option><option>100,000 – 300,000 جنيه</option><option>300,000 – 700,000 جنيه</option><option>أكثر من 700,000 جنيه</option><option>لسه بحدد</option></select></label>
            <label>تفاصيل المشروع<textarea name="details" rows={3} maxLength={3000} placeholder="نوع المساحة، الموقع، وأي تفاصيل تحب تشاركها..."/></label>
            {error && <p className="sd-form-error" role="alert">{error}</p>}{sent && <p className="sd-form-success" role="status">وصلنا طلبك بنجاح. شكرًا لثقتك في Siri Designs، هنتواصل معاك قريبًا.</p>}
            <button className="sd-submit" disabled={busy}>{busy ? 'جاري إرسال طلبك...' : 'إرسال طلب المشروع'} <span>↙</span></button><small className="sd-privacy">بياناتك آمنة، ونستخدمها للتواصل معك بخصوص طلبك فقط.</small>
          </form>
        </div>
      </div>
    </section>

    <footer className="sd-footer" id="contact"><div className="sd-container"><div className="sd-footer-main">
      <div className="sd-footer-brand"><Image src="/logo.png" alt="Siri Designs" width={100} height={88}/><b>Siri Designs</b><p>نصمم مساحات تشبهك.</p></div>
      <div><h4>استكشف</h4><a href="#about">عن الشركة</a><a href="#services">خدماتنا</a><a href="#projects">سابقة الأعمال</a><a href="#clients">عملاؤنا</a></div>
      <div><h4>تواصل معنا</h4>{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<p>{settings.address || defaults.address}</p></div>
      <div><h4>تابعنا</h4>{socialLinks.map(({ name, url, short }) => <a className="sd-social-link" key={name} href={url} target="_blank" rel="noreferrer"><span>{short}</span>{name} ↗</a>)}{whatsapp && <a className="sd-social-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><span>WA</span>WhatsApp ↗</a>}{!socialLinks.length && !whatsapp && <p>أضف روابط التواصل من لوحة الإدارة</p>}</div>
    </div><div className="sd-footer-bottom"><span>© {new Date().getFullYear()} Siri Designs. جميع الحقوق محفوظة.</span><span>Designed by <b>Tech Relation</b></span></div></div></footer>
    {whatsapp && <a className="sd-whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="تواصل معنا عبر واتساب"><span>واتساب</span><b>↗</b></a>}
  </main>;
}
