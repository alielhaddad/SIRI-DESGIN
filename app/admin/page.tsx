'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; title_ar: string; category: string; category_ar: string; location: string; image_url: string; description: string; description_ar: string; published: boolean };
type Client = { id: string; name: string; logo_url: string; note: string; active: boolean };
type Lead = { id: string; name: string; phone: string; email: string; service: string; budget: string; details: string; status: string; created_at: string };
type Service = { id: string; nameEn: string; nameAr: string; descEn: string; descAr: string; imageUrl: string; tagEn: string; tagAr: string; active: boolean; sortOrder: number };
type MallProject = { id: string; nameEn: string; nameAr: string; portfolioProjectId?: string; clientId?: string; brandNameEn?: string; brandNameAr?: string; brandLogoUrl?: string; imageUrl?: string; descriptionEn?: string; descriptionAr?: string };
type RetailLocation = { id: string; nameEn: string; nameAr: string; logoUrl: string; active: boolean; sortOrder: number; projects?: MallProject[] };
type SiteMedia = { hero: string; logo: string; about: string };
type Settings = { phone: string; phones: string[]; whatsapp: string; email: string; address: string; address_ar: string; location_url: string; facebook: string; instagram: string; tiktok: string; linkedin: string; about: string; about_ar: string; services?: Service[]; retail_locations?: RetailLocation[]; site_media?: Partial<SiteMedia> };
const blankProject: Omit<Project, 'id'> = { title: '', title_ar: '', category: 'Complete Fit-Out', category_ar: '', location: '', image_url: '', description: '', description_ar: '', published: true };
const blankClient: Omit<Client, 'id'> = { name: '', logo_url: '', note: '', active: true };
const blankSettings: Settings = { phone: '', phones: [''], whatsapp: '', email: '', address: '', address_ar: '', location_url: '', facebook: '', instagram: '', tiktok: '', linkedin: '', about: '', about_ar: '' };
const defaultSiteMedia: SiteMedia = { hero: '/projects/dnp-storefront.webp', logo: '/logo.png', about: '/projects/dnp-interior.webp' };
const defaultServices: Service[] = [
  { id: 'interior-design', nameEn: 'Interior Design', nameAr: 'التصميم الداخلي', descEn: 'Concept development, space planning, and 3D visualization tailored to each retail brand.', descAr: 'تطوير الفكرة وتخطيط المساحات والتصور ثلاثي الأبعاد بما يتناسب مع هوية كل علامة تجارية.', imageUrl: '/projects/dnp-interior.webp', tagEn: 'DESIGN', tagAr: 'تصميم', active: true, sortOrder: 1 },
  { id: 'retail-fitout', nameEn: 'Fit-Out Contracting', nameAr: 'مقاولات وتجهيزات المحلات', descEn: 'Civil works, MEP, ceilings, flooring, lighting, and signage for branded retail spaces.', descAr: 'الأعمال المدنية والكهروميكانيكية والأسقف والأرضيات والإضاءة واللافتات للمساحات التجارية ذات الهوية الخاصة.', imageUrl: '/projects/dnp-storefront.webp', tagEn: 'FIT-OUT', tagAr: 'تجهيز وتشطيب', active: true, sortOrder: 2 },
  { id: 'furniture-decor', nameEn: 'Furniture & Décor Supply', nameAr: 'توريد الأثاث والديكور', descEn: 'Custom furnishings, shelving, and lighting units designed to support the retail experience.', descAr: 'أثاث مخصص ووحدات أرفف وإضاءة مصممة لدعم تجربة التسوق وإبراز المنتجات.', imageUrl: '/projects/fitout-display-wide.webp', tagEn: 'FURNITURE & DÉCOR', tagAr: 'أثاث وديكور', active: true, sortOrder: 3 },
  { id: 'maintenance', nameEn: 'Maintenance', nameAr: 'الصيانة والدعم', descEn: 'Ongoing monthly support for more than 45 stores, with fast response and scheduled preventive maintenance.', descAr: 'دعم وصيانة شهرية لأكثر من 45 متجرًا، مع فرق استجابة سريعة وصيانة وقائية مجدولة.', imageUrl: '/projects/site-ceiling-install.webp', tagEn: 'SUPPORT', tagAr: 'دعم وصيانة', active: true, sortOrder: 4 },
  { id: 'consulting-project-management', nameEn: 'Consulting & Project Management', nameAr: 'الاستشارات وإدارة المشروعات', descEn: 'Project supervision, budgeting, and ISO compliance support from concept through delivery.', descAr: 'الإشراف على المشروعات وإعداد الميزانيات ودعم التوافق مع معايير ISO من بداية الفكرة حتى التسليم.', imageUrl: '/projects/fitout-lighting-progress.webp', tagEn: 'PROJECT MANAGEMENT', tagAr: 'إدارة المشروعات', active: true, sortOrder: 5 },
];
const blankService: Service = { id: '', nameEn: '', nameAr: '', descEn: '', descAr: '', imageUrl: '', tagEn: 'SERVICE', tagAr: 'خدمة', active: true, sortOrder: 1 };
const blankLocation: RetailLocation = { id: '', nameEn: '', nameAr: '', logoUrl: '', active: true, sortOrder: 1, projects: [] };
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

// Accept both public-folder paths (e.g. /projects/photo.webp) and full image URLs.
function normalizeImagePath(value: string) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^(https?:\/\/|data:image\/)/i.test(raw)) return raw;
  return `/${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'projects' | 'clients' | 'services' | 'locations' | 'media' | 'settings'>('requests');
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>(blankSettings);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [serviceDraft, setServiceDraft] = useState<Service>(blankService);
  const [retailLocations, setRetailLocations] = useState<RetailLocation[]>(defaultRetailLocations);
  const [locationDraft, setLocationDraft] = useState<RetailLocation>(blankLocation);
  const [siteMedia, setSiteMedia] = useState<SiteMedia>(defaultSiteMedia);
  const [project, setProject] = useState<any>(blankProject);
  const [client, setClient] = useState<any>(blankClient);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (!mounted) return; setSession(data.session); setLoading(false); if (data.session) void loadAll(); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); if (nextSession) void loadAll(); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function loadAll() {
    if (!supabase) return;
    const [p, l, s, c] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('customer_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('value').eq('id', 'main').maybeSingle(),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
    ]);
    if (p.error || l.error || c.error) setError('Some data could not be loaded. Make sure the latest supabase-schema.sql has been applied.');
    setProjects((p.data || []) as Project[]); setLeads((l.data || []) as Lead[]); setClients((c.data || []) as Client[]);
    if (s.data?.value) {
      const stored = s.data.value as Partial<Settings> & { phone?: string };
      // Migrate the old single phone field into the new list without losing existing contact data.
      const storedPhones = Array.isArray(stored.phones)
        ? stored.phones.map((value) => String(value || ''))
        : stored.phone ? [stored.phone] : [''];
      setSettings({ ...blankSettings, ...stored, phones: storedPhones.length ? storedPhones : [''] });
      if (Array.isArray(stored.services)) setServices(stored.services);
      else setServices(defaultServices);
      if (Array.isArray(stored.retail_locations)) setRetailLocations(stored.retail_locations);
      else setRetailLocations(defaultRetailLocations);
      setSiteMedia({ ...defaultSiteMedia, ...((stored as any).site_media || {}) });
    }
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    setNotice(''); setError(''); const f = new FormData(e.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (authError) setError('Unable to sign in. Check your email address and password.');
  }

  async function uploadImage(e: ChangeEvent<HTMLInputElement>, target: 'project' | 'client' | 'service' | 'location' | 'mallProject' | 'mallBrand' | 'hero' | 'logo' | 'about', mallProjectId?: string) {
    if (!supabase || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('The image must be 6 MB or smaller.'); return; }
    setSaving(true); setError(''); setNotice('Uploading image...');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storageFolder = target === 'mallProject' ? 'location' : target === 'mallBrand' ? 'client' : target;
    const path = `${storageFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) setError('Image upload failed. Make sure the portfolio storage bucket and its policies are configured in Supabase.');
    else {
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      if (target === 'project') setProject((old: any) => ({ ...old, image_url: data.publicUrl }));
      else if (target === 'client') setClient((old: any) => ({ ...old, logo_url: data.publicUrl }));
      else if (target === 'service') setServiceDraft((old) => ({ ...old, imageUrl: data.publicUrl }));
      else if (target === 'location') setLocationDraft((old) => ({ ...old, logoUrl: data.publicUrl }));
      else if (target === 'mallProject' && mallProjectId) setLocationDraft((old) => ({ ...old, projects: (old.projects || []).map((item) => item.id === mallProjectId ? { ...item, imageUrl: data.publicUrl } : item) }));
      else if (target === 'mallBrand' && mallProjectId) setLocationDraft((old) => ({ ...old, projects: (old.projects || []).map((item) => item.id === mallProjectId ? { ...item, brandLogoUrl: data.publicUrl } : item) }));
      else if (target === 'hero' || target === 'logo' || target === 'about') setSiteMedia((old) => ({ ...old, [target]: data.publicUrl }));
      setNotice('Image uploaded. Save the related content to publish it on the website.');
    }
    setSaving(false); e.target.value = '';
  }

  async function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const payload = { title: project.title.trim(), title_ar: String(project.title_ar || '').trim(), category: project.category, category_ar: String(project.category_ar || '').trim(), location: project.location, image_url: normalizeImagePath(project.image_url), description: project.description, description_ar: String(project.description_ar || '').trim(), published: Boolean(project.published) };
    const result = project.id ? await supabase.from('projects').update(payload).eq('id', project.id) : await supabase.from('projects').insert(payload);
    setSaving(false);
    if (result.error) setError('Could not save the project. Check the database connection.'); else { setNotice('Project saved successfully.'); setProject(blankProject); await loadAll(); }
  }

  async function deleteProject(id: string) {
    if (!supabase || !window.confirm('Are you sure you want to permanently delete this project?')) return;
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id);
    if (deleteError) setError('Could not delete the project.'); else setNotice('Project deleted.'); await loadAll();
  }

  async function saveClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const payload = { name: client.name.trim(), logo_url: normalizeImagePath(client.logo_url), note: client.note, active: Boolean(client.active) };
    const result = client.id ? await supabase.from('clients').update(payload).eq('id', client.id) : await supabase.from('clients').insert(payload);
    setSaving(false);
    if (result.error) setError('Could not save client details.'); else { setNotice('Client details saved.'); setClient(blankClient); await loadAll(); }
  }

  async function deleteClient(id: string) {
    if (!supabase || !window.confirm('Are you sure you want to remove this client?')) return;
    const { error: deleteError } = await supabase.from('clients').delete().eq('id', id);
    if (deleteError) setError('Could not delete the client.'); else setNotice('Client deleted.'); await loadAll();
  }

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const rawLocation = String(settings.location_url || '').trim();
    let locationUrl = '';
    if (rawLocation) {
      try {
        const parsed = new URL(rawLocation);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Invalid URL protocol');
        locationUrl = parsed.toString();
      } catch {
        setSaving(false);
        setError('Please enter a valid full map link starting with https://');
        return;
      }
    }
    const phones = (settings.phones || []).map((phone) => String(phone || '').trim()).filter(Boolean);
    const settingsToSave = { ...settings, phones, phone: phones[0] || '', location_url: locationUrl, services, retail_locations: retailLocations, site_media: siteMedia };
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value: settingsToSave });
    setSaving(false);
    if (saveError) setError('Could not save settings.');
    else { setSettings({ ...settingsToSave, phones: phones.length ? phones : [''] }); setNotice('Company contact details and social links saved.'); }
  }

  function updateServiceDraft<K extends keyof Service>(key: K, value: Service[K]) {
    setServiceDraft((old) => ({ ...old, [key]: value }));
  }

  function saveServiceDraft(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = { ...serviceDraft, id: serviceDraft.id || `service-${Date.now()}`, nameEn: serviceDraft.nameEn.trim(), nameAr: serviceDraft.nameAr.trim(), imageUrl: normalizeImagePath(serviceDraft.imageUrl), sortOrder: Number(serviceDraft.sortOrder) || services.length + 1 };
    if (!clean.nameEn || !clean.nameAr || !clean.imageUrl) { setError('Please enter the service name in both languages and add an image.'); return; }
    setServices((old) => {
      const exists = old.some((item) => item.id === clean.id);
      return (exists ? old.map((item) => item.id === clean.id ? clean : item) : [...old, clean]).sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setServiceDraft(blankService);
    setNotice('Service added to the changes list. Click Save Services to publish it.');
  }

  function editService(item: Service) {
    setServiceDraft({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeService(id: string) {
    if (!window.confirm('Remove this service from the website?')) return;
    setServices((old) => old.filter((item) => item.id !== id));
    if (serviceDraft.id === id) setServiceDraft(blankService);
    setNotice('Service removed from the changes list. Click Save Services to publish it.');
  }

  async function saveServices() {
    if (!supabase) return;
    setSaving(true); setError('');
    const value = { ...settings, services, retail_locations: retailLocations, site_media: siteMedia };
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value });
    setSaving(false);
    if (saveError) setError(`Could not save services: ${saveError.message}`);
    else setNotice('Services saved successfully. They are now updated on the website.');
  }

  async function saveSiteMedia() {
    if (!supabase) return;
    setSaving(true); setError('');
    const value = { ...settings, services, retail_locations: retailLocations, site_media: siteMedia };
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value });
    setSaving(false);
    if (saveError) setError(`Could not save website images: ${saveError.message}`);
    else setNotice('Website images saved successfully.');
  }

  function addMallProject() {
    setLocationDraft((old) => ({ ...old, projects: [...(old.projects || []), { id: `mall-project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nameEn: '', nameAr: '', portfolioProjectId: '', clientId: '', brandNameEn: '', brandNameAr: '', brandLogoUrl: '', imageUrl: '', descriptionEn: '', descriptionAr: '' }] }));
  }

  function updateMallProject<K extends keyof MallProject>(id: string, key: K, value: MallProject[K]) {
    setLocationDraft((old) => ({ ...old, projects: (old.projects || []).map((item) => item.id === id ? { ...item, [key]: value } : item) }));
  }

  function selectMallPortfolioProject(mallProjectId: string, projectId: string) {
    const selected = projects.find((item) => item.id === projectId);
    setLocationDraft((old) => ({ ...old, projects: (old.projects || []).map((item) => item.id === mallProjectId ? {
      ...item,
      portfolioProjectId: projectId,
      nameEn: selected ? (selected.title || item.nameEn) : item.nameEn,
      nameAr: selected ? (selected.title_ar || item.nameAr) : item.nameAr,
      imageUrl: selected?.image_url || item.imageUrl || '',
      descriptionEn: selected?.description || item.descriptionEn || '',
      descriptionAr: selected?.description_ar || item.descriptionAr || '',
    } : item) }));
  }

  function selectMallClient(mallProjectId: string, clientId: string) {
    const selected = clients.find((item) => item.id === clientId);
    setLocationDraft((old) => ({ ...old, projects: (old.projects || []).map((item) => item.id === mallProjectId ? {
      ...item,
      clientId,
      brandNameEn: selected?.name || (clientId ? item.brandNameEn : ''),
      brandNameAr: clientId ? (item.brandNameAr || '') : '',
      brandLogoUrl: selected?.logo_url || (clientId ? item.brandLogoUrl || '' : ''),
    } : item) }));
  }

  function removeMallProject(id: string) {
    setLocationDraft((old) => ({ ...old, projects: (old.projects || []).filter((item) => item.id !== id) }));
  }

  function saveLocationDraft(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean: RetailLocation = {
      ...locationDraft,
      id: locationDraft.id || `retail-location-${Date.now()}`,
      nameEn: locationDraft.nameEn.trim(),
      nameAr: locationDraft.nameAr.trim(),
      logoUrl: normalizeImagePath(locationDraft.logoUrl),
      sortOrder: Number(locationDraft.sortOrder) || retailLocations.length + 1,
      projects: (locationDraft.projects || []).map((item) => ({ ...item, id: item.id || `mall-project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nameEn: String(item.nameEn || '').trim(), nameAr: String(item.nameAr || '').trim(), brandNameEn: String(item.brandNameEn || '').trim(), brandNameAr: String(item.brandNameAr || '').trim(), brandLogoUrl: normalizeImagePath(item.brandLogoUrl || ''), imageUrl: normalizeImagePath(item.imageUrl || ''), descriptionEn: String(item.descriptionEn || '').trim(), descriptionAr: String(item.descriptionAr || '').trim() })).filter((item) => item.nameEn || item.nameAr || item.portfolioProjectId || item.brandNameEn || item.brandNameAr),
    };
    if (!clean.nameEn || !clean.nameAr) { setError('Please enter the location name in both English and Arabic.'); return; }
    setRetailLocations((old) => {
      const exists = old.some((item) => item.id === clean.id);
      return (exists ? old.map((item) => item.id === clean.id ? clean : item) : [...old, clean]).sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setLocationDraft({ ...blankLocation, sortOrder: retailLocations.length + 2 });
    setNotice('Mall and project names added to the changes list. Click Save Mall Projects to publish them.');
  }

  function editLocation(item: RetailLocation) {
    setLocationDraft({ ...item, projects: (item.projects || []).map((project) => ({ ...project })) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeLocation(id: string) {
    if (!window.confirm('Remove this shopping mall from the website?')) return;
    setRetailLocations((old) => old.filter((item) => item.id !== id));
    if (locationDraft.id === id) setLocationDraft(blankLocation);
    setNotice('Mall removed from the changes list. Click Save Mall Projects to publish the change.');
  }

  async function saveRetailLocations() {
    if (!supabase) return;
    setSaving(true); setError('');
    const value = { ...settings, services, retail_locations: retailLocations, site_media: siteMedia };
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value });
    setSaving(false);
    if (saveError) setError(`Could not save mall projects: ${saveError.message}`);
    else { setSettings(value); setNotice('Mall projects saved successfully. They are now updated on the website.'); }
  }

  function displayService(value: string) {
    const legacy: Record<string, string> = {
      'تشطيبات متكاملة': 'Complete Fit-Out',
      'تصميم داخلي': 'Interior Design',
      'ديكورات وإضاءة': 'Decor & Lighting',
      'تجديد وتطوير': 'Renovation & Upgrades',
      'أخرى': 'Other',
    };
    return legacy[value] || value;
  }

  function displayBudget(value: string) {
    const legacy: Record<string, string> = {
      'اختياري': 'Optional',
      'أقل من 100,000 جنيه': 'Under EGP 100,000',
      '100,000 – 300,000 جنيه': 'EGP 100,000 – 300,000',
      '300,000 – 700,000 جنيه': 'EGP 300,000 – 700,000',
      'أكثر من 700,000 جنيه': 'Over EGP 700,000',
      'لسه بحدد': 'Still to be determined',
    };
    return legacy[value] || value;
  }

  async function updateLead(id: string, status: string) {
    if (!supabase) return; const { error: updateError } = await supabase.from('customer_requests').update({ status }).eq('id', id);
    if (updateError) setError('Could not update the request status.'); else setNotice('Request status updated.'); await loadAll();
  }

  async function deleteLead(id: string) {
    if (!supabase || !window.confirm('Are you sure you want to delete this customer request?')) return;
    const { error: deleteError } = await supabase.from('customer_requests').delete().eq('id', id);
    if (deleteError) setError('Could not delete the request.'); else setNotice('Request deleted.'); await loadAll();
  }

  // Export every customer request in paginated batches so large lists are not truncated.
  async function exportCustomerRequests() {
    if (!supabase) return;
    setExporting(true); setError(''); setNotice('Preparing the customer data export...');
    const allRows: Lead[] = [];
    const pageSize = 500;
    for (let from = 0; ; from += pageSize) {
      const { data, error: fetchError } = await supabase
        .from('customer_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (fetchError) {
        setError('Could not export data. Check the Supabase connection and admin permissions.');
        setNotice(''); setExporting(false); return;
      }
      const batch = (data || []) as Lead[];
      allRows.push(...batch);
      if (batch.length < pageSize) break;
    }

    if (!allRows.length) {
      setNotice('There are no customer requests to export yet.');
      setExporting(false); return;
    }

    const statusLabels: Record<string, string> = {
      new: 'New', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
    };
    const headers = ['Request ID', 'Customer Name', 'Phone', 'Email', 'Requested Service', 'Budget', 'Project Details', 'Status', 'Request Date'];
    const rows = allRows.map((lead) => [
      lead.id, lead.name, lead.phone, lead.email, displayService(lead.service), displayBudget(lead.budget), lead.details,
      statusLabels[lead.status] || lead.status || 'New',
      lead.created_at ? new Date(lead.created_at).toLocaleString('en-GB') : '',
    ]);
    const escapeCsv = (value: unknown) => {
      let text = String(value ?? '');
      // Prevent spreadsheet formula execution when opening untrusted customer input.
      if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
      return `\"${text.replace(/\"/g, '\"\"')}\"`;
    };
    const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Siri-Designs-Customer-Requests-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Successfully exported ${allRows.length} customer requests.`);
    setExporting(false);
  }

  if (loading) return <main className="admin-wrap"><p>Loading admin dashboard...</p></main>;

  if (!session) return <main className="admin-wrap"><form className="login-card" onSubmit={login}>
    <a href="/" className="admin-back">← Back to website</a><div className="login-logo"><Image src="/logo.png" alt="Siri Designs" width={126} height={112}/></div>
    <h1>Admin Dashboard</h1><p>Sign in to manage the website, projects, and customer inquiries.</p>
    {!supabase && <div className="notice">The database is not connected. Add your Supabase environment variables in Vercel first.</div>}
    <label>Email Address<input name="email" type="email" required placeholder="admin@example.com" autoComplete="username"/></label>
    <label>Password<input name="password" type="password" required placeholder="••••••••" autoComplete="current-password"/></label>
    {error && <p className="form-error">{error}</p>}<button className="button primary submit" disabled={!supabase}>Sign In ↗</button>
  </form></main>;

  const tabs = [ ['requests', 'Customer Requests', leads.filter(x => x.status === 'new').length], ['projects', 'Portfolio', projects.length], ['services', 'Services', services.length], ['locations', 'Mall Projects', retailLocations.length], ['media', 'Website Images', 0], ['clients', 'Clients', clients.length], ['settings', 'Company Settings', 0] ] as const;
  return <main className="dashboard"><aside className="sidebar"><a href="/" className="dash-brand"><Image src="/logo.png" alt="" width={62} height={55}/><span>SIRI <em>DESIGNS</em><small>ADMIN DASHBOARD</small></span></a>
    {tabs.map(([key, label, count]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setNotice(''); setError(''); }}>{label}{count > 0 && <b>{count}</b>}</button>)}
    <div className="sidebar-bottom"><a href="/">← View Website</a><button onClick={() => supabase?.auth.signOut()}>Sign Out</button></div>
  </aside><section className="dash-main"><header className="dash-header"><div><span>Welcome to</span><h1>{tabs.find(x => x[0] === tab)?.[1]}</h1></div><span className="admin-pill">SIRI / ADMIN</span></header>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}{error && <div className="notice error-notice">{error}<button onClick={() => setError('')}>×</button></div>}
    {tab === 'requests' && <><div className="dash-stats"><article><span>Total Requests</span><b>{leads.length}</b></article><article><span>New Requests</span><b>{leads.filter(x => x.status === 'new').length}</b></article><article><span>In Progress</span><b>{leads.filter(x => x.status === 'in_progress').length}</b></article><article><span>Completed Requests</span><b>{leads.filter(x => x.status === 'completed').length}</b></article></div>
      <div className="dash-panel"><div className="panel-head"><h2>Customer Requests</h2><div className="panel-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><button type="button" onClick={() => void exportCustomerRequests()} disabled={exporting}>{exporting ? 'Preparing file...' : 'Export Customer Data ↓'}</button><button type="button" onClick={() => void loadAll()}>Refresh Data ↻</button></div></div>{!leads.length ? <p className="empty-admin">No requests yet. Inquiries submitted through the website will appear here.</p> : <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Contact</th><th>Service</th><th>Budget</th><th>Details</th><th>Status</th><th>Request Date</th><th>Action</th></tr></thead><tbody>{leads.map(l => <tr key={l.id}><td>{l.name}</td><td><a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{l.phone}</a>{l.email && <small>{l.email}</small>}</td><td>{displayService(l.service)}</td><td>{displayBudget(l.budget) || '—'}</td><td className="details-cell">{l.details || '—'}</td><td><select value={l.status || 'new'} onChange={e => void updateLead(l.id, e.target.value)}><option value="new">New</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td><td>{new Date(l.created_at).toLocaleDateString('en-GB')}</td><td><button className="table-danger" onClick={() => void deleteLead(l.id)}>Delete</button></td></tr>)}</tbody></table></div>}</div></>}

    {tab === 'projects' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{project.id ? 'Edit Project' : 'Add New Project'}</h2><button type="button" onClick={() => setProject(blankProject)}>+ New</button></div><form className="dash-form" onSubmit={saveProject}>
      <label>Project Name (English) *<input required value={project.title} onChange={e => setProject({ ...project, title: e.target.value })}/></label><label>Project Name (Arabic)<input dir="rtl" value={project.title_ar || ''} onChange={e => setProject({ ...project, title_ar: e.target.value })}/></label><label>Category (English)<input value={project.category} onChange={e => setProject({ ...project, category: e.target.value })}/></label><label>Category (Arabic)<input dir="rtl" value={project.category_ar || ''} onChange={e => setProject({ ...project, category_ar: e.target.value })}/></label><label>Location<input value={project.location} onChange={e => setProject({ ...project, location: e.target.value })}/></label>
      <label>Project Image<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'project')}/><small className="field-help">Upload an image or add a direct image path below. Maximum size: 6 MB.</small></label>
      {project.image_url && <img className="upload-preview" src={normalizeImagePath(project.image_url)} alt="Project image preview"/>}<label>Project Image Path or URL<input type="text" inputMode="url" value={project.image_url} onChange={e => setProject({ ...project, image_url: e.target.value })} placeholder="/projects/photo.webp or https://..."/></label>
      <label>Caption (English)<textarea rows={3} maxLength={500} value={project.description} onChange={e => setProject({ ...project, description: e.target.value })}/></label><label>Caption (Arabic)<textarea dir="rtl" rows={3} maxLength={500} value={project.description_ar || ''} onChange={e => setProject({ ...project, description_ar: e.target.value })}/><small className="field-help">Add both language versions to display the matching caption when visitors switch languages.</small></label><label className="check-label"><input type="checkbox" checked={!!project.published} onChange={e => setProject({ ...project, published: e.target.checked })}/> Show project on website</label><button className="button primary submit" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>Projects ({projects.length})</h2></div>{!projects.length ? <p className="empty-admin">No projects have been added.</p> : projects.map(p => <div className="project-admin-row" key={p.id}>{p.image_url && <img src={p.image_url} alt=""/>}<div><b>{p.title}</b><small>{p.category || 'Uncategorized'} · {p.published ? 'Published' : 'Hidden'}</small>{p.description && <small className="project-admin-description">{p.description}</small>}</div><button onClick={() => { setProject(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="danger" onClick={() => void deleteProject(p.id)}>Delete</button></div>)}</div></div>}

    {tab === 'services' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{serviceDraft.id ? 'Edit Service' : 'Add New Service'}</h2><button type="button" onClick={() => setServiceDraft({ ...blankService, sortOrder: services.length + 1 })}>+ New</button></div><form className="dash-form" onSubmit={saveServiceDraft}>
      <label>Service Name (English) *<input required value={serviceDraft.nameEn} onChange={e => updateServiceDraft('nameEn', e.target.value)}/></label>
      <label>Service Name (Arabic) *<input required dir="rtl" value={serviceDraft.nameAr} onChange={e => updateServiceDraft('nameAr', e.target.value)}/></label>
      <label>Description (English)<textarea rows={3} value={serviceDraft.descEn} onChange={e => updateServiceDraft('descEn', e.target.value)}/></label>
      <label>Description (Arabic)<textarea dir="rtl" rows={3} value={serviceDraft.descAr} onChange={e => updateServiceDraft('descAr', e.target.value)}/></label>
      <label>Service Image<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'service')}/><small className="field-help">Upload an image up to 6 MB, or paste an image path below.</small></label>
      {serviceDraft.imageUrl && <img className="upload-preview" src={normalizeImagePath(serviceDraft.imageUrl)} alt="Service image preview"/>}
      <label>Image Path or URL *<input type="text" value={serviceDraft.imageUrl} onChange={e => updateServiceDraft('imageUrl', e.target.value)} placeholder="/projects/service.webp or https://..." required/></label>
      <div className="settings-grid"><label>Label (English)<input value={serviceDraft.tagEn} onChange={e => updateServiceDraft('tagEn', e.target.value)}/></label><label>Label (Arabic)<input dir="rtl" value={serviceDraft.tagAr} onChange={e => updateServiceDraft('tagAr', e.target.value)}/></label></div>
      <label>Display Order<input type="number" min="1" value={serviceDraft.sortOrder} onChange={e => updateServiceDraft('sortOrder', Number(e.target.value))}/></label>
      <label className="check-label"><input type="checkbox" checked={serviceDraft.active} onChange={e => updateServiceDraft('active', e.target.checked)}/> Show this service on website</label>
      <button className="button primary submit">{serviceDraft.id ? 'Update Service in List' : 'Add Service to List'}</button>
      <small className="field-help">Changes remain in this editor until you click Save Services.</small>
    </form></div><div className="dash-panel"><div className="panel-head"><h2>Services ({services.length})</h2><button type="button" onClick={() => void saveServices()} disabled={saving}>{saving ? 'Saving...' : 'Save Services'}</button></div>{!services.length ? <p className="empty-admin">No services. Add your first service.</p> : [...services].sort((a,b)=>a.sortOrder-b.sortOrder).map(item => <div className="project-admin-row" key={item.id}>{item.imageUrl && <img src={item.imageUrl} alt=""/>}<div><b>{item.nameEn}</b><small dir="rtl">{item.nameAr}</small><small>{item.active ? 'Visible on website' : 'Hidden from website'} · Order {item.sortOrder}</small></div><button type="button" onClick={() => editService(item)}>Edit</button><button type="button" className="danger" onClick={() => removeService(item.id)}>Delete</button></div>)}</div></div>}

    {tab === 'locations' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{locationDraft.id ? 'Edit Shopping Mall' : 'Add Shopping Mall'}</h2><button type="button" onClick={() => setLocationDraft({ ...blankLocation, sortOrder: retailLocations.length + 1, projects: [] })}>+ New</button></div><form className="dash-form" onSubmit={saveLocationDraft}>
      <label>Mall Name (English) *<input required value={locationDraft.nameEn} onChange={e => setLocationDraft(old => ({ ...old, nameEn: e.target.value }))}/></label>
      <label>Mall Name (Arabic) *<input required dir="rtl" value={locationDraft.nameAr} onChange={e => setLocationDraft(old => ({ ...old, nameAr: e.target.value }))}/></label>
      <label>Mall Logo<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'location')}/><small className="field-help">Upload a shopping mall logo. Maximum size: 6 MB.</small></label>
      {locationDraft.logoUrl && <img className="upload-preview client-preview" src={normalizeImagePath(locationDraft.logoUrl)} alt="Mall logo preview"/>}
      <label>Logo Path or URL<input type="text" inputMode="url" value={locationDraft.logoUrl} onChange={e => setLocationDraft(old => ({ ...old, logoUrl: e.target.value }))} placeholder="/locations/logo.webp or https://..."/></label>
      <div className="mall-project-editor" style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 16 }}>
        <div className="panel-head"><h3 style={{ margin: 0 }}>Projects Completed in This Mall</h3><button type="button" onClick={addMallProject}>+ Add Project</button></div>
        {(locationDraft.projects || []).length === 0 && <p className="empty-admin">No projects added yet. Add a project and connect it to an existing portfolio item or brand.</p>}
        {(locationDraft.projects || []).map((item, index) => <div key={item.id} className="mall-project-editor-card" style={{ padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="panel-head"><b>Project {index + 1}</b><button type="button" className="danger" onClick={() => removeMallProject(item.id)}>Remove Project</button></div>
          <label>Link to Existing Portfolio Project<select value={item.portfolioProjectId || ''} onChange={e => selectMallPortfolioProject(item.id, e.target.value)}><option value="">Custom project / not linked</option>{projects.map((projectItem) => <option key={projectItem.id} value={projectItem.id}>{projectItem.title}{projectItem.location ? ` — ${projectItem.location}` : ''}</option>)}</select><small className="field-help">Choose a project already managed in Portfolio to reuse its title, image, and description. You can still edit the details below.</small></label>
          <label>Existing Brand / Client<select value={item.clientId || ''} onChange={e => selectMallClient(item.id, e.target.value)}><option value="">Custom brand / not listed</option>{clients.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select><small className="field-help">Select an existing brand from Clients, or type a new brand name below.</small></label>
          <div className="settings-grid"><label>Brand Name (English)<input value={item.brandNameEn || ''} onChange={e => updateMallProject(item.id, 'brandNameEn', e.target.value)} placeholder="e.g. ALURA"/></label><label>Brand Name (Arabic)<input dir="rtl" value={item.brandNameAr || ''} onChange={e => updateMallProject(item.id, 'brandNameAr', e.target.value)} placeholder="اسم البراند"/></label></div>
          <label>Brand Logo (optional)<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'mallBrand', item.id)}/><small className="field-help">Use this for a custom brand not already listed in Clients. An existing client logo is filled automatically.</small></label>
          {item.brandLogoUrl && <img className="upload-preview client-preview" src={normalizeImagePath(item.brandLogoUrl)} alt="Brand logo preview"/>}
          <div className="settings-grid"><label>Project / Store Name (English)<input value={item.nameEn || ''} onChange={e => updateMallProject(item.id, 'nameEn', e.target.value)} placeholder="e.g. ALURA retail store"/></label><label>اسم المشروع / الفرع بالعربية<input dir="rtl" value={item.nameAr || ''} onChange={e => updateMallProject(item.id, 'nameAr', e.target.value)} placeholder="اسم المشروع أو الفرع"/></label></div>
          <label>Project Image<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'mallProject', item.id)}/><small className="field-help">Upload an image for this mall project. Maximum size: 6 MB. If linked to a Portfolio project, its image is used by default.</small></label>
          {(item.imageUrl || '') && <img className="upload-preview" src={normalizeImagePath(item.imageUrl || '')} alt="Mall project preview"/>}
          <label>Project Image Path or URL<input value={item.imageUrl || ''} onChange={e => updateMallProject(item.id, 'imageUrl', e.target.value)} placeholder="/projects/photo.webp or https://..."/></label>
          <div className="settings-grid"><label>Project Description (English)<textarea rows={2} value={item.descriptionEn || ''} onChange={e => updateMallProject(item.id, 'descriptionEn', e.target.value)}/></label><label>وصف المشروع بالعربية<textarea rows={2} dir="rtl" value={item.descriptionAr || ''} onChange={e => updateMallProject(item.id, 'descriptionAr', e.target.value)}/></label></div>
          {item.brandLogoUrl && <div className="field-help">Brand logo linked: <img src={item.brandLogoUrl} alt="Brand logo" style={{ width: 54, height: 42, objectFit: 'contain', verticalAlign: 'middle', marginInlineStart: 8 }}/></div>}
        </div>)}
        <small className="field-help">When a visitor clicks this mall's logo or name, these projects appear in a dedicated gallery. Add existing brands or any new brand.</small>
      </div>
      <label>Display Order<input type="number" min="1" value={locationDraft.sortOrder} onChange={e => setLocationDraft(old => ({ ...old, sortOrder: Number(e.target.value) }))}/></label>
      <label className="check-label"><input type="checkbox" checked={locationDraft.active} onChange={e => setLocationDraft(old => ({ ...old, active: e.target.checked }))}/> Show mall and its projects on website</label>
      <button className="button primary submit">{locationDraft.id ? 'Update Mall in List' : 'Add Mall to List'}</button><small className="field-help">Changes remain in this editor until you click Save Mall Projects.</small>
    </form></div><div className="dash-panel"><div className="panel-head"><h2>Malls ({retailLocations.length})</h2><button type="button" onClick={() => void saveRetailLocations()} disabled={saving}>{saving ? 'Saving...' : 'Save Mall Projects'}</button></div>{!retailLocations.length ? <p className="empty-admin">No shopping malls have been added.</p> : [...retailLocations].sort((a,b)=>a.sortOrder-b.sortOrder).map(item => <div className="project-admin-row" key={item.id}>{item.logoUrl && <img src={item.logoUrl} alt=""/>}<div><b>{item.nameEn}</b><small dir="rtl">{item.nameAr}</small><small>{(item.projects || []).filter(project => project.nameEn || project.nameAr || project.portfolioProjectId || project.brandNameEn || project.brandNameAr).length} project(s) · {item.active ? 'Visible on website' : 'Hidden from website'} · Order {item.sortOrder}</small>{(item.projects || []).filter(project => project.nameEn || project.nameAr || project.brandNameEn || project.brandNameAr).slice(0, 4).map(project => <small key={project.id}>— {project.brandNameEn || project.brandNameAr ? `${project.brandNameEn || project.brandNameAr}: ` : ''}{project.nameEn || project.nameAr}</small>)}</div><button type="button" onClick={() => editLocation(item)}>Edit</button><button type="button" className="danger" onClick={() => removeLocation(item.id)}>Delete</button></div>)}</div></div>}

    {tab === 'media' && <div className="dash-panel settings-form"><h2>Website Images</h2><p>Manage the main visual images used across the public website. Project images, client logos, and service images are managed in their own sections.</p>
      {([['hero', 'Main Hero Image', 'The large background image at the top of the homepage.'], ['about', 'About Section Image', 'The featured image displayed in the About section.'], ['logo', 'Website Logo', 'The logo displayed in the header and footer.']] as const).map(([key, label, help]) => <div key={key} className="media-admin-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) minmax(220px, 1fr)', gap: 18, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
        <div><b>{label}</b><small className="field-help" style={{ display: 'block' }}>{help}</small>{siteMedia[key] && <img src={siteMedia[key]} alt={label} style={{ width: '100%', maxHeight: 150, objectFit: 'cover', marginTop: 10 }}/>}</div>
        <div><label>Upload Image<input type="file" accept="image/*" onChange={e => void uploadImage(e, key)}/></label><label>Image Path or URL<input type="text" value={siteMedia[key]} onChange={e => setSiteMedia(old => ({ ...old, [key]: e.target.value }))} placeholder="/projects/image.webp or https://..."/></label></div>
      </div>)}
      <button className="button primary" onClick={() => void saveSiteMedia()} disabled={saving}>{saving ? 'Saving...' : 'Save Website Images'}</button>
    </div>}

    {tab === 'clients' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{client.id ? 'Edit Client' : 'Add Client'}</h2><button type="button" onClick={() => setClient(blankClient)}>+ New</button></div><form className="dash-form" onSubmit={saveClient}><label>Client or Company Name *<input required value={client.name} onChange={e => setClient({ ...client, name: e.target.value })}/></label><label>Client Logo<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'client')}/><small className="field-help">Optional. Maximum size: 6 MB.</small></label>{client.logo_url && <img className="upload-preview client-preview" src={normalizeImagePath(client.logo_url)} alt="Logo preview"/>}<label>Logo Path or URL<input type="text" inputMode="url" value={client.logo_url} onChange={e => setClient({ ...client, logo_url: e.target.value })} placeholder="/clients/logo.webp or https://..."/></label><label>Short Note<input value={client.note} onChange={e => setClient({ ...client, note: e.target.value })}/></label><label className="check-label"><input type="checkbox" checked={!!client.active} onChange={e => setClient({ ...client, active: e.target.checked })}/> Show client on website</label><button className="button primary submit" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>Clients ({clients.length})</h2></div>{!clients.length ? <p className="empty-admin">No clients have been added yet.</p> : clients.map(c => <div className="project-admin-row" key={c.id}>{c.logo_url && <img src={c.logo_url} alt=""/>}<div><b>{c.name}</b><small>{c.active ? 'Visible on website' : 'Hidden from website'}</small></div><button onClick={() => { setClient(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="danger" onClick={() => void deleteClient(c.id)}>Delete</button></div>)}</div></div>}

    {tab === 'settings' && <form className="dash-panel settings-form" onSubmit={saveSettings}>
      <h2>Company & Contact Details</h2><p>Changes made here will appear on the website after saving.</p>
      <div className="settings-phone-manager" style={{ marginTop: 22, marginBottom: 18 }}>
        <label>Company Phone Numbers</label>
        {(settings.phones?.length ? settings.phones : ['']).map((phone, index) => <div key={index} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <input type="tel" value={phone} maxLength={30} placeholder="+20 1X XXX XXXX" aria-label={`Company phone number ${index + 1}`} onChange={e => setSettings(old => ({ ...old, phones: (old.phones?.length ? old.phones : ['']).map((value, i) => i === index ? e.target.value : value) }))}/>
          <button type="button" aria-label={`Remove phone number ${index + 1}`} disabled={(settings.phones?.length || 1) <= 1} onClick={() => setSettings(old => { const next = (old.phones || ['']).filter((_, i) => i !== index); return { ...old, phones: next.length ? next : [''] }; })} style={{ border: '1px solid #e2caca', background: '#fff8f7', color: '#a13d3d', padding: '10px 13px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
        </div>)}
        <button type="button" onClick={() => setSettings(old => ({ ...old, phones: [...(old.phones || []), ''] }))} style={{ border: '1px solid #b9d4ce', background: '#f0f7f4', color: '#087e83', padding: '10px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+ Add Another Phone Number</button>
        <small className="field-help" style={{ display: 'block', marginTop: 8 }}>All saved numbers will appear in the Contact section and website footer. The first number is kept as the primary number for compatibility.</small>
      </div>
      <div className="settings-grid">{([['whatsapp', 'WhatsApp Number with Country Code'], ['email', 'Email Address'], ['address', 'Office Address'], ['location_url', 'Google Maps Location Link'], ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['tiktok', 'TikTok URL'], ['linkedin', 'LinkedIn URL']] as const).map(([key, label]) => <label key={key}>{label}<input type={key === 'location_url' ? 'url' : 'text'} value={settings[key] || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} placeholder={key === 'whatsapp' ? '201xxxxxxxxx' : key === 'location_url' ? 'https://maps.app.goo.gl/...' : ''}/>{key === 'location_url' && <small className="field-help">Paste the Google Maps share link for your office location.</small>}</label>)}</div>
      <label>About the Company (English)<textarea rows={4} value={settings.about || ''} onChange={e => setSettings({ ...settings, about: e.target.value })}/></label><label>About the Company (Arabic)<textarea dir="rtl" rows={4} value={settings.about_ar || ''} onChange={e => setSettings({ ...settings, about_ar: e.target.value })}/></label><label>Office Address (Arabic)<input dir="rtl" value={settings.address_ar || ''} onChange={e => setSettings({ ...settings, address_ar: e.target.value })}/></label>
      <button className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Save Company Details'}</button>
    </form>}
  </section></main>;
}
