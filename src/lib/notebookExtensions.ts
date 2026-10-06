export type SupportedExtension = 'txt' | 'md' | 'env' | 'html' | 'xml' | 'json'

export interface ExtensionOption {
  ext: SupportedExtension
  label: string
  extLabel: string
  mime: string
  desc: string
}

export const SUPPORTED_EXTENSIONS: ExtensionOption[] = [
  { ext: 'txt', label: 'Plain Text', extLabel: '.txt', mime: 'text/plain', desc: 'Standard unformatted text' },
  { ext: 'md', label: 'Markdown', extLabel: '.md', mime: 'text/markdown', desc: 'Rich document with preview' },
  { ext: 'env', label: 'Environment Config', extLabel: '.env', mime: 'text/plain', desc: 'Config variables & secrets' },
  { ext: 'json', label: 'JSON', extLabel: '.json', mime: 'application/json', desc: 'Structured data document' },
  { ext: 'html', label: 'HTML', extLabel: '.html', mime: 'text/html', desc: 'Web markup page' },
  { ext: 'xml', label: 'XML', extLabel: '.xml', mime: 'application/xml', desc: 'Extensible markup data' },
]

/**
 * Computes the authoritative full file name based on user input and selected extension.
 * Properly formats `.env` files (.env, .env.local, .env.production, etc.)
 */
export function computeFullName(nameInput: string, ext: SupportedExtension): string {
  const trimmed = nameInput.trim()
  if (ext === 'env') {
    if (!trimmed || trimmed === 'untitled' || trimmed === '.env' || trimmed === 'env') {
      return '.env'
    }
    if (trimmed.startsWith('.env.')) return trimmed
    if (trimmed.endsWith('.env')) return trimmed
    if (trimmed.startsWith('.')) return `.env${trimmed}`
    return `.env.${trimmed}`
  }

  let base = trimmed || 'untitled'
  if (base.toLowerCase().endsWith(`.${ext}`)) {
    base = base.slice(0, -(ext.length + 1))
  }
  return `${base}.${ext}`
}
