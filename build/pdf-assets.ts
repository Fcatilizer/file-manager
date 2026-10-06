import { cpSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import express from 'express'
import type { Plugin } from 'vite'

/** Keep fonts, CMaps and image decoders exactly in sync with the installed PDF.js. */
export function pdfAssets(): Plugin {
  const require = createRequire(import.meta.url)
  const root = dirname(require.resolve('pdfjs-dist/package.json'))
  const folders = ['cmaps', 'standard_fonts', 'wasm']
  let output = 'dist'
  return {
    name: 'vault-pdf-assets',
    configResolved(config) { output = resolve(config.root, config.build.outDir) },
    configureServer(server) {
      const assets = express()
      for (const folder of folders) assets.use(`/pdfjs-assets/${folder}`, express.static(resolve(root, folder), { index: false }))
      server.middlewares.use(assets)
    },
    writeBundle() {
      mkdirSync(resolve(output, 'pdfjs-assets'), { recursive: true })
      for (const folder of folders) cpSync(resolve(root, folder), resolve(output, 'pdfjs-assets', folder), { recursive: true })
    },
  }
}
