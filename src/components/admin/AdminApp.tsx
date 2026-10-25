'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { requestJson } from '@/lib/api-client';
import {
  defaultProfile,
  demoOfferings,
  demoProjects,
  demoTestimonials,
  fallbackCategories,
  leadStatusCopy,
} from '@/domain/content';
import type { AdminWorkspace, Category, Inquiry, LeadStatus, Offering, Project, SiteProfile, Testimonial } from '@/domain/types';
import { leadStatuses } from '@/domain/types';
import AuthScreen from './AuthScreen';
import DataTable, { type Column } from './DataTable';
import Dialog from './Dialog';

type Section = 'overview' | 'works' | 'categories' | 'leads' | 'testimonials' | 'services' | 'settings';
type DialogKind = 'project' | 'category' | 'lead' | 'testimonial' | 'offering' | null;

const emptyProject = {
  title: '',
  description: '',
  thumbnail: '',
  videoUrl: '',
  categoryId: null as string | null,
  clientName: '',
  year: '',
  duration: '',
  role: 'Editor',
  published: false,
  featured: false,
};

const sections: { id: Section; title: string }[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'works', title: 'Works' },
  { id: 'categories', title: 'Categories' },
  { id: 'leads', title: 'Leads' },
  { id: 'testimonials', title: 'Testimonials' },
  { id: 'services', title: 'Services' },
  { id: 'settings', title: 'Site settings' },
];

const titles: Record<Section, [string, string, string]> = {
  overview: ['WORKSPACE / OVERVIEW', 'Good to see you.', 'A clear view of portfolio content and recent activity.'],
  works: ['CONTENT / PORTFOLIO', 'Works & videos', 'Add and organize the videos visitors see on the site.'],
  categories: ['CONTENT / ORGANIZATION', 'Categories', 'Create the filters used in the public work library.'],
  leads: ['CRM / PIPELINE', 'Leads', 'Review contact-form inquiries and move them through the pipeline.'],
  testimonials: ['CONTENT / SOCIAL PROOF', 'Testimonials', 'Quotes shown in the public Kind Words section.'],
  services: ['CONTENT / OFFERINGS', 'Services', 'The service cards on the public homepage.'],
  settings: ['SITE / PROFILE', 'Site settings', 'Hero, about, process, and contact copy used across the portfolio.'],
};

export default function AdminApp() {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [setup, setSetup] = useState(false);
  const [section, setSection] = useState<Section>('overview');
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [editingId, setEditingId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [leadFilter, setLeadFilter] = useState<'all' | LeadStatus>('all');
  const [workspace, setWorkspace] = useState<AdminWorkspace>({
    projects: [],
    categories: [],
    inquiries: [],
    testimonials: [],
    offerings: [],
    profile: defaultProfile,
  });
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '', status: 'new' as LeadStatus, notes: '', isRead: false });
  const [quoteForm, setQuoteForm] = useState({ quote: '', author: '', role: '', published: true });
  const [offeringForm, setOfferingForm] = useState({ title: '', description: '', published: true });
  const [profileForm, setProfileForm] = useState<SiteProfile>(defaultProfile);

  const previewWorkspace: AdminWorkspace = useMemo(() => ({
    projects: demoProjects,
    categories: fallbackCategories,
    inquiries: [{
      id: 'preview-query',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '+91 90000 12345',
      message: 'Hi Saurav, I’m looking for an editor for a short brand film. Could you share your availability?',
      status: 'new',
      notes: '',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }],
    testimonials: demoTestimonials,
    offerings: demoOfferings,
    profile: defaultProfile,
  }), []);

  const data = preview ? previewWorkspace : workspace;
  const unread = data.inquiries.filter((item) => !item.isRead).length;
  const visibleLeads = data.inquiries.filter((item) => leadFilter === 'all' || item.status === leadFilter);

  async function refresh() {
    const payload = await requestJson<AdminWorkspace>('/api/admin/workspace');
    setWorkspace(payload);
    setProfileForm(payload.profile);
    setLogged(true);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh().catch(() => setLogged(false)).finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const endpoint = setup ? '/api/admin/setup' : '/api/admin/login';
    try {
      setError('');
      await requestJson(endpoint, 'POST', setup
        ? { token: values.get('token'), email: values.get('email'), password: values.get('password') }
        : { email: values.get('email'), password: values.get('password') });
      setLogged(true);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.');
    }
  }

  async function toggleSetup() {
    if (setup) { setSetup(false); setError(''); return; }
    try {
      setError('');
      await requestJson('/api/admin/setup');
      setSetup(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Admin setup is not ready.');
    }
  }

  function openDialog(kind: Exclude<DialogKind, null>, row?: Project | Category | Inquiry | Testimonial | Offering) {
    setError('');
    setEditingId(row?.id || '');
    if (kind === 'project') {
      const project = row && 'thumbnail' in row ? row as Project : null;
      setProjectForm(project ? {
        title: project.title,
        description: project.description,
        thumbnail: project.thumbnail,
        videoUrl: project.videoUrl,
        categoryId: project.categoryId,
        clientName: project.clientName,
        year: project.year,
        duration: project.duration,
        role: project.role,
        published: project.published,
        featured: project.featured,
      } : emptyProject);
    }
    if (kind === 'category') setCategoryForm(row && 'slug' in row && 'name' in row ? { name: (row as Category).name } : { name: '' });
    if (kind === 'lead' && row && 'message' in row) {
      const lead = row as Inquiry;
      setLeadForm({ name: lead.name, email: lead.email, phone: lead.phone, message: lead.message, status: lead.status, notes: lead.notes, isRead: true });
    }
    if (kind === 'testimonial') {
      const item = row && 'quote' in row ? row as Testimonial : null;
      setQuoteForm(item ? { quote: item.quote, author: item.author, role: item.role, published: item.published } : { quote: '', author: '', role: '', published: true });
    }
    if (kind === 'offering') {
      const item = row && 'title' in row && 'description' in row && !('thumbnail' in row) ? row as Offering : null;
      setOfferingForm(item ? { title: item.title, description: item.description, published: item.published } : { title: '', description: '', published: true });
    }
    setDialog(kind);
  }

  async function save(event: FormEvent<HTMLFormElement>, endpoint: string, method: string, body: unknown) {
    event.preventDefault();
    if (preview) return;
    try {
      setError('');
      await requestJson(endpoint, method, body);
      setDialog(null);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save.');
    }
  }

  async function removeItem(endpoint: string, id: string, label: string) {
    if (preview || !window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      await requestJson(endpoint, 'DELETE', { id });
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete item.');
    }
  }

  async function uploadFile(file: File, field: 'thumbnail' | 'videoUrl') {
    if (preview) return;
    setUploading(true);
    setError('');
    try {
      const signed = await requestJson<{ url: string; publicUrl: string }>('/api/admin/upload', 'POST', {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      const response = await fetch(signed.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!response.ok) throw new Error('Upload failed. Check your storage settings.');
      setProjectForm((form) => ({ ...form, [field]: signed.publicUrl }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) return;
    try {
      setError('');
      const profile = await requestJson<SiteProfile>('/api/admin/settings', 'PATCH', {
        ...profileForm,
        aboutParagraphs: profileForm.aboutParagraphs.filter(Boolean),
        tools: profileForm.tools.map((item) => item.trim()).filter(Boolean),
      });
      setProfileForm(profile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save settings.');
    }
  }

  if (loading) return <div className="admin-page"><p>Loading workspace…</p></div>;
  if (!logged && !preview) {
    return <AuthScreen setup={setup} error={error} onSubmit={handleLogin} onToggleSetup={toggleSetup} onPreview={() => setPreview(true)} />;
  }

  const projectColumns: Column<Project>[] = [
    { key: 'work', title: 'Work', render: (row) => <div className="cell-project"><span className="cell-thumb" style={{ backgroundImage: `url("${row.thumbnail}")` }} /><span><b>{row.title}</b><small>{row.slug}</small></span></div> },
    { key: 'category', title: 'Category', render: (row) => data.categories.find((category) => category.id === row.categoryId)?.name || 'Uncategorized' },
    { key: 'status', title: 'Status', render: (row) => <span className={`status-tag ${row.published ? 'published' : 'draft'}`}>{row.published ? 'Published' : 'Draft'}</span> },
    { key: 'featured', title: 'Featured', render: (row) => row.featured ? 'Yes' : '—' },
  ];
  const categoryColumns: Column<Category>[] = [
    { key: 'name', title: 'Category', render: (row) => <b>{row.name}</b> },
    { key: 'slug', title: 'Slug', render: (row) => <span className="muted-cell">{row.slug}</span> },
    { key: 'works', title: 'Works', render: (row) => data.projects.filter((project) => project.categoryId === row.id).length },
  ];
  const leadColumns: Column<Inquiry>[] = [
    { key: 'sender', title: 'From', render: (row) => <div className="cell-person"><b>{row.name}</b><small>{row.email}</small></div> },
    { key: 'phone', title: 'Mobile', render: (row) => row.phone },
    { key: 'status', title: 'Stage', render: (row) => <span className={`status-tag ${row.status}`}>{leadStatusCopy[row.status]}</span> },
    { key: 'message', title: 'Query', render: (row) => <span className="query-preview">{row.message}</span> },
    { key: 'date', title: 'Received', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];
  const testimonialColumns: Column<Testimonial>[] = [
    { key: 'author', title: 'Author', render: (row) => <div><b>{row.author}</b><div className="muted-cell">{row.role}</div></div> },
    { key: 'quote', title: 'Quote', render: (row) => <span className="query-preview">{row.quote}</span> },
    { key: 'status', title: 'Status', render: (row) => <span className={`status-tag ${row.published ? 'published' : 'draft'}`}>{row.published ? 'Published' : 'Draft'}</span> },
  ];
  const offeringColumns: Column<Offering>[] = [
    { key: 'title', title: 'Service', render: (row) => <b>{row.title}</b> },
    { key: 'description', title: 'Description', render: (row) => <span className="query-preview">{row.description}</span> },
    { key: 'status', title: 'Status', render: (row) => <span className={`status-tag ${row.published ? 'published' : 'draft'}`}>{row.published ? 'Published' : 'Draft'}</span> },
  ];

  const [eyebrow, heading, copy] = titles[section];

  return (
    <div className={`admin-page${preview ? ' preview-mode' : ''}`}>
      <header className="admin-top glass">
        <Link className="brand" href="/">SAURAV <i>GUSAIN</i> <span>/ ADMIN</span></Link>
        <div className="top-actions">
          <span className="admin-live"><i />{preview ? 'PREVIEW MODE' : 'ADMIN WORKSPACE'}</span>
          <Link className="pill" href="/" target="_blank">View portfolio ↗</Link>
          {preview
            ? <button className="pill" onClick={() => setPreview(false)}>Exit preview</button>
            : <button className="pill" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); setLogged(false); }}>Sign out</button>}
        </div>
      </header>
      {preview && <div className="preview-banner">READ-ONLY PREVIEW · Sample CRM content. Live changes require the database and admin setup.</div>}
      <div className="admin-layout">
        <aside className="admin-sidebar glass">
          <div className="sidebar-caption">WORKSPACE</div>
          <nav className="admin-nav" aria-label="Admin sections">
            {sections.map((item) => (
              <button key={item.id} className={section === item.id ? 'active' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => setSection(item.id)}>
                <span>{item.title}</span>
                {item.id === 'leads' && unread > 0 && <small>{unread}</small>}
              </button>
            ))}
          </nav>
          <div className="sidebar-foot">
            <span className="avatar">SG</span>
            <div>
              <b>Saurav Gusain</b>
              <small>{preview ? 'Dashboard preview' : 'Portfolio admin'}</small>
            </div>
          </div>
        </aside>
        <main className="admin-content">
          {error && !dialog && <div className="error">{error}</div>}
          <div className="admin-title">
            <div>
              <div className="eyebrow">{eyebrow}</div>
              <h1>{heading}</h1>
              <p>{copy}</p>
            </div>
            {section === 'works' && <button className="pill primary" onClick={() => openDialog('project')}>＋ Add work</button>}
            {section === 'categories' && <button className="pill primary" onClick={() => openDialog('category')}>＋ Add category</button>}
            {section === 'testimonials' && <button className="pill primary" onClick={() => openDialog('testimonial')}>＋ Add quote</button>}
            {section === 'services' && <button className="pill primary" onClick={() => openDialog('offering')}>＋ Add service</button>}
          </div>

          {section === 'overview' && (
            <>
              <div className="stats">
                <div className="glass"><span>Total works</span><b>{data.projects.length}</b><small>Portfolio entries</small></div>
                <div className="glass"><span>Published</span><b>{data.projects.filter((item) => item.published).length}</b><small>Visible to visitors</small></div>
                <div className="glass"><span>Open leads</span><b>{data.inquiries.filter((item) => item.status !== 'closed').length}</b><small>Still in the pipeline</small></div>
                <div className="glass"><span>Unread</span><b>{unread}</b><small>Need a first look</small></div>
              </div>
              <div className="overview-grid">
                <section className="glass admin-box">
                  <div className="panel-heading"><h2>Recent works</h2><button className="text-button" onClick={() => setSection('works')}>View all →</button></div>
                  <DataTable columns={projectColumns.slice(0, 3)} rows={data.projects.slice(0, 4)} empty="No works yet." actions={false} />
                </section>
                <section className="glass admin-box">
                  <div className="panel-heading"><h2>Recent leads</h2><button className="text-button" onClick={() => setSection('leads')}>View all →</button></div>
                  <DataTable columns={leadColumns.slice(0, 3)} rows={data.inquiries.slice(0, 4)} empty="No leads yet." actions={false} />
                </section>
              </div>
            </>
          )}

          {section === 'works' && (
            <DataTable
              columns={projectColumns}
              rows={data.projects}
              empty="No projects yet. Add your first work."
              onEdit={(row) => openDialog('project', row)}
              onDelete={preview ? undefined : (row) => removeItem('/api/admin/projects', row.id, row.title)}
            />
          )}

          {section === 'categories' && (
            <DataTable
              columns={categoryColumns}
              rows={data.categories}
              empty="No categories yet."
              onEdit={(row) => openDialog('category', row)}
              onDelete={preview ? undefined : (row) => removeItem('/api/admin/categories', row.id, row.name)}
            />
          )}

          {section === 'leads' && (
            <>
              <div className="lead-filters">
                <button className={`filter ${leadFilter === 'all' ? 'active' : ''}`} onClick={() => setLeadFilter('all')}>All</button>
                {leadStatuses.map((status) => (
                  <button key={status} className={`filter ${leadFilter === status ? 'active' : ''}`} onClick={() => setLeadFilter(status)}>
                    {leadStatusCopy[status]}
                  </button>
                ))}
              </div>
              <DataTable
                columns={leadColumns}
                rows={visibleLeads}
                empty="No queries yet. New contact form submissions will appear here."
                onEdit={(row) => openDialog('lead', row)}
                onDelete={preview ? undefined : (row) => removeItem('/api/admin/queries', row.id, `query from ${row.name}`)}
              />
            </>
          )}

          {section === 'testimonials' && (
            <DataTable
              columns={testimonialColumns}
              rows={data.testimonials}
              empty="No testimonials yet."
              onEdit={(row) => openDialog('testimonial', row)}
              onDelete={preview ? undefined : (row) => removeItem('/api/admin/testimonials', row.id, row.author)}
            />
          )}

          {section === 'services' && (
            <DataTable
              columns={offeringColumns}
              rows={data.offerings}
              empty="No services yet."
              onEdit={(row) => openDialog('offering', row)}
              onDelete={preview ? undefined : (row) => removeItem('/api/admin/offerings', row.id, row.title)}
            />
          )}

          {section === 'settings' && (
            <form className="glass admin-box settings-form" onSubmit={saveSettings}>
              <div className="dialog-grid">
                <label className="field">Display name<input value={profileForm.displayName} onChange={(event) => setProfileForm({ ...profileForm, displayName: event.target.value })} /></label>
                <label className="field">Role title<input value={profileForm.roleTitle} onChange={(event) => setProfileForm({ ...profileForm, roleTitle: event.target.value })} /></label>
                <label className="field">Location<input value={profileForm.location} onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })} /></label>
                <label className="field">Public email<input value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} /></label>
              </div>
              <label className="field">Hero headline<input value={profileForm.heroHeadline} onChange={(event) => setProfileForm({ ...profileForm, heroHeadline: event.target.value })} /></label>
              <label className="field">Hero highlight<input value={profileForm.heroHighlight} onChange={(event) => setProfileForm({ ...profileForm, heroHighlight: event.target.value })} /></label>
              <label className="field">Hero copy<textarea value={profileForm.heroCopy} onChange={(event) => setProfileForm({ ...profileForm, heroCopy: event.target.value })} /></label>
              <label className="field">About title<input value={profileForm.aboutTitle} onChange={(event) => setProfileForm({ ...profileForm, aboutTitle: event.target.value })} /></label>
              <label className="field">About copy<textarea value={profileForm.aboutParagraphs.join('\n\n')} onChange={(event) => setProfileForm({ ...profileForm, aboutParagraphs: event.target.value.split(/\n\n+/) })} /></label>
              <label className="field">Tools (comma separated)<input value={profileForm.tools.join(', ')} onChange={(event) => setProfileForm({ ...profileForm, tools: event.target.value.split(',').map((item) => item.trim()) })} /></label>
              <label className="field">Contact title<input value={profileForm.contactTitle} onChange={(event) => setProfileForm({ ...profileForm, contactTitle: event.target.value })} /></label>
              <div className="dialog-actions">
                <button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save settings'}</button>
              </div>
            </form>
          )}
        </main>
      </div>

      {dialog && (
        <Dialog title={`${editingId ? 'Edit' : 'Add'} ${dialog}`} onClose={() => setDialog(null)}>
          {dialog === 'project' && (
            <form className="dialog-form" onSubmit={(event) => save(event, '/api/admin/projects', editingId ? 'PATCH' : 'POST', editingId ? { ...projectForm, id: editingId } : projectForm)}>
              <label>Project name<input required maxLength={160} value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} /></label>
              <label>Description<textarea maxLength={5000} rows={4} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></label>
              <div className="dialog-grid">
                <label>Category
                  <select value={projectForm.categoryId || ''} onChange={(event) => setProjectForm({ ...projectForm, categoryId: event.target.value || null })}>
                    <option value="">Uncategorized</option>
                    {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <label>Client<input value={projectForm.clientName} onChange={(event) => setProjectForm({ ...projectForm, clientName: event.target.value })} /></label>
                <label>Year<input value={projectForm.year} onChange={(event) => setProjectForm({ ...projectForm, year: event.target.value })} /></label>
                <label>Duration<input value={projectForm.duration} onChange={(event) => setProjectForm({ ...projectForm, duration: event.target.value })} /></label>
              </div>
              <label>Role<input value={projectForm.role} onChange={(event) => setProjectForm({ ...projectForm, role: event.target.value })} /></label>
              <label>Thumbnail image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'thumbnail')} /></label>
              <label>Thumbnail URL<input type="url" value={projectForm.thumbnail} onChange={(event) => setProjectForm({ ...projectForm, thumbnail: event.target.value })} /></label>
              <label>Video file<input type="file" accept="video/mp4,video/webm" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'videoUrl')} /></label>
              <label>Video URL<input type="url" value={projectForm.videoUrl} onChange={(event) => setProjectForm({ ...projectForm, videoUrl: event.target.value })} /></label>
              <div className="dialog-checks">
                <label><input type="checkbox" checked={projectForm.published} onChange={(event) => setProjectForm({ ...projectForm, published: event.target.checked })} />Publish work</label>
                <label><input type="checkbox" checked={projectForm.featured} onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })} />Feature on homepage</label>
              </div>
              {error && <div className="error">{error}</div>}
              <div className="dialog-actions">
                <button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button>
                <button className="pill primary" disabled={preview || uploading}>{preview ? 'Preview only' : uploading ? 'Uploading…' : editingId ? 'Save changes' : 'Create work'}</button>
              </div>
            </form>
          )}
          {dialog === 'category' && (
            <form className="dialog-form" onSubmit={(event) => save(event, '/api/admin/categories', editingId ? 'PATCH' : 'POST', editingId ? { ...categoryForm, id: editingId } : categoryForm)}>
              <label>Category name<input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm({ name: event.target.value })} /></label>
              <p className="form-hint">A clean URL slug is created from the name automatically.</p>
              {error && <div className="error">{error}</div>}
              <div className="dialog-actions">
                <button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button>
                <button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save category'}</button>
              </div>
            </form>
          )}
          {dialog === 'lead' && (
            <form className="dialog-form" onSubmit={(event) => save(event, '/api/admin/queries', 'PATCH', { ...leadForm, id: editingId })}>
              <div className="dialog-grid">
                <label>Name<input required value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} /></label>
                <label>Email<input required type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} /></label>
              </div>
              <label>Mobile<input required value={leadForm.phone} onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })} /></label>
              <label>Stage
                <select value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value as LeadStatus })}>
                  {leadStatuses.map((status) => <option key={status} value={status}>{leadStatusCopy[status]}</option>)}
                </select>
              </label>
              <label>Query<textarea required rows={5} value={leadForm.message} onChange={(event) => setLeadForm({ ...leadForm, message: event.target.value })} /></label>
              <label>Internal notes<textarea rows={3} value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} /></label>
              {error && <div className="error">{error}</div>}
              <div className="dialog-actions">
                <button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button>
                <button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save lead'}</button>
              </div>
            </form>
          )}
          {dialog === 'testimonial' && (
            <form className="dialog-form" onSubmit={(event) => save(event, '/api/admin/testimonials', editingId ? 'PATCH' : 'POST', editingId ? { ...quoteForm, id: editingId } : quoteForm)}>
              <label>Quote<textarea required minLength={8} value={quoteForm.quote} onChange={(event) => setQuoteForm({ ...quoteForm, quote: event.target.value })} /></label>
              <div className="dialog-grid">
                <label>Author<input required value={quoteForm.author} onChange={(event) => setQuoteForm({ ...quoteForm, author: event.target.value })} /></label>
                <label>Role<input value={quoteForm.role} onChange={(event) => setQuoteForm({ ...quoteForm, role: event.target.value })} /></label>
              </div>
              <div className="dialog-checks">
                <label><input type="checkbox" checked={quoteForm.published} onChange={(event) => setQuoteForm({ ...quoteForm, published: event.target.checked })} />Publish</label>
              </div>
              {error && <div className="error">{error}</div>}
              <div className="dialog-actions">
                <button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button>
                <button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save quote'}</button>
              </div>
            </form>
          )}
          {dialog === 'offering' && (
            <form className="dialog-form" onSubmit={(event) => save(event, '/api/admin/offerings', editingId ? 'PATCH' : 'POST', editingId ? { ...offeringForm, id: editingId } : offeringForm)}>
              <label>Title<input required value={offeringForm.title} onChange={(event) => setOfferingForm({ ...offeringForm, title: event.target.value })} /></label>
              <label>Description<textarea value={offeringForm.description} onChange={(event) => setOfferingForm({ ...offeringForm, description: event.target.value })} /></label>
              <div className="dialog-checks">
                <label><input type="checkbox" checked={offeringForm.published} onChange={(event) => setOfferingForm({ ...offeringForm, published: event.target.checked })} />Publish</label>
              </div>
              {error && <div className="error">{error}</div>}
              <div className="dialog-actions">
                <button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button>
                <button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save service'}</button>
              </div>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
