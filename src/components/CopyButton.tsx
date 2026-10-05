import { useState } from 'react'
import { Icon } from './Icon'

export default function CopyButton({ value, label = 'Copy link', className = '', disabled = false, onError }: {
  value: string; label?: string; className?: string; disabled?: boolean; onError: (message: string) => void
}) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const copied = value === copiedValue
  return <button type="button" className={`btn btn--icon ${className}`} disabled={disabled} aria-label={copied ? 'Link copied' : label} title={copied ? 'Copied' : label} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopiedValue(value) }
    catch { onError('Could not copy. Select the URL and copy it manually.') }
  }}><Icon name={copied ? 'check' : 'copy'} size={16} /><span className="copy-field__status" role="status">{copied ? 'Link copied' : ''}</span></button>
}
