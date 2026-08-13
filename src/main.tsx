// Safely handle window.fetch setter in sandboxed iframe contexts
try {
  if (typeof window !== "undefined" && "fetch" in window) {
    let currentFetch = window.fetch;
    const protoDesc = Object.getOwnPropertyDescriptor(Window.prototype, "fetch");
    if (protoDesc && protoDesc.get && !protoDesc.set) {
      Object.defineProperty(Window.prototype, "fetch", {
        get() {
          return currentFetch;
        },
        set(v) {
          currentFetch = v;
        },
        configurable: true,
      });
    }
  }
} catch {
  // Ignored if window.fetch property descriptor cannot be redefined
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

