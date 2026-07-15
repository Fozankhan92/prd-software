import { useMemo, useState } from 'react';
import { desktopNavigation } from './module-navigation';
import { createWebRecord, loadWebWorkspace, saveWebWorkspace, type WebCrmRecord, type WebWorkspaceState } from '../web-store';
import './web-app.css';

type ModuleId = (typeof desktopNavigation)[number]['id'];

const moduleDescriptions: Record<ModuleId, string> = {
  home: 'A live summary of your organization, approvals, and exceptions.',
  admin: 'Users, roles, permissions, sessions, and audit history.',
  crm: 'Accounts, contacts, leads, opportunities, activities, quotes, and cases.',
  hr: 'Employees, departments, attendance, leave, and people records.',
  erp: 'Products, suppliers, purchasing, receiving, and operational controls.',
  pos: 'Registers, sales, returns, payments, and end-of-day closing.',
  ims: 'Locations, stock, lots, serials, transfers, and inventory counts.',
  oms: 'Orders, fulfillment, returns, cancellations, and customer status.',
  scm: 'Suppliers, shipments, lead times, receiving, and delivery exceptions.',
  accounting: 'Accounts, journals, imprest, narration, reconciliation, and closing.',
  finance: 'Budgets, cash flow, payables, receivables, and forecasts.',
  files: 'Controlled files, versions, sharing, and permission-aware access.',
};

const recordLabels: Record<WebCrmRecord['kind'], string> = {
  organization: 'Account', contact: 'Contact', lead: 'Lead', opportunity: 'Opportunity', activity: 'Activity',
};

export function WebApp() {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [workspace, setWorkspace] = useState<WebWorkspaceState>(() => loadWebWorkspace());
  const [recordKind, setRecordKind] = useState<WebCrmRecord['kind']>('contact');
  const [recordName, setRecordName] = useState('');
  const [recordDetail, setRecordDetail] = useState('');
  const [recordStatus, setRecordStatus] = useState('New');
  const [message, setMessage] = useState('');

  const crmRecords = useMemo(() => workspace.records.filter((record) => record.kind !== 'activity'), [workspace.records]);
  const saveWorkspace = (next: WebWorkspaceState, successMessage: string) => {
    setWorkspace(next);
    saveWebWorkspace(next);
    setMessage(successMessage);
  };

  function finishSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace.organization.trim() || !workspace.adminName.trim()) {
      setMessage('Organization and administrator name are required. Email can be added later.');
      return;
    }
    saveWorkspace(workspace, 'Workspace setup saved in this browser.');
  }

  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recordName.trim()) {
      setMessage(`${recordLabels[recordKind]} name is required.`);
      return;
    }
    const next = { ...workspace, records: [createWebRecord(recordKind, recordName.trim(), recordDetail.trim(), recordStatus), ...workspace.records] };
    saveWorkspace(next, `${recordLabels[recordKind]} added to the web workspace.`);
    setRecordName('');
    setRecordDetail('');
  }

  return (
    <div className="web-app">
      <aside className="web-app__sidebar">
        <div className="web-app__brand"><span className="web-app__brand-mark">P</span><span>PRD Software</span></div>
        <p className="web-app__sidebar-label">Workspace</p>
        <nav aria-label="Primary navigation">
          {desktopNavigation.map((item) => (
            <button key={item.id} className={item.id === activeModule ? 'web-nav web-nav--active' : 'web-nav'} onClick={() => { setActiveModule(item.id); setMessage(''); }} type="button">
              <span className="web-nav__icon">{item.label.slice(0, 1)}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="web-app__sidebar-footer"><span className="web-status-dot" /> Web workspace<br /><small>Data is stored in this browser for now</small></div>
      </aside>
      <main className="web-app__main">
        <header className="web-app__header">
          <div><p className="web-app__eyebrow">{workspace.organization || 'Your organization'}</p><h1>{desktopNavigation.find((item) => item.id === activeModule)?.label}</h1></div>
          <div className="web-app__header-actions"><button type="button" className="web-button web-button--quiet">Search</button><button type="button" className="web-button web-button--quiet">Notifications</button><span className="web-avatar">{workspace.adminName ? workspace.adminName.slice(0, 1).toUpperCase() : 'A'}</span></div>
        </header>
        <section className="web-app__content">
          <div className="web-app__intro"><div><p className="web-app__eyebrow">{activeModule === 'crm' ? 'Customer operations' : 'Business workspace'}</p><h2>{activeModule === 'home' ? 'Good morning' : `${desktopNavigation.find((item) => item.id === activeModule)?.label} workspace`}</h2><p>{moduleDescriptions[activeModule]}</p></div><span className="web-pill">MCP boundary · no AI tools</span></div>

          {activeModule === 'home' ? <>
            <div className="web-metrics"><article><span>CRM records</span><strong>{crmRecords.length}</strong><small>Accounts, contacts, leads, opportunities</small></article><article><span>Active modules</span><strong>12</strong><small>Connected business areas</small></article><article><span>Permission model</span><strong>2-layer</strong><small>Read and edit are separate</small></article><article><span>Data mode</span><strong>Web</strong><small>Ready for managed cloud database</small></article></div>
            <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Getting started</p><h3>Set up your workspace</h3></div><span className="web-card__step">1 of 3</span></div><form className="web-form" onSubmit={finishSetup}><label>Organization name<input value={workspace.organization} onChange={(event) => setWorkspace({ ...workspace, organization: event.target.value })} placeholder="e.g. Fozan Trading Co." /></label><label>Administrator name<input value={workspace.adminName} onChange={(event) => setWorkspace({ ...workspace, adminName: event.target.value })} placeholder="Your name" /></label><button className="web-button web-button--primary" type="submit">Save workspace setup</button></form></section><section className="web-card"><p className="web-app__eyebrow">Next layers</p><h3>What will be added next</h3><ul className="web-checklist"><li><span>✓</span> Managed PostgreSQL database</li><li><span>✓</span> Login and organization access</li><li><span>✓</span> Advanced CRM forms and imports</li><li><span>✓</span> Admin permissions and audit trails</li></ul></section></div>
          </> : null}

          {activeModule === 'crm' ? <div className="web-grid web-grid--crm"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">CRM data entry</p><h3>Add a related record</h3></div><span className="web-card__hint">Complex records supported</span></div><form className="web-form" onSubmit={addRecord}><label>Record type<select value={recordKind} onChange={(event) => setRecordKind(event.target.value as WebCrmRecord['kind'])}>{Object.entries(recordLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Name or subject<input value={recordName} onChange={(event) => setRecordName(event.target.value)} placeholder="Record name" /></label><label>Details, notes, or reference<input value={recordDetail} onChange={(event) => setRecordDetail(event.target.value)} placeholder="Optional details" /></label><label>Status<select value={recordStatus} onChange={(event) => setRecordStatus(event.target.value)}><option>New</option><option>Working</option><option>Qualified</option><option>Proposal</option><option>Won</option><option>Open</option><option>Completed</option></select></label><button className="web-button web-button--primary" type="submit">Add to CRM</button></form></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Recent records</p><h3>CRM workspace</h3></div><span className="web-card__hint">{crmRecords.length} records</span></div><div className="web-records">{crmRecords.length ? crmRecords.slice(0, 8).map((record) => <article key={record.id}><span className="web-record-icon">{recordLabels[record.kind].slice(0, 1)}</span><div><strong>{record.name}</strong><small>{recordLabels[record.kind]} · {record.status}{record.detail ? ` · ${record.detail}` : ''}</small></div></article>) : <div className="web-empty">Your CRM records will appear here after you add them.</div>}</div></section></div> : null}

          {activeModule !== 'home' && activeModule !== 'crm' ? <section className="web-card web-placeholder"><span className="web-placeholder__icon">{desktopNavigation.find((item) => item.id === activeModule)?.label.slice(0, 1)}</span><h3>{desktopNavigation.find((item) => item.id === activeModule)?.label} foundation</h3><p>{moduleDescriptions[activeModule]} The web foundation is ready for its detailed forms, workflows, reports, and permission-aware database services.</p><button type="button" className="web-button web-button--secondary" onClick={() => setMessage('This module is queued for its detailed web workflow.')}>Plan module workflow</button></section> : null}
          {message ? <p className="web-message" role="status">{message}</p> : null}
        </section>
      </main>
    </div>
  );
}
