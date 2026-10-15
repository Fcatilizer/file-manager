import { Marked } from 'marked'
import DOMPurify from 'dompurify'

import hljs from 'highlight.js'
import { escapeHtml } from './syntaxHighlight'

export function isMermaidCode(text: string, lang?: string): boolean {
  const language = lang?.trim().split(/\s+/)[0]?.toLowerCase()
  if (language) return language === 'mermaid'
  // Support pasted flowcharts without misclassifying ordinary named code fences.
  return /^(?:flowchart|graph)\s+(?:TB|TD|BT|RL|LR)\b/.test(text.trimStart())
}

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    link({ href, title, text }) {
      const t = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(href)}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
    },
    code({ text, lang }) {
      if (isMermaidCode(text, lang)) return `<pre><code class="language-mermaid">${escapeHtml(text)}</code></pre>\n`
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
