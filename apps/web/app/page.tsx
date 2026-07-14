'use client';

import { useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { LocalUserDirectory } from '../user-directory';

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState('');
  const [resumeStatus, setResumeStatus] = useState('Session resume pending');
  const [revokeSessionId, setRevokeSessionId] = useState('');
  const [revokeStatus, setRevokeStatus] = useState('Admin revocation pending');
  const [userEmail, setUserEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userRole, setUserRole] = useState<'staff' | 'manager' | 'department_admin' | 'organization_admin'>('staff');
  const [userStatus, setUserStatus] = useState<'active' | 'invited' | 'suspended'>('active');
  const [userStatusMessage, setUserStatusMessage] = useState('User management pending');
  const [users, setUsers] = useState<readonly { id: string; email: string; displayName: string; status: string }[]>([]);
  const [usersStatus, setUsersStatus] = useState('User list not loaded');

  useEffect(() => {
    void (async () => {
      try {
        const database = await Database.load('sqlite:prd.sqlite');
        const metadata = await database.select<{ value: string }[]>('SELECT value FROM app_metadata WHERE key = $1', ['current_session_id']);
        const sessionId = metadata[0]?.value;
        if (!sessionId) return;
        const rows = await database.select<{ id: string; revoked_at: string | null; expires_at: string | null }[]>('SELECT id, revoked_at, expires_at FROM session WHERE id = $1', [sessionId]);
        const session = rows[0];
        if (!session || session.revoked_at || (session.expires_at && session.expires_at <= new Date().toISOString())) return;
        setCurrentSessionId(session.id);
        setResumeStatus('Active local session restored');
      } catch {
        // Session restoration runs only inside the Tauri desktop shell.
      }
    })();
  }, []);
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
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_tenant_id', $1)", [tenantId]);
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_user_id', $1)", [userId]);
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_session_id', $1)", [sessionId]);
      setCurrentSessionId(sessionId);
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
      const bootstrap = await database.select<{ tenant_id: string; user_id: string }[]>('SELECT tenant_id, user_id FROM admin_bootstrap WHERE id = 1');
      const tenantId = bootstrap[0]?.tenant_id;
      const actorId = bootstrap[0]?.user_id;
      if (!tenantId || !actorId) throw new Error('administrator_bootstrap_required');
      await database.execute('INSERT INTO permission_grant (id, tenant_id, subject_id, resource_type, resource_id, action, effect, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [crypto.randomUUID(), tenantId, permissionSubject.trim(), 'business_record', permissionResource.trim(), permissionAction, 'allow', new Date().toISOString()]);
      await database.execute('INSERT INTO audit_event (id, tenant_id, actor_id, action, resource_type, resource_id, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [crypto.randomUUID(), tenantId, actorId, 'permission_granted', 'business_record', permissionResource.trim(), new Date().toISOString()]);
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



      <section aria-label="Local session resume" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>Resume local session</h2>
        <p style={{ color: '#667085' }}>Reopen a session until it is explicitly closed or revoked.</p>
        <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <input aria-label="Session ID" placeholder="Session ID" value={resumeSessionId} onChange={(event) => setResumeSessionId(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <button type="button" onClick={async () => {
            if (!resumeSessionId.trim()) {
              setResumeStatus('Session ID is required');
              return;
            }
            try {
              const database = await Database.load('sqlite:prd.sqlite');
              const rows = await database.select<{ id: string; revoked_at: string | null; expires_at: string | null }[]>('SELECT id, revoked_at, expires_at FROM session WHERE id = $1', [resumeSessionId.trim()]);
              const session = rows[0];
              if (!session || session.revoked_at || (session.expires_at && session.expires_at <= new Date().toISOString())) {
                setResumeStatus('Session is unavailable');
                return;
              }
              await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_session_id', $1)", [session.id]);
              setCurrentSessionId(session.id);
              setResumeStatus('Local session resumed');
            } catch {
              setResumeStatus('Open PRD Software inside Tauri to resume sessions');
            }
          }} style={{ width: 'fit-content', border: 0, borderRadius: 8, background: '#175cd3', color: 'white', padding: '10px 16px' }}>Resume session</button>
          <small role="status" style={{ color: '#667085' }}>{resumeStatus}</small>
        </div>
      </section>

      <section aria-label="Session controls" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>Session controls</h2>
        <p style={{ color: '#667085' }}>Sessions remain active until explicitly closed or revoked.</p>
        <button type="button" disabled={!currentSessionId} onClick={async () => {
          if (!currentSessionId) return;
          const database = await Database.load('sqlite:prd.sqlite');
          await database.execute('UPDATE session SET revoked_at = $1 WHERE id = $2', [new Date().toISOString(), currentSessionId]);
          await database.execute("DELETE FROM app_metadata WHERE key = 'current_session_id'");
          setCurrentSessionId(null);
          setStatus('Local session closed');
        }} style={{ border: 0, borderRadius: 8, background: '#b42318', color: 'white', padding: '10px 16px' }}>Close current session</button>

        <div style={{ display: 'grid', gap: 12, maxWidth: 520, marginTop: 20 }}>
          <input aria-label="Session ID to revoke" placeholder="Session ID to revoke" value={revokeSessionId} onChange={(event) => setRevokeSessionId(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <button type="button" onClick={async () => {
            if (!revokeSessionId.trim()) {
              setRevokeStatus('Session ID is required');
              return;
            }
            try {
              const database = await Database.load('sqlite:prd.sqlite');
              await database.execute('UPDATE session SET revoked_at = $1 WHERE id = $2', [new Date().toISOString(), revokeSessionId.trim()]);
              const revokedAt = new Date().toISOString();
              await database.execute('INSERT INTO audit_event (id, tenant_id, actor_id, action, resource_type, resource_id, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [crypto.randomUUID(), 'admin-scope', 'local-admin', 'session_revoked', 'session', revokeSessionId.trim(), revokedAt]);
              setRevokeSessionId('');
              setRevokeStatus('Session revoked by administrator');
            } catch {
              setRevokeStatus('Open PRD Software inside Tauri to revoke sessions');
            }
          }} style={{ width: 'fit-content', border: 0, borderRadius: 8, background: '#7a271a', color: 'white', padding: '10px 16px' }}>Revoke session</button>
          <small role="status" style={{ color: '#667085' }}>{revokeStatus}</small>
        </div>
      </section>


      <section aria-label="User management" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>Organization users</h2>
        <p style={{ color: '#667085' }}>Create users and assign role and account status. Email is optional for desktop-only users, but adding one is encouraged for notifications and identification.</p>
        <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <input aria-label="User email" placeholder="User email" type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <input aria-label="Display name" placeholder="Display name" value={userDisplayName} onChange={(event) => setUserDisplayName(event.target.value)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }} />
          <select aria-label="User role" value={userRole} onChange={(event) => setUserRole(event.target.value as typeof userRole)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="department_admin">Department admin</option>
            <option value="organization_admin">Organization admin</option>
          </select>
          <select aria-label="User status" value={userStatus} onChange={(event) => setUserStatus(event.target.value as typeof userStatus)} style={{ padding: 12, border: '1px solid #d0d5dd', borderRadius: 8 }}>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="button" onClick={async () => {
            if (!userDisplayName.trim()) {
              setUserStatusMessage('Display name is required; email is optional but encouraged');
              return;
            }
            try {
              const database = await Database.load('sqlite:prd.sqlite');
              const metadata = await database.select<{ value: string }[]>('SELECT value FROM app_metadata WHERE key = $1', ['current_tenant_id']);
              const tenantId = metadata[0]?.value;
              if (!tenantId) throw new Error('organization_required');
              const userId = crypto.randomUUID();
              const now = new Date().toISOString();
              await database.execute('INSERT INTO app_user (id, tenant_id, email, display_name, role, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [userId, tenantId, userEmail.trim(), userDisplayName.trim(), userRole, userStatus, now]);
              await database.execute('INSERT INTO audit_event (id, tenant_id, actor_id, action, resource_type, resource_id, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [crypto.randomUUID(), tenantId, (await database.select<{ value: string }[]>('SELECT value FROM app_metadata WHERE key = $1', ['current_user_id']))[0]?.value ?? 'unknown', 'user_created', 'app_user', userId, now]);
              setUserEmail('');
              setUserDisplayName('');
              setUserStatusMessage('User created locally');
            } catch {
              setUserStatusMessage('Complete administrator setup inside Tauri first');
            }
          }} style={{ width: 'fit-content', border: 0, borderRadius: 8, background: '#175cd3', color: 'white', padding: '10px 16px' }}>Save user</button>
          <small role="status" style={{ color: '#667085' }}>{userStatusMessage}</small>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="button" onClick={async () => {
            try {
              const database = await Database.load('sqlite:prd.sqlite');
              const metadata = await database.select<{ value: string }[]>('SELECT value FROM app_metadata WHERE key = $1', ['current_tenant_id']);
              const tenantId = metadata[0]?.value;
              if (!tenantId) throw new Error('organization_required');
              const directory = new LocalUserDirectory();
              setUsers(await directory.list(tenantId));
              setUsersStatus('User list loaded');
            } catch {
              setUsersStatus('Complete administrator setup inside Tauri first');
            }
          }} style={{ border: '1px solid #d0d5dd', borderRadius: 8, background: 'white', padding: '10px 14px' }}>Load users</button>
          <small role="status" style={{ display: 'block', color: '#667085', marginTop: 8 }}>{usersStatus}</small>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {users.map((user) => (
              <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaecf0', padding: '10px 0' }}>
                <span>{user.displayName} · {user.email} · {user.status}</span>
                <button type="button" onClick={async () => {
                  await new LocalUserDirectory().setStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended');
                  setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === 'suspended' ? 'active' : 'suspended' } : item));
                }} style={{ border: '1px solid #d0d5dd', borderRadius: 8, background: 'white', padding: '6px 10px' }}>{user.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button>
              </div>
            ))}
          </div>
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
