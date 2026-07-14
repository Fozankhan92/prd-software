const cards = [
  ['Revenue', '—', 'Connect finance data'],
  ['Open orders', '—', 'Connect OMS data'],
  ['Inventory alerts', '—', 'Connect IMS data'],
  ['Pending approvals', '—', 'Review authorization queue'],
];

const modules = ['CRM', 'HR', 'ERP', 'POS', 'IMS', 'OMS', 'SCM', 'Accounting', 'Finance', 'Files'];

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 24 }}>
        <div>
          <p style={{ color: '#667085', marginBottom: 8 }}>PRD SOFTWARE / ADMIN</p>
          <h1 style={{ margin: 0 }}>Operations overview</h1>
          <p style={{ color: '#667085' }}>Authorized summaries with drill-down detail.</p>
        </div>
        <span style={{ background: '#ecfdf3', color: '#027a48', padding: '8px 12px', borderRadius: 999, fontSize: 13 }}>MCP disabled</span>
      </header>
      <section aria-label='Executive summary' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 32 }}>
        {cards.map(([label, value, detail]) => (
          <article key={label} style={{ border: '1px solid #eaecf0', borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#667085', margin: 0 }}>{label}</p>
            <strong style={{ display: 'block', fontSize: 28, margin: '12px 0' }}>{value}</strong>
            <small style={{ color: '#667085' }}>{detail}</small>
          </article>
        ))}
      </section>
      <section aria-label='Modules' style={{ marginTop: 40 }}>
        <h2>Business modules</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {modules.map((module) => <button key={module} type='button' style={{ border: '1px solid #d0d5dd', borderRadius: 8, background: 'white', padding: '10px 14px' }}>{module}</button>)}
        </div>
      </section>
    </main>
  );
}
