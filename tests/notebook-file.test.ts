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

test('filePlus, edit, and pencil icons exist and have valid svg paths', () => {
  assert.ok(ICON_PATHS.filePlus?.length > 0, 'filePlus icon exists in ICON_PATHS')
  assert.ok(ICON_PATHS.edit?.length > 0, 'edit icon exists in ICON_PATHS')
  assert.ok(ICON_PATHS.pencil?.length > 0, 'pencil icon exists in ICON_PATHS')
})

test('parseFileNameAndExt accurately parses filenames for notebook edit mode', async () => {
  const { parseFileNameAndExt, getMimeForExtension } = await import('../src/lib/notebookExtensions.ts')
  const { isEditableFile } = await import('../src/lib/filetype.ts')

  // .env variants
  assert.deepEqual(parseFileNameAndExt('.env'), { baseName: '', ext: 'env' })
  assert.deepEqual(parseFileNameAndExt('env'), { baseName: '', ext: 'env' })
  assert.deepEqual(parseFileNameAndExt('.env.local'), { baseName: 'local', ext: 'env' })
  assert.deepEqual(parseFileNameAndExt('.env.production'), { baseName: 'production', ext: 'env' })
  assert.deepEqual(parseFileNameAndExt('prod.env'), { baseName: 'prod', ext: 'env' })

  // Standard code & markup files
  assert.deepEqual(parseFileNameAndExt('base.html'), { baseName: 'base', ext: 'html' })
  assert.deepEqual(parseFileNameAndExt('README.md'), { baseName: 'README', ext: 'md' })
  assert.deepEqual(parseFileNameAndExt('package.json'), { baseName: 'package', ext: 'json' })
  assert.deepEqual(parseFileNameAndExt('app.test.tsx'), { baseName: 'app.test', ext: 'tsx' })
  assert.deepEqual(parseFileNameAndExt('script.py'), { baseName: 'script', ext: 'py' })

  // Files without extension default to txt
  assert.deepEqual(parseFileNameAndExt('notes'), { baseName: 'notes', ext: 'txt' })

  // MIME types
  assert.equal(getMimeForExtension('html'), 'text/html')
  assert.equal(getMimeForExtension('env'), 'text/plain')
  assert.equal(getMimeForExtension('py'), 'text/x-python')
  assert.equal(getMimeForExtension('js'), 'application/javascript')
  assert.equal(getMimeForExtension('ts'), 'application/typescript')

  // isEditableFile checks
  assert.equal(isEditableFile('.env'), true)
  assert.equal(isEditableFile('base.html'), true)
  assert.equal(isEditableFile('notes.md'), true)
  assert.equal(isEditableFile('config.json'), true)
  assert.equal(isEditableFile('photo.png'), false)
  assert.equal(isEditableFile('document.docx'), false)
  assert.equal(isEditableFile('archive.zip'), false)
})

test('editing file retains or recomputes full name correctly without accidental overwrites', async () => {
  const { parseFileNameAndExt, computeFullName } = await import('../src/lib/notebookExtensions.ts')

  // When editing base.html:
  const parsed1 = parseFileNameAndExt('base.html')
  assert.equal(parsed1.baseName, 'base')
  assert.equal(parsed1.ext, 'html')
  // User keeps name same:
  assert.equal(computeFullName(parsed1.baseName, parsed1.ext), 'base.html')

  // User renames base to layout:
  assert.equal(computeFullName('layout', parsed1.ext), 'layout.html')

  // When editing .env:
  const parsed2 = parseFileNameAndExt('.env')
  assert.equal(parsed2.baseName, '')
  assert.equal(parsed2.ext, 'env')
  assert.equal(computeFullName(parsed2.baseName, parsed2.ext), '.env')

  // User updates .env to .env.local:
  assert.equal(computeFullName('local', parsed2.ext), '.env.local')
})


