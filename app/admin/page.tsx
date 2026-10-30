'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Project = { id: string; title: string; category: string; location: string; image_url: string; description: string; published: boolean };
type Client = { id: string; name: string; logo_url: string; note: string; active: boolean };
type Lead = { id: string; name: string; phone: string; email: string; service: string; budget: string; details: string; status: string; created_at: string };
type Settings = { phone: string; whatsapp: string; email: string; address: string; facebook: string; instagram: string; tiktok: string; linkedin: string; about: string };
const blankProject: Omit<Project, 'id'> = { title: '', category: 'Complete Fit-Out', location: '', image_url: '', description: '', published: true };
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
    if (p.error || l.error || c.error) setError('Some data could not be loaded. Make sure the latest supabase-schema.sql has been applied.');
    setProjects((p.data || []) as Project[]); setLeads((l.data || []) as Lead[]); setClients((c.data || []) as Client[]);
    if (s.data?.value) setSettings({ ...blankSettings, ...s.data.value });
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return;
    setNotice(''); setError(''); const f = new FormData(e.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (authError) setError('Unable to sign in. Check your email address and password.');
  }

  async function uploadImage(e: ChangeEvent<HTMLInputElement>, target: 'project' | 'client') {
    if (!supabase || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('The image must be 6 MB or smaller.'); return; }
    setSaving(true); setError(''); setNotice('Uploading image...');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${target}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) setError('Image upload failed. Make sure the portfolio storage bucket and its policies are configured in Supabase.');
    else {
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      if (target === 'project') setProject((old: any) => ({ ...old, image_url: data.publicUrl }));
      else setClient((old: any) => ({ ...old, logo_url: data.publicUrl }));
      setNotice('Image uploaded. Save the record to publish it on the website.');
    }
    setSaving(false); e.target.value = '';
  }

  async function saveProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!supabase) return; setSaving(true); setError('');
    const payload = { title: project.title.trim(), category: project.category, location: project.location, image_url: normalizeImagePath(project.image_url), description: project.description, published: Boolean(project.published) };
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
    const { error: saveError } = await supabase.from('site_settings').upsert({ id: 'main', value: settings });
    setSaving(false); if (saveError) setError('Could not save settings.'); else setNotice('Company details and social links saved.');
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

  const tabs = [ ['requests', 'Customer Requests', leads.filter(x => x.status === 'new').length], ['projects', 'Portfolio', projects.length], ['clients', 'Clients', clients.length], ['settings', 'Company Settings', 0] ] as const;
  return <main className="dashboard"><aside className="sidebar"><a href="/" className="dash-brand"><Image src="/logo.png" alt="" width={62} height={55}/><span>SIRI <em>DESIGNS</em><small>ADMIN DASHBOARD</small></span></a>
    {tabs.map(([key, label, count]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setNotice(''); setError(''); }}>{label}{count > 0 && <b>{count}</b>}</button>)}
    <div className="sidebar-bottom"><a href="/">← View Website</a><button onClick={() => supabase?.auth.signOut()}>Sign Out</button></div>
  </aside><section className="dash-main"><header className="dash-header"><div><span>Welcome to</span><h1>{tabs.find(x => x[0] === tab)?.[1]}</h1></div><span className="admin-pill">SIRI / ADMIN</span></header>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}{error && <div className="notice error-notice">{error}<button onClick={() => setError('')}>×</button></div>}
    {tab === 'requests' && <><div className="dash-stats"><article><span>Total Requests</span><b>{leads.length}</b></article><article><span>New Requests</span><b>{leads.filter(x => x.status === 'new').length}</b></article><article><span>In Progress</span><b>{leads.filter(x => x.status === 'in_progress').length}</b></article><article><span>Completed Requests</span><b>{leads.filter(x => x.status === 'completed').length}</b></article></div>
      <div className="dash-panel"><div className="panel-head"><h2>Customer Requests</h2><div className="panel-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><button type="button" onClick={() => void exportCustomerRequests()} disabled={exporting}>{exporting ? 'Preparing file...' : 'Export Customer Data ↓'}</button><button type="button" onClick={() => void loadAll()}>Refresh Data ↻</button></div></div>{!leads.length ? <p className="empty-admin">No requests yet. Inquiries submitted through the website will appear here.</p> : <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Contact</th><th>Service</th><th>Budget</th><th>Details</th><th>Status</th><th>Request Date</th><th>Action</th></tr></thead><tbody>{leads.map(l => <tr key={l.id}><td>{l.name}</td><td><a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{l.phone}</a>{l.email && <small>{l.email}</small>}</td><td>{displayService(l.service)}</td><td>{displayBudget(l.budget) || '—'}</td><td className="details-cell">{l.details || '—'}</td><td><select value={l.status || 'new'} onChange={e => void updateLead(l.id, e.target.value)}><option value="new">New</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td><td>{new Date(l.created_at).toLocaleDateString('en-GB')}</td><td><button className="table-danger" onClick={() => void deleteLead(l.id)}>Delete</button></td></tr>)}</tbody></table></div>}</div></>}

    {tab === 'projects' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{project.id ? 'Edit Project' : 'Add New Project'}</h2><button type="button" onClick={() => setProject(blankProject)}>+ New</button></div><form className="dash-form" onSubmit={saveProject}>
      <label>Project Name / Main Image Title *<input required value={project.title} onChange={e => setProject({ ...project, title: e.target.value })}/></label><label>Category / Small Label Above the Project Name<input value={project.category} onChange={e => setProject({ ...project, category: e.target.value })}/></label><label>Location<input value={project.location} onChange={e => setProject({ ...project, location: e.target.value })}/></label>
      <label>Project Image<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'project')}/><small className="field-help">Upload an image or add a direct image path below. Maximum size: 6 MB.</small></label>
      {project.image_url && <img className="upload-preview" src={normalizeImagePath(project.image_url)} alt="Project image preview"/>}<label>Project Image Path or URL<input type="text" inputMode="url" value={project.image_url} onChange={e => setProject({ ...project, image_url: e.target.value })} placeholder="/projects/photo.webp or https://..."/></label>
      <label>Caption displayed below the image<textarea rows={4} maxLength={500} value={project.description} onChange={e => setProject({ ...project, description: e.target.value })}/><small className="field-help">Enter the text exactly as you want visitors to see it below the image. Up to 500 characters.</small></label><label className="check-label"><input type="checkbox" checked={!!project.published} onChange={e => setProject({ ...project, published: e.target.checked })}/> Show project on website</label><button className="button primary submit" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>Projects ({projects.length})</h2></div>{!projects.length ? <p className="empty-admin">No projects have been added.</p> : projects.map(p => <div className="project-admin-row" key={p.id}>{p.image_url && <img src={p.image_url} alt=""/>}<div><b>{p.title}</b><small>{p.category || 'Uncategorized'} · {p.published ? 'Published' : 'Hidden'}</small>{p.description && <small className="project-admin-description">{p.description}</small>}</div><button onClick={() => { setProject(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="danger" onClick={() => void deleteProject(p.id)}>Delete</button></div>)}</div></div>}

    {tab === 'clients' && <div className="dash-two"><div className="dash-panel"><div className="panel-head"><h2>{client.id ? 'Edit Client' : 'Add Client'}</h2><button type="button" onClick={() => setClient(blankClient)}>+ New</button></div><form className="dash-form" onSubmit={saveClient}><label>Client or Company Name *<input required value={client.name} onChange={e => setClient({ ...client, name: e.target.value })}/></label><label>Client Logo<input type="file" accept="image/*" onChange={e => void uploadImage(e, 'client')}/><small className="field-help">Optional. Maximum size: 6 MB.</small></label>{client.logo_url && <img className="upload-preview client-preview" src={normalizeImagePath(client.logo_url)} alt="Logo preview"/>}<label>Logo Path or URL<input type="text" inputMode="url" value={client.logo_url} onChange={e => setClient({ ...client, logo_url: e.target.value })} placeholder="/clients/logo.webp or https://..."/></label><label>Short Note<input value={client.note} onChange={e => setClient({ ...client, note: e.target.value })}/></label><label className="check-label"><input type="checkbox" checked={!!client.active} onChange={e => setClient({ ...client, active: e.target.checked })}/> Show client on website</label><button className="button primary submit" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button></form></div>
      <div className="dash-panel"><div className="panel-head"><h2>Clients ({clients.length})</h2></div>{!clients.length ? <p className="empty-admin">No clients have been added yet.</p> : clients.map(c => <div className="project-admin-row" key={c.id}>{c.logo_url && <img src={c.logo_url} alt=""/>}<div><b>{c.name}</b><small>{c.active ? 'Visible on website' : 'Hidden from website'}</small></div><button onClick={() => { setClient(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button className="danger" onClick={() => void deleteClient(c.id)}>Delete</button></div>)}</div></div>}

    {tab === 'settings' && <form className="dash-panel settings-form" onSubmit={saveSettings}><h2>Company & Contact Details</h2><p>Changes made here will appear on the website after saving.</p><div className="settings-grid">{([['phone', 'Phone Number'], ['whatsapp', 'WhatsApp Number with Country Code'], ['email', 'Email Address'], ['address', 'Address'], ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['tiktok', 'TikTok URL'], ['linkedin', 'LinkedIn URL']] as const).map(([key, label]) => <label key={key}>{label}<input value={settings[key] || ''} onChange={e => setSettings({ ...settings, [key]: e.target.value })} placeholder={key === 'whatsapp' ? '201xxxxxxxxx' : key === 'phone' ? '01xxxxxxxxx' : ''}/></label>)}</div><label>About the Company<textarea rows={5} value={settings.about || ''} onChange={e => setSettings({ ...settings, about: e.target.value })}/></label><button className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Save Company Details'}</button></form>}
  </section></main>;
}
