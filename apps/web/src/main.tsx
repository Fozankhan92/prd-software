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
    await database.execute('CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    document.documentElement.dataset.database = 'connected';
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
