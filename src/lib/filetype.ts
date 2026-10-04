export type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'other'

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v', 'ogv']
const AUDIO_EXT = ['mp3', 'wav', 'flac', 'ogg', 'oga', 'aac', 'm4a']
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

export function fileKind(name: string): FileKind {
  const ext = extOf(name)
  if (IMAGE_EXT.includes(ext)) return 'image'
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (AUDIO_EXT.includes(ext)) return 'audio'
  if (ext === 'pdf') return 'pdf'
  if (TEXT_EXT.includes(ext)) return 'text'
  return 'other'
}

export function isPreviewable(name: string): boolean {
  return fileKind(name) !== 'other'
}
