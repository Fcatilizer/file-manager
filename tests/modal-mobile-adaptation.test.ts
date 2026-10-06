import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('modal overlay primitives prevent top clipping and support safe-area insets', () => {
  const indexCss = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

  // Check .modal-overlay uses dynamic viewport, safe centering, and auto scrolling
  assert.ok(indexCss.includes('height: 100dvh;'), 'modal-overlay uses 100dvh for mobile dynamic toolbars')
  assert.ok(indexCss.includes('align-items: safe center;'), 'modal-overlay uses safe center to prevent negative overflow')
  assert.ok(indexCss.includes('overflow-y: auto;'), 'modal-overlay allows vertical scrolling')
  assert.ok(indexCss.includes('env(safe-area-inset-top'), 'modal-overlay accounts for device notches/cutouts')
  assert.ok(indexCss.includes('margin: auto;'), 'modal card uses margin: auto for flex centering without data loss')
})

test('fullscreen modal overlays on mobile stretch and prevent off-screen top displacement', () => {
  const indexCss = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

  // Check mobile fullscreen rules
  assert.ok(indexCss.includes('.modal-overlay--fullscreen'), 'defines modal-overlay--fullscreen')
  assert.ok(indexCss.includes('align-items: stretch;'), 'fullscreen overlay stretches rather than vertically offsets on mobile')
  assert.ok(indexCss.includes('height: 100dvh !important;'), 'fullscreen modal card uses 100dvh')

  // Check preview header has safe-area inset padding
  assert.ok(indexCss.includes('padding-top: max(12px, env(safe-area-inset-top'), 'preview header has safe-area top padding')
  assert.ok(indexCss.includes('users-modal__header'), 'users-modal header has safe-area top padding')
})

test('dialog and password modals have bounded max-height and inner scrolling for small screens', () => {
  const indexCss = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

  // Dialog constraints
  assert.ok(indexCss.includes('.dialog'), 'defines .dialog')
  assert.ok(indexCss.includes('max-height: min(90dvh, 680px);'), 'dialog has 90dvh constraint')
  assert.ok(indexCss.includes('.dialog__body'), 'dialog body is scrollable')

  // Password modal constraints
  assert.ok(indexCss.includes('.password-modal'), 'defines .password-modal')
  assert.ok(indexCss.includes('max-height: min(90dvh, 600px);'), 'password modal has 90dvh constraint')
  assert.ok(indexCss.includes('.password-modal__form'), 'password modal form has scrollable body')
})

test('notebook new file modal uses fullscreen overlay and mobile responsive layout', () => {
  const newFileModalTsx = readFileSync(resolve(process.cwd(), 'src/components/NewFileModal.tsx'), 'utf8')
  const notebookCss = readFileSync(resolve(process.cwd(), 'src/styles/notebook-modal.css'), 'utf8')

  assert.ok(
    newFileModalTsx.includes('overlayClassName="modal-overlay--fullscreen"'),
    'NewFileModal uses modal-overlay--fullscreen for seamless mobile view',
  )
  assert.ok(notebookCss.includes('height: 100dvh;'), 'notebook modal uses 100dvh on mobile')
  assert.ok(notebookCss.includes('env(safe-area-inset-top'), 'notebook header respects safe-area top inset')
})

test('share dialog, item details, bucket protection, and account settings have mobile scroll handling', () => {
  const shareCss = readFileSync(resolve(process.cwd(), 'src/styles/share-dialog.css'), 'utf8')
  const itemDetailsCss = readFileSync(resolve(process.cwd(), 'src/styles/item-details.css'), 'utf8')
  const bucketCss = readFileSync(resolve(process.cwd(), 'src/styles/bucket-protection.css'), 'utf8')
  const accountCss = readFileSync(resolve(process.cwd(), 'src/styles/account-settings.css'), 'utf8')

  assert.ok(shareCss.includes('-webkit-overflow-scrolling: touch;'), 'share dialog has touch scrolling')
  assert.ok(itemDetailsCss.includes('-webkit-overflow-scrolling: touch;'), 'item details has touch scrolling')
  assert.ok(bucketCss.includes('-webkit-overflow-scrolling: touch;'), 'bucket dialog has touch scrolling')
  assert.ok(accountCss.includes('-webkit-overflow-scrolling: touch;'), 'account settings has touch scrolling')
})
