import { pdfAssets } from './build/pdf-assets.ts'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pdfAssets()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'highlight', test: /node_modules[\\/]highlight\.js/ },
            { name: 'pdfjs', test: /node_modules[\\/]pdfjs-dist/ },
          ],
        },
      },
    },
  },
})
