import { invoke } from '@tauri-apps/api/core';
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
  } catch {
    // Native commands run only inside the Tauri desktop shell.
  }
}

void connectDesktopRuntime();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
