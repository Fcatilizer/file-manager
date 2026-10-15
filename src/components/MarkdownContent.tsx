import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { renderMarkdownToHtml } from '../lib/markdown'
import '../styles/markdown-diagrams.css'

const readTheme = () => document.documentElement.dataset.theme === 'dark'
const watchTheme = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

/** Shared by authenticated/public file previews and the Scratchpad. */
export default function MarkdownContent({ content, className }: { content: string; className: string }) {
  const html = useMemo(() => renderMarkdownToHtml(content), [content])
  const ref = useRef<HTMLDivElement>(null)
  const dark = useSyncExternalStore(watchTheme, readTheme, () => false)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    // Reset prior enhancements on content/theme changes; never render stale async results.
    root.innerHTML = html
    let cancelled = false
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('pre > code.language-mermaid'))
    if (!blocks.length) return
    void (async () => {
      const { renderDiagram } = await import('../lib/mermaid')
      for (const [index, code] of blocks.entries()) {
        if (cancelled) return
        const pre = code.parentElement!
        const figure = document.createElement('figure')
        figure.className = 'markdown-diagram'
        const status = document.createElement('p')
        status.className = 'markdown-diagram__status'
        status.setAttribute('role', 'status')
        status.textContent = 'Rendering diagram…'
        const details = document.createElement('details')
        const summary = document.createElement('summary')
        summary.textContent = 'Diagram source'
        pre.replaceWith(figure)
        details.append(summary, pre)
        figure.append(status, details)
        try {
          if (index >= 20) throw new Error('Too many diagrams')
          const svg = await renderDiagram(code.textContent || '', dark, () => cancelled)
          if (cancelled || svg === null) return
          const drawing = document.createElement('div')
          drawing.className = 'markdown-diagram__drawing'
          drawing.setAttribute('role', 'img')
          drawing.setAttribute('aria-label', 'Mermaid diagram; source available below')
          drawing.tabIndex = 0
          drawing.innerHTML = svg
          const graphic = drawing.querySelector('svg')
          const naturalWidth = graphic?.viewBox.baseVal.width
          if (naturalWidth) drawing.style.setProperty('--diagram-width', `${naturalWidth}px`)
          const sizing = document.createElement('button')
          sizing.type = 'button'
          sizing.className = 'markdown-diagram__size btn btn--ghost btn--sm'
          sizing.textContent = 'Actual size'
          sizing.setAttribute('aria-label', 'Show diagram at actual size')
          sizing.setAttribute('aria-pressed', 'false')
          sizing.onclick = () => {
            const actual = drawing.classList.toggle('markdown-diagram__drawing--actual')
            sizing.textContent = actual ? 'Fit width' : 'Actual size'
            sizing.setAttribute('aria-label', actual ? 'Fit diagram to width' : 'Show diagram at actual size')
            sizing.setAttribute('aria-pressed', String(actual))
          }
          status.replaceWith(drawing)
          figure.insertBefore(sizing, drawing)
        } catch {
          if (cancelled) return
          status.textContent = index >= 20 ? 'Diagram preview limit reached. Source is shown below.' : 'Unable to render this diagram. Check its syntax in the source below.'
          details.open = true
        }
      }
    })().catch(() => { /* The original code blocks remain readable if the renderer cannot load. */ })
    return () => { cancelled = true }
  }, [html, dark])
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
