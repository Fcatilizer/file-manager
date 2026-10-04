import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { s3ApiPlugin } from './server/s3-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), s3ApiPlugin()],
})
