import { invoke } from '@tauri-apps/api/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from '../app/page';

async function connectDesktopRuntime() {
  try {
    const status = await invoke<string>('foundation_status');
    document.documentElement.dataset.foundationStatus = status;
  } catch {
    // The UI can be type-checked outside Tauri, but native commands run only in the desktop shell.
  }
}

void connectDesktopRuntime();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
