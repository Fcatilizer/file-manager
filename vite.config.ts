import { pdfAssets } from './build/pdf-assets.ts'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pdfAssets()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('highlight.js')) return 'highlight'
          if (id.includes('pdfjs-dist')) return 'pdfjs'
        },
      },
    },
  },
})
