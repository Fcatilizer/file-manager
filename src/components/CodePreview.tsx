import { useState, useMemo } from 'react'
import type { FileItem } from '../lib/api'
import { formatSize } from '../lib/filetype'
import { highlightCode } from '../lib/syntaxHighlight'
import { Icon } from './Icon'
import '../styles/syntax-highlight.css'

type Props = {
  file: FileItem
  content: string
  onCopy: () => void
  copied: boolean
  onEdit?: () => void
}

export default function CodePreview({ file, content, onCopy, copied, onEdit }: Props) {
  // Syntax highlighting toggle defaults to true as requested
  const [syntaxHighlight, setSyntaxHighlight] = useState(true)

  const lineCount = useMemo(() => {
    return content ? content.split('\n').length : 0
  }, [content])

  // Compute syntax highlighted HTML and detected language
  const { html: highlightedHtml, language } = useMemo(() => {
    return highlightCode(content, file.name)
  }, [content, file.name])

  return (
    <>
      <div className="preview__code-toolbar">
        <div className="preview__code-info">
          <span className="preview__code-stats">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {formatSize(file.size)}
          </span>
          {language && (
            <span className="preview__lang-badge" title={`Detected language: ${language}`}>
              {language}
            </span>
          )}
        </div>

        <div className="preview__code-actions">
          {/* Syntax Highlighting Toggle (default: ON) */}
          <button
            type="button"
            className={`preview__syntax-toggle ${syntaxHighlight ? 'preview__syntax-toggle--active' : ''}`}
            onClick={() => setSyntaxHighlight((prev) => !prev)}
            aria-pressed={syntaxHighlight}
            title={syntaxHighlight ? 'Switch to plain monochrome text' : 'Enable syntax highlighting'}
          >
            <Icon name="code" size={13} />
            <span>Syntax</span>
            <span className="preview__syntax-pill">{syntaxHighlight ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onCopy}
            title="Copy code to clipboard"
          >
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onEdit && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onEdit}
              title="Edit file in notebook"
            >
              <Icon name="edit" size={13} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <pre className="preview__code">
        {syntaxHighlight ? (
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code>{content}</code>
        )}
      </pre>
    </>
  )
}
