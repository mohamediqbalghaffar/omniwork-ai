import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import './styles/globals.css';
import './styles/glassmorphism.css';
import './styles/univer-overrides.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
