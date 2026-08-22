import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAssetValidatorInDev } from './utils/assetValidator';

// Initialize asset validation diagnostics for development mode
initAssetValidatorInDev();

// Ensure OffscreenCanvas and HTMLCanvasElement instances always have getBoundingClientRect defined
if (typeof window !== 'undefined') {
  if (window.OffscreenCanvas && typeof (OffscreenCanvas.prototype as any).getBoundingClientRect !== 'function') {
    (OffscreenCanvas.prototype as any).getBoundingClientRect = function () {
      return {
        width: this.width || 0,
        height: this.height || 0,
        top: 0,
        left: 0,
        right: this.width || 0,
        bottom: this.height || 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

