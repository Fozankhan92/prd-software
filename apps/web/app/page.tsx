'use client';

import { useState } from 'react';
import Database from '@tauri-apps/plugin-sql';

const cards = [
  ['Revenue', '—', 'Connect finance data'],
  ['Open orders', '—', 'Connect OMS data'],
  ['Inventory alerts', '—', 'Connect IMS data'],
  ['Pending approvals', '—', 'Review authorization queue'],
];

const modules = ['CRM', 'HR', 'ERP', 'POS', 'IMS', 'OMS', 'SCM', 'Accounting', 'Finance', 'Files'];

export default function HomePage() {
  const [organization, setOrganization] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [status, setStatus] = useState('Admin setup pending');
  const [permissionSubject, setPermissionSubject] = useState('');
  const [permissionResource, setPermissionResource] = useState('');
  const [permissionAction, setPermissionAction] = useState<'read' | 'edit'>('read');
  const [permissionStatus, setPermissionStatus] = useState('Permission assignment pending');

  async function bootstrapAdmin() {
    if (!organization.trim() || !adminEmail.trim()) {
      setStatus('Organization and administrator email are required');
      return;
    }

    try {
      const database = await Database.load('sqlite:prd.sqlite');
      const now = new Date().toISOString();
      const tenantId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const sessionId = crypto.randomUUID();

      await database.execute('INSERT INTO tenant (id, name, created_at) VALUES ($1, $2, $3)', [tenantId, organization.trim(), now]);
      await database.execute('INSERT INTO app_user (id, tenant_id, email, display_name, created_at) VALUES ($1, $2, $3, $4, $5)', [userId, tenantId, adminEmail.trim(), adminEmail.trim(), now]);
      await database.execute('UPDATE admin_bootstrap SET tenant_id = $1, user_id = $2, completed_at = $3 WHERE id = 1', [tenantId, userId, now]);
      await database.execute('INSERT INTO session (id, tenant_id, user_id, issued_at, expires_at) VALUES ($1, $2, $3, $4, $5)', [sessionId, tenantId, userId, now, null]);
      setStatus('Administrator bootstrap and local session saved');
    } catch {
      setStatus('Open PRD Software inside Tauri to save the local bootstrap');
    }
  }

  async function grantPermission() {
    if (!permissionSubject.trim() || !permissionResource.trim()) {
      setPermissionStatus('Subject and resource are required');
      return;
    }
    try {
      const database = await Database.load('sqlite:prd.sqlite');
      await database.execute('INSERT INTO permission_grant (id, tenant_id, subject_id, resource_type, resource_id, action, effect, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [crypto.randomUUID(), 'local-bootstrap', permissionSubject.trim(), 'business_record', permissionResource.trim(), permissionAction, 'allow', new Date().toISOString()]);
      setPermissionStatus(permissionAction === 'read' ? 'Read-only permission granted' : 'Edit permission granted');
    } catch {
      setPermissionStatus('Open PRD Software inside Tauri to save permissions');
    }
  }

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

      <section aria-label="Executive summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 32 }}>
        {cards.map(([label, value, detail]) => (
          <article key={label} style={{ border: '1px solid #eaecf0', borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#667085', margin: 0 }}>{label}</p>
            <strong style={{ display: 'block', fontSize: 28, margin: '12px 0' }}>{value}</strong>
            <small style={{ color: '#667085' }}>{detail}</small>
          </article>
        ))}
      </section>

      <section aria-label="Administrator setup" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>First-launch administrator setup</h2>
        <p style={{ color: '#667085' }}>Create the local organization and administrator record for this desktop installation.</p>
        <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <input aria-label="Organization name" placeholder="Organization name" value={organization} onChange={(event) => setOrganization(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <input aria-label="Administrator email" placeholder="Administrator email" type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <button type="button" onClick={bootstrapAdmin} style={{ width: 'fit-content', border: 0, borderRadius: 8, background: '#175cd3', color: 'white', padding: '10px 16px' }}>Save local administrator</button>
          <small role="status" style={{ color: '#667085' }}>{status}</small>
        </div>
      </section>


      <section aria-label="Permission assignment" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>Admin permission assignment</h2>
        <p style={{ color: '#667085' }}>Grant read access first; edit access is a separate approval.</p>
        <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <input aria-label="User or group ID" placeholder="User or group ID" value={permissionSubject} onChange={(event) => setPermissionSubject(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <input aria-label="Resource ID" placeholder="Resource ID" value={permissionResource} onChange={(event) => setPermissionResource(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <select aria-label="Permission level" value={permissionAction} onChange={(event) => setPermissionAction(event.target.value as 'read' | 'edit')} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }}>
            <option value="read">Read only</option>
            <option value="edit">Edit approval</option>
          </select>
          <button type="button" onClick={grantPermission} style={{ width: 'fit-content', border: 0, borderRadius: 8, background: '#344054', color: 'white', padding: '10px 16px' }}>Grant permission</button>
          <small role="status" style={{ color: '#667085' }}>{permissionStatus}</small>
        </div>
      </section>

      <section aria-label="Modules" style={{ marginTop: 40 }}>
        <h2>Business modules</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {modules.map((module) => <button key={module} type="button" style={{ border: '1px solid #d0d5dd', borderRadius: 8, background: 'white', padding: '10px 14px' }}>{module}</button>)}
        </div>
      </section>
    </main>
  );
}
