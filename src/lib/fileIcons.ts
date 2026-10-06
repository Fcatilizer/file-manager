import { isEnvFile } from './filetype.ts'
export type FileCategory =
  | 'folder'
  | 'doc'
  | 'pdf'
  | 'sheet'
  | 'slide'
  | 'code'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'package'
  | 'other'

export interface FileTypeInfo {
  category: FileCategory
  label: string
  iconName: string
  colorLight: string
  colorDark: string
}

const EXT_MAP: Record<string, { category: FileCategory; label: string; iconName: string; colorLight: string; colorDark: string }> = {
  // Word / Documents
  doc: { category: 'doc', label: 'Word Document', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  docx: { category: 'doc', label: 'Word Document', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  odt: { category: 'doc', label: 'OpenDocument Text', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  rtf: { category: 'doc', label: 'Rich Text', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  dot: { category: 'doc', label: 'Word Template', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  dotx: { category: 'doc', label: 'Word Template', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },

  // PDF
  pdf: { category: 'pdf', label: 'PDF Document', iconName: 'filePdf', colorLight: '#dc2626', colorDark: '#f87171' },

  // Spreadsheets
  xls: { category: 'sheet', label: 'Excel Spreadsheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  xlsx: { category: 'sheet', label: 'Excel Spreadsheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  xlsm: { category: 'sheet', label: 'Excel Spreadsheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  csv: { category: 'sheet', label: 'CSV Spreadsheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  tsv: { category: 'sheet', label: 'TSV Spreadsheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  ods: { category: 'sheet', label: 'OpenDocument Sheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  numbers: { category: 'sheet', label: 'Numbers Sheet', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },

  // Presentations
  ppt: { category: 'slide', label: 'PowerPoint', iconName: 'fileSlide', colorLight: '#ea580c', colorDark: '#fb923c' },
  pptx: { category: 'slide', label: 'PowerPoint', iconName: 'fileSlide', colorLight: '#ea580c', colorDark: '#fb923c' },
  odp: { category: 'slide', label: 'OpenDocument Slide', iconName: 'fileSlide', colorLight: '#ea580c', colorDark: '#fb923c' },
  key: { category: 'slide', label: 'Keynote', iconName: 'fileSlide', colorLight: '#ea580c', colorDark: '#fb923c' },

  // Code & Config
  json: { category: 'code', label: 'JSON Data', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  js: { category: 'code', label: 'JavaScript', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  jsx: { category: 'code', label: 'React JSX', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  ts: { category: 'code', label: 'TypeScript', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  tsx: { category: 'code', label: 'React TSX', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  html: { category: 'code', label: 'HTML Document', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  htm: { category: 'code', label: 'HTML Document', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  css: { category: 'code', label: 'CSS Stylesheet', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  scss: { category: 'code', label: 'SCSS Stylesheet', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  sass: { category: 'code', label: 'Sass Stylesheet', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  less: { category: 'code', label: 'Less Stylesheet', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  py: { category: 'code', label: 'Python Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  rs: { category: 'code', label: 'Rust Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  go: { category: 'code', label: 'Go Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  java: { category: 'code', label: 'Java Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  c: { category: 'code', label: 'C Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  cpp: { category: 'code', label: 'C++ Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  cs: { category: 'code', label: 'C# Source', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  php: { category: 'code', label: 'PHP Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  rb: { category: 'code', label: 'Ruby Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  sql: { category: 'code', label: 'SQL Query', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  sh: { category: 'code', label: 'Shell Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  bash: { category: 'code', label: 'Bash Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  zsh: { category: 'code', label: 'Zsh Script', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  yaml: { category: 'code', label: 'YAML Config', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  yml: { category: 'code', label: 'YAML Config', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  toml: { category: 'code', label: 'TOML Config', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  xml: { category: 'code', label: 'XML Document', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  vue: { category: 'code', label: 'Vue Component', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  svelte: { category: 'code', label: 'Svelte Component', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  graphql: { category: 'code', label: 'GraphQL Schema', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  prisma: { category: 'code', label: 'Prisma Schema', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  dockerfile: { category: 'code', label: 'Dockerfile', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  env: { category: 'code', label: 'Environment Config', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },

  // Text & Notes
  txt: { category: 'text', label: 'Plain Text', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  md: { category: 'text', label: 'Markdown', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  markdown: { category: 'text', label: 'Markdown', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  log: { category: 'text', label: 'Log File', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  ini: { category: 'text', label: 'Configuration', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  conf: { category: 'text', label: 'Configuration', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },

  // Images
  jpg: { category: 'image', label: 'JPEG Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  jpeg: { category: 'image', label: 'JPEG Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  png: { category: 'image', label: 'PNG Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  gif: { category: 'image', label: 'GIF Animation', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  svg: { category: 'image', label: 'SVG Vector', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  webp: { category: 'image', label: 'WebP Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  bmp: { category: 'image', label: 'Bitmap Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  ico: { category: 'image', label: 'Icon', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  avif: { category: 'image', label: 'AVIF Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  tiff: { category: 'image', label: 'TIFF Image', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },

  // Video
  mp4: { category: 'video', label: 'MP4 Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  mov: { category: 'video', label: 'QuickTime Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  mkv: { category: 'video', label: 'MKV Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  webm: { category: 'video', label: 'WebM Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  avi: { category: 'video', label: 'AVI Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  m4v: { category: 'video', label: 'M4V Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },

  // Audio
  mp3: { category: 'audio', label: 'MP3 Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  wav: { category: 'audio', label: 'WAV Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  flac: { category: 'audio', label: 'FLAC Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  ogg: { category: 'audio', label: 'OGG Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  m4a: { category: 'audio', label: 'M4A Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  aac: { category: 'audio', label: 'AAC Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },

  // Archives
  zip: { category: 'archive', label: 'ZIP Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  rar: { category: 'archive', label: 'RAR Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  tar: { category: 'archive', label: 'TAR Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  gz: { category: 'archive', label: 'GZIP Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  tgz: { category: 'archive', label: 'TAR GZip Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  '7z': { category: 'archive', label: '7-Zip Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  bz2: { category: 'archive', label: 'BZIP2 Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  tbz2: { category: 'archive', label: 'TAR BZip2 Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  xz: { category: 'archive', label: 'XZ Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  txz: { category: 'archive', label: 'TAR XZ Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  zst: { category: 'archive', label: 'Zstandard Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  cab: { category: 'archive', label: 'Cabinet Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },

  // Disc Images & ISO
  iso: { category: 'package', label: 'ISO Disc Image', iconName: 'fileIso', colorLight: '#0284c7', colorDark: '#38bdf8' },
  img: { category: 'package', label: 'Disk Image', iconName: 'fileIso', colorLight: '#0284c7', colorDark: '#38bdf8' },
  bin: { category: 'package', label: 'Binary Disk Image', iconName: 'fileIso', colorLight: '#0284c7', colorDark: '#38bdf8' },
  cue: { category: 'package', label: 'Cue Sheet', iconName: 'fileIso', colorLight: '#0284c7', colorDark: '#38bdf8' },
  vdi: { category: 'package', label: 'VirtualBox Disk Image', iconName: 'fileIso', colorLight: '#0284c7', colorDark: '#38bdf8' },

  // Mobile Applications & Bundles
  apk: { category: 'package', label: 'Android Package', iconName: 'fileApk', colorLight: '#16a34a', colorDark: '#4ade80' },
  aab: { category: 'package', label: 'Android App Bundle', iconName: 'fileApk', colorLight: '#16a34a', colorDark: '#4ade80' },
  ipa: { category: 'package', label: 'iOS App Package', iconName: 'fileIpa', colorLight: '#0284c7', colorDark: '#38bdf8' },

  // Executables & Installers
  exe: { category: 'package', label: 'Windows Executable', iconName: 'fileExe', colorLight: '#2563eb', colorDark: '#60a5fa' },
  msi: { category: 'package', label: 'Windows Installer', iconName: 'fileExe', colorLight: '#2563eb', colorDark: '#60a5fa' },
  dmg: { category: 'package', label: 'Apple Disk Image', iconName: 'fileDmg', colorLight: '#475569', colorDark: '#94a3b8' },
  pkg: { category: 'package', label: 'macOS Package', iconName: 'fileDmg', colorLight: '#475569', colorDark: '#94a3b8' },
  appimage: { category: 'package', label: 'AppImage Application', iconName: 'fileAppImage', colorLight: '#0284c7', colorDark: '#38bdf8' },
  deb: { category: 'package', label: 'Debian Package', iconName: 'fileDeb', colorLight: '#d91438', colorDark: '#fb7185' },
  rpm: { category: 'package', label: 'RPM Package', iconName: 'fileRpm', colorLight: '#cc0000', colorDark: '#f87171' },
}

export function getFileTypeInfo(name: string, isFolder: boolean): FileTypeInfo {
  if (isFolder) {
    return {
      category: 'folder',
      label: 'Folder',
      iconName: 'folder',
      colorLight: '#4f46e5',
      colorDark: '#818cf8',
    }
  }

  if (isEnvFile(name)) return EXT_MAP.env

  const lower = name.toLowerCase()
  if (lower.endsWith('.tar.gz')) return { category: 'archive', label: 'TAR GZip Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' }
  if (lower.endsWith('.tar.bz2')) return { category: 'archive', label: 'TAR BZip2 Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' }
  if (lower.endsWith('.tar.xz')) return { category: 'archive', label: 'TAR XZ Archive', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' }

  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (ext && EXT_MAP[ext]) {
    return EXT_MAP[ext]
  }

  return {
    category: 'other',
    label: ext ? `${ext.toUpperCase()} File` : 'File',
    iconName: 'file',
    colorLight: '#64748b',
    colorDark: '#94a3b8',
  }
}

/* ─── Category metadata (for filter chips) ────────────── */

export interface CategoryInfo {
  label: string
  iconName: string
  colorLight: string
  colorDark: string
}

export const CATEGORY_META: Record<FileCategory, CategoryInfo> = {
  folder: { label: 'Folders', iconName: 'folder', colorLight: '#4f46e5', colorDark: '#818cf8' },
  doc: { label: 'Documents', iconName: 'fileDoc', colorLight: '#2563eb', colorDark: '#60a5fa' },
  pdf: { label: 'PDF', iconName: 'filePdf', colorLight: '#dc2626', colorDark: '#f87171' },
  sheet: { label: 'Sheets', iconName: 'fileSheet', colorLight: '#059669', colorDark: '#34d399' },
  slide: { label: 'Slides', iconName: 'fileSlide', colorLight: '#ea580c', colorDark: '#fb923c' },
  code: { label: 'Code', iconName: 'fileCode', colorLight: '#0891b2', colorDark: '#38bdf8' },
  text: { label: 'Text', iconName: 'fileText', colorLight: '#475569', colorDark: '#94a3b8' },
  image: { label: 'Images', iconName: 'fileImage', colorLight: '#7c3aed', colorDark: '#a78bfa' },
  video: { label: 'Video', iconName: 'fileVideo', colorLight: '#e11d48', colorDark: '#fb7185' },
  audio: { label: 'Audio', iconName: 'fileAudio', colorLight: '#d97706', colorDark: '#fbbf24' },
  archive: { label: 'Archives', iconName: 'fileArchive', colorLight: '#b45309', colorDark: '#f59e0b' },
  package: { label: 'Packages', iconName: 'package', colorLight: '#0284c7', colorDark: '#38bdf8' },
  other: { label: 'Other', iconName: 'file', colorLight: '#64748b', colorDark: '#94a3b8' },
}

export const CATEGORY_ORDER: FileCategory[] = [
  'folder',
  'doc',
  'pdf',
  'sheet',
  'slide',
  'code',
  'text',
  'image',
  'video',
  'audio',
  'archive',
  'package',
  'other',
]

export function getCategoryInfo(category: FileCategory): CategoryInfo {
  return CATEGORY_META[category]
}
