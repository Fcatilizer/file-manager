import test from 'node:test'
import assert from 'node:assert/strict'
import { isMarkdownFile, formatSize } from '../src/lib/filetype.ts'
import { renderMarkdownToHtml } from '../src/lib/markdown.ts'

test('isMarkdownFile accurately identifies markdown extensions', () => {
  assert.equal(isMarkdownFile('README.md'), true)
  assert.equal(isMarkdownFile('notes.markdown'), true)
  assert.equal(isMarkdownFile('DOC.MD'), true)
  assert.equal(isMarkdownFile('guide.Markdown'), true)
  assert.equal(isMarkdownFile('untitled.md'), true)

  assert.equal(isMarkdownFile('notes.txt'), false)
  assert.equal(isMarkdownFile('script.js'), false)
  assert.equal(isMarkdownFile('data.json'), false)
  assert.equal(isMarkdownFile('style.css'), false)
  assert.equal(isMarkdownFile('.env'), false)
  assert.equal(isMarkdownFile('noextension'), false)
})

test('formatSize formats byte sizes cleanly', () => {
  assert.equal(formatSize(0), '0 B')
  assert.equal(formatSize(12), '12 B')
  assert.equal(formatSize(1024), '1.0 KB')
  assert.equal(formatSize(1024 * 1024 * 2.5), '2.5 MB')
})

test('renderMarkdownToHtml renders headings, lists, links and formatting', () => {
  const md = `# Test Title

This is a **bold** paragraph with a [vault link](https://vault.local).

- [x] Task 1
- [ ] Task 2

| Col 1 | Col 2 |
|---|---|
| Val 1 | Val 2 |

\`\`\`ts
const x = 42;
\`\`\`
`

  const html = renderMarkdownToHtml(md)

  assert.ok(html.includes('<h1>Test Title</h1>'), 'renders h1 title')
  assert.ok(html.includes('<strong>bold</strong>'), 'renders bold text')
  assert.ok(
    html.includes('<a href="https://vault.local"') &&
    html.includes('target="_blank"') &&
    html.includes('rel="noopener noreferrer"'),
    'renders external link with safe target and rel attributes',
  )
  assert.ok(html.includes('type="checkbox"'), 'renders task list checkboxes')
  assert.ok(html.includes('<table>') && html.includes('<th>Col 1</th>'), 'renders markdown tables')
  assert.ok(html.includes('<pre><code') && html.includes('const x = 42;'), 'renders code block')
})

test('renderMarkdownToHtml handles empty or falsy markdown gracefully', () => {
  assert.equal(renderMarkdownToHtml(''), '')
})
