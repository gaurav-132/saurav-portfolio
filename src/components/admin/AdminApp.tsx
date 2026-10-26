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
import {
  categoryInput,
  inquiryUpdate,
  offeringInput,
  profileInput,
  projectInput,
  projectPlaybackInput,
  testimonialInput,
} from '@/lib/validation';
import AuthScreen from './AuthScreen';
import AdminLoading from './AdminLoading';
import DataTable, { type Column } from './DataTable';
import Dialog from './Dialog';
import ProjectForm from './ProjectForm';
import type { ProjectFormState } from './ProjectForm';
import { CategoryForm, LeadForm, OfferingForm, SettingsForm, TestimonialForm } from './EntityForms';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type Section = 'overview' | 'works' | 'categories' | 'leads' | 'testimonials' | 'services' | 'settings';
type DialogKind = 'project' | 'category' | 'lead' | 'testimonial' | 'offering' | null;
type DeleteRequest = { endpoint: string; id: string; label: string };

const emptyProject: ProjectFormState = {
  title: '',
  description: '',
  thumbnail: '',
  videoUrl: '',
  actualVideoUrl: '',
  playbackSource: 'uploaded' as 'uploaded' | 'external',
  categoryId: null as string | null,
  clientName: '',
  year: '',
  duration: '',
  role: 'Editor',
  published: false,
  featured: false,
};

function uploadViewHref(value: string) {
  try {
    const parsed = new URL(value, 'https://portfolio.invalid');
    if (parsed.pathname === '/api/media') {
      const objectKey = parsed.searchParams.get('key');
      if (objectKey) return `/api/admin/upload?objectKey=${encodeURIComponent(objectKey)}`;
    }
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value;
    if (value.startsWith('/') && !value.startsWith('//')) return value;
  } catch {
    return '#';
  }
  return '#';
}

function uploadedObjectKey(value: string) {
  try {
    const parsed = new URL(value, 'https://portfolio.invalid');
    return parsed.pathname === '/api/media' ? parsed.searchParams.get('key') : null;
  } catch {
    return null;
  }
}

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
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [uploadingField, setUploadingField] = useState<'thumbnail' | 'videoUrl' | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notice, setNotice] = useState('');
  const [pendingUploadKeys, setPendingUploadKeys] = useState<string[]>([]);
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

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

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
        actualVideoUrl: project.actualVideoUrl,
        playbackSource: project.playbackSource,
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

  function closeDialog() {
    const unusedKeys = pendingUploadKeys;
    setPendingUploadKeys([]);
    setDialog(null);
    for (const objectKey of unusedKeys) {
      void requestJson('/api/admin/upload', 'DELETE', { objectKey }).catch(() => undefined);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>, endpoint: string, method: string, body: unknown) {
    event.preventDefault();
    if (preview || saving || uploadingField) return;
    const validators = {
      '/api/admin/projects': (value: unknown) => {
        const parsed = projectInput.safeParse(value);
        if (!parsed.success) return parsed;
        const playback = projectPlaybackInput.safeParse(parsed.data);
        return playback.success ? parsed : playback;
      },
      '/api/admin/categories': (value: unknown) => categoryInput.safeParse(value),
      '/api/admin/queries': (value: unknown) => inquiryUpdate.safeParse(value),
      '/api/admin/testimonials': (value: unknown) => testimonialInput.safeParse(value),
      '/api/admin/offerings': (value: unknown) => offeringInput.safeParse(value),
    } as const;
    const validate = validators[endpoint as keyof typeof validators];
    if (validate) {
      const result = validate(body);
      if (!result.success) {
        setError(result.error.issues[0]?.message || 'Check the required fields and try again.');
        return;
      }
    }
    setSaving(true);
    try {
      setError('');
      setNotice('');
      await requestJson(endpoint, method, body);
      if (endpoint === '/api/admin/projects') {
        const retainedKeys = new Set([projectForm.thumbnail, projectForm.videoUrl].map(uploadedObjectKey).filter(Boolean));
        const removedKeys = pendingUploadKeys.filter((key) => !retainedKeys.has(key));
        await Promise.all(removedKeys.map((objectKey) => requestJson('/api/admin/upload', 'DELETE', { objectKey }).catch(() => undefined)));
        setPendingUploadKeys([]);
      }
      await refresh();
      setDialog(null);
      setNotice('Changes saved successfully.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  function removeItem(endpoint: string, id: string, label: string) {
    if (preview || deleting || refreshing) return;
    setDeleteRequest({ endpoint, id, label });
  }

  async function confirmDelete() {
    if (!deleteRequest || deleting || refreshing) return;
    const target = deleteRequest;
    setDeleting(true);
    setError('');
    try {
      await requestJson(target.endpoint, 'DELETE', { id: target.id });
      setDeleteRequest(null);
      setRefreshing(true);
      await refresh();
      setNotice('Entry deleted successfully.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete or refresh the entry.');
    } finally {
      setDeleting(false);
      setRefreshing(false);
    }
  }

  async function uploadFile(file: File, field: 'thumbnail' | 'videoUrl') {
    if (preview) return;
    setUploadingField(field);
    setError('');
    let objectKey = '';
    try {
      const signed = await requestJson<{ url: string; objectKey: string; mediaUrl: string }>('/api/admin/upload', 'POST', {
        action: 'prepare',
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      objectKey = signed.objectKey;
      const response = await fetch(signed.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!response.ok) {
        const details = await response.text().catch(() => '');
        throw new Error(`Neon Object Storage rejected the upload (${response.status}). ${details.slice(0, 240)}`);
      }
      const completed = await requestJson<{ mediaUrl: string }>('/api/admin/upload', 'POST', {
        action: 'complete',
        objectKey: signed.objectKey,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      setPendingUploadKeys((keys) => [...keys, signed.objectKey]);
      setProjectForm((form) => ({ ...form, [field]: completed.mediaUrl }));
    } catch (reason) {
      if (objectKey) void requestJson('/api/admin/upload', 'DELETE', { objectKey }).catch(() => undefined);
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setUploadingField(null);
    }
  }

  async function removeUploadedFile(field: 'thumbnail' | 'videoUrl') {
    const objectKey = uploadedObjectKey(projectForm[field]);
    setProjectForm((form) => ({ ...form, [field]: '' }));
    if (!objectKey || !pendingUploadKeys.includes(objectKey)) return;

    try {
      await requestJson('/api/admin/upload', 'DELETE', { objectKey });
      setPendingUploadKeys((keys) => keys.filter((key) => key !== objectKey));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not remove the uploaded file.');
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || savingSettings) return;
    const payload = {
      ...profileForm,
      aboutParagraphs: profileForm.aboutParagraphs.filter(Boolean),
      tools: profileForm.tools.map((item) => item.trim()).filter(Boolean),
    };
    const validation = profileInput.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Check the required settings and try again.');
      return;
    }
    setSavingSettings(true);
    try {
      setError('');
      setNotice('');
      const profile = await requestJson<SiteProfile>('/api/admin/settings', 'PATCH', validation.data);
      setProfileForm(profile);
      setNotice('Changes saved successfully.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save settings.');
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) return <AdminLoading />;
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
          {notice && !dialog && <div className="success" role="status">{notice}</div>}
          {error && !dialog && <div className="error">{error}</div>}
          {refreshing && <div className="admin-refresh-overlay" role="status" aria-live="polite"><span className="admin-spinner" aria-hidden="true" /><span>Refreshing workspace…</span></div>}
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

          {section === 'settings' && <SettingsForm value={profileForm} onChange={setProfileForm} onSubmit={saveSettings} preview={preview} saving={savingSettings} />}
        </main>
      </div>

      {dialog && (
        <Dialog title={`${editingId ? 'Edit' : 'Add'} ${dialog}`} onClose={closeDialog}>
          {dialog === 'project' && (
            <ProjectForm
              value={projectForm}
              categories={data.categories}
              editing={Boolean(editingId)}
              preview={preview}
              saving={saving}
              uploadingField={uploadingField}
              error={error}
              currentYear={new Date().getFullYear()}
              onChange={setProjectForm}
              onUpload={uploadFile}
              onRemove={removeUploadedFile}
              onCancel={closeDialog}
              uploadViewHref={uploadViewHref}
              onSubmit={(event) => save(event, '/api/admin/projects', editingId ? 'PATCH' : 'POST', editingId ? { ...projectForm, id: editingId } : projectForm)}
            />
          )}
          {dialog === 'category' && <CategoryForm value={categoryForm} onChange={setCategoryForm} error={error} preview={preview} onCancel={() => setDialog(null)} onSubmit={(event) => save(event, '/api/admin/categories', editingId ? 'PATCH' : 'POST', editingId ? { ...categoryForm, id: editingId } : categoryForm)} />}
          {dialog === 'lead' && <LeadForm value={leadForm} onChange={setLeadForm} error={error} preview={preview} onCancel={() => setDialog(null)} onSubmit={(event) => save(event, '/api/admin/queries', 'PATCH', { ...leadForm, id: editingId })} />}
          {dialog === 'testimonial' && <TestimonialForm value={quoteForm} onChange={setQuoteForm} error={error} preview={preview} onCancel={() => setDialog(null)} onSubmit={(event) => save(event, '/api/admin/testimonials', editingId ? 'PATCH' : 'POST', editingId ? { ...quoteForm, id: editingId } : quoteForm)} />}
          {dialog === 'offering' && <OfferingForm value={offeringForm} onChange={setOfferingForm} error={error} preview={preview} onCancel={() => setDialog(null)} onSubmit={(event) => save(event, '/api/admin/offerings', editingId ? 'PATCH' : 'POST', editingId ? { ...offeringForm, id: editingId } : offeringForm)} />}
        </Dialog>
      )}
      {deleteRequest && <DeleteConfirmDialog label={deleteRequest.label} deleting={deleting} onCancel={() => { if (!deleting) setDeleteRequest(null); }} onConfirm={confirmDelete} />}
    </div>
  );
}
