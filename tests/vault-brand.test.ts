import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('vault-diamond CSS animation defines keyframes, spring-timing, and reduced motion', () => {
  const cssPath = resolve(process.cwd(), 'src/styles/vault-diamond.css')
  const cssContent = readFileSync(cssPath, 'utf8')

  // Check keyframes
  assert.ok(cssContent.includes('@keyframes vault-diamond-spin'), 'defines vault-diamond-spin keyframes')
  assert.ok(cssContent.includes('@keyframes vault-diamond-pulse'), 'defines vault-diamond-pulse keyframes for reduced motion')
  assert.ok(cssContent.includes('prefers-reduced-motion'), 'supports prefers-reduced-motion')

  // Check animation cubic-bezier timing
  assert.ok(cssContent.includes('cubic-bezier(0.25, 1, 0.5, 1)'), 'uses smooth spring cubic-bezier for spin')
  assert.ok(cssContent.includes('vault-diamond--animating'), 'defines animating class')
  assert.ok(cssContent.includes('.vault-brand-btn--public'), 'defines public share variant styling')
})
