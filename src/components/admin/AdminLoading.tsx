export default function AdminLoading() {
  return (
    <main className="admin-page admin-loading-page" aria-busy="true" aria-live="polite">
      <section className="admin-loading-card glass" role="status" aria-label="Preparing admin workspace">
        <div className="admin-loading-brand">
          <span className="admin-loading-mark" aria-hidden="true">SG</span>
          <span>SAURAV <i>GUSAIN</i><small>PORTFOLIO WORKSPACE</small></span>
        </div>
        <div className="admin-loading-copy">
          <span className="admin-loading-spinner" aria-hidden="true" />
          <div>
            <h1>Preparing your workspace</h1>
            <p>Securely checking your portfolio and enquiries…</p>
          </div>
        </div>
        <div className="admin-loading-skeleton" aria-hidden="true">
          <span /><span /><span />
        </div>
        <span className="sr-only">Please wait while the admin workspace loads.</span>
      </section>
    </main>
  );
}
