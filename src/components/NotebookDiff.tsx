import { useMemo } from 'react'
import { diffLines } from 'diff'
import '../styles/notebook-diff.css'

export default function NotebookDiff({ original, current }: { original: string; current: string }) {
  const changes = useMemo(() => original.length + current.length > 1_000_000 || original.split('\n').length + current.split('\n').length > 20000 ? undefined : diffLines(original, current, { timeout: 100, maxEditLength: 5000 }), [original, current])
  if (original === current) return <div className="notebook-diff" role="status">No unsaved content changes.</div>
  if (!changes || original.length + current.length > 2_000_000) return <div className="notebook-diff" role="status">This change is too large for an inline diff. Your edits are still available in the editor.</div>
  let oldLine = 0, newLine = 0
  const added = changes.filter(c => c.added).reduce((sum, c) => sum + c.count, 0)
  const removed = changes.filter(c => c.removed).reduce((sum, c) => sum + c.count, 0)
  return <section className="notebook-diff" aria-label="Unsaved changes">
    <p className="notebook-diff__summary">{added} added · {removed} deleted</p>
    <div className="notebook-diff__lines">{changes.flatMap((change, group) => {
      const lines = change.value.split('\n'); if (lines.at(-1) === '') lines.pop()
      return lines.map((line, index) => <div key={`${group}-${index}`} className={`notebook-diff__line ${change.added ? 'is-added' : change.removed ? 'is-removed' : ''}`}>
        <span>{change.added ? '' : ++oldLine}</span><span>{change.removed ? '' : ++newLine}</span>
        <b aria-label={change.added ? 'Added' : change.removed ? 'Deleted' : 'Unchanged'}>{change.added ? '+' : change.removed ? '−' : ' '}</b><code>{line || ' '}{index === lines.length - 1 && !change.value.endsWith('\n') && <small> ⏎ No final newline</small>}</code>
      </div>)
    })}</div>
  </section>
}
