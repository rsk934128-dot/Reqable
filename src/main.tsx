import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Global error handlers for Android WebView diagnostics
window.addEventListener('error', (event) => {
  console.error('[Reqable Global Error]', event.message, event.filename, event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Reqable Unhandled Rejection]', event.reason);
});

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
