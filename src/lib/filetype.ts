export type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'env' | 'word' | 'excel' | 'other'

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v', 'ogv', 'mkv']
const AUDIO_EXT = ['mp3', 'wav', 'flac', 'ogg', 'oga', 'aac', 'm4a']
const WORD_EXT = ['docx', 'doc', 'odt', 'rtf', 'dot', 'dotx']
const EXCEL_EXT = ['xlsx', 'xls', 'xlsm', 'xlsb', 'ods']
const TEXT_EXT = [
  'txt', 'md', 'markdown', 'json', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'sass',
  'less', 'html', 'htm', 'xml', 'yaml', 'yml', 'csv', 'tsv', 'log', 'sh', 'bash',
  'zsh', 'py', 'rb', 'go', 'rs', 'java', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'sql',
  'toml', 'ini', 'env', 'conf', 'cfg', 'gitignore', 'editorconfig', 'lock', 'map',
  'vue', 'svelte', 'graphql', 'prisma', 'properties', 'gradle', 'tf', 'proto',
]

export function extOf(name: string): string {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

export function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

/** Matches `.env`, `.env.local`, `.env.production`, `prod.env`, `env`, etc. */
export function isEnvFile(name: string): boolean {
  const lower = name.toLowerCase()
  return lower === '.env' || lower === 'env' || lower.startsWith('.env.') || lower.endsWith('.env')
}

/** Matches Markdown document extensions (.md, .markdown) */
export function isMarkdownFile(name: string): boolean {
  const ext = extOf(name)
  return ext === 'md' || ext === 'markdown'
}

export function fileKind(name: string): FileKind {
  if (isEnvFile(name)) return 'env'
  const ext = extOf(name)
  if (IMAGE_EXT.includes(ext)) return 'image'
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (AUDIO_EXT.includes(ext)) return 'audio'
  if (ext === 'pdf') return 'pdf'
  if (WORD_EXT.includes(ext)) return 'word'
  if (EXCEL_EXT.includes(ext)) return 'excel'
  if (TEXT_EXT.includes(ext)) return 'text'
  return 'other'
}

export function isPreviewable(name: string): boolean {
  return fileKind(name) !== 'other'
}

/** Matches files that can be edited in the notebook (text, code, config, markdown, env). */
export function isEditableFile(name: string): boolean {
  const kind = fileKind(name)
  return kind === 'text' || kind === 'env'
}
