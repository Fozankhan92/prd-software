import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from '../app/page';

async function connectDesktopRuntime() {
  try {
    const [foundation, localStore] = await Promise.all([
      invoke<string>('foundation_status'),
      invoke<string>('local_store_status'),
    ]);
    document.documentElement.dataset.foundationStatus = foundation;
    document.documentElement.dataset.localStoreStatus = localStore;

    const database = await Database.load('sqlite:prd.sqlite');
    const userColumns = await database.select<{ name: string }[]>('PRAGMA table_info(app_user)');
    if (userColumns.length && !userColumns.some((column) => column.name === 'role')) await database.execute("ALTER TABLE app_user ADD COLUMN role TEXT NOT NULL DEFAULT 'staff'");
    if (userColumns.length && !userColumns.some((column) => column.name === 'status')) await database.execute("ALTER TABLE app_user ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
    const sessionColumns = await database.select<{ name: string; notnull: number }[]>('PRAGMA table_info(session)');
    const expiresAtColumn = sessionColumns.find((column) => column.name === 'expires_at');
    if (expiresAtColumn?.notnull === 1) {
      await database.execute('ALTER TABLE session RENAME TO session_legacy');
      await database.execute('CREATE TABLE session (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, user_id TEXT NOT NULL, issued_at TEXT NOT NULL, expires_at TEXT, revoked_at TEXT)');
      await database.execute('INSERT INTO session (id, tenant_id, user_id, issued_at, expires_at, revoked_at) SELECT id, tenant_id, user_id, issued_at, expires_at, revoked_at FROM session_legacy');
      await database.execute('DROP TABLE session_legacy');
    }
    const migrations = [
      'CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS crm_organization (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT, phone TEXT, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS hr_department (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL)',
      "CREATE TABLE IF NOT EXISTS hr_employee (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, department_id TEXT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT, employment_status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL)",
      'CREATE TABLE IF NOT EXISTS crm_contact (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT, phone TEXT, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS tenant (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL)',
      "CREATE TABLE IF NOT EXISTS app_user (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL)",
      'CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, user_id TEXT NOT NULL, issued_at TEXT NOT NULL, expires_at TEXT, revoked_at TEXT)',
      'CREATE TABLE IF NOT EXISTS permission_grant (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, subject_id TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, action TEXT NOT NULL, effect TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS audit_event (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, occurred_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS file_metadata (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, owner_id TEXT NOT NULL, name TEXT NOT NULL, storage_key TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS admin_bootstrap (id INTEGER PRIMARY KEY CHECK (id = 1), tenant_id TEXT, user_id TEXT, completed_at TEXT)',
    ];
    for (const migration of migrations) await database.execute(migration);
    await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('schema_version', '11')");
    await database.execute('INSERT OR IGNORE INTO admin_bootstrap (id) VALUES (1)');
    document.documentElement.dataset.database = 'connected';
    document.documentElement.dataset.schemaVersion = '11';
  } catch {
    // Native commands and local storage run only inside the Tauri desktop shell.
  }
}

void connectDesktopRuntime();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
