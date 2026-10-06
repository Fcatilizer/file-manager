export type SupportedExtension = 'txt' | 'md' | 'env' | 'html' | 'xml' | 'json' | 'sh' | 'bat' | 'cmd'

export interface ExtensionOption {
  ext: SupportedExtension | string
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
  { ext: 'sh', label: 'Shell Script', extLabel: '.sh', mime: 'application/x-sh', desc: 'Unix / Linux shell script' },
  { ext: 'bat', label: 'Batch Script', extLabel: '.bat', mime: 'application/x-bat', desc: 'Windows batch script' },
  { ext: 'cmd', label: 'Command Script', extLabel: '.cmd', mime: 'application/cmd', desc: 'Windows command script' },
]

/**
 * Returns MIME type for an extension.
 */
export function getMimeForExtension(ext: string): string {
  const matched = SUPPORTED_EXTENSIONS.find((s) => s.ext === ext)
  if (matched) return matched.mime
  const extLower = ext.toLowerCase()
  const map: Record<string, string> = {
    js: 'application/javascript',
    jsx: 'application/javascript',
    ts: 'application/typescript',
    tsx: 'application/typescript',
    css: 'text/css',
    scss: 'text/x-scss',
    less: 'text/x-less',
    py: 'text/x-python',
    sh: 'application/x-sh',
    bash: 'application/x-sh',
    zsh: 'application/x-sh',
    bat: 'application/x-bat',
    cmd: 'application/cmd',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    sql: 'application/sql',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    log: 'text/plain',
    conf: 'text/plain',
    ini: 'text/plain',
    toml: 'text/plain',
    svg: 'image/svg+xml',
  }
  return map[extLower] || 'text/plain'
}

/**
 * Decomposes a full file name into base name and extension.
 * Handles `.env`, `.env.local`, dotfiles, and standard extensions.
 */
export function parseFileNameAndExt(fullName: string): { baseName: string; ext: string } {
  const trimmed = fullName.trim()
  if (trimmed === '.env' || trimmed === 'env') {
    return { baseName: '', ext: 'env' }
  }
  if (trimmed.startsWith('.env.')) {
    return { baseName: trimmed.slice(5), ext: 'env' }
  }
  if (trimmed.endsWith('.env') && trimmed !== '.env') {
    return { baseName: trimmed.slice(0, -4), ext: 'env' }
  }
  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot > 0) {
    return {
      baseName: trimmed.slice(0, lastDot),
      ext: trimmed.slice(lastDot + 1).toLowerCase(),
    }
  }
  return {
    baseName: trimmed,
    ext: 'txt',
  }
}

/**
 * Computes the authoritative full file name based on user input and selected extension.
 * Properly formats `.env` files (.env, .env.local, .env.production, etc.)
 */
export function computeFullName(nameInput: string, ext: SupportedExtension | string): string {
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

