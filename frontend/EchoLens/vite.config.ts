import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,              // allow external access (e.g., phone or other devices)
    hmr: false,
    allowedHosts: ['.ngrok-free.app']      // allow all domains, including ngrok.
  },
  build: {
    target: 'es2019'  // Safari 13+ compatibility
  }
});
