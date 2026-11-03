'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; title_ar?: string; category?: string; category_ar?: string; location?: string; image_url?: string; description?: string; description_ar?: string };
<<<<<<< HEAD
type MallProject = { id: string; nameEn: string; nameAr: string; portfolioProjectId?: string; clientId?: string; brandNameEn?: string; brandNameAr?: string; brandLogoUrl?: string; imageUrl?: string; descriptionEn?: string; descriptionAr?: string };
type RetailLocation = { id: string; nameEn: string; nameAr: string; logoUrl: string; active: boolean; sortOrder: number; projects?: MallProject[] };
=======
type Client = { id: string; name: string; logo_url?: string; note?: string };
type Our Projects in Shopping Malls = { id: string; nameEn: string; nameAr: string; logoUrl: string; active: boolean; sortOrder: number };
>>>>>>> 7992e0233bf8422a6a2a7dadd804b02672058059
type Service = { id: string; nameEn: string; nameAr: string; descEn: string; descAr: string; imageUrl: string; tagEn: string; tagAr: string; active: boolean; sortOrder: number };
type SiteMedia = { hero: string; logo: string; about: string };
type Settings = { phone?: string; phones?: string[]; whatsapp?: string; email?: string; address?: string; address_ar?: string; location_url?: string; facebook?: string; instagram?: string; tiktok?: string; linkedin?: string; about?: string; about_ar?: string; services?: Service[]; retail_locations?: RetailLocation[]; site_media?: Partial<SiteMedia> };

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

const defaultMedia: SiteMedia = {
  hero: '/projects/dnp-storefront.webp',
  logo: '/logo.png',
  about: '/projects/dnp-interior.webp',
};

const defaultRetailLocations: RetailLocation[] = [
  { id: 'downtown', nameEn: 'Downtown', nameAr: 'داون تاون', logoUrl: '', active: true, sortOrder: 1 },
  { id: 'city-stars', nameEn: 'City Stars', nameAr: 'سيتي ستارز', logoUrl: '', active: true, sortOrder: 2 },
  { id: 'mall-of-egypt', nameEn: 'Mall of Egypt', nameAr: 'مول مصر', logoUrl: '', active: true, sortOrder: 3 },
  { id: 'marassi', nameEn: 'Marassi', nameAr: 'مراسي', logoUrl: '', active: true, sortOrder: 4 },
  { id: 'golden-square', nameEn: 'Golden Square', nameAr: 'جولدن سكوير', logoUrl: '', active: true, sortOrder: 5 },
  { id: 'san-stefano', nameEn: 'San Stefano', nameAr: 'سان ستيفانو', logoUrl: '', active: true, sortOrder: 6 },
  { id: 'mall-of-tanta', nameEn: 'Mall of Tanta', nameAr: 'مول طنطا', logoUrl: '', active: true, sortOrder: 7 },
  { id: 'city-center-maadi', nameEn: 'City Center Maadi', nameAr: 'سيتي سنتر المعادي', logoUrl: '', active: true, sortOrder: 8 },
  { id: 'genina-mall', nameEn: 'GENINA Mall', nameAr: 'جنينة مول', logoUrl: '', active: true, sortOrder: 9 },
  { id: 'the-yard-mall', nameEn: 'The Yard Mall', nameAr: 'ذا يارد مول', logoUrl: '', active: true, sortOrder: 10 },
];

const defaultServices: Service[] = [
  { id: 'interior-design', nameEn: 'Interior Design', nameAr: 'التصميم الداخلي', descEn: 'Concept development, space planning, and 3D visualization tailored to each retail brand.', descAr: 'تطوير الفكرة وتخطيط المساحات والتصور ثلاثي الأبعاد بما يتناسب مع هوية كل علامة تجارية.', imageUrl: '/projects/dnp-interior.webp', tagEn: 'DESIGN', tagAr: 'تصميم', active: true, sortOrder: 1 },
  { id: 'retail-fitout', nameEn: 'Fit-Out Contracting', nameAr: 'مقاولات وتجهيزات المحلات', descEn: 'Civil works, MEP, ceilings, flooring, lighting, and signage for branded retail spaces.', descAr: 'الأعمال المدنية والكهروميكانيكية والأسقف والأرضيات والإضاءة واللافتات للمساحات التجارية ذات الهوية الخاصة.', imageUrl: '/projects/dnp-storefront.webp', tagEn: 'FIT-OUT', tagAr: 'تجهيز وتشطيب', active: true, sortOrder: 2 },
  { id: 'furniture-decor', nameEn: 'Furniture & Décor Supply', nameAr: 'توريد الأثاث والديكور', descEn: 'Custom furnishings, shelving, and lighting units designed to support the retail experience.', descAr: 'أثاث مخصص ووحدات أرفف وإضاءة مصممة لدعم تجربة التسوق وإبراز المنتجات.', imageUrl: '/projects/fitout-display-wide.webp', tagEn: 'FURNITURE & DÉCOR', tagAr: 'أثاث وديكور', active: true, sortOrder: 3 },
  { id: 'maintenance', nameEn: 'Maintenance', nameAr: 'الصيانة والدعم', descEn: 'Ongoing monthly support for more than 45 stores, with fast response and scheduled preventive maintenance.', descAr: 'دعم وصيانة شهرية لأكثر من 45 متجرًا، مع فرق استجابة سريعة وصيانة وقائية مجدولة.', imageUrl: '/projects/site-ceiling-install.webp', tagEn: 'SUPPORT', tagAr: 'دعم وصيانة', active: true, sortOrder: 4 },
  { id: 'consulting-project-management', nameEn: 'Consulting & Project Management', nameAr: 'الاستشارات وإدارة المشروعات', descEn: 'Project supervision, budgeting, and ISO compliance support from concept through delivery.', descAr: 'الإشراف على المشروعات وإعداد الميزانيات ودعم التوافق مع معايير ISO من بداية الفكرة حتى التسليم.', imageUrl: '/projects/fitout-lighting-progress.webp', tagEn: 'PROJECT MANAGEMENT', tagAr: 'إدارة المشروعات', active: true, sortOrder: 5 },
];

const copy = {
  en: {
    nav: ['About', 'Vision & Values', 'Services', 'Our Work', 'Mall Projects', 'Contact'], talk: "Let's Talk", heroKicker: 'SIRI DESIGNS — RETAIL INTERIOR & FIT-OUT', heroTitle1: 'Retail spaces.', heroTitle2: 'Elevated by design.', heroBody: 'We transform retail visions into stunning, functional spaces. From interior design and fit-out to furnishing and ongoing support, we create exceptional branded retail environments.', explore: 'Explore Our Work', start: 'Start Your Project', designed: 'Designed Around Your Life', heroCaption: 'Spaces<br/>with meaning.', heroCaptionSmall: 'DESIGNED AROUND YOU', scroll: 'SCROLL TO EXPLORE', marquee: ['RETAIL INTERIOR DESIGN', 'FIT-OUT CONTRACTING', 'FURNITURE & DÉCOR', 'MAINTENANCE & SUPPORT'],
    aboutIndex: '01 / ABOUT US', aboutAside: 'OUR DESIGN PHILOSOPHY', approach: 'THE SIRI APPROACH', aboutTitle1: 'Retail spaces,', aboutTitle2: 'designed around', aboutTitle3: 'your brand.', aboutSub: 'We deliver turnkey projects for branded retail outlets, with high-quality results tailored to each client.', discover: 'Discover Our Approach', process: ['We listen and understand your vision', 'We plan and design with care', 'We build and oversee every detail', 'We deliver a space you love'],
    servicesIndex: '03 / WHAT WE DO', servicesAside: 'Our Services', serviceHeading1: 'From the first', serviceHeading2: 'idea,', serviceHeading3: 'to the final detail.', servicesIntro: 'We offer end-to-end retail solutions, from initial concept to ongoing support. Our expertise covers every aspect of project delivery and maintenance.', exploreService: 'Explore Service',
    projectsIndex: '04 / SELECTED WORK', projectsAside: 'Selected Projects', projectsHeading1: 'Our work', projectsHeading2: 'speaks for itself.', projectsIntro: 'Every project is a new beginning, and every detail is part of a story worth seeing.', projectErrorTitle: 'Our projects are temporarily unavailable.', projectErrorText: 'Please try again shortly.', projectEmptyTitle: 'Our next stories start here.', projectEmptyText: 'Add projects, photos, and descriptions in the admin dashboard and they will appear here automatically.', becomeProject: 'Become Our Next Project', projectLabel: 'PROJECT',
    clientsIndex: '05 / MALL PROJECTS', clientsAside: 'MALLS & RETAIL DESTINATIONS', clientsHeading1: 'Our Projects', clientsHeading2: 'in Shopping Malls.', clientsIntro: 'Choose a shopping mall to explore the retail brands and projects Siri Designs has delivered inside it.', clientsEmpty: 'Our mall projects will appear here once they are added in the admin dashboard.', locationsEmpty: 'Mall locations will appear here once they are added in the admin dashboard.', mallProjectsLabel: 'PROJECTS COMPLETED HERE', mallOpen: 'Explore Projects', mallClose: 'Close', mallNoProjects: 'No projects have been added for this mall yet.', mallProjectCount: 'projects completed', mallBrand: 'BRAND',
    philosophy: 'SIRI DESIGN PHILOSOPHY', quote1: 'We do not just design spaces', quote2: 'to be seen…', quote3: 'we design spaces to be felt.', quoteCta: "Let's Talk About Your Space",
    contactIndex: '07 / START A PROJECT', contactAside: 'Start a Project', contactKicker: "LET'S CREATE SOMETHING BEAUTIFUL", contactTitle1: 'Have an idea?', contactTitle2: 'We are ready.', contactBody: 'Tell us about the space you have in mind. Share a few project details and our team will get in touch to help you take the first step.', direct: 'Direct Contact', addPhone: 'Add your phone number in the admin dashboard', viewLocation: 'View Company Location', formKicker: 'PROJECT INQUIRY', formTitle: 'Tell Us About Your Project', fullName: 'Full Name', phone: 'Phone Number', email: 'Email Address', serviceRequired: 'Service Required', selectService: 'Select a service', other: 'Other', budget: 'Estimated Budget', optional: 'Optional', budgetOptions: ['Under EGP 100,000', 'EGP 100,000 – 300,000', 'EGP 300,000 – 700,000', 'Over EGP 700,000', 'Still to be determined'], details: 'Project Details', detailsPlaceholder: 'Space type, location, and anything else you would like to share...', submit: 'Submit Project Inquiry', submitting: 'Submitting your request...', privacy: 'Your information is secure and will only be used to follow up on your inquiry.', success: 'Your request has been submitted successfully. Thank you for choosing Siri Designs. Our team will contact you soon.', error: 'We could not submit your request. Please try again or contact us directly.', emailFailed: 'Your request was saved, but the email notification could not be sent. The request is still available in the admin dashboard.', emailMissing: 'Your request was saved. Email notifications are not configured yet.',
    footerTag: 'We design spaces that feel like you.', exploreFooter: 'Explore', contactFooter: 'Contact', follow: 'Follow Us', noSocial: 'Add social links in the admin dashboard', whatsapp: 'WhatsApp', allRights: 'All rights reserved.', language: 'العربية', light: 'Light mode', dark: 'Dark mode',
  },
  ar: {
    nav: ['من نحن', 'الرؤية والقيم', 'خدماتنا', 'أعمالنا', 'مشروعات المولات', 'تواصل معنا'], talk: 'ابدأ التواصل', heroKicker: 'سيري ديزاينز — تصميم وتجهيز مساحات البيع بالتجزئة', heroTitle1: 'مساحات تجارية', heroTitle2: 'ترتقي بالتصميم.', heroBody: 'نحوّل رؤى العلامات التجارية إلى مساحات بيع بالتجزئة مميزة وعملية. من التصميم الداخلي والتجهيز إلى الأثاث والدعم المستمر، نصنع بيئات تجارية تعكس هوية كل علامة.', explore: 'شاهد أعمالنا', start: 'ابدأ مشروعك', designed: 'تصميم يناسب أسلوب حياتك', heroCaption: 'مساحات<br/>لها معنى.', heroCaptionSmall: 'مصممة خصيصًا لك', scroll: 'اكتشف المزيد', marquee: ['تصميم مساحات البيع بالتجزئة', 'مقاولات وتجهيزات', 'الأثاث والديكور', 'الصيانة والدعم'],
    aboutIndex: '01 / من نحن', aboutAside: 'فلسفتنا في التصميم', approach: 'منهج سيري', aboutTitle1: 'مساحات تجارية', aboutTitle2: 'تعكس هوية', aboutTitle3: 'علامتك.', aboutSub: 'ننفذ مشروعات متكاملة وجاهزة للتشغيل لمتاجر تحمل هويات تجارية مميزة، بجودة عالية وحلول مصممة حسب الاحتياج.', discover: 'اكتشف أسلوبنا', process: ['نستمع إليك ونفهم رؤيتك', 'نخطط ونصمم بعناية', 'ننّفذ ونتابع كل التفاصيل', 'نسلمك مساحة تحبها'],
    servicesIndex: '03 / ماذا نقدم', servicesAside: 'خدماتنا', serviceHeading1: 'من أول', serviceHeading2: 'فكرة،', serviceHeading3: 'حتى آخر تفصيلة.', servicesIntro: 'نقدم حلولًا متكاملة لمساحات البيع بالتجزئة، من الفكرة الأولى وحتى الدعم المستمر. تشمل خبراتنا مختلف مراحل التنفيذ والتجهيز والصيانة.', exploreService: 'اكتشف الخدمة',
    projectsIndex: '04 / أعمال مختارة', projectsAside: 'مشروعات مختارة', projectsHeading1: 'أعمالنا', projectsHeading2: 'تتحدث عن نفسها.', projectsIntro: 'كل مشروع بداية جديدة، وكل تفصيلة جزء من حكاية تستحق أن تُروى.', projectErrorTitle: 'مشروعاتنا غير متاحة مؤقتًا.', projectErrorText: 'حاول مرة أخرى بعد قليل.', projectEmptyTitle: 'حكايتنا القادمة تبدأ معك.', projectEmptyText: 'أضف المشروعات والصور والأوصاف من لوحة الإدارة لتظهر هنا تلقائيًا.', becomeProject: 'كن مشروعنا القادم', projectLabel: 'مشروع',
    clientsIndex: '05 / مشروعات المولات', clientsAside: 'المراكز التجارية ووجهات التجزئة', clientsHeading1: 'مشروعاتنا', clientsHeading2: 'في المولات التجارية.', clientsIntro: 'اختر المول لاستكشاف العلامات التجارية والمشروعات التي نفذتها Siri Designs بداخله.', clientsEmpty: 'ستظهر مشروعات المولات هنا بعد إضافتها من لوحة الإدارة.', locationsEmpty: 'ستظهر المراكز التجارية هنا بعد إضافتها من لوحة الإدارة.', mallProjectsLabel: 'المشروعات المنفذة هنا', mallOpen: 'استكشف المشروعات', mallClose: 'إغلاق', mallNoProjects: 'لم تتم إضافة مشروعات لهذا المول بعد.', mallProjectCount: 'مشروعات منفذة', mallBrand: 'العلامة التجارية',
    philosophy: 'فلسفة سيري ديزاينز', quote1: 'نحن لا نصمم مساحات', quote2: 'لتُرى فقط…', quote3: 'بل نصمم مساحات لتُشعَر.', quoteCta: 'لنتحدث عن مساحتك',
    contactIndex: '07 / ابدأ مشروعك', contactAside: 'ابدأ مشروعًا جديدًا', contactKicker: 'لنصنع شيئًا جميلًا معًا', contactTitle1: 'لديك فكرة؟', contactTitle2: 'نحن جاهزون.', contactBody: 'احكِ لنا عن المساحة التي تتخيلها. شاركنا بعض تفاصيل مشروعك وسيتواصل معك فريقنا لمساعدتك في أول خطوة.', direct: 'تواصل مباشر', addPhone: 'أضف رقم هاتفك من لوحة الإدارة', viewLocation: 'عرض موقع الشركة', formKicker: 'طلب مشروع جديد', formTitle: 'أخبرنا عن مشروعك', fullName: 'الاسم بالكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني', serviceRequired: 'الخدمة المطلوبة', selectService: 'اختر الخدمة', other: 'أخرى', budget: 'الميزانية المتوقعة', optional: 'اختياري', budgetOptions: ['أقل من 100,000 جنيه', 'من 100,000 إلى 300,000 جنيه', 'من 300,000 إلى 700,000 جنيه', 'أكثر من 700,000 جنيه', 'لم يتم تحديدها بعد'], details: 'تفاصيل المشروع', detailsPlaceholder: 'نوع المساحة والموقع وأي تفاصيل أخرى تود مشاركتها...', submit: 'إرسال طلب المشروع', submitting: 'جارٍ إرسال طلبك...', privacy: 'بياناتك آمنة وستُستخدم فقط للتواصل معك بخصوص طلبك.', success: 'تم إرسال طلبك بنجاح. شكرًا لاختيارك Siri Designs، سيتواصل معك فريقنا قريبًا.', error: 'تعذر إرسال طلبك. حاول مرة أخرى أو تواصل معنا مباشرة.', emailFailed: 'تم حفظ طلبك، لكن تعذر إرسال إشعار البريد الإلكتروني. طلبك موجود في لوحة الإدارة.', emailMissing: 'تم حفظ طلبك. لم يتم إعداد إشعارات البريد الإلكتروني بعد.',
    footerTag: 'نصمم مساحات تشبهك.', exploreFooter: 'استكشف', contactFooter: 'تواصل معنا', follow: 'تابعنا', noSocial: 'أضف روابط التواصل الاجتماعي من لوحة الإدارة', whatsapp: 'واتساب', allRights: 'جميع الحقوق محفوظة.', language: 'English', light: 'الوضع الفاتح', dark: 'الوضع الداكن',
  },
} as const;

const companyProfileCopy = {
  en: {
    visionTitle: 'Our Vision & Mission', visionLabel: 'OUR VISION', missionLabel: 'OUR MISSION', valuesTitle: 'Our Core Values',
    vision: 'To be the go-to partner for premium retail interior solutions across Egypt and the region.',
    mission: 'To deliver exceptional design, fit-out, and furnishing services that align with brand identity and ensure operational excellence.',
    valuesIntro: 'Our values guide every project. We prioritize meticulous work and client needs, while innovation drives our design solutions.',
    values: ['Quality & Precision', 'Client-Centered Approach', 'Innovation in Design', 'Timely Delivery'],
    whyTitle: 'Why Choose Siri Designs?', whyIntro: 'We are uniquely positioned for retail excellence. Our specialized focus ensures tailored solutions. We manage projects end to end, supported by an expert team.',
    whyChoose: [
      { title: 'Retail Specialization', body: 'Specialized in retail brand outlets inside malls. We understand unique retail challenges.' },
      { title: 'End-to-End Solutions', body: 'From design to handover, we manage everything. A single point of contact for your project.' },
      { title: 'Expert Team', body: 'A team of skilled architects, engineers, and project managers delivering top-tier quality.' },
    ],
    locationsTitle: 'Our Projects in Shopping Malls',
    maintenanceTitle: 'Maintenance & Support', maintenanceIntro: 'Our commitment extends beyond project completion. We help keep retail spaces pristine, minimize downtime, and maximize appeal.',
    maintenanceCards: [
      { value: '45+', title: 'Stores Under Maintenance', body: 'Ensuring continuous operational excellence.' },
      { value: 'Fast', title: 'Response Teams', body: 'Addressing issues promptly and efficiently.' },
      { value: 'Scheduled', title: 'Preventive Maintenance', body: 'Proactive care to extend asset lifespan.' },
    ],
  },
  ar: {
    visionTitle: 'رؤيتنا ورسالتنا', visionLabel: 'رؤيتنا', missionLabel: 'رسالتنا', valuesTitle: 'قيمنا الأساسية',
    vision: 'أن نكون الشريك الأول للحلول المتميزة في التصميم الداخلي لمساحات البيع بالتجزئة في مصر والمنطقة.',
    mission: 'تقديم خدمات استثنائية في التصميم والتجهيز والتأثيث، بما يتوافق مع هوية العلامة التجارية ويضمن التميز التشغيلي.',
    valuesIntro: 'توجّه قيمنا كل مشروع. نعطي الأولوية لدقة التنفيذ واحتياجات العملاء، ويقود الابتكار حلولنا التصميمية.',
    values: ['الجودة والدقة', 'التركيز على العميل', 'الابتكار في التصميم', 'الالتزام بمواعيد التسليم'],
    whyTitle: 'لماذا تختار Siri Designs؟', whyIntro: 'نتميز بتخصصنا في قطاع التجزئة، ونقدم حلولًا مصممة حسب الاحتياج، مع إدارة متكاملة للمشروع وفريق من الخبراء.',
    whyChoose: [
      { title: 'التخصص في قطاع التجزئة', body: 'نتخصص في تجهيز متاجر العلامات التجارية داخل المولات، وندرك التحديات الخاصة بهذا القطاع.' },
      { title: 'حلول متكاملة من البداية للنهاية', body: 'نتولى جميع المراحل من التصميم حتى التسليم، مع نقطة اتصال واحدة لإدارة مشروعك.' },
      { title: 'فريق من الخبراء', body: 'يضم فريقنا مهندسين معماريين ومهندسين ومديري مشروعات ذوي مهارة، لتقديم جودة عالية.' },
    ],
    locationsTitle: 'مشروعاتنا في المراكز التجارية',
    maintenanceTitle: 'الصيانة والدعم', maintenanceIntro: 'يمتد التزامنا إلى ما بعد تسليم المشروع. نقدم دعمًا وصيانة يحافظان على جاهزية المساحات التجارية، ويقللان فترات التوقف، ويحافظان على جاذبيتها.',
    maintenanceCards: [
      { value: '+45', title: 'متجرًا تحت الصيانة', body: 'لضمان استمرارية وكفاءة التشغيل.' },
      { value: 'سريع', title: 'فرق الاستجابة', body: 'للتعامل مع المشكلات بسرعة وكفاءة.' },
      { value: 'مجدولة', title: 'الصيانة الوقائية', body: 'رعاية استباقية لإطالة العمر الافتراضي للأصول.' },
    ],
  },
} as const;

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolioLoadError, setPortfolioLoadError] = useState('');
  const [retailLocations, setRetailLocations] = useState<RetailLocation[]>(defaultRetailLocations);
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
  const [selectedMall, setSelectedMall] = useState<RetailLocation | null>(null);

  const t = copy[language];
  const isArabic = language === 'ar';
  const profile = companyProfileCopy[language];

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
    if (!selectedMall) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedMall(null); };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [selectedMall]);

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
  }, [projects, services]);

  useEffect(() => {
    if (!supabase) {
      setPortfolioLoadError(isArabic ? 'الموقع غير متصل بقاعدة البيانات. راجع إعدادات Supabase في Vercel.' : 'The website is not connected to its database. Check the Supabase environment variables in Vercel.');
      return;
    }
    let alive = true;
    (async () => {
      const [p, s] = await Promise.all([
        supabase.from('projects').select('id,title,title_ar,category,category_ar,location,image_url,description,description_ar').eq('published', true).order('created_at', { ascending: false }).limit(50),
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
      if (s.data?.value) {
        const value = s.data.value as Settings;
        setSettings(value);
        if (Array.isArray(value.services)) setServices(value.services.filter((service) => service.active !== false).sort((a, b) => a.sortOrder - b.sortOrder));
        if (Array.isArray(value.retail_locations)) setRetailLocations(value.retail_locations.filter((location) => location.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
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
    ? (settings.about_ar || (settings.about && /[\u0600-\u06FF]/.test(settings.about) ? settings.about : 'سيري ديزاينز شركة مصرية متخصصة في تقديم حلول متكاملة للتصميم الداخلي وتجهيز متاجر البيع بالتجزئة. نقدم نتائج عالية الجودة ومصممة حسب احتياجات كل عميل، ونتولى تنفيذ المشروعات الجاهزة للتشغيل للمتاجر ذات الهوية التجارية.'))
    : (settings.about && !/[\u0600-\u06FF]/.test(settings.about) ? settings.about : 'Siri Designs is a premier Egyptian company specializing in comprehensive retail interior solutions. We deliver high-quality, tailored results and turnkey projects for branded retail outlets.');
  const addressText = isArabic ? (settings.address_ar || settings.address || 'الشيراتون، مصر الجديدة – خلف فندق هيلتون، القاهرة، مصر') : (settings.address && !/[\u0600-\u06FF]/.test(settings.address) ? settings.address : 'Sheraton, Heliopolis – Behind Hilton Hotel, Cairo, Egypt');
  const contactEmail = settings.email || 'siri.design@outlook.com';
  const whatsapp = settings.whatsapp?.replace(/\D/g, '');
  const companyPhones = (Array.isArray(settings.phones) ? settings.phones : []).map((phone) => String(phone || '').trim()).filter(Boolean);
  if (!companyPhones.length && settings.phone?.trim()) companyPhones.push(settings.phone.trim());
  if (!companyPhones.length) companyPhones.push('+2 0111 877 7569', '+2 0112 688 9843');
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
          {t.nav.map((label, index) => <a key={index} href={['#about', '#vision', '#services', '#projects', '#clients', '#contact'][index]} onClick={() => setMenuOpen(false)}>{label}</a>)}
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
      <div className="sd-about-backdrop">
        {siteMedia.about && <div className="sd-about-photo" aria-hidden="true"><img src={siteMedia.about} alt="" loading="lazy"/></div>}
        <div className="sd-container sd-about-content-wrap">
          <div className="sd-section-top sd-reveal"><span className="sd-index">{t.aboutIndex}</span><span className="sd-section-aside">{t.aboutAside}</span></div>
          <div className="sd-about-grid">
            <div className="sd-about-title sd-reveal"><span className="sd-mini-label">{t.approach}</span><h2>{t.aboutTitle1}<br/>{t.aboutTitle2}<br/><em>{t.aboutTitle3}</em></h2></div>
            <div className="sd-about-content sd-reveal"><p>{aboutText}</p><p className="sd-about-sub">{t.aboutSub}</p><a href="#contact" className="sd-underlink">{t.discover} <span>↙</span></a><div className="sd-about-stamp"><b>S</b><span>{isArabic ? <>التفاصيل<br/>تصنع الفرق</> : <>DETAILS<br/>MATTER</>}</span></div></div>
          </div>
          <div className="sd-process sd-reveal">{t.process.map((item, index) => <div key={index}><b>{String(index + 1).padStart(2, '0')}</b><span>{item}</span></div>)}</div>
        </div>
      </div>
    </section>

    <section id="vision" className="sd-profile-section sd-section">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">02 / {isArabic ? 'رؤيتنا وقيمنا' : 'OUR DIRECTION'}</span><span className="sd-section-aside">{profile.visionTitle}</span></div>
        <div className="sd-vm-grid">
          <article className="sd-vm-card sd-reveal"><span className="sd-mini-label">{profile.visionLabel}</span><h3>{profile.vision}</h3></article>
          <article className="sd-vm-card sd-vm-card-accent sd-reveal"><span className="sd-mini-label">{profile.missionLabel}</span><h3>{profile.mission}</h3></article>
        </div>
        <div className="sd-values-head sd-reveal"><div><span className="sd-mini-label">SIRI DESIGNS</span><h2>{profile.valuesTitle}</h2></div><p>{profile.valuesIntro}</p></div>
        <div className="sd-values-grid">{profile.values.map((value, index) => <article className="sd-value-card sd-reveal" key={index}><b>{String(index + 1).padStart(2, '0')}</b><span>{value}</span></article>)}</div>
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

    <section className="sd-why-section sd-section" id="why-siri">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">WHY SIRI DESIGNS</span><span className="sd-section-aside">{profile.whyTitle}</span></div>
        <div className="sd-why-heading sd-reveal"><h2>{profile.whyTitle}</h2><p>{profile.whyIntro}</p></div>
        <div className="sd-why-grid">{profile.whyChoose.map((item, index) => <article className="sd-why-card sd-reveal" key={index}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
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
        <div className="sd-market-grid sd-market-grid-single">
          <div className="sd-market-panel sd-reveal"><div className="sd-location-heading"><span className="sd-mini-label">{profile.locationsTitle}</span><span className="sd-location-count">{retailLocations.filter((location) => location.active !== false).length.toString().padStart(2, '0')}</span></div>
            {retailLocations.filter((location) => location.active !== false).sort((a, b) => a.sortOrder - b.sortOrder).length ? <div className="sd-location-grid">{retailLocations.filter((location) => location.active !== false).sort((a, b) => a.sortOrder - b.sortOrder).map((location) => {
              const mallProjectCount = (location.projects || []).filter((item) => item.nameEn?.trim() || item.nameAr?.trim() || item.portfolioProjectId || item.brandNameEn?.trim() || item.brandNameAr?.trim()).length;
              return <button type="button" className="sd-location-card" key={location.id} onClick={() => setSelectedMall(location)} aria-label={`${isArabic ? location.nameAr || location.nameEn : location.nameEn} — ${t.mallOpen}`}>
                <div className="sd-location-logo">{location.logoUrl ? <img src={location.logoUrl} alt={`${isArabic ? location.nameAr || location.nameEn : location.nameEn} logo`} loading="lazy"/> : <span>SD</span>}</div>
                <h3>{isArabic ? location.nameAr || location.nameEn : location.nameEn}</h3>
                <span className="sd-location-open">{t.mallOpen} <b>↗</b></span>
                <small className="sd-location-project-count">{mallProjectCount} {t.mallProjectCount}</small>
              </button>;
            })}</div> : <p className="sd-location-empty">{t.locationsEmpty}</p>}
          </div>
        </div>
      </div>
      {selectedMall && <div className="sd-mall-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMall(null); }}>
        <section className="sd-mall-modal" role="dialog" aria-modal="true" aria-labelledby="sd-mall-modal-title" dir={isArabic ? 'rtl' : 'ltr'}>
          <button type="button" className="sd-mall-modal-close" onClick={() => setSelectedMall(null)} aria-label={t.mallClose}>×</button>
          <div className="sd-mall-modal-head">
            <div className="sd-mall-modal-logo">{selectedMall.logoUrl ? <img src={selectedMall.logoUrl} alt=""/> : <span>SD</span>}</div>
            <div><span className="sd-mini-label">{t.mallProjectsLabel}</span><h2 id="sd-mall-modal-title">{isArabic ? selectedMall.nameAr || selectedMall.nameEn : selectedMall.nameEn}</h2><p>{(selectedMall.projects || []).filter((item) => item.nameEn?.trim() || item.nameAr?.trim() || item.portfolioProjectId || item.brandNameEn?.trim() || item.brandNameAr?.trim()).length} {t.mallProjectCount}</p></div>
          </div>
          {(() => {
            const mallProjects = (selectedMall.projects || []).filter((item) => item.nameEn?.trim() || item.nameAr?.trim() || item.portfolioProjectId || item.brandNameEn?.trim() || item.brandNameAr?.trim());
            if (!mallProjects.length) return <div className="sd-mall-modal-empty"><span>✳</span><p>{t.mallNoProjects}</p></div>;
            return <div className="sd-mall-detail-grid">{mallProjects.map((item, index) => {
              const linkedProject = projects.find((project) => project.id === item.portfolioProjectId);
              const imageUrl = item.imageUrl || linkedProject?.image_url || '';
              const brandName = isArabic ? item.brandNameAr || item.brandNameEn : item.brandNameEn || item.brandNameAr;
              const projectName = isArabic ? item.nameAr || linkedProject?.title_ar || item.nameEn || linkedProject?.title : item.nameEn || linkedProject?.title || item.nameAr;
              const description = isArabic ? item.descriptionAr || linkedProject?.description_ar || item.descriptionEn || linkedProject?.description : item.descriptionEn || linkedProject?.description || item.descriptionAr || linkedProject?.description_ar;
              return <article className="sd-mall-detail-card" key={item.id}>
                {imageUrl ? <div className="sd-mall-detail-image"><img src={imageUrl} alt={projectName || brandName || (isArabic ? 'صورة المشروع' : 'Project image')} loading="lazy"/></div> : <div className="sd-mall-detail-image sd-mall-detail-placeholder"><span>SIRI / PROJECT</span></div>}
                <div className="sd-mall-detail-copy">
                  {(brandName || item.brandLogoUrl) && <div className="sd-mall-brand-line">{item.brandLogoUrl && <img src={item.brandLogoUrl} alt=""/>}<span>{brandName || t.mallBrand}</span></div>}
                  <span className="sd-mall-detail-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{projectName || brandName || (isArabic ? 'مشروع تجاري' : 'Retail Project')}</h3>
                  {description && <p>{description}</p>}
                </div>
              </article>;
            })}</div>;
          })()}
        </section>
      </div>}
    </section>

    <section className="sd-maintenance-section sd-section" id="maintenance">
      <div className="sd-container">
        <div className="sd-section-top sd-reveal"><span className="sd-index">06 / AFTER HANDOVER</span><span className="sd-section-aside">{profile.maintenanceTitle}</span></div>
        <div className="sd-maintenance-heading sd-reveal"><h2>{profile.maintenanceTitle}</h2><p>{profile.maintenanceIntro}</p></div>
        <div className="sd-maintenance-grid">{profile.maintenanceCards.map((item, index) => <article className="sd-maintenance-card sd-reveal" key={index}><b>{item.value}</b><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
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
              {contactEmail && <a href={`mailto:${contactEmail}`}>{contactEmail}</a>}{addressText && <small>{addressText}</small>}
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
      <div><h4>{t.exploreFooter}</h4><a href="#about">{t.nav[0]}</a><a href="#vision">{t.nav[1]}</a><a href="#services">{t.nav[2]}</a><a href="#projects">{t.nav[3]}</a><a href="#clients">{t.nav[4]}</a></div>
      <div><h4>{t.contactFooter}</h4>{companyPhones.map((phone, index) => <a key={`${phone}-${index}`} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>)}{contactEmail && <a href={`mailto:${contactEmail}`}>{contactEmail}</a>}<p>{addressText}</p>{companyLocationUrl && <a href={companyLocationUrl} target="_blank" rel="noopener noreferrer">{t.viewLocation} ↗</a>}</div>
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
