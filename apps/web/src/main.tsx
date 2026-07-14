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
    const migrations = [
      'CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS tenant (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS app_user (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, user_id TEXT NOT NULL, issued_at TEXT NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT)',
      'CREATE TABLE IF NOT EXISTS permission_grant (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, subject_id TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, action TEXT NOT NULL, effect TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS audit_event (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL, occurred_at TEXT NOT NULL)',
      'CREATE TABLE IF NOT EXISTS file_metadata (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, owner_id TEXT NOT NULL, name TEXT NOT NULL, storage_key TEXT NOT NULL, created_at TEXT NOT NULL)',
    ];
    for (const migration of migrations) await database.execute(migration);
    await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('schema_version', '3')");
    document.documentElement.dataset.database = 'connected';
    document.documentElement.dataset.schemaVersion = '3';
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
