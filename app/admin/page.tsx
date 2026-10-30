'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; category: string; location: string; image_url: string; description: string; published: boolean };
type Client = { id: string; name: string; logo_url: string; note: string; active: boolean };
type Lead = { id: string; name: string; phone: string; email: string; service: string; budget: string; details: string; status: string; created_at: string };
type Settings = { phone: string; whatsapp: string; email: string; address: string; facebook: string; instagram: string; tiktok: string; linkedin: string; about: string };
const blankProject: Omit<Project, 'id'> = { title: '', category: 'تشطيبات متكاملة', location: '', image_url: '', description: '', published: true };
const blankClient: Omit<Client, 'id'> = { name: '', logo_url: '', note: '', active: true };
const blankSettings: Settings = { phone: '', whatsapp: '', email: '', address: '', facebook: '', instagram: '', tiktok: '', linkedin: '', about: '' };

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
  const [tab, setTab] = useState<'requests' | 'projects' | 'clients' | 'settings'>('requests');
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>(blankSettings);
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
    if (p.error || l.error || c.error) setError('تعذر تحميل بعض البيانات. تأكد من تشغيل آخر نسخة من ملف supabase-schema.sql.');
    setProjects((p.data || []) as Project[]); setLeads((l.data || []) as Lead[]); setClients((c.data || []) as Client[]);
    if (s.data?.value) setSettings({ ...blankSettings, ...s.data.value });
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    setNotice(''); setError(''); const f = new FormData(e.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (authError) setError('تعذر تسجيل الدخول. راجع البريد الإلكتروني وكلمة المرور.');
  }

  async function uploadImage(e: ChangeEvent<HTMLInputElement>, target: 'project' | 'client') {
    if (!supabase || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) { setError('من فضلك اختر ملف صورة.'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('حجم الصورة يجب ألا يزيد عن 6 ميجابايت.'); return; }
    setSaving(true); setError(''); setNotice('جاري رفع الصورة...');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${target}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) setError('تعذر رفع الصورة. تأكد من إنشاء مساحة portfolio في Supabase وتشغيل سياسات التخزين.');
    else {
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      if (target === 'project') setProject((old: any) => ({ ...old, image_url: data.publicUrl }));
      else setClient((old: any) => ({ ...old, logo_url: data.publicUrl }));
      setNotice('تم رفع الصورة بنجاح. احفظ البيانات لتظهر على الموقع.');
    }
    setSaving(false); e.target.value = '';
  }

  async function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const payload = { title: project.title.trim(), category: project.category, location: project.location, image_url: normalizeImagePath(project.image_url), description: project.description, published: Boolean(project.published) };
    const result = project.id ? await supabase.from('projects').update(payload).eq('id', project.id) : await supabase.from('projects').insert(payload);
    setSaving(false);
    if (result.error) setError('تعذر حفظ المشروع. راجع اتصال قاعدة البيانات.'); else { setNotice('تم حفظ المشروع بنجاح.'); setProject(blankProject); await loadAll(); }
  }

  async function deleteProject(id: string) {
    if (!supabase || !window.confirm('هل تريد حذف هذا المشروع نهائيًا؟')) return;
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id);
    if (deleteError) setError('تعذر حذف المشروع.'); else setNotice('تم حذف المشروع.'); await loadAll();
  }

  async function saveClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const payload = { name: client.name.trim(), logo_url: normalizeImagePath(client.logo_url), note: client.note, active: Boolean(client.active) };
    const result = client.id ? await supabase.from('clients').update(payload).eq('id', client.id) : await supabase.from('clients').insert(payload);
    setSaving(false);
    if (result.error) setError('تعذر حفظ بيانات العميل.'); else { setNotice('تم حفظ بيانات العميل.'); setClient(blankClient); await loadAll(); }
  }

  async function deleteClient(id: string) {
    if (!supabase || !window.confirm('هل تريد حذف هذا العميل من القائمة؟')) return;
    const { error: deleteError } = await supabase.from('clients').delete().eq('id', id);
    if (deleteError) setError('تعذر حذف العميل.'); else setNotice('تم حذف العميل.'); await loadAll();
  }

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value: settings });
    setSaving(false); if (saveError) setError('تعذر حفظ الإعدادات.'); else setNotice('تم حفظ بيانات الشركة وروابط التواصل.');
  }

  async function updateLead(id: string, status: string) {
    if (!supabase) return; const { error: updateError } = await supabase.from('customer_requests').update({ status }).eq('id', id);
    if (updateError) setError('تعذر تحديث حالة الطلب.'); else setNotice('تم تحديث حالة الطلب.'); await loadAll();
  }

  async function deleteLead(id: string) {
    if (!supabase || !window.confirm('هل تريد حذف طلب العميل؟')) return;
    const { error: deleteError } = await supabase.from('customer_requests').delete().eq('id', id);
    if (deleteError) setError('تعذر حذف الطلب.'); else setNotice('تم حذف الطلب.'); await loadAll();
  }

  // Export every customer request in paginated batches so large lists are not truncated.
  async function exportCustomerRequests() {
    if (!supabase) return;
    setExporting(true); setError(''); setNotice('جاري تجهيز ملف بيانات العملاء...');
    const allRows: Lead[] = [];
    const pageSize = 500;
    for (let from = 0; ; from += pageSize) {
      const { data, error: fetchError } = await supabase
        .from('customer_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (fetchError) {
        setError('تعذر تنزيل البيانات. تأكد من اتصال Supabase وصلاحيات حساب الإدارة.');
        setNotice(''); setExporting(false); return;
      }
      const batch = (data || []) as Lead[];
      allRows.push(...batch);
      if (batch.length < pageSize) break;
    }

    if (!allRows.length) {
      setNotice('لا توجد طلبات عملاء لتصديرها حتى الآن.');
      setExporting(false); return;
    }

    const statusLabels: Record<string, string> = {
      new: 'جديد', in_progress: 'قيد المتابعة', completed: 'مكتمل', cancelled: 'ملغي',
    };
    const headers = ['رقم الطلب', 'اسم العميل', 'رقم الهاتف', 'البريد الإلكتروني', 'الخدمة المطلوبة', 'الميزانية', 'تفاصيل الطلب', 'حالة الطلب', 'تاريخ الطلب'];
    const rows = allRows.map((lead) => [
      lead.id, lead.name, lead.phone, lead.email, lead.service, lead.budget, lead.details,
      statusLabels[lead.status] || lead.status || 'جديد',
      lead.created_at ? new Date(lead.created_at).toLocaleString('ar-EG') : '',
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
    setNotice(`تم تنزيل بيانات ${allRows.length} طلب عميل بنجاح.`);
    setExporting(false);
  }

  if (loading) return <main className="admin-wrap"><p>جاري تحميل لوحة الإدارة...</p></main>;

  if (!session) return <main className="admin-wrap"><form className="login-card" onSubmit={login}>
    <a href="/" className="admin-back">← العودة للموقع</a><div className="login-logo"><Image src="/logo.png" alt="Siri Designs" width={126} height={112}/></div>
    <h1>لوحة التحكم</h1><p>سجّل الدخول لإدارة الموقع والمشروعات وطلبات العملاء.</p>
    {!supabase && <div className="notice">قاعدة البيانات غير متصلة. أضف متغيرات Supabase في إعدادات Vercel أولًا.</div>}
    <label>البريد الإلكتروني<input name="email" type="email" required placeholder="admin@example.com" autoComplete="username"/></label>
    <label>كلمة المرور<input name="password" type="password" required placeholder="••••••••" autoComplete="current-password"/></label>
    {error && <p className="form-error">{error}</p>}<button className="button primary submit" disabled={!supabase}>تسجيل الدخول ↗</button>
  </form></main>;

  const tabs = [ ['requests', 'طلبات العملاء', leads.filter(x => x.status === 'new').length], ['projects', 'سابقة الأعمال', projects.length], ['clients', 'العملاء', clients.length], ['settings', 'بيانات الشركة', 0] ] as const;
  return <main className="dashboard"><aside className="sidebar"><a href="/" className="dash-brand"><Image src="/logo.png" alt="" width={62} height={55}/><span>SIRI <em>DESIGNS</em><small>ADMIN DASHBOARD</small></span></a>
    {tabs.map(([key, label, count]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setNotice(''); setError(''); }}>{label}{count > 0 && <b>{count}</b>}</button>)}
    <div className="sidebar-bottom"><a href="/">← عرض الموقع</a><button onClick={() => supabase?.auth.signOut()}>تسجيل الخروج</button></div>
  </aside><section className="dash-main"><header className="dash-header"><div><span>مرحبًا بك في</span><h1>{tabs.find(x => x[0] === tab)?.[1]}</h1></div><span className="admin-pill">SIRI / ADMIN</span></header>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}{error && <div className="notice error-notice">{error}<button onClick={() => setError('')}>×</button></div>}
    {tab === 'requests' && <><div className="dash-stats"><article><span>إجمالي الطلبات</span><b>{leads.length}</b></article><article><span>طلبات جديدة</span><b>{leads.filter(x => x.status === 'new').length}</b></article><article><span>قيد المتابعة</span><b>{leads.filter(x => x.status === 'in_progress').length}</b></article><article><span>طلبات مكتملة</span><b>{leads.filter(x => x.status === 'completed').length}</b></article></div>
      <div className="dash-panel"><div className="panel-head"><h2>طلبات العملاء</h2><div className="panel-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><button type="button" onClick={() => void exportCustomerRequests()} disabled={exporting}>{exporting ? 'جاري تجهيز الملف...' : 'تنزيل بيانات العملاء ↓'}</button><button type="button" onClick={() => void loadAll()}>تحديث البيانات ↻</button></div></div>{!leads.length ? <p className="empty-admin">لا توجد طلبات حتى الآن. الطلبات المرسلة من الموقع ستظهر هنا.</p> : <div className="table-scroll"><table><thead><tr><th>العميل</th><th>التواصل</th><th>الخدمة</th><th>الميزانية</th><th>التفاصيل</th><th>الحالة</th><th>تاريخ الطلب</th><th>إجراء</th></tr></thead><tbody>{leads.map(l => <tr key={l.id}><td>{l.name}</td><td><a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{l.phone}</a>{l.email && <small>{l.email}</small>}</td><td>{l.service}</td><td>{l.budget || '—'}</td><td className="details-cell">{l.details || '—'}</td><td><select value={l.status || 'new'} onChange={e => void updateLead(l.id, e.target.value)}><option value="new">جديد</option><option value="in_progress">قيد المتابعة</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option></select></td><td>{new Date(l.created_at).toLocaleDateString('ar-EG')}</td><td><button className="table-danger" onClick={() => void deleteLead(l.id)}>حذف</button></td></tr>)}</tbody></table></div>}</div></>}

    {tab === 'projects' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{project.id ? 'تعديل مشروع' : 'إضافة مشروع جديد'}</h2><button type="button" onClick={() => setProject(blankProject)}>+ جديد</button></div><form className="dash-form" onSubmit={saveProject}>
      <label>اسم المشروع / العنوان الرئيسي تحت الصورة *<input required value={project.title} onChange={e => setProject({ ...project, title: e.target.value })}/></label><label>التصنيف / السطر الصغير فوق اسم المشروع<input value={project.category} onChange={e => setProject({ ...project, category: e.target.value })}/></label><label>الموقع<input value={project.location} onChange={e => setProject({ ...project, location: e.target.value })}/></label>
      <label>صورة المشروع<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'project')}/><small className="field-help">يمكنك رفع صورة أو وضع رابط مباشر بالأسفل. الحد الأقصى 6 ميجابايت.</small></label>
      {project.image_url && <img className="upload-preview" src={normalizeImagePath(project.image_url)} alt="معاينة صورة المشروع"/>}<label>رابط صورة المشروع<input type="text" inputMode="url" value={project.image_url} onChange={e => setProject({ ...project, image_url: e.target.value })} placeholder="/projects/photo.webp أو https://..."/></label>
      <label>الوصف الذي يظهر أسفل الصورة<textarea rows={4} maxLength={500} value={project.description} onChange={e => setProject({ ...project, description: e.target.value })}/><small className="field-help">اكتب النص كما تريد ظهوره للزائر تحت الصورة مباشرة، حتى 500 حرف.</small></label><label className="check-label"><input type="checkbox" checked={!!project.published} onChange={e => setProject({ ...project, published: e.target.checked })}/> عرض المشروع على الموقع</label><button className="button primary submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ المشروع'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>المشروعات ({projects.length})</h2></div>{!projects.length ? <p className="empty-admin">لم تتم إضافة مشروعات.</p> : projects.map(p => <div className="project-admin-row" key={p.id}>{p.image_url && <img src={p.image_url} alt=""/>}<div><b>{p.title}</b><small>{p.category || 'بدون تصنيف'} · {p.published ? 'منشور' : 'مخفي'}</small>{p.description && <small className="project-admin-description">{p.description}</small>}</div><button onClick={() => { setProject(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>تعديل</button><button className="danger" onClick={() => void deleteProject(p.id)}>حذف</button></div>)}</div></div>}

    {tab === 'clients' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{client.id ? 'تعديل عميل' : 'إضافة عميل'}</h2><button type="button" onClick={() => setClient(blankClient)}>+ جديد</button></div><form className="dash-form" onSubmit={saveClient}><label>اسم العميل أو الشركة *<input required value={client.name} onChange={e => setClient({ ...client, name: e.target.value })}/></label><label>شعار العميل<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'client')}/><small className="field-help">اختياري، بحد أقصى 6 ميجابايت.</small></label>{client.logo_url && <img className="upload-preview client-preview" src={normalizeImagePath(client.logo_url)} alt="معاينة الشعار"/>}<label>رابط الشعار<input type="text" inputMode="url" value={client.logo_url} onChange={e => setClient({ ...client, logo_url: e.target.value })} placeholder="/clients/logo.webp أو https://..."/></label><label>ملاحظة قصيرة<input value={client.note} onChange={e => setClient({ ...client, note: e.target.value })}/></label><label className="check-label"><input type="checkbox" checked={!!client.active} onChange={e => setClient({ ...client, active: e.target.checked })}/> عرض العميل على الموقع</label><button className="button primary submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ بيانات العميل'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>قائمة العملاء ({clients.length})</h2></div>{!clients.length ? <p className="empty-admin">لم تتم إضافة عملاء بعد.</p> : clients.map(c => <div className="project-admin-row" key={c.id}>{c.logo_url && <img src={c.logo_url} alt=""/>}<div><b>{c.name}</b><small>{c.active ? 'ظاهر على الموقع' : 'مخفي من الموقع'}</small></div><button onClick={() => { setClient(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>تعديل</button><button className="danger" onClick={() => void deleteClient(c.id)}>حذف</button></div>)}</div></div>}

    {tab === 'settings' && <form className="dash-panel settings-form" onSubmit={saveSettings}><h2>بيانات الشركة والتواصل</h2><p>أي تعديل هنا يظهر على الموقع بعد الحفظ.</p><div className="settings-grid">{([['phone', 'رقم التليفون'], ['whatsapp', 'رقم واتساب مع كود الدولة'], ['email', 'البريد الإلكتروني'], ['address', 'العنوان'], ['facebook', 'رابط Facebook'], ['instagram', 'رابط Instagram'], ['tiktok', 'رابط TikTok'], ['linkedin', 'رابط LinkedIn']] as const).map(([key, label]) => <label key={key}>{label}<input value={settings[key] || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} placeholder={key === 'whatsapp' ? '201xxxxxxxxx' : key === 'phone' ? '01xxxxxxxxx' : ''}/></label>)}</div><label>نبذة عن الشركة<textarea rows={5} value={settings.about || ''} onChange={e => setSettings({ ...settings, about: e.target.value })}/></label><button className="button primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ بيانات الشركة'}</button></form>}
  </section></main>;
}
