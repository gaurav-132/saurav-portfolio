'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Project = { id: string; title: string; slug: string; description: string; thumbnail: string; videoUrl: string; featured: boolean; published: boolean; categoryId: string | null };
type Category = { id: string; name: string; slug: string };
type Inquiry = { id: string; name: string; email: string; phone: string; message: string; isRead: boolean; createdAt: string };
type Section = 'overview' | 'works' | 'categories' | 'queries';
type Column<T> = { key: string; title: string; render: (row: T) => ReactNode };

const emptyProject = { title: '', description: '', thumbnail: '', videoUrl: '', categoryId: null as string | null, published: false, featured: false };
const demoProjects: Project[] = [
  { id: 'demo-preview-1', title: 'A Quiet Morning', slug: 'demo-a-quiet-morning', description: 'Sample footage demo', thumbnail: '/demo/quiet-morning.svg', videoUrl: '', featured: true, published: true, categoryId: 'preview-1' },
  { id: 'demo-preview-2', title: 'Small Moments', slug: 'demo-small-moments', description: 'Sample footage demo', thumbnail: '/demo/small-moments.svg', videoUrl: '', featured: true, published: false, categoryId: 'preview-2' },
];
const demoCategories: Category[] = [
  { id: 'preview-1', name: 'Cinematic Edits', slug: 'cinematic-edits' },
  { id: 'preview-2', name: 'Reels & Shorts', slug: 'reels-shorts' },
  { id: 'preview-3', name: 'Documentaries', slug: 'documentaries' },
];

function DataTable<T extends { id: string }>({ columns, rows, empty, onEdit, onDelete, actions = true }: { columns: Column<T>[]; rows: T[]; empty: string; onEdit?: (row: T) => void; onDelete?: (row: T) => void; actions?: boolean }) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const showActions = actions && Boolean(onEdit || onDelete);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return <div className="table-card glass"><div className="table-scroll"><table className="admin-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.title}</th>)}{showActions && <th className="table-action-heading">Actions</th>}</tr></thead><tbody>{pageRows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}{showActions && <td><div className="row-actions">{onEdit && <button className="table-action" onClick={() => onEdit(row)}>Edit</button>}{onDelete && <button className="table-action delete-action" onClick={() => onDelete(row)}>Delete</button>}</div></td>}</tr>)}</tbody></table>{rows.length === 0 && <div className="table-empty">{empty}</div>}</div><div className="table-footer"><span>{rows.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, rows.length)} of ${rows.length}` : '0 records'}</span><div className="pagination"><button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((current) => current - 1)}>←</button><span>Page {currentPage} of {pageCount}</span><button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((current) => current + 1)}>→</button></div></div></div>;
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="dialog glass" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><div><span className="eyebrow">PORTFOLIO MANAGER</span><h2 id="dialog-title">{title}</h2></div><button className="dialog-close" aria-label="Close dialog" onClick={onClose}>×</button></header>{children}</section></div>;
}

export default function AdminPanel() {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [queries, setQueries] = useState<Inquiry[]>([]);
  const [setup, setSetup] = useState(false);
  const [preview, setPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [dialog, setDialog] = useState<'project' | 'category' | 'query' | null>(null);
  const [editingId, setEditingId] = useState('');
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [queryForm, setQueryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    const [projectResponse, categoryResponse, queryResponse] = await Promise.all([fetch('/api/admin/projects'), fetch('/api/admin/categories'), fetch('/api/admin/queries')]);
    if (projectResponse.ok && categoryResponse.ok) {
      setProjects(await projectResponse.json()); setCategories(await categoryResponse.json()); setQueries(queryResponse.ok ? await queryResponse.json() : []); setLogged(true);
    } else if (projectResponse.status === 401) setLogged(false);
  }
  useEffect(() => { const timer = window.setTimeout(() => { refresh().finally(() => setLoading(false)); }, 0); return () => window.clearTimeout(timer); }, []);
  const displayProjects = preview ? demoProjects : projects;
  const displayCategories = preview ? demoCategories : categories;
  const displayQueries = useMemo(() => preview ? [{ id: 'preview-query', name: 'Alex Morgan', email: 'alex@example.com', phone: '+91 90000 12345', message: 'Hi Saurav, I’m looking for an editor for a short brand film. Could you share your availability?', isRead: false, createdAt: new Date().toISOString() }] : queries, [preview, queries]);

  async function requestJson(url: string, method: string, body: unknown) {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  }
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget); const endpoint = setup ? '/api/admin/setup' : '/api/admin/login';
    try { setError(''); await requestJson(endpoint, 'POST', setup ? { token: values.get('token'), email: values.get('email'), password: values.get('password') } : { email: values.get('email'), password: values.get('password') }); setLogged(true); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not sign in.'); }
  }
  async function toggleSetup() {
    if (setup) { setSetup(false); setError(''); return; }
    setError('');
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Admin setup is not ready.');
      setSetup(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Admin setup is not ready.');
    }
  }
  function openDialog(kind: 'project' | 'category' | 'query', row?: Project | Category | Inquiry) {
    setError(''); setEditingId(row?.id || '');
    if (kind === 'project') setProjectForm(row && 'title' in row ? { title: row.title, description: row.description, thumbnail: row.thumbnail, videoUrl: row.videoUrl, categoryId: row.categoryId, published: row.published, featured: row.featured } : emptyProject);
    if (kind === 'category') setCategoryForm(row && 'name' in row ? { name: row.name } : { name: '' });
    if (kind === 'query') setQueryForm(row && 'message' in row ? { name: row.name, email: row.email, phone: row.phone, message: row.message } : { name: '', email: '', phone: '', message: '' });
    setDialog(kind);
  }
  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (preview) return; try { setError(''); await requestJson('/api/admin/projects', editingId ? 'PATCH' : 'POST', editingId ? { ...projectForm, id: editingId } : projectForm); setDialog(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save project.'); }
  }
  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (preview) return; try { setError(''); await requestJson('/api/admin/categories', editingId ? 'PATCH' : 'POST', editingId ? { ...categoryForm, id: editingId } : categoryForm); setDialog(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save category.'); }
  }
  async function saveQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (preview) return; try { setError(''); await requestJson('/api/admin/queries', 'PATCH', { ...queryForm, id: editingId }); setDialog(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save query.'); }
  }
  async function removeItem(endpoint: string, id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
    try { await requestJson(endpoint, 'DELETE', { id }); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete item.'); }
  }
  async function uploadFile(file: File, field: 'thumbnail' | 'videoUrl') {
    if (preview) return; setUploading(true); setError('');
    try { const signed = await requestJson('/api/admin/upload', 'POST', { fileName: file.name, contentType: file.type, size: file.size }); const response = await fetch(signed.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); if (!response.ok) throw new Error('Upload failed. Check your storage settings.'); setProjectForm((form) => ({ ...form, [field]: signed.publicUrl })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Upload failed.'); }
    finally { setUploading(false); }
  }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); setLogged(false); }

  if (loading) return <div className="admin-page"><p>Loading workspace…</p></div>;
  if (!logged && !preview) return <div className="admin-page admin-auth-page"><form className="admin-card admin-auth-card glass" onSubmit={handleLogin}>
    <Link className="brand auth-brand" href="/">SAURAV <i>GUSAIN</i></Link>
    <div className="auth-heading"><span className="auth-kicker">PORTFOLIO WORKSPACE</span><h1>{setup ? 'Create your admin' : 'Welcome back'}</h1><p>{setup ? 'Set up secure access to manage your portfolio.' : 'Sign in to manage your portfolio and enquiries.'}</p></div>
    {error && <div className="error auth-error" role="alert">{error}</div>}
    {setup && <><label>One-time setup token<input name="token" required type="password" autoComplete="off" placeholder="Enter setup token" /></label><p className="setup-hint">Use the token configured in the server environment.</p></>}
    <label>Email address<input name="email" required type="email" autoComplete="username" placeholder="you@example.com" /></label>
    <label>Password<input name="password" required type="password" minLength={setup ? 12 : 1} autoComplete={setup ? 'new-password' : 'current-password'} placeholder={setup ? 'At least 12 characters' : 'Enter your password'} /></label>
    <button className="pill primary auth-submit" type="submit">{setup ? 'Create administrator' : 'Sign in'} <span aria-hidden="true">↗</span></button>
    <div className="auth-links"><button className="quiet" type="button" onClick={toggleSetup}>{setup ? 'Back to sign in' : 'First time? Configure the initial admin'}</button><button className="quiet" type="button" onClick={() => { setCategories(demoCategories); setPreview(true); }}>Preview the dashboard (read-only)</button></div>
  </form></div>;

  const sections: { id: Section; title: string; icon: string }[] = [{ id: 'overview', title: 'Overview', icon: '⌂' }, { id: 'works', title: 'Works & videos', icon: '▣' }, { id: 'categories', title: 'Categories', icon: '◇' }, { id: 'queries', title: 'Queries', icon: '✉' }];
  const projectColumns: Column<Project>[] = [
    { key: 'work', title: 'Work', render: (row) => <div className="cell-project"><span className="cell-thumb" style={{ backgroundImage: `url("${row.thumbnail}")` }} /><span><b>{row.title}</b><small>{row.slug}</small></span></div> },
    { key: 'category', title: 'Category', render: (row) => displayCategories.find((category) => category.id === row.categoryId)?.name || 'Uncategorized' },
    { key: 'status', title: 'Status', render: (row) => <span className={`status-tag ${row.published ? 'published' : 'draft'}`}>{row.published ? 'Published' : 'Draft'}</span> },
    { key: 'featured', title: 'Featured', render: (row) => row.featured ? 'Yes' : '—' },
  ];
  const categoryColumns: Column<Category>[] = [
    { key: 'name', title: 'Category', render: (row) => <b>{row.name}</b> },
    { key: 'slug', title: 'Slug', render: (row) => <span className="muted-cell">{row.slug}</span> },
    { key: 'works', title: 'Works', render: (row) => displayProjects.filter((project) => project.categoryId === row.id).length },
  ];
  const queryColumns: Column<Inquiry>[] = [
    { key: 'sender', title: 'From', render: (row) => <div className="cell-person"><b>{row.name}</b><small>{row.email}</small></div> },
    { key: 'phone', title: 'Mobile', render: (row) => row.phone },
    { key: 'message', title: 'Query', render: (row) => <span className="query-preview">{row.message}</span> },
    { key: 'date', title: 'Received', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];
  const titleBySection: Record<Section, [string, string]> = { overview: ['WORKSPACE / OVERVIEW', 'Good to see you.'], works: ['CONTENT / PORTFOLIO', 'Works & videos'], categories: ['CONTENT / ORGANIZATION', 'Categories'], queries: ['INBOX / CONTACT FORM', 'Queries'] };
  const [eyebrow, heading] = titleBySection[activeSection];

  return <div className={`admin-page${preview ? ' preview-mode' : ''}`}><header className="admin-top glass"><Link className="brand" href="/">SAURAV <i>GUSAIN</i> <span>/ ADMIN</span></Link><div className="top-actions"><span className="admin-live"><i />{preview ? 'PREVIEW MODE' : 'ADMIN WORKSPACE'}</span><Link className="pill" href="/" target="_blank">View portfolio ↗</Link>{preview ? <button onClick={() => setPreview(false)} className="pill">Exit preview</button> : <button onClick={logout} className="pill">Sign out</button>}</div></header>{preview && <div className="preview-banner">READ-ONLY PREVIEW · Sample dashboard content. Live changes require the database and admin setup.</div>}<div className="admin-layout"><aside className="admin-sidebar glass"><div className="sidebar-caption">WORKSPACE</div><nav className="admin-nav" aria-label="Admin sections">{sections.map((section) => <button key={section.id} className={activeSection === section.id ? 'active' : ''} aria-current={activeSection === section.id ? 'page' : undefined} onClick={() => setActiveSection(section.id)}><span className="nav-icon">{section.icon}</span><span>{section.title}</span>{section.id === 'queries' && displayQueries.length > 0 && <small>{displayQueries.length}</small>}</button>)}</nav><div className="sidebar-foot"><span className="avatar">SG</span><div><b>Saurav Gusain</b><small>{preview ? 'Dashboard preview' : 'Portfolio admin'}</small></div></div></aside><main className="admin-content">{error && !dialog && <div className="error">{error}</div>}<div className="admin-title"><div><div className="eyebrow">{eyebrow}</div><h1>{heading}</h1><p>{activeSection === 'overview' ? 'A clear view of your portfolio content and recent activity.' : activeSection === 'works' ? 'Add and organize the videos visitors see in your portfolio.' : activeSection === 'categories' ? 'Create and manage the work filters on your website.' : 'Review and manage messages sent through your contact form.'}</p></div>{activeSection !== 'overview' && activeSection !== 'queries' && <button className="pill primary" onClick={() => openDialog(activeSection === 'works' ? 'project' : 'category')}>＋ Add {activeSection === 'works' ? 'work' : 'category'}</button>}</div>
    {activeSection === 'overview' && <><div className="stats"><div className="glass"><span>Total works</span><b>{displayProjects.length}</b><small>Portfolio entries</small></div><div className="glass"><span>Published</span><b>{displayProjects.filter((item) => item.published).length}</b><small>Visible to visitors</small></div><div className="glass"><span>Categories</span><b>{displayCategories.length}</b><small>Work collections</small></div><div className="glass"><span>Queries</span><b>{displayQueries.length}</b><small>Contact messages</small></div></div><div className="overview-grid"><section className="glass admin-box"><div className="panel-heading"><h2>Recent works</h2><button className="text-button" onClick={() => setActiveSection('works')}>View all →</button></div><DataTable columns={projectColumns.slice(0, 3)} rows={displayProjects.slice(0, 4)} empty="No works yet." actions={false} /></section><section className="glass admin-box"><div className="panel-heading"><h2>Recent queries</h2><button className="text-button" onClick={() => setActiveSection('queries')}>View all →</button></div><DataTable columns={queryColumns.slice(0, 2)} rows={displayQueries.slice(0, 4)} empty="No queries yet." actions={false} /></section></div></>}
    {activeSection === 'works' && <DataTable columns={projectColumns} rows={displayProjects} empty="No projects yet. Add your first work." onEdit={(row) => openDialog('project', row)} onDelete={preview ? undefined : (row) => removeItem('/api/admin/projects', row.id, row.title)} />}
    {activeSection === 'categories' && <DataTable columns={categoryColumns} rows={displayCategories} empty="No categories yet. Add a category to organize your work." onEdit={(row) => openDialog('category', row)} onDelete={preview ? undefined : (row) => removeItem('/api/admin/categories', row.id, row.name)} />}
    {activeSection === 'queries' && <DataTable columns={queryColumns} rows={displayQueries} empty="No queries yet. New contact form submissions will appear here." onEdit={(row) => openDialog('query', row)} onDelete={preview ? undefined : (row) => removeItem('/api/admin/queries', row.id, `query from ${row.name}`)} />}
  </main></div>
  {dialog && <Dialog title={`${editingId ? 'Edit' : 'Add'} ${dialog === 'project' ? 'work' : dialog}`} onClose={() => setDialog(null)}>
    {dialog === 'project' && <form className="dialog-form" onSubmit={saveProject}><label>Project name<input required maxLength={160} value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} /></label><label>Description<textarea maxLength={5000} rows={4} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></label><label>Category<select value={projectForm.categoryId || ''} onChange={(event) => setProjectForm({ ...projectForm, categoryId: event.target.value || null })}><option value="">Uncategorized</option>{displayCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Thumbnail image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'thumbnail')} /></label><label>Thumbnail URL<input type="url" value={projectForm.thumbnail} onChange={(event) => setProjectForm({ ...projectForm, thumbnail: event.target.value })} /></label><label>Video file<input type="file" accept="video/mp4,video/webm" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'videoUrl')} /></label><label>Video URL<input type="url" value={projectForm.videoUrl} onChange={(event) => setProjectForm({ ...projectForm, videoUrl: event.target.value })} /></label><div className="dialog-checks"><label><input type="checkbox" checked={projectForm.published} onChange={(event) => setProjectForm({ ...projectForm, published: event.target.checked })} />Publish work</label><label><input type="checkbox" checked={projectForm.featured} onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })} />Feature on homepage</label></div>{error && <div className="error">{error}</div>}<div className="dialog-actions"><button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button><button className="pill primary" disabled={preview || uploading}>{preview ? 'Preview only' : uploading ? 'Uploading…' : editingId ? 'Save changes' : 'Create work'}</button></div></form>}
    {dialog === 'category' && <form className="dialog-form" onSubmit={saveCategory}><label>Category name<input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm({ name: event.target.value })} placeholder="e.g. Brand films" /></label><p className="form-hint">A clean URL slug is created from the name automatically.</p>{error && <div className="error">{error}</div>}<div className="dialog-actions"><button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button><button className="pill primary" disabled={preview}>{preview ? 'Preview only' : editingId ? 'Save changes' : 'Create category'}</button></div></form>}
    {dialog === 'query' && <form className="dialog-form" onSubmit={saveQuery}><label>Name<input required maxLength={120} value={queryForm.name} onChange={(event) => setQueryForm({ ...queryForm, name: event.target.value })} /></label><label>Email<input required type="email" maxLength={254} value={queryForm.email} onChange={(event) => setQueryForm({ ...queryForm, email: event.target.value })} /></label><label>Mobile number<input required maxLength={40} value={queryForm.phone} onChange={(event) => setQueryForm({ ...queryForm, phone: event.target.value })} /></label><label>Query<textarea required maxLength={5000} rows={5} value={queryForm.message} onChange={(event) => setQueryForm({ ...queryForm, message: event.target.value })} /></label>{error && <div className="error">{error}</div>}<div className="dialog-actions"><button type="button" className="pill" onClick={() => setDialog(null)}>Cancel</button><button className="pill primary" disabled={preview}>{preview ? 'Preview only' : 'Save changes'}</button></div></form>}
  </Dialog>}
  <style jsx>{adminStyles}</style></div>;
}

const adminStyles = `
.admin-page {
  min-height: 100vh; padding: 18px 3vw 60px;
  background: radial-gradient(ellipse at 80% 0%, #9ddc4415, transparent 35%), #080a09;
  color: #f4f5f1; font-size: 14px;
}
.admin-top {
  position: sticky; z-index: 5; top: 10px; height: 64px; padding: 10px 18px;
  display: flex; align-items: center; justify-content: space-between;
  border-radius: 9px; backdrop-filter: blur(18px);
}
.admin-top .brand { font-size: 21px; }
.admin-top .brand span { color: #92998f; font-size: 11px; letter-spacing: .14em; }
.top-actions { display: flex; align-items: center; gap: 10px; }
.admin-live { margin-right: 8px; color: #b8c0b0; font: 11px 'DM Mono'; letter-spacing: .1em; }
.admin-live i { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: #c7fa68; }
.admin-layout { max-width: 1440px; margin: 25px auto; display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; align-items: start; }
.admin-sidebar { position: sticky; top: 96px; min-height: calc(100vh - 130px); padding: 17px 11px; display: flex; flex-direction: column; border-radius: 9px; }
.sidebar-caption { padding: 10px 11px 14px; color: #899184; font: 11px 'DM Mono'; letter-spacing: .14em; }
.admin-nav { display: grid; gap: 5px; }
.admin-nav button { width: 100%; padding: 13px 11px; display: flex; align-items: center; gap: 11px; border: 0; border-radius: 6px; background: transparent; color: #c0c7b9; text-align: left; font-size: 14px; cursor: pointer; transition: background .18s, color .18s; }
.admin-nav button:hover { background: #ffffff0b; color: white; }
.admin-nav button.active { background: #c7fa6818; color: #e0f6b8; box-shadow: inset 2px 0 #c7fa68; }
.admin-nav button small { margin-left: auto; padding: 3px 8px; border-radius: 20px; background: #c7fa681b; color: #d3f49a; font-size: 11px; }
.nav-icon { width: 20px; text-align: center; font-size: 17px; }
.sidebar-foot { display: flex; align-items: center; gap: 10px; margin-top: auto; padding: 16px 6px 5px; border-top: 1px solid #ffffff18; }
.sidebar-foot > div { display: grid; gap: 4px; }
.sidebar-foot b { font-size: 13px; }
.sidebar-foot small { color: #9ba493; font-size: 11px; }
.avatar { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 7px; background: #c7fa681b; color: #d8f5a6; font-size: 11px; }
.admin-content { min-width: 0; padding: 8px 0 40px; }
.admin-title { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 22px; }
.admin-title h1 { margin: 9px 0 6px; font-size: 36px; line-height: 1.1; letter-spacing: -.045em; }
.admin-title p { margin: 0; color: #b1b9aa; font-size: 15px; line-height: 1.6; }
.admin-page .eyebrow { font-size: 11px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; margin-bottom: 18px; }
.stats > div { padding: 17px 18px; display: grid; gap: 8px; border-radius: 8px; }
.stats span { color: #bdc5b7; font-size: 14px; }
.stats b { font-size: 28px; }
.stats small { color: #a0a995; font-size: 12px; }
.overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; align-items: start; }
.overview-grid > .admin-box { min-width: 0; }
.admin-box { padding: 19px; border-radius: 9px; }
.admin-box p { color: #b1b9aa; font-size: 14px; line-height: 1.6; }
.admin-box h2, .panel-heading h2 { margin: 0 0 15px; font-size: 18px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.panel-heading h2 { margin-bottom: 15px; }
.text-button { border: 0; background: none; color: #d1ef99; font-size: 12px; cursor: pointer; }
.table-card { overflow: hidden; border-radius: 8px; }
.admin-box > .table-card { border: 1px solid #ffffff18; }
.table-scroll { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
.admin-table th { background: #ffffff07; color: #b0b8a8; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
.admin-table th, .admin-table td { padding: 15px 16px; border-bottom: 1px solid #ffffff14; vertical-align: middle; }
.admin-table tbody tr:last-child td { border-bottom: 0; }
.admin-table td { color: #d3d8cf; }
.cell-project { min-width: 180px; display: flex; align-items: center; gap: 11px; }
.cell-thumb { width: 52px; height: 38px; flex: none; border-radius: 5px; background: #262c24 center / cover; }
.cell-project > span:last-child, .cell-person { display: grid; gap: 5px; }
.cell-project b, .cell-person b { color: #f0f2ed; font-size: 14px; }
.cell-project small, .cell-person small, .muted-cell { color: #aab2a2; font-size: 12px; }
.status-tag { padding: 5px 9px; border-radius: 20px; font-size: 12px; white-space: nowrap; }
.status-tag.published { background: #c7fa6819; color: #d9f6aa; }
.status-tag.draft { background: #ffffff12; color: #d0d4cc; }
.query-preview { display: block; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-actions { display: flex; gap: 13px; white-space: nowrap; }
.table-action { padding: 4px 0; border: 0; background: none; color: #d0ef96; font-size: 12px; cursor: pointer; }
.delete-action { color: #ffaaa0; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 15px; border-top: 1px solid #ffffff14; color: #aeb6a7; font-size: 12px; }
.pagination { display: flex; align-items: center; gap: 11px; white-space: nowrap; }
.pagination button { width: 32px; height: 30px; border: 1px solid #ffffff25; border-radius: 5px; background: #ffffff08; color: #f0f2ed; font-size: 16px; cursor: pointer; }
.pagination button:disabled { opacity: .4; cursor: not-allowed; }
.table-empty { padding: 36px 20px; color: #aeb6a7; text-align: center; font-size: 14px; }
.admin-card { width: min(440px, 100%); margin: 10vh auto; padding: 30px; display: grid; gap: 14px; border-radius: 9px; }
.admin-auth-page { min-height: 100svh; padding: 32px 20px; display: grid; place-items: center; overflow: auto; background: radial-gradient(ellipse at 50% 0%, #c7fa6814, transparent 42%), radial-gradient(ellipse at 100% 100%, #8eb85810, transparent 38%), #080a09; }
.admin-auth-card { position: relative; width: min(460px, 100%); margin: 0; padding: clamp(26px, 5vw, 42px); gap: 18px; border: 1px solid #ffffff1c; border-radius: 14px; background: linear-gradient(145deg, #151915eF, #0d100deF); box-shadow: 0 26px 90px #0008, inset 0 1px #ffffff0a; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
.auth-brand { width: fit-content; font-size: 20px; letter-spacing: -.045em; }
.auth-heading { display: grid; gap: 8px; margin: 12px 0 2px; }
.auth-kicker { color: #c7fa68; font: 11px 'DM Mono', monospace; letter-spacing: .15em; }
.admin-auth-card .auth-heading h1 { margin: 2px 0 0; font-size: clamp(28px, 6vw, 34px); line-height: 1.12; letter-spacing: -.045em; }
.admin-auth-card .auth-heading p { margin: 0; color: #b0b9ab; font-size: 15px; line-height: 1.6; }
.admin-auth-card label { gap: 8px; color: #dce2d7; font-size: 14px; font-weight: 600; }
.admin-auth-card input { min-height: 48px; padding: 12px 14px; border-radius: 8px; background: #090c09bb; font-size: 15px; }
.admin-auth-card input::placeholder { color: #778073; }
.admin-auth-card input:focus-visible { border-color: #c7fa68; box-shadow: 0 0 0 3px #c7fa6820; }
.auth-submit { width: 100%; min-height: 49px; margin-top: 3px; border-radius: 8px; font-size: 15px; }
.auth-submit span { transition: transform .2s ease; }
.auth-submit:hover span { transform: translate(2px, -2px); }
.auth-links { display: grid; justify-items: center; gap: 3px; padding-top: 2px; }
.auth-links .quiet { min-height: 40px; color: #c3ccbc; font-size: 13px; text-align: center; text-underline-offset: 4px; }
.auth-links .quiet:hover { color: #d9f49e; text-decoration: underline; }
.auth-error { margin: 0; padding: 12px 14px; border: 1px solid #ff766c35; border-radius: 8px; line-height: 1.55; }
.admin-auth-card .setup-hint { margin: -12px 0 0; color: #aeb9a7; font-size: 13px; line-height: 1.5; }
.admin-card h1 { margin: 14px 0 0; font-size: 30px; }
.admin-card p { margin: 0 0 10px; color: #aeb6a7; font-size: 14px; }
.admin-card .setup-hint { margin: -8px 0 2px; color: #bec7b8; font-size: 13px; line-height: 1.5; }
.admin-card label, .dialog-form > label { display: grid; gap: 8px; color: #d1d7cc; font-size: 14px; }
.admin-card input, .dialog-form input, .dialog-form textarea, .dialog-form select { width: 100%; padding: 12px 13px; outline: none; border: 1px solid #ffffff24; border-radius: 6px; background: #111511; color: #f4f5f1; font-size: 15px; }
.admin-card input:focus, .dialog-form input:focus, .dialog-form textarea:focus, .dialog-form select:focus { border-color: #c7fa68; box-shadow: 0 0 0 3px #c7fa6818; }
.dialog-backdrop { position: fixed; z-index: 50; inset: 0; padding: 24px; display: grid; place-items: center; overflow: auto; background: #000b; backdrop-filter: blur(8px); }
.dialog { width: min(620px, 100%); max-height: min(90vh, 900px); overflow: auto; padding: 24px; border-radius: 11px; box-shadow: 0 25px 100px #0009; }
.dialog header { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 22px; }
.dialog header h2 { margin: 6px 0 0; font-size: 25px; }
.dialog-close { width: 38px; height: 38px; border: 1px solid #ffffff25; border-radius: 7px; background: #ffffff08; color: white; font-size: 25px; cursor: pointer; }
.dialog-form { display: grid; gap: 15px; }
.dialog-form textarea { min-height: 100px; resize: vertical; }
.dialog-form input[type=file] { font-size: 13px; }
.dialog-checks { display: flex; flex-wrap: wrap; gap: 18px; }
.dialog-checks label { display: flex; align-items: center; gap: 8px; color: #d1d7cc; font-size: 13px; }
.dialog-checks input { width: auto; accent-color: #c7fa68; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.form-hint { margin: 0; color: #aeb6a7; font-size: 13px; }
.quiet { justify-self: center; padding: 10px; border: 0; background: none; color: #c1c9b8; font-size: 13px; cursor: pointer; }
.error { margin: 10px 0; padding: 12px 14px; border-radius: 6px; background: #ff4b3e18; color: #ffb0a5; font-size: 14px; }
.preview-banner { max-width: 1440px; margin: 12px auto 0; padding: 13px 15px; border: 1px solid #c7fa6850; border-radius: 7px; background: #c7fa6810; color: #e0efca; font-size: 13px; line-height: 1.6; }
.preview-mode .admin-content .admin-title .pill { opacity: .8; }
.admin-page button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 1050px) {
  .admin-layout { grid-template-columns: 185px minmax(0, 1fr); gap: 17px; }
  .overview-grid { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .admin-auth-page { padding: 20px 16px; }
  .admin-auth-card { gap: 16px; }
  .admin-page { padding: 12px 12px 40px; }
  .admin-top { top: 5px; min-height: 58px; height: auto; padding: 9px 12px; flex-wrap: wrap; gap: 8px; }
  .admin-top .brand { font-size: 17px; }
  .admin-top .brand span { font-size: 9px; }
  .top-actions { gap: 7px; }
  .top-actions .pill { padding: 9px 11px; font-size: 11px; }
  .admin-live { display: none; }
  .preview-banner { margin-top: 9px; font-size: 12px; }
  .admin-layout { display: block; margin: 14px auto; }
  .admin-sidebar { position: static; min-height: 0; margin-bottom: 18px; padding: 8px; }
  .sidebar-caption, .sidebar-foot { display: none; }
  .admin-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px; }
  .admin-nav button { justify-content: center; flex-direction: column; gap: 4px; padding: 9px 3px; font-size: 12px; text-align: center; }
  .admin-nav button small { display: none; }
  .nav-icon { font-size: 15px; }
  .admin-content { padding: 0 0 30px; }
  .admin-title { align-items: flex-start; }
  .admin-title h1 { font-size: 29px; }
  .admin-title p { max-width: 95%; font-size: 14px; }
  .admin-content > .admin-title > .pill { padding: 10px 12px; font-size: 12px; white-space: nowrap; }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .stats > div { padding: 14px; }
  .stats span { font-size: 13px; }
  .stats b { font-size: 25px; }
  .stats small { font-size: 11px; }
  .overview-grid { grid-template-columns: minmax(0, 1fr); }
  .admin-table { min-width: 680px; }
  .overview-grid .admin-table { min-width: 470px; }
  .table-footer { padding: 11px; font-size: 11px; }
  .dialog-backdrop { place-items: end center; padding: 10px; }
  .dialog { width: 100%; max-height: 92dvh; padding: 20px; border-radius: 12px 12px 8px 8px; }
  .dialog header h2 { font-size: 23px; }
  .dialog-actions { position: sticky; bottom: -20px; margin: 4px -20px -20px; padding: 14px 20px 18px; background: #111511; }
}
@media (max-width: 430px) {
  .admin-auth-page { padding: 14px; }
  .admin-auth-card { padding: 25px 20px; border-radius: 12px; }
  .auth-brand { font-size: 18px; }
  .admin-title { flex-direction: column; align-items: flex-start; }
  .admin-title h1 { font-size: 27px; }
  .admin-nav button { font-size: 10px; }
  .admin-table { min-width: 650px; }
  .overview-grid .admin-table { min-width: 440px; }
  .table-footer { flex-wrap: wrap; }
  .dialog { padding: 17px; }
  .dialog-actions { margin: 4px -17px -17px; padding: 13px 17px 16px; }
  .dialog-actions .pill { padding: 11px 13px; font-size: 12px; }
}
`;
