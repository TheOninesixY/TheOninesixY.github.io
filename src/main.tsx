import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

if (isMobile) {
  import('./mobile.css');
} else {
  import('./desktop.css');
}

window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

setTimeout(() => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  }
}, 500);
