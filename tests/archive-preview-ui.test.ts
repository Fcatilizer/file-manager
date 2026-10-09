import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'

test('archive preview icons exist and have valid SVG paths', () => {
  assert.ok(ICON_PATHS.archive, 'archive icon must exist')
  assert.ok(Array.isArray(ICON_PATHS.archive) && ICON_PATHS.archive.length > 0)
  assert.match(ICON_PATHS.archive[0], /^M\s*[-0-9]/, 'archive icon starts with move command')

  assert.ok(ICON_PATHS.list, 'list icon must exist')
  assert.ok(Array.isArray(ICON_PATHS.list) && ICON_PATHS.list.length > 0)
  assert.match(ICON_PATHS.list[0], /^M\s*[-0-9]/, 'list icon starts with move command')

  assert.ok(ICON_PATHS.folder, 'folder icon must exist')
  assert.ok(ICON_PATHS.download, 'download icon must exist')
})

test('archive-preview.css contains modern layout, table, toolbar and mobile styles', () => {
  const css = readFileSync(resolve('src/styles/archive-preview.css'), 'utf-8')

  assert.ok(css.includes('.archive-preview'), 'defines .archive-preview')
  assert.ok(css.includes('.archive-preview__toolbar'), 'defines .archive-preview__toolbar')
  assert.ok(css.includes('.archive-preview__breadcrumbs'), 'defines .archive-preview__breadcrumbs')
  assert.ok(css.includes('.archive-preview__search'), 'defines .archive-preview__search')
  assert.ok(css.includes('.archive-preview__view-toggle'), 'defines .archive-preview__view-toggle')
  assert.ok(css.includes('.archive-preview__table'), 'defines .archive-preview__table')
  assert.ok(css.includes('.archive-preview__thead'), 'defines sticky .archive-preview__thead')
  assert.ok(css.includes('.archive-preview__footer'), 'defines .archive-preview__footer')
  assert.ok(css.includes('@media (max-width: 680px)'), 'defines responsive mobile breakpoint')
})

test('ArchivePreview component source includes search, views, breadcrumbs and sorting features', () => {
  const tsx = readFileSync(resolve('src/components/ArchivePreview.tsx'), 'utf-8')

  assert.ok(tsx.includes('searchQuery'), 'includes search filtering state')
  assert.ok(tsx.includes('searchScope'), 'supports search scope toggle')
  assert.ok(tsx.includes('viewMode'), 'supports view mode (folder / flat)')
  assert.ok(tsx.includes('sortBy'), 'supports sorting')
  assert.ok(tsx.includes('navigateToSegment'), 'supports clickable breadcrumb navigation')
  assert.ok(tsx.includes('getFileTypeInfo'), 'uses themed file type icons and colors')
})
