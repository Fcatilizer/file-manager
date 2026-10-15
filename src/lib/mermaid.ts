import DOMPurify from 'dompurify'

// Mermaid keeps global configuration. Serialize renders across all Markdown surfaces.
let queue: Promise<unknown> = Promise.resolve()
let nextId = 0
export function renderDiagram(source: string, dark: boolean, cancelled: () => boolean): Promise<string | null> {
  const render = async () => {
    if (cancelled()) return null
    if (source.length > 50_000) throw new Error('Diagram exceeds the preview limit')
    const { default: mermaid } = await import('mermaid')
    if (cancelled()) return null
    mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true,
      theme: dark ? 'dark' : 'default', htmlLabels: false,
      flowchart: { htmlLabels: false, wrappingWidth: 260 }, maxTextSize: 50_000, maxEdges: 500,
      // Document directives must not loosen safety or replace our theme/layout policy.
      secure: ['secure', 'securityLevel', 'startOnLoad', 'suppressErrorRendering', 'maxTextSize', 'maxEdges', 'htmlLabels', 'flowchart', 'theme', 'themeCSS'],
    })
    const { svg } = await mermaid.render(`vault-diagram-${++nextId}`, source)
    if (cancelled()) return null
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ['foreignObject', 'image', 'a'],
    })
  }
  const result = queue.then(render)
  queue = result.catch(() => undefined)
  return result
}
