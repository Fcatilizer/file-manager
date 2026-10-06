import test from 'node:test'
import assert from 'node:assert/strict'
import { SUPPORTED_EXTENSIONS } from '../src/lib/notebookExtensions.ts'
import { getFileTypeInfo } from '../src/lib/fileIcons.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'

test('notebook supports requested extensions: txt, md, html, xml, json with valid mimes', () => {
  const exts = SUPPORTED_EXTENSIONS.map((s) => s.ext)
  assert.deepEqual(exts, ['txt', 'md', 'html', 'xml', 'json'])

  const expectedMimes: Record<string, string> = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    xml: 'application/xml',
    json: 'application/json',
  }

  for (const item of SUPPORTED_EXTENSIONS) {
    assert.equal(item.mime, expectedMimes[item.ext])
    const info = getFileTypeInfo(`notes.${item.ext}`, false)
    assert.ok(info.iconName, `has iconName for ${item.ext}`)
    assert.ok(ICON_PATHS[info.iconName]?.length > 0, `icon ${info.iconName} exists in ICON_PATHS`)
  }
})

test('filePlus icon exists and has valid svg paths', () => {
  assert.ok(ICON_PATHS.filePlus?.length > 0, 'filePlus icon exists in ICON_PATHS')
})
