import test from 'node:test'
import assert from 'node:assert/strict'
import { SUPPORTED_EXTENSIONS, computeFullName } from '../src/lib/notebookExtensions.ts'
import { getFileTypeInfo } from '../src/lib/fileIcons.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'
import { isEnvFile } from '../src/lib/filetype.ts'

test('notebook supports extensions: txt, md, env, json, html, xml with valid mimes', () => {
  const exts = SUPPORTED_EXTENSIONS.map((s) => s.ext)
  assert.ok(exts.includes('txt'))
  assert.ok(exts.includes('md'))
  assert.ok(exts.includes('env'))
  assert.ok(exts.includes('json'))
  assert.ok(exts.includes('html'))
  assert.ok(exts.includes('xml'))

  const expectedMimes: Record<string, string> = {
    txt: 'text/plain',
    md: 'text/markdown',
    env: 'text/plain',
    html: 'text/html',
    xml: 'application/xml',
    json: 'application/json',
  }

  for (const item of SUPPORTED_EXTENSIONS) {
    assert.equal(item.mime, expectedMimes[item.ext])
    const testFile = item.ext === 'env' ? '.env' : `notes.${item.ext}`
    const info = getFileTypeInfo(testFile, false)
    assert.ok(info.iconName, `has iconName for ${item.ext}`)
    assert.ok(ICON_PATHS[info.iconName]?.length > 0, `icon ${info.iconName} exists in ICON_PATHS`)
  }
})

test('computeFullName formats .env and standard files accurately', () => {
  // .env cases
  assert.equal(computeFullName('', 'env'), '.env')
  assert.equal(computeFullName('untitled', 'env'), '.env')
  assert.equal(computeFullName('.env', 'env'), '.env')
  assert.equal(computeFullName('local', 'env'), '.env.local')
  assert.equal(computeFullName('.local', 'env'), '.env.local')
  assert.equal(computeFullName('.env.production', 'env'), '.env.production')
  assert.equal(computeFullName('custom.env', 'env'), 'custom.env')

  assert.ok(isEnvFile(computeFullName('', 'env')))
  assert.ok(isEnvFile(computeFullName('local', 'env')))
  assert.ok(isEnvFile(computeFullName('production', 'env')))

  // standard extensions
  assert.equal(computeFullName('notes', 'md'), 'notes.md')
  assert.equal(computeFullName('notes.md', 'md'), 'notes.md')
  assert.equal(computeFullName('', 'md'), 'untitled.md')
  assert.equal(computeFullName('config', 'json'), 'config.json')
  assert.equal(computeFullName('page', 'html'), 'page.html')
  assert.equal(computeFullName('data', 'xml'), 'data.xml')
  assert.equal(computeFullName('readme', 'txt'), 'readme.txt')
})

test('filePlus icon exists and has valid svg paths', () => {
  assert.ok(ICON_PATHS.filePlus?.length > 0, 'filePlus icon exists in ICON_PATHS')
})
