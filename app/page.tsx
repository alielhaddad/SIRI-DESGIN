'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; title_ar?: string; category?: string; category_ar?: string; location?: string; image_url?: string; description?: string; description_ar?: string };
type Client = { id: string; name: string; logo_url?: string; note?: string };
type Service = { id: string; nameEn: string; nameAr: string; descEn: string; descAr: string; imageUrl: string; tagEn: string; tagAr: string; active: boolean; sortOrder: number };
type SiteMedia = { hero: string; logo: string; about: string };
type Settings = { phone?: string; phones?: string[]; whatsapp?: string; email?: string; address?: string; address_ar?: string; location_url?: string; facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; about?: string; about_ar?: string; services?: Service[]; site_media?: Partial<SiteMedia> };

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

const defaultMedia: SiteMedia = {
  hero: '/projects/dnp-storefront.webp',
  logo: '/logo.png',
  about: '/projects/dnp-interior.webp',
};

const defaultServices: Service[] = [
  { id: 'fitout', nameEn: 'Complete Fit-Out', nameAr: 'التشطيبات المتكاملة', descEn: 'End-to-end execution with clear stages, carefully selected materials, and quality you can see in every detail.', descAr: 'تنفيذ متكامل بمراحل واضحة وخامات مختارة بعناية وجودة تظهر في كل تفصيلة.', imageUrl: '/projects/fitout-display-wide.webp', tagEn: 'FINISHING', tagAr: 'تشطيبات', active: true, sortOrder: 1 },
  { id: 'interior', nameEn: 'Interior Design', nameAr: 'التصميم الداخلي', descEn: 'Thoughtful space planning, colors, and furnishings that reflect your personality and support your lifestyle.', descAr: 'تخطيط مدروس للمساحات والألوان والأثاث يعكس شخصيتك ويلائم أسلوب حياتك.', imageUrl: '/projects/dnp-interior.webp', tagEn: 'INTERIOR DESIGN', tagAr: 'تصميم داخلي', active: true, sortOrder: 2 },
  { id: 'decor', nameEn: 'Decor & Lighting', nameAr: 'الديكورات والإضاءة', descEn: 'Considered visual details and lighting that give every space its own character and atmosphere.', descAr: 'تفاصيل جمالية وحلول إضاءة تمنح كل مساحة طابعها وأجواءها الخاصة.', imageUrl: '/projects/alura-arches.webp', tagEn: 'DECOR & LIGHTING', tagAr: 'ديكورات وإضاءة', active: true, sortOrder: 3 },
  { id: 'renovation', nameEn: 'Renovation & Upgrades', nameAr: 'التجديد والتطوير', descEn: 'We give existing spaces a fresh start through smarter layouts and more refined, comfortable results.', descAr: 'نجدد المساحات القائمة بتوزيعات أكثر ذكاءً ونتائج أكثر أناقة وراحة.', imageUrl: '/projects/site-counter-finish.webp', tagEn: 'RENOVATION', tagAr: 'تجديد وتطوير', active: true, sortOrder: 4 },
];

const copy = {
  en: {
    nav: ['About', 'Services', 'Our Work', 'Clients', 'Contact'], talk: "Let's Talk", heroKicker: 'SIRI DESIGNS — INTERIOR STUDIO', heroTitle1: 'Your space.', heroTitle2: 'A different feeling.', heroBody: 'We design and deliver spaces that tell your story. A clear vision, considered details, and a seamless experience from the first idea to the final touch.', explore: 'Explore Our Work', start: 'Start Your Project', designed: 'Designed Around Your Life', heroCaption: 'Spaces<br/>with meaning.', heroCaptionSmall: 'DESIGNED AROUND YOU', scroll: 'SCROLL TO EXPLORE', marquee: ['INTERIOR DESIGN', 'FINISHING', 'DECORATION', 'SPACES THAT FEEL LIKE YOU'],
    aboutIndex: '01 / ABOUT US', aboutAside: 'OUR DESIGN PHILOSOPHY', approach: 'THE SIRI APPROACH', aboutTitle1: 'Beauty is more', aboutTitle2: 'than what you see.', aboutTitle3: 'It is what you feel.', aboutSub: 'We balance function and visual appeal to make every space comfortable, considered, and personal.', discover: 'Discover Our Approach', process: ['We listen and understand your vision', 'We plan and design with care', 'We build and oversee every detail', 'We deliver a space you love'],
    servicesIndex: '02 / WHAT WE DO', servicesAside: 'Our Services', serviceHeading1: 'From the first', serviceHeading2: 'idea,', serviceHeading3: 'to the final detail.', servicesIntro: 'Every stage of your project deserves attention. We bring planning, design sensibility, and professional execution together.', exploreService: 'Explore Service',
    projectsIndex: '03 / SELECTED WORK', projectsAside: 'Selected Projects', projectsHeading1: 'Our work', projectsHeading2: 'speaks for itself.', projectsIntro: 'Every project is a new beginning, and every detail is part of a story worth seeing.', projectErrorTitle: 'Our projects are temporarily unavailable.', projectErrorText: 'Please try again shortly.', projectEmptyTitle: 'Our next stories start here.', projectEmptyText: 'Add projects, photos, and descriptions in the admin dashboard and they will appear here automatically.', becomeProject: 'Become Our Next Project', projectLabel: 'PROJECT',
    clientsIndex: '04 / OUR CLIENTS', clientsAside: 'Clients & Partners', clientsHeading1: 'Trust is the foundation', clientsHeading2: 'of every space.', clientsIntro: 'Strong partnerships begin with understanding and grow through commitment and attention to detail.', clientsEmpty: 'Client names and logos will appear here once they are added in the admin dashboard.',
    philosophy: 'SIRI DESIGN PHILOSOPHY', quote1: 'We do not just design spaces', quote2: 'to be seen…', quote3: 'we design spaces to be felt.', quoteCta: "Let's Talk About Your Space",
    contactIndex: '05 / START A PROJECT', contactAside: 'Start a Project', contactKicker: "LET'S CREATE SOMETHING BEAUTIFUL", contactTitle1: 'Have an idea?', contactTitle2: 'We are ready.', contactBody: 'Tell us about the space you have in mind. Share a few project details and our team will get in touch to help you take the first step.', direct: 'Direct Contact', addPhone: 'Add your phone number in the admin dashboard', viewLocation: 'View Company Location', formKicker: 'PROJECT INQUIRY', formTitle: 'Tell Us About Your Project', fullName: 'Full Name', phone: 'Phone Number', email: 'Email Address', serviceRequired: 'Service Required', selectService: 'Select a service', other: 'Other', budget: 'Estimated Budget', optional: 'Optional', budgetOptions: ['Under EGP 100,000', 'EGP 100,000 – 300,000', 'EGP 300,000 – 700,000', 'Over EGP 700,000', 'Still to be determined'], details: 'Project Details', detailsPlaceholder: 'Space type, location, and anything else you would like to share...', submit: 'Submit Project Inquiry', submitting: 'Submitting your request...', privacy: 'Your information is secure and will only be used to follow up on your inquiry.', success: 'Your request has been submitted successfully. Thank you for choosing Siri Designs. Our team will contact you soon.', error: 'We could not submit your request. Please try again or contact us directly.', emailFailed: 'Your request was saved, but the email notification could not be sent. The request is still available in the admin dashboard.', emailMissing: 'Your request was saved. Email notifications are not configured yet.',
    footerTag: 'We design spaces that feel like you.', exploreFooter: 'Explore', contactFooter: 'Contact', follow: 'Follow Us', noSocial: 'Add social links in the admin dashboard', whatsapp: 'WhatsApp', allRights: 'All rights reserved.', language: 'العربية', light: 'Light mode', dark: 'Dark mode',
  },
  ar: {
    nav: ['من نحن', 'خدماتنا', 'أعمالنا', 'عملاؤنا', 'تواصل معنا'], talk: 'ابدأ التواصل', heroKicker: 'سيري ديزاينز — استوديو التصميم الداخلي', heroTitle1: 'مساحتك…', heroTitle2: 'بإحساس مختلف.', heroBody: 'نصمم وننفذ مساحات تحكي قصتك. رؤية واضحة وتفاصيل مدروسة وتجربة متكاملة من أول فكرة وحتى آخر لمسة.', explore: 'شاهد أعمالنا', start: 'ابدأ مشروعك', designed: 'تصميم يناسب أسلوب حياتك', heroCaption: 'مساحات<br/>لها معنى.', heroCaptionSmall: 'مصممة خصيصًا لك', scroll: 'اكتشف المزيد', marquee: ['التصميم الداخلي', 'التشطيبات', 'الديكورات', 'مساحات تشبهك'],
    aboutIndex: '01 / من نحن', aboutAside: 'فلسفتنا في التصميم', approach: 'منهج سيري', aboutTitle1: 'الجمال ليس فقط', aboutTitle2: 'ما تراه بعينيك،', aboutTitle3: 'بل ما تشعر به.', aboutSub: 'نوازن بين العملية والجمال لنصنع مساحات مريحة ومدروسة وتعبر عن أصحابها.', discover: 'اكتشف أسلوبنا', process: ['نستمع إليك ونفهم رؤيتك', 'نخطط ونصمم بعناية', 'ننّفذ ونتابع كل التفاصيل', 'نسلمك مساحة تحبها'],
    servicesIndex: '02 / ماذا نقدم', servicesAside: 'خدماتنا', serviceHeading1: 'من أول', serviceHeading2: 'فكرة،', serviceHeading3: 'حتى آخر تفصيلة.', servicesIntro: 'كل مرحلة في مشروعك تستحق الاهتمام. نجمع بين التخطيط والحس التصميمي والتنفيذ الاحترافي.', exploreService: 'اكتشف الخدمة',
    projectsIndex: '03 / أعمال مختارة', projectsAside: 'مشروعات مختارة', projectsHeading1: 'أعمالنا', projectsHeading2: 'تتحدث عن نفسها.', projectsIntro: 'كل مشروع بداية جديدة، وكل تفصيلة جزء من حكاية تستحق أن تُروى.', projectErrorTitle: 'مشروعاتنا غير متاحة مؤقتًا.', projectErrorText: 'حاول مرة أخرى بعد قليل.', projectEmptyTitle: 'حكايتنا القادمة تبدأ معك.', projectEmptyText: 'أضف المشروعات والصور والأوصاف من لوحة الإدارة لتظهر هنا تلقائيًا.', becomeProject: 'كن مشروعنا القادم', projectLabel: 'مشروع',
    clientsIndex: '04 / عملاؤنا', clientsAside: 'العملاء والشركاء', clientsHeading1: 'الثقة هي أساس', clientsHeading2: 'كل مساحة ناجحة.', clientsIntro: 'تبدأ الشراكات القوية بالفهم وتنمو بالالتزام والاهتمام بالتفاصيل.', clientsEmpty: 'ستظهر أسماء العملاء وشعاراتهم هنا بعد إضافتها من لوحة الإدارة.',
    philosophy: 'فلسفة سيري ديزاينز', quote1: 'نحن لا نصمم مساحات', quote2: 'لتُرى فقط…', quote3: 'بل نصمم مساحات لتُشعَر.', quoteCta: 'لنتحدث عن مساحتك',
    contactIndex: '05 / ابدأ مشروعك', contactAside: 'ابدأ مشروعًا جديدًا', contactKicker: 'لنصنع شيئًا جميلًا معًا', contactTitle1: 'لديك فكرة؟', contactTitle2: 'نحن جاهزون.', contactBody: 'احكِ لنا عن المساحة التي تتخيلها. شاركنا بعض تفاصيل مشروعك وسيتواصل معك فريقنا لمساعدتك في أول خطوة.', direct: 'تواصل مباشر', addPhone: 'أضف رقم هاتفك من لوحة الإدارة', viewLocation: 'عرض موقع الشركة', formKicker: 'طلب مشروع جديد', formTitle: 'أخبرنا عن مشروعك', fullName: 'الاسم بالكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني', serviceRequired: 'الخدمة المطلوبة', selectService: 'اختر الخدمة', other: 'أخرى', budget: 'الميزانية المتوقعة', optional: 'اختياري', budgetOptions: ['أقل من 100,000 جنيه', 'من 100,000 إلى 300,000 جنيه', 'من 300,000 إلى 700,000 جنيه', 'أكثر من 700,000 جنيه', 'لم يتم تحديدها بعد'], details: 'تفاصيل المشروع', detailsPlaceholder: 'نوع المساحة والموقع وأي تفاصيل أخرى تود مشاركتها...', submit: 'إرسال طلب المشروع', submitting: 'جارٍ إرسال طلبك...', privacy: 'بياناتك آمنة وستُستخدم فقط للتواصل معك بخصوص طلبك.', success: 'تم إرسال طلبك بنجاح. شكرًا لاختيارك Siri Designs، سيتواصل معك فريقنا قريبًا.', error: 'تعذر إرسال طلبك. حاول مرة أخرى أو تواصل معنا مباشرة.', emailFailed: 'تم حفظ طلبك، لكن تعذر إرسال إشعار البريد الإلكتروني. طلبك موجود في لوحة الإدارة.', emailMissing: 'تم حفظ طلبك. لم يتم إعداد إشعارات البريد الإلكتروني بعد.',
    footerTag: 'نصمم مساحات تشبهك.', exploreFooter: 'استكشف', contactFooter: 'تواصل معنا', follow: 'تابعنا', noSocial: 'أضف روابط التواصل الاجتماعي من لوحة الإدارة', whatsapp: 'واتساب', allRights: 'جميع الحقوق محفوظة.', language: 'English', light: 'الوضع الفاتح', dark: 'الوضع الداكن',
  },
} as const;

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioLoadError, setPortfolioLoadError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [siteMedia, setSiteMedia] = useState<SiteMedia>(defaultMedia);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [sent, setSent] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = copy[language];
  const isArabic = language === 'ar';

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('siri-language');
      const savedTheme = localStorage.getItem('siri-theme');
      if (savedLanguage === 'ar' || savedLanguage === 'en') setLanguage(savedLanguage);
      if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
    } catch { /* storage may be disabled */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('siri-language', language); } catch { /* ignore */ }
  }, [language, isArabic]);

  useEffect(() => {
    try { localStorage.setItem('siri-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('.sd-nav');
    const updateNav = () => nav?.classList.toggle('sd-scrolled', window.scrollY > 24);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    return () => window.removeEventListener('scroll', updateNav);
  }, []);

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
  }, [projects, clients, services]);

  useEffect(() => {
    if (!supabase) {
      setPortfolioLoadError(isArabic ? 'الموقع غير متصل بقاعدة البيانات. راجع إعدادات Supabase في Vercel.' : 'The website is not connected to its database. Check the Supabase environment variables in Vercel.');
      return;
    }
    let alive = true;
    (async () => {
      const [p, c, s] = await Promise.all([
        supabase.from('projects').select('id,title,title_ar,category,category_ar,location,image_url,description,description_ar').eq('published', true).order('created_at', { ascending: false }).limit(50),
        supabase.from('clients').select('id,name,logo_url,note').eq('active', true).order('created_at', { ascending: false }).limit(12),
        supabase.from('site_settings').select('value').eq('id', 'main').maybeSingle(),
      ]);
      if (!alive) return;
      if (p.error) {
        // Older installations may not yet have the Arabic project columns; retry with the original schema.
        const fallback = await supabase.from('projects').select('id,title,category,location,image_url,description').eq('published', true).order('created_at', { ascending: false }).limit(50);
        if (!alive) return;
        if (fallback.error) {
          console.error('Siri Designs portfolio query failed:', p.error, fallback.error);
          setProjects([]);
          setPortfolioLoadError(isArabic ? 'تعذر تحميل المشروعات. تحقق من صلاحيات القراءة العامة ومن نشر مشروع واحد على الأقل.' : 'Projects could not be loaded. Check public read access and make sure at least one project is published.');
        } else { setPortfolioLoadError(''); setProjects((fallback.data || []) as Project[]); }
      } else { setPortfolioLoadError(''); setProjects((p.data || []) as Project[]); }
      if (c.data) setClients(c.data as Client[]);
      if (s.data?.value) {
        const value = s.data.value as Settings;
        setSettings(value);
        if (Array.isArray(value.services)) setServices(value.services.filter((service) => service.active !== false).sort((a, b) => a.sortOrder - b.sortOrder));
        if (value.site_media) setSiteMedia({ ...defaultMedia, ...value.site_media });
      }
    })();
    return () => { alive = false; };
  }, [isArabic]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setBusy(true); setError(''); setSent(false); setEmailWarning('');
    if (!supabase) { setError(isArabic ? 'نموذج الطلب غير متاح حاليًا. يرجى التواصل معنا عبر الهاتف أو واتساب.' : 'The inquiry form is currently unavailable. Please contact us by phone or WhatsApp.'); setBusy(false); return; }
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get('name') || '').trim(), phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim(), service: String(form.get('service') || ''),
      budget: String(form.get('budget') || ''), details: String(form.get('details') || '').trim(), status: 'new',
    };
    const { error: insertError } = await supabase.from('customer_requests').insert(payload);
    if (insertError) {
      setError(t.error);
    } else {
      setSent(true);
      formEl.reset();
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        try {
          const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: serviceId, template_id: templateId, user_id: publicKey,
              template_params: {
                name: payload.name, phone: payload.phone, email: payload.email || 'Not provided', service: payload.service,
                budget: payload.budget || 'Not specified', details: payload.details || 'No additional details', submitted_at: new Date().toLocaleString(isArabic ? 'ar-EG' : 'en-GB'),
              },
            }),
          });
          if (!emailResponse.ok) { console.error('EmailJS notification failed:', emailResponse.status, await emailResponse.text().catch(() => '')); setEmailWarning(t.emailFailed); }
        } catch (emailError) { console.error('EmailJS notification request failed:', emailError); setEmailWarning(t.emailFailed); }
      } else setEmailWarning(t.emailMissing);
    }
    setBusy(false);
  }

  const aboutText = isArabic
    ? (settings.about_ar || (settings.about && /[\u0600-\u06FF]/.test(settings.about) ? settings.about : 'نحوّل أفكارك إلى مساحات متوازنة تجمع بين الجمال والراحة والوظيفة. نهتم بكل خطوة، من فهم احتياجاتك وتطوير الفكرة إلى اختيار الخامات ومتابعة التنفيذ.'))
    : (settings.about && !/[\u0600-\u06FF]/.test(settings.about) ? settings.about : 'We turn your ideas into balanced spaces where beauty, comfort, and function come together. From understanding your needs and shaping the concept to selecting materials and overseeing execution, every detail matters.');
  const addressText = isArabic ? (settings.address_ar || settings.address || 'القاهرة، مصر') : (settings.address && !/[\u0600-\u06FF]/.test(settings.address) ? settings.address : 'Cairo, Egypt');
  const whatsapp = settings.whatsapp?.replace(/\D/g, '');
  const companyPhones = (Array.isArray(settings.phones) ? settings.phones : []).map((phone) => String(phone || '').trim()).filter(Boolean);
  if (!companyPhones.length && settings.phone?.trim()) companyPhones.push(settings.phone.trim());
  const companyLocationUrl = safeExternalUrl(settings.location_url);
  const socialLinks: { name: string; url: string; short: string }[] = [];
  if (settings.facebook) socialLinks.push({ name: 'Facebook', url: settings.facebook, short: 'FB' });
  if (settings.instagram) socialLinks.push({ name: 'Instagram', url: settings.instagram, short: 'IG' });
  if (settings.tiktok) socialLinks.push({ name: 'TikTok', url: settings.tiktok, short: 'TK' });
  if (settings.linkedin) socialLinks.push({ name: 'LinkedIn', url: settings.linkedin, short: 'IN' });

  return <main className="sd-site" data-theme={theme} dir={isArabic ? 'rtl' : 'ltr'} lang={language}>
    <header className="sd-nav">
      <div className="sd-nav-inner">
        <a href="#home" className="sd-brand" aria-label="Siri Designs - Home">
          {siteMedia.logo && siteMedia.logo !== '/logo.png' ? <img src={siteMedia.logo} alt="Siri Designs" width={62} height={58} /> : <Image src="/logo.png" alt="Siri Designs" width={62} height={58} priority />}
          <span><b>Siri Designs</b><small>{isArabic ? 'تصميم داخلي · تشطيبات · ديكور' : 'INTERIOR · FINISHING · DECOR'}</small></span>
        </a>
        <nav className={menuOpen ? 'sd-links sd-links-open' : 'sd-links'} aria-label={isArabic ? 'القائمة الرئيسية' : 'Main navigation'}>
          {t.nav.map((label, index) => <a key={index} href={['#about', '#services', '#projects', '#clients', '#contact'][index]} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="sd-nav-tools">
          <button className="sd-language-toggle" type="button" onClick={() => setLanguage(isArabic ? 'en' : 'ar')} aria-label="Switch language">{t.language}</button>
          <button className="sd-theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? t.dark : t.light}>{theme === 'light' ? '☾' : '☀'}</button>
          <a className="sd-nav-action" href="#request">{t.talk} <span>↗</span></a>
        </div>
        <button className="sd-menu-toggle" type="button" aria-label={isArabic ? 'فتح القائمة' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><span/><span/></button>
      </div>
    </header>

    <section id="home" className="sd-hero">
      <div className="sd-hero-photo" style={{ backgroundImage: `url("${siteMedia.hero || defaultMedia.hero}")` }}/>
      <div className="sd-hero-shade"/>
      <div className="sd-container sd-hero-layout">
        <div className="sd-hero-copy">
          <div className="sd-kicker sd-hero-kicker"><i/> {t.heroKicker}</div>
          <h1>{t.heroTitle1}<br/><em>{t.heroTitle2}</em></h1>
          <p>{t.heroBody}</p>
          <div className="sd-hero-actions"><a href="#projects" className="sd-btn sd-btn-light">{t.explore} <span>↙</span></a><a href="#request" className="sd-text-btn">{t.start} <span>←</span></a></div>
          <div className="sd-hero-footnote"><span/> {t.designed}</div>
        </div>
        <div className="sd-hero-side" aria-hidden="true"><div className="sd-outline-number">01</div><div className="sd-hero-caption"><b>{isArabic ? <>مساحات<br/>لها معنى.</> : <>Spaces<br/>with meaning.</>}</b><span>{t.heroCaptionSmall}</span></div><div className="sd-vertical-word">SIRI / DESIGNS</div></div>
      </div>
      <a className="sd-scroll-cue" href="#about"><span>{t.scroll}</span><i>↓</i></a>
    </section>

    <div className="sd-marquee" aria-label="Siri Designs services"><div className="sd-marquee-track">{Array.from({ length: 2 }).map((_, i) => <span key={i}>{t.marquee.map((item, index) => <span key={`${i}-${index}`}>{item} <b>✳</b> </span>)}</span>)}</div></div>

    <section className="sd-about sd-section" id="about">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">{t.aboutIndex}</span><span className="sd-section-aside">{t.aboutAside}</span></div>
        <div className="sd-about-grid">
          <div className="sd-about-title sd-reveal"><span className="sd-mini-label">{t.approach}</span><h2>{t.aboutTitle1}<br/>{t.aboutTitle2}<br/><em>{t.aboutTitle3}</em></h2></div>
          <div className="sd-about-content sd-reveal"><p>{aboutText}</p><p className="sd-about-sub">{t.aboutSub}</p><a href="#contact" className="sd-underlink">{t.discover} <span>↙</span></a><div className="sd-about-stamp"><b>S</b><span>{isArabic ? <>التفاصيل<br/>تصنع الفرق</> : <>DETAILS<br/>MATTER</>}</span></div></div>
        </div>
        {siteMedia.about && <div className="sd-about-photo sd-reveal"><img src={siteMedia.about} alt={isArabic ? 'صورة من أعمال سيري ديزاينز' : 'Siri Designs featured interior'} loading="lazy"/></div>}
        <div className="sd-process sd-reveal">{t.process.map((item, index) => <div key={index}><b>{String(index + 1).padStart(2, '0')}</b><span>{item}</span></div>)}</div>
      </div>
    </section>

    <section id="services" className="sd-services sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">{t.servicesIndex}</span><span className="sd-section-aside">{t.servicesAside}</span></div>
        <div className="sd-heading-row sd-reveal"><h2>{t.serviceHeading1} <em>{t.serviceHeading2}</em><br/>{t.serviceHeading3}</h2><p>{t.servicesIntro}</p></div>
        <div className="sd-service-grid">{services.filter((service) => service.active !== false).sort((a, b) => a.sortOrder - b.sortOrder).map((service, index) => <article className="sd-service-card sd-reveal" key={service.id}>
          <div className="sd-service-image" style={{ backgroundImage: `url("${service.imageUrl || defaultMedia.about}")` }}><span className="sd-service-tag">{isArabic ? service.tagAr || service.tagEn : service.tagEn || service.tagAr}</span><span className="sd-service-no">{String(index + 1).padStart(2, '0')}</span></div>
          <div className="sd-service-info"><h3>{isArabic ? service.nameAr || service.nameEn : service.nameEn || service.nameAr}</h3><p>{isArabic ? service.descAr || service.descEn : service.descEn || service.descAr}</p><a href="#request" aria-label={`${t.exploreService}: ${isArabic ? service.nameAr : service.nameEn}`}>{t.exploreService} <span>↙</span></a></div>
        </article>)}</div>
      </div>
    </section>

    <section className="sd-projects sd-section" id="projects">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">{t.projectsIndex}</span><span className="sd-section-aside">{t.projectsAside}</span></div>
        <div className="sd-heading-row sd-reveal"><h2>{t.projectsHeading1}<br/><em>{t.projectsHeading2}</em></h2><p>{t.projectsIntro}</p></div>
        {portfolioLoadError ? <div className="sd-project-empty sd-reveal sd-visible"><span className="sd-empty-symbol">!</span><div><b>{t.projectErrorTitle}</b><p>{t.projectErrorText}</p></div></div> : projects.length ? <div className="sd-project-grid">{projects.map((p, i) => <article className={`sd-project-card sd-reveal sd-project-${i % 3}`} key={p.id}>
          <div className="sd-project-image">{p.image_url ? <img src={p.image_url} alt={`${isArabic ? p.title_ar || p.title : p.title} — ${(isArabic ? p.category_ar || p.category : p.category) || t.projectLabel}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async"/> : <div className="sd-project-empty-image">SIRI / PROJECT</div>}<span className="sd-project-count">{String(i + 1).padStart(2, '0')}</span></div>
          <div className="sd-project-info"><div><span>{(isArabic ? p.category_ar || p.category : p.category) || t.projectLabel}</span><h3>{isArabic ? p.title_ar || p.title : p.title}</h3>{p.location && <small>{p.location}</small>}</div><span className="sd-project-arrow">↙</span></div>
          {(isArabic ? p.description_ar || p.description : p.description) && <p className="sd-project-desc">{isArabic ? p.description_ar || p.description : p.description}</p>}
        </article>)}</div> : <div className="sd-project-empty sd-reveal"><span className="sd-empty-symbol">✳</span><div><b>{t.projectEmptyTitle}</b><p>{t.projectEmptyText}</p></div><a href="#request">{t.becomeProject} <span>↙</span></a></div>}
      </div>
    </section>

    <section className="sd-clients sd-section" id="clients">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">{t.clientsIndex}</span><span className="sd-section-aside">{t.clientsAside}</span></div>
        <div className="sd-heading-row sd-reveal"><h2>{t.clientsHeading1}<br/><em>{t.clientsHeading2}</em></h2><p>{t.clientsIntro}</p></div>
        {clients.length ? <div className="sd-client-row">{clients.map((c) => <article className="sd-client-card sd-reveal" key={c.id}>{c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy"/> : <b>{c.name}</b>}{c.logo_url && <span>{c.name}</span>}{c.note && <small>{c.note}</small>}</article>)}</div> : <div className="sd-client-note sd-reveal"><span>✳</span> {t.clientsEmpty}</div>}
      </div>
    </section>

    <section className="sd-quote"><div className="sd-container sd-quote-inner"><span className="sd-index">{t.philosophy}</span><p>{t.quote1}<br/>{t.quote2} <em>{t.quote3}</em></p><a href="#request">{t.quoteCta} <span>↙</span></a><div className="sd-quote-mark">“</div></div></section>

    <section id="request" className="sd-contact sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">{t.contactIndex}</span><span className="sd-section-aside">{t.contactAside}</span></div>
        <div className="sd-contact-grid">
          <div className="sd-contact-copy sd-reveal"><span className="sd-mini-label">{t.contactKicker}</span><h2>{t.contactTitle1}<br/><em>{t.contactTitle2}</em></h2><p>{t.contactBody}</p>
            <div className="sd-direct-contact"><span>{t.direct}</span>
              {companyPhones.length ? companyPhones.map((phone, index) => <a key={`${phone}-${index}`} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>) : <b>{t.addPhone}</b>}
              {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{addressText && <small>{addressText}</small>}
              {companyLocationUrl && <a href={companyLocationUrl} target="_blank" rel="noopener noreferrer">{t.viewLocation} ↗</a>}
            </div>
          </div>
          <form className="sd-form sd-reveal" onSubmit={submit}>
            <div className="sd-form-head"><div><span>{t.formKicker}</span><h3>{t.formTitle}</h3></div><b>01 — 05</b></div>
            <div className="sd-form-row"><label>{t.fullName} *<input name="name" required maxLength={100} placeholder={isArabic ? 'اسمك' : 'Your name'}/></label><label>{t.phone} *<input name="phone" required type="tel" maxLength={30} placeholder={isArabic ? 'رقم هاتفك' : 'Your phone number'}/></label></div>
            <div className="sd-form-row"><label>{t.email}<input name="email" type="email" maxLength={150} placeholder="name@example.com"/></label><label>{t.serviceRequired} *<select name="service" required defaultValue=""><option value="" disabled>{t.selectService}</option>{services.filter((service) => service.active !== false).map((service) => <option key={service.id} value={service.nameEn}>{isArabic ? service.nameAr || service.nameEn : service.nameEn}</option>)}<option value="Other">{t.other}</option></select></label></div>
            <label>{t.budget}<select name="budget" defaultValue=""><option value="">{t.optional}</option>{t.budgetOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label>{t.details}<textarea name="details" rows={3} maxLength={3000} placeholder={t.detailsPlaceholder}/></label>
            {error && <p className="sd-form-error" role="alert">{error}</p>}{sent && <p className="sd-form-success" role="status">{t.success}</p>}{emailWarning && <p className="sd-form-error" role="status">{emailWarning}</p>}
            <button className="sd-submit" disabled={busy}>{busy ? t.submitting : t.submit} <span>↙</span></button><small className="sd-privacy">{t.privacy}</small>
          </form>
        </div>
      </div>
    </section>

    <footer className="sd-footer" id="contact"><div className="sd-container"><div className="sd-footer-main">
      <div className="sd-footer-brand">{siteMedia.logo && siteMedia.logo !== '/logo.png' ? <img src={siteMedia.logo} alt="Siri Designs"/> : <Image src="/logo.png" alt="Siri Designs" width={100} height={88}/>}<b>Siri Designs</b><p>{t.footerTag}</p></div>
      <div><h4>{t.exploreFooter}</h4><a href="#about">{t.nav[0]}</a><a href="#services">{t.nav[1]}</a><a href="#projects">{t.nav[2]}</a><a href="#clients">{t.nav[3]}</a></div>
      <div><h4>{t.contactFooter}</h4>{companyPhones.map((phone, index) => <a key={`${phone}-${index}`} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>)}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<p>{addressText}</p>{companyLocationUrl && <a href={companyLocationUrl} target="_blank" rel="noopener noreferrer">{t.viewLocation} ↗</a>}</div>
      <div><h4>{t.follow}</h4>{socialLinks.map(({ name, url, short }) => <a className="sd-social-link" key={name} href={url} target="_blank" rel="noreferrer"><span>{short}</span>{name} ↗</a>)}{whatsapp && <a className="sd-social-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><span>WA</span>{t.whatsapp} ↗</a>}{!socialLinks.length && !whatsapp && <p>{t.noSocial}</p>}</div>
    </div><div className="sd-footer-bottom"><span>© {new Date().getFullYear()} Siri Designs. {t.allRights}</span><span>Designed by <b>Tech Relation</b></span></div></div></footer>
    {whatsapp && <a className="sd-whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label={isArabic ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}><span>{t.whatsapp}</span><b>↗</b></a>}
  </main>;
}

function safeExternalUrl(value?: string) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try { const parsed = new URL(raw); return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : ''; }
  catch { return ''; }
}
