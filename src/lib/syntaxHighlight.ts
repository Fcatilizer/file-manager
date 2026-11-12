import hljs from 'highlight.js'
import { extOf } from './filetype'

const EXT_TO_LANG: Record<string, string> = {
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  bat: 'bat',
  cmd: 'bat',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  pyw: 'python',
  json: 'json',
  jsonc: 'json',
  html: 'xml',
  htm: 'xml',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'less',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'ini',
  ini: 'ini',
  conf: 'ini',
  cfg: 'ini',
  env: 'bash',
  rs: 'rust',
  go: 'go',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',
  cc: 'cpp',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  dockerfile: 'dockerfile',
  md: 'markdown',
  markdown: 'markdown',
  graphql: 'graphql',
  gql: 'graphql',
  proto: 'protobuf',
  diff: 'diff',
  patch: 'diff',
  lua: 'lua',
  swift: 'swift',
  kt: 'kotlin',
  r: 'r',
  // Extensions highlight.js has no alias for.
  cljs: 'clojure',
  fsx: 'fsharp',
  psm1: 'powershell',
  hrl: 'erlang',
  mli: 'ocaml',
  jl: 'julia',
  rkt: 'scheme',
  sc: 'scala',
  sbt: 'scala',
  asm: 'x86asm',
  vue: 'xml',
  svelte: 'xml',
  xaml: 'xml',
  cxx: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Detects programming/markup language based on file extension or shebang header.
 */
export function detectLanguage(filename: string, content = ''): string | null {
  const lowerName = filename.toLowerCase()
  if (lowerName === 'dockerfile' || lowerName.startsWith('dockerfile.')) return 'dockerfile'
  if (lowerName === '.env' || lowerName.endsWith('.env')) return 'bash'

  const ext = extOf(filename)
  if (ext && EXT_TO_LANG[ext]) {
    const candidate = EXT_TO_LANG[ext]
    if (hljs.getLanguage(candidate)) return candidate
  }
  // highlight.js registers most file extensions as aliases (dart, ex, hs, pl…).
  if (ext && hljs.getLanguage(ext)) return ext

  // Check shebang in first line
  if (content) {
    const firstLine = content.slice(0, 120).split('\n')[0].trim()
    if (firstLine.startsWith('#!')) {
      if (/bash|sh|zsh/.test(firstLine)) return 'bash'
      if (/python/.test(firstLine)) return 'python'
      if (/node/.test(firstLine)) return 'javascript'
      if (/ruby/.test(firstLine)) return 'ruby'
      if (/perl/.test(firstLine)) return 'perl'
    }
  }

  return null
}

/** Display name of the language used to highlight a file, e.g. "Python". */
export function languageName(filename: string): string | null {
  const language = detectLanguage(filename)
  return language ? hljs.getLanguage(language)?.name || null : null
}

/**
 * Highlights code text using highlight.js with language detection.
 */
export function highlightCode(
  content: string,
  filename: string,
): { html: string; language: string | null } {
  if (!content) return { html: '', language: null }

  const detected = detectLanguage(filename, content)
  if (detected) {
    try {
      const res = hljs.highlight(content, { language: detected, ignoreIllegals: true })
      return { html: res.value, language: detected }
    } catch {
      // fallback
    }
  }

  // Auto detect if file is reasonably sized (< 50 KB) and no explicit extension
  if (content.length < 50_000) {
    try {
      const auto = hljs.highlightAuto(content)
      if (auto.language && auto.relevance > 4) {
        return { html: auto.value, language: auto.language }
      }
    } catch {
      // ignore
    }
  }

  return { html: escapeHtml(content), language: null }
}
