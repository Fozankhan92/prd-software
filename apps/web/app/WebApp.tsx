import { useMemo, useState } from 'react';
import { desktopNavigation } from './module-navigation';
import { createTenantId, createWebFile, createWebRecord, exportWorkspace, grantWebPermission, loadWebWorkspace, openWebSession, saveWebWorkspace, type WebCrmRecord, type WebWorkspaceState } from './web-store';
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
  lead: 'Lead', prospect: 'Prospect', customer: 'Customer', organization: 'Organization', contact: 'Contact', opportunity: 'Opportunity', pipeline: 'Pipeline', 'sales-stage': 'Sales stage', activity: 'Activity', call: 'Call', meeting: 'Meeting', task: 'Task', note: 'Note', 'follow-up': 'Follow-up', quotation: 'Quotation', 'sales-order': 'Sales order', contract: 'Contract', renewal: 'Renewal', 'service-case': 'Customer service case', complaint: 'Complaint', campaign: 'Campaign', 'marketing-source': 'Marketing source', territory: 'Territory', 'sales-team': 'Sales team', commission: 'Commission', 'credit-limit': 'Customer credit limit', 'customer-statement': 'Customer statement',
};

const crmViews = [
  ['overview', 'Overview'], ['sales', 'Sales'], ['activities', 'Activities'], ['service', 'Service'], ['marketing', 'Marketing'], ['controls', 'CRM controls'],
] as const;

const crmViewKinds: Record<(typeof crmViews)[number][0], WebCrmRecord['kind'][]> = {
  overview: Object.keys(recordLabels) as WebCrmRecord['kind'][],
  sales: ['lead', 'prospect', 'customer', 'organization', 'contact', 'opportunity', 'pipeline', 'sales-stage', 'quotation', 'sales-order', 'contract', 'renewal', 'commission', 'credit-limit', 'customer-statement'],
  activities: ['activity', 'call', 'meeting', 'task', 'note', 'follow-up'],
  service: ['service-case', 'complaint'],
  marketing: ['campaign', 'marketing-source'],
  controls: ['territory', 'sales-team'],
};

export function WebApp() {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [workspace, setWorkspace] = useState<WebWorkspaceState>(() => loadWebWorkspace());
  const [recordKind, setRecordKind] = useState<WebCrmRecord['kind']>('contact');
  const [recordName, setRecordName] = useState('');
  const [recordDetail, setRecordDetail] = useState('');
  const [recordStatus, setRecordStatus] = useState('New');
  const [crmView, setCrmView] = useState<(typeof crmViews)[number][0]>('overview');
  const [recordRelationship, setRecordRelationship] = useState('');
  const [recordOwner, setRecordOwner] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordPriority, setRecordPriority] = useState('Normal');
  const [customFieldName, setCustomFieldName] = useState('');
  const [customStageName, setCustomStageName] = useState('');
  const [permissionSubject, setPermissionSubject] = useState('');
  const [permissionResource, setPermissionResource] = useState('');
  const [permissionEdit, setPermissionEdit] = useState(false);
  const [message, setMessage] = useState('');

  const crmRecords = useMemo(() => workspace.records, [workspace.records]);
  const crmViewRecords = useMemo(() => {
    return crmRecords.filter((record) => crmViewKinds[crmView].includes(record.kind));
  }, [crmRecords, crmView]);
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
    const next = { ...workspace, tenantId: workspace.tenantId || createTenantId(), session: workspace.session || openWebSession(workspace.tenantId || 'local-tenant', workspace.adminName) };
    saveWorkspace(next, 'Workspace setup saved and session opened.');
  }

  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recordName.trim()) {
      setMessage(`${recordLabels[recordKind]} name is required.`);
      return;
    }
    const duplicate = workspace.records.some((record) => record.kind === recordKind && record.name.trim().toLowerCase() === recordName.trim().toLowerCase());
    if (duplicate) {
      setMessage(`Possible duplicate detected: this ${recordLabels[recordKind].toLowerCase()} already exists.`);
      return;
    }
    const detailParts = [recordDetail.trim(), recordRelationship.trim() ? `Related to: ${recordRelationship.trim()}` : '', recordOwner.trim() ? `Owner: ${recordOwner.trim()}` : '', recordAmount.trim() ? `Amount: ${recordAmount.trim()}` : '', recordDate ? `Date: ${recordDate}` : '', crmView === 'service' ? `Priority: ${recordPriority}` : ''].filter(Boolean);
    const detail = detailParts.join(' · ');
    const next = { ...workspace, records: [createWebRecord(recordKind, recordName.trim(), detail, recordStatus), ...workspace.records] };
    saveWorkspace(next, `${recordLabels[recordKind]} added to the web workspace.`);
    setRecordName('');
    setRecordDetail('');
    setRecordRelationship('');
    setRecordOwner('');
    setRecordAmount('');
    setRecordDate('');
    setRecordPriority('Normal');
  }

  function deleteRecord(recordId: string) {
    const record = workspace.records.find((item) => item.id === recordId);
    if (!record) return;
    if (!window.confirm(`Delete this ${recordLabels[record.kind].toLowerCase()}?`)) return;
    saveWorkspace({ ...workspace, records: workspace.records.filter((item) => item.id !== recordId) }, `${recordLabels[record.kind]} deleted.`);
  }

  function addCustomField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customFieldName.trim() || workspace.customFields.includes(customFieldName.trim())) return setMessage('Enter a new custom field name.');
    saveWorkspace({ ...workspace, customFields: [...workspace.customFields, customFieldName.trim()] }, 'Custom CRM field added.');
    setCustomFieldName('');
  }

  function addCustomStage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customStageName.trim() || workspace.customPipelineStages.includes(customStageName.trim())) return setMessage('Enter a new custom pipeline stage.');
    saveWorkspace({ ...workspace, customPipelineStages: [...workspace.customPipelineStages, customStageName.trim()] }, 'Custom pipeline stage added.');
    setCustomStageName('');
  }

  function addPermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permissionSubject.trim() || !permissionResource.trim()) {
      setMessage('User or group and resource are required.');
      return;
    }
    saveWorkspace({ ...workspace, permissions: [grantWebPermission(permissionSubject.trim(), permissionResource.trim(), permissionEdit), ...workspace.permissions] }, permissionEdit ? 'Read and edit permission granted.' : 'Read-only permission granted.');
    setPermissionSubject('');
    setPermissionResource('');
  }

  function addFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    saveWorkspace({ ...workspace, files: [createWebFile(file), ...workspace.files] }, `${file.name} added to file metadata. Cloud storage adapter is ready.`);
    event.target.value = '';
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
        <div className="web-app__sidebar-footer"><span className="web-status-dot" /> Web workspace<br /><small>{workspace.session ? 'Session active' : 'Setup required'}</small></div>
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
            <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Getting started</p><h3>Set up your workspace</h3></div><span className="web-card__step">1 of 3</span></div><form className="web-form" onSubmit={finishSetup}><label>Organization name<input value={workspace.organization} onChange={(event) => setWorkspace({ ...workspace, organization: event.target.value })} placeholder="e.g. Fozan Trading Co." /></label><label>Administrator name<input value={workspace.adminName} onChange={(event) => setWorkspace({ ...workspace, adminName: event.target.value })} placeholder="Your name" /></label><button className="web-button web-button--primary" type="submit">Save workspace setup</button></form></section><section className="web-card"><p className="web-app__eyebrow">Next layers</p><h3>Connected services</h3><ul className="web-checklist"><li><span>✓</span> Tenant-aware data service</li><li><span>✓</span> Session and permission boundary</li><li><span>✓</span> JSON backup/export now</li><li><span>✓</span> PostgreSQL and cloud storage ready</li></ul><button className="web-button web-button--secondary" type="button" onClick={() => exportWorkspace(workspace)}>Download backup</button></section></div>
          </> : null}

          {activeModule === 'crm' ? <>
            <div className="web-subnav" aria-label="CRM sections">{crmViews.map(([value, label]) => <button type="button" key={value} className={crmView === value ? 'web-subnav__item web-subnav__item--active' : 'web-subnav__item'} onClick={() => setCrmView(value)}>{label}</button>)}</div>
            {crmView !== 'controls' ? <div className="web-grid web-grid--crm"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">{crmViews.find(([value]) => value === crmView)?.[1]} data entry</p><h3>Add a related CRM record</h3></div><span className="web-card__hint">Section-specific fields</span></div><form className="web-form" onSubmit={addRecord}><label>Record type<select value={recordKind} onChange={(event) => setRecordKind(event.target.value as WebCrmRecord['kind'])}>{crmViewKinds[crmView].map((kind) => <option value={kind} key={kind}>{recordLabels[kind]}</option>)}</select></label><label>{crmView === 'activities' ? 'Subject' : crmView === 'service' ? 'Case subject' : crmView === 'marketing' ? 'Campaign name' : 'Name or subject'}<input value={recordName} onChange={(event) => setRecordName(event.target.value)} placeholder={crmView === 'activities' ? 'Call, meeting, task...' : 'Record name'} /></label><label>{crmView === 'service' ? 'Customer complaint or case details' : crmView === 'marketing' ? 'Audience and campaign details' : 'Details and notes'}<input value={recordDetail} onChange={(event) => setRecordDetail(event.target.value)} placeholder="Enter detailed information" /></label><label>Related record<input value={recordRelationship} onChange={(event) => setRecordRelationship(event.target.value)} placeholder="Account, contact, opportunity..." /></label>{crmView === 'sales' ? <><label>Owner or sales team<input value={recordOwner} onChange={(event) => setRecordOwner(event.target.value)} placeholder="Owner, territory, or sales team" /></label><label>Amount or limit<input value={recordAmount} onChange={(event) => setRecordAmount(event.target.value)} placeholder="Currency amount" type="number" /></label><label>Expected date<input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} type="date" /></label></> : null}{crmView === 'activities' ? <><label>Assigned to<input value={recordOwner} onChange={(event) => setRecordOwner(event.target.value)} placeholder="User or team" /></label><label>Due date<input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} type="datetime-local" /></label></> : null}{crmView === 'service' ? <><label>Priority<select value={recordPriority} onChange={(event) => setRecordPriority(event.target.value)}><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></label><label>Assigned queue<input value={recordOwner} onChange={(event) => setRecordOwner(event.target.value)} placeholder="Service queue or owner" /></label></> : null}{crmView === 'marketing' ? <><label>Budget<input value={recordAmount} onChange={(event) => setRecordAmount(event.target.value)} placeholder="Campaign budget" type="number" /></label><label>Start date<input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} type="date" /></label></> : null}<label>Status or stage<select value={recordStatus} onChange={(event) => setRecordStatus(event.target.value)}>{['New', 'Working', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Open', 'Pending', 'Resolved', 'Completed', ...workspace.customPipelineStages].map((stage) => <option key={stage}>{stage}</option>)}</select></label><button className="web-button web-button--primary" type="submit">Add {crmViews.find(([value]) => value === crmView)?.[1]} record</button></form></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">{crmViews.find(([value]) => value === crmView)?.[1]}</p><h3>Expanded CRM data</h3></div><span className="web-card__hint">{crmViewRecords.length} records</span></div><div className="web-records">{crmViewRecords.length ? crmViewRecords.slice(0, 20).map((record) => <details className="web-record" key={record.id}><summary><span className="web-record-icon">{recordLabels[record.kind].slice(0, 1)}</span><span><strong>{record.name}</strong><small>{recordLabels[record.kind]} · {record.status}</small></span></summary><div className="web-record__details"><p>{record.detail || 'No additional details entered.'}</p><small>Created {new Date(record.createdAt).toLocaleString()}</small><button className="web-button web-button--danger" type="button" onClick={() => deleteRecord(record.id)}>Delete record</button></div></details>) : <div className="web-empty">No records in this CRM section yet.</div>}</div></section></div> : null}
            {crmView === 'overview' ? <section className="web-card web-crm-overview"><div className="web-card__heading"><div><p className="web-app__eyebrow">CRM overview</p><h3>Summary by CRM area</h3></div><span className="web-card__hint">Live browser data</span></div><div className="web-crm-overview__grid">{crmViews.filter(([value]) => value !== 'overview' && value !== 'controls').map(([value, label]) => <article key={value}><span>{label}</span><strong>{crmRecords.filter((record) => crmViewKinds[value].includes(record.kind)).length}</strong><small>{value === 'sales' ? 'Revenue lifecycle' : value === 'activities' ? 'Engagement history' : value === 'service' ? 'Customer support' : 'Demand generation'}</small></article>)}</div></section> : null}
            {crmView === 'controls' ? <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Configuration</p><h3>Custom CRM fields</h3></div><span className="web-card__hint">{workspace.customFields.length} fields</span></div><form className="web-form" onSubmit={addCustomField}><label>Field name<input value={customFieldName} onChange={(event) => setCustomFieldName(event.target.value)} placeholder="e.g. Customer segment" /></label><button className="web-button web-button--primary" type="submit">Add custom field</button></form><div className="web-chip-list">{workspace.customFields.map((field) => <span key={field}>{field}</span>)}</div></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Pipeline configuration</p><h3>Custom sales stages</h3></div><span className="web-card__hint">{workspace.customPipelineStages.length} stages</span></div><form className="web-form" onSubmit={addCustomStage}><label>Stage name<input value={customStageName} onChange={(event) => setCustomStageName(event.target.value)} placeholder="e.g. Legal review" /></label><button className="web-button web-button--primary" type="submit">Add pipeline stage</button></form><div className="web-chip-list">{workspace.customPipelineStages.map((stage) => <span key={stage}>{stage}</span>)}</div></section></div> : null}
          </> : null}

          {activeModule === 'admin' ? <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Double-layer access</p><h3>Assign permission</h3></div><span className="web-card__hint">Read ≠ edit</span></div><form className="web-form" onSubmit={addPermission}><label>User or group<input value={permissionSubject} onChange={(event) => setPermissionSubject(event.target.value)} placeholder="User, role, or department" /></label><label>Resource<input value={permissionResource} onChange={(event) => setPermissionResource(event.target.value)} placeholder="CRM account, file, report..." /></label><label className="web-checkbox"><input type="checkbox" checked={permissionEdit} onChange={(event) => setPermissionEdit(event.target.checked)} /> Also grant edit permission</label><button className="web-button web-button--primary" type="submit">Grant permission</button></form></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Permission register</p><h3>Current grants</h3></div><button className="web-button web-button--secondary" type="button" onClick={() => exportWorkspace(workspace)}>Backup</button></div><div className="web-records">{workspace.permissions.length ? workspace.permissions.map((permission) => <article key={permission.id}><span className="web-record-icon">{permission.canEdit ? 'E' : 'R'}</span><div><strong>{permission.subject}</strong><small>{permission.resource} · {permission.canEdit ? 'Read and edit' : 'Read only'}</small></div></article>) : <div className="web-empty">No permissions assigned yet.</div>}</div></section></div> : null}

          {activeModule === 'files' ? <section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Cloud file boundary</p><h3>Files and controlled sharing</h3></div><span className="web-card__hint">Cloud-ready</span></div><label className="web-file-drop">Choose a file<input type="file" onChange={addFile} /></label><div className="web-records">{workspace.files.length ? workspace.files.map((file) => <article key={file.id}><span className="web-record-icon">F</span><div><strong>{file.name}</strong><small>{Math.ceil(file.size / 1024)} KB · {file.storage} · uploaded {new Date(file.uploadedAt).toLocaleDateString()}</small></div></article>) : <div className="web-empty">No files added yet.</div>}</div></section> : null}

          {activeModule !== 'home' && activeModule !== 'crm' ? <section className="web-card web-placeholder"><span className="web-placeholder__icon">{desktopNavigation.find((item) => item.id === activeModule)?.label.slice(0, 1)}</span><h3>{desktopNavigation.find((item) => item.id === activeModule)?.label} foundation</h3><p>{moduleDescriptions[activeModule]} The web foundation is ready for its detailed forms, workflows, reports, and permission-aware database services.</p><button type="button" className="web-button web-button--secondary" onClick={() => setMessage('This module is queued for its detailed web workflow.')}>Plan module workflow</button></section> : null}
          {message ? <p className="web-message" role="status">{message}</p> : null}
        </section>
      </main>
    </div>
  );
}
