import { Marked } from 'marked'
import DOMPurify from 'dompurify'

import hljs from 'highlight.js'
import { escapeHtml } from './syntaxHighlight'

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    link({ href, title, text }) {
      const t = title ? ` title="${title}"` : ''
      return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
    },
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined
      const highlighted = language
        ? hljs.highlight(text, { language, ignoreIllegals: true }).value
        : escapeHtml(text)
      const langClass = language ? ` class="hljs language-${language}"` : ' class="hljs"'
      return `<pre><code${langClass}>${highlighted}</code></pre>\n`
    },
  },
})

/**
 * Parses markdown into safe, sanitized HTML.
 * In browser environments, sanitizes with DOMPurify while preserving safe tags, links and task lists.
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return ''
  const rawHtml = markedInstance.parse(markdown) as string
  if (typeof window === 'undefined') {
    return rawHtml
  }
  const sanitizer = typeof DOMPurify.sanitize === 'function' ? DOMPurify : DOMPurify(window)
  return sanitizer.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  })
}
