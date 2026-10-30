'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; category?: string; location?: string; image_url?: string; description?: string };
type Client = { id: string; name: string; logo_url?: string; note?: string };
type Settings = { phone?: string; whatsapp?: string; email?: string; address?: string; facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; about?: string };
const defaults: Settings = { address: 'القاهرة، مصر', about: 'نحوّل أفكارك إلى مساحات أنيقة تجمع بين الجودة والراحة والوظيفة، من الفكرة الأولى وحتى أدق تفاصيل التنفيذ.' };

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>(
      '.intro-grid, .stats > div, .section-heading, .service-grid article, .project-card, .client-card, .request-form, .contact-mini, .footer-top > div, .quote-band p'
    );
    revealTargets.forEach((element) => element.classList.add('motion-reveal'));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });
      revealTargets.forEach((element) => observer.observe(element));

      const nav = document.querySelector<HTMLElement>('.nav');
      const updateNav = () => nav?.classList.toggle('is-scrolled', window.scrollY > 18);
      updateNav();
      window.addEventListener('scroll', updateNav, { passive: true });
      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updateNav);
      };
    }

    const nav = document.querySelector<HTMLElement>('.nav');
    const updateNav = () => nav?.classList.toggle('is-scrolled', window.scrollY > 18);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    return () => window.removeEventListener('scroll', updateNav);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    (async () => {
      const [p, c, s] = await Promise.all([
        supabase.from('projects').select('id,title,category,location,image_url,description').eq('published', true).order('created_at', { ascending: false }).limit(9),
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
  const socialLinks: { name: string; url: string }[] = [];
  if (settings.facebook) socialLinks.push({ name: 'Facebook', url: settings.facebook });
  if (settings.instagram) socialLinks.push({ name: 'Instagram', url: settings.instagram });
  if (settings.tiktok) socialLinks.push({ name: 'TikTok', url: settings.tiktok });
  if (settings.linkedin) socialLinks.push({ name: 'LinkedIn', url: settings.linkedin });

  return <main>
    <header className="nav">
      <a href="#home" className="brand"><Image src="/logo.png" alt="Siri Designs" width={76} height={68} priority/><span>Siri <b>Designs</b><small>تشطيبات • ديكورات • تصميم داخلي</small></span></a>
      <nav aria-label="التنقل الرئيسي"><a href="#about">عن الشركة</a><a href="#services">خدماتنا</a><a href="#projects">سابقة الأعمال</a><a href="#clients">عملاؤنا</a><a href="#contact">تواصل معنا</a></nav>
      <a className="nav-cta" href="#request">اطلب عرض سعر <span>↗</span></a>
    </header>

    <section id="home" className="hero">
      <div className="hero-shape hero-shape-one"/><div className="hero-shape hero-shape-two"/>
      <div className="hero-content"><span className="eyebrow">SIRI DESIGNS · INTERIOR & FINISHING</span>
        <h1>نصمم مساحات<br/><em>تشبهك.</em></h1>
        <p>من أول خط في التصميم إلى آخر لمسة في التنفيذ، نصنع مساحات متوازنة تجمع بين الذوق والجودة والتفاصيل الذكية.</p>
        <div className="hero-actions"><a className="button primary" href="#projects">شاهد أعمالنا <span>↙</span></a><a className="button ghost" href="#request">ابدأ مشروعك</a></div>
        <div className="hero-note"><span className="note-line"/> تصميم مدروس. تنفيذ متقن. تفاصيل تصنع الفرق.</div>
      </div>
      <div className="hero-badge"><span>SPACES</span><b>MADE<br/>FOR YOU</b><i>01 — 04</i></div>
      <div className="hero-bottom-mark">SIRI <span>DESIGNS</span></div>
    </section>

    <section className="intro section" id="about"><div className="section-label">01 / من نحن</div>
      <div className="intro-grid"><h2>الجمال الحقيقي<br/>يبدأ من <em>التفاصيل.</em></h2><div><p>{settings.about || defaults.about}</p><a className="text-link" href="#contact">احكيلنا عن فكرتك <span>←</span></a></div></div>
      <div className="stats"><div><b>01</b><span>نسمع احتياجك ونفهم رؤيتك</span></div><div><b>02</b><span>نخطط لكل مساحة بعناية</span></div><div><b>03</b><span>نهتم بالتفاصيل حتى التسليم</span></div></div>
    </section>

    <section id="services" className="services section"><div className="section-label">02 / خدماتنا</div><div className="section-heading"><h2>من الفكرة إلى <em>التنفيذ.</em></h2><p>حلول متكاملة نصممها لتناسب احتياجك وطبيعة مساحتك.</p></div>
      <div className="service-grid">
        <article><span>01</span><div className="service-icon">⌂</div><h3>التشطيبات المتكاملة</h3><p>تنفيذ أعمال التشطيب بمراحل واضحة واهتمام باختيار الخامات وجودة التفاصيل.</p><a href="#request">اطلب الخدمة ↙</a></article>
        <article><span>02</span><div className="service-icon">◈</div><h3>التصميم الداخلي</h3><p>توزيع مدروس للمساحات والألوان والأثاث يعكس شخصيتك ويخدم استخدامك اليومي.</p><a href="#request">اطلب الخدمة ↙</a></article>
        <article><span>03</span><div className="service-icon">✳</div><h3>الديكورات والإضاءة</h3><p>اختيار الخامات والإضاءة واللمسات الجمالية التي تمنح المكان هويته الخاصة.</p><a href="#request">اطلب الخدمة ↙</a></article>
        <article><span>04</span><div className="service-icon">▧</div><h3>تجديد وتطوير المساحات</h3><p>تجديد المساحات القائمة لتصبح أكثر عملية وراحة وأناقة مع استغلال أفضل لكل ركن.</p><a href="#request">اطلب الخدمة ↙</a></article>
      </div>
    </section>

    <section className="project-section section" id="projects"><div className="section-label">03 / مختارات من أعمالنا</div><div className="section-heading"><h2>مساحات صُممت <em>لتُعاش.</em></h2><p>اكتشف بعض المشروعات التي نفخر بتفاصيلها.</p></div>
      {projects.length ? <div className="project-grid">{projects.map((p, i) => <article className="project-card" key={p.id}>{p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy"/> : <div className={`project-placeholder tone-${i % 3}`}>SIRI / PROJECT</div>}<div><span>{p.category || 'مشروع'}</span><h3>{p.title}</h3>{p.location && <p>{p.location}</p>}{p.description && <p>{p.description}</p>}</div></article>)}</div> : <div className="empty-projects"><div className="empty-mark">✳</div><h3>كل مشروع له حكاية.</h3><p>سيتم عرض سابقة الأعمال هنا بمجرد إضافتها من لوحة التحكم.</p></div>}
    </section>

    <section className="clients-section section" id="clients"><div className="section-label">04 / شركاء النجاح</div><div className="section-heading"><h2>ثقة نبنيها <em>معًا.</em></h2><p>نفخر بالعمل مع عملائنا وشركائنا.</p></div>{clients.length ? <div className="client-grid">{clients.map(c => <article className="client-card" key={c.id}>{c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy"/> : <b>{c.name}</b>}{c.logo_url && <span>{c.name}</span>}{c.note && <small>{c.note}</small>}</article>)}</div> : <div className="empty-projects"><div className="empty-mark">✳</div><h3>شركاء النجاح.</h3><p>ستظهر هنا أسماء العملاء وشعاراتهم بعد إضافتها من لوحة التحكم.</p></div>}</section>

    <section className="quote-band"><p>“المكان الجميل لا يُرى فقط،<br/>بل تشعر به في كل يوم.”</p><span>SIRI DESIGNS — DESIGNED AROUND YOU</span></section>

    <section id="request" className="request-section section"><div className="section-label">05 / ابدأ مشروعك</div><div className="request-grid"><div><h2>كل بداية حلوة<br/><em>بتبدأ بفكرة.</em></h2><p>احكيلنا عن مشروعك، وفريقنا هيتواصل معاك لمناقشة التفاصيل والخطوة المناسبة.</p><div className="contact-mini"><span>تواصل مباشر</span>{settings.phone ? <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a> : <b>أضف رقم التواصل من لوحة الإدارة</b>}{settings.email && <small>{settings.email}</small>}</div></div>
      <form className="request-form" onSubmit={submit}><div className="form-title"><h3>اطلب عرض سعر</h3><span>الحقول المعلّمة مطلوبة *</span></div><div className="form-row"><label>الاسم بالكامل *<input name="name" required maxLength={100} placeholder="اكتب اسمك"/></label><label>رقم الموبايل *<input name="phone" required type="tel" maxLength={30} placeholder="01xxxxxxxxx"/></label></div>
        <div className="form-row"><label>البريد الإلكتروني<input name="email" type="email" maxLength={150} placeholder="name@example.com"/></label><label>نوع الخدمة *<select name="service" required defaultValue=""><option value="" disabled>اختار الخدمة</option><option>تشطيبات متكاملة</option><option>تصميم داخلي</option><option>ديكورات وإضاءة</option><option>تجديد وتطوير</option><option>أخرى</option></select></label></div>
        <label>الميزانية التقريبية<select name="budget" defaultValue=""><option value="">اختياري</option><option>أقل من 100,000 جنيه</option><option>100,000 – 300,000 جنيه</option><option>300,000 – 700,000 جنيه</option><option>أكثر من 700,000 جنيه</option><option>لسه بحدد</option></select></label>
        <label>تفاصيل المشروع<textarea name="details" rows={4} maxLength={3000} placeholder="احكيلنا عن المساحة والموقع وفكرتك..."/></label>
        {error && <p className="form-error" role="alert">{error}</p>}{sent && <p className="form-success" role="status">تم إرسال طلبك بنجاح، شكرًا لثقتك في Siri Designs. هنتواصل معاك قريبًا.</p>}
        <button className="button primary submit" disabled={busy}>{busy ? 'جاري الإرسال...' : 'إرسال طلبك ↗'}</button><small className="privacy">بياناتك تُستخدم للتواصل معك بخصوص طلبك فقط.</small>
      </form></div></section>

    <footer id="contact"><div className="footer-top"><div className="footer-brand"><Image src="/logo.png" alt="Siri Designs" width={110} height={98}/><h3>Siri <em>Designs</em></h3><p>التفاصيل تصنع الفرق.</p></div><div><h4>تصفح</h4><a href="#about">عن الشركة</a><a href="#services">خدماتنا</a><a href="#projects">سابقة الأعمال</a><a href="#clients">عملاؤنا</a></div><div><h4>تواصل معنا</h4>{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a>}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<p>{settings.address || defaults.address}</p></div><div><h4>تابعنا</h4>{socialLinks.map(({ name, url }) => <a key={name} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}{whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>}{!socialLinks.length && !whatsapp && <p>أضف روابط التواصل من لوحة التحكم</p>}</div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Siri Designs. جميع الحقوق محفوظة.</span><span className="footer-credit">Designed by <strong>Tech Relation</strong></span></div>
    </footer>
    {whatsapp && <a className="whatsapp-float" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="تواصل معنا عبر واتساب">واتساب <b>↗</b></a>}
  </main>;
}
