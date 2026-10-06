import test from 'node:test'
import assert from 'node:assert/strict'
import { detectLanguage, highlightCode, escapeHtml } from '../src/lib/syntaxHighlight.ts'

test('detectLanguage resolves languages from extension', () => {
  assert.equal(detectLanguage('build_bundle_prod.sh'), 'bash')
  assert.equal(detectLanguage('deploy.bash'), 'bash')
  assert.equal(detectLanguage('script.py'), 'python')
  assert.equal(detectLanguage('app.tsx'), 'typescript')
  assert.equal(detectLanguage('index.js'), 'javascript')
  assert.equal(detectLanguage('data.json'), 'json')
  assert.equal(detectLanguage('style.css'), 'css')
  assert.equal(detectLanguage('query.sql'), 'sql')
  assert.equal(detectLanguage('main.rs'), 'rust')
  assert.equal(detectLanguage('main.go'), 'go')
  assert.equal(detectLanguage('Dockerfile'), 'dockerfile')
  assert.equal(detectLanguage('.env'), 'bash')
})

test('detectLanguage resolves language from shebang when extension is missing', () => {
  assert.equal(detectLanguage('my-script', '#!/bin/bash\necho "hi"'), 'bash')
  assert.equal(detectLanguage('runner', '#!/usr/bin/env python3\nprint(1)'), 'python')
  assert.equal(detectLanguage('cli', '#!/usr/bin/env node\nconsole.log(1)'), 'javascript')
})

test('highlightCode generates syntax spans for code', () => {
  const shellCode = `#!/usr/bin/env bash
set -e
API_URL="https://api.example.com"
echo "Building bundle ($API_URL)"
`
  const result = highlightCode(shellCode, 'build_bundle_prod.sh')
  assert.equal(result.language, 'bash')
  assert.ok(result.html.includes('hljs-meta'), 'highlights shebang meta')
  assert.ok(result.html.includes('hljs-built_in') || result.html.includes('hljs-string'), 'highlights tokens')
})

test('highlightCode handles empty content and escapes HTML safely', () => {
  assert.deepEqual(highlightCode('', 'test.sh'), { html: '', language: null })
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
})
