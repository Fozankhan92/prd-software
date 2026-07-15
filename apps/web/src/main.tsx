import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WebApp } from '../app/WebApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebApp />
  </StrictMode>,
);
