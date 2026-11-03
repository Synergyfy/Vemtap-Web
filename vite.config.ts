import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The app ships as one large route bundle (routing is state-driven in App.tsx).
    // Vendor libraries are split out below; raise the limit so the remaining app
    // chunk does not trigger the 500 kB warning. Lazy-loading screens is the next step.
    chunkSizeWarningLimit: 9000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('xlsx') || id.includes('papaparse')) return 'vendor-spreadsheet';
          if (id.includes('react')) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
})