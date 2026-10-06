export type SupportedExtension = 'txt' | 'md' | 'html' | 'xml' | 'json'

export interface ExtensionOption {
  ext: SupportedExtension
  label: string
  mime: string
}

export const SUPPORTED_EXTENSIONS: ExtensionOption[] = [
  { ext: 'txt', label: 'Plain Text (.txt)', mime: 'text/plain' },
  { ext: 'md', label: 'Markdown (.md)', mime: 'text/markdown' },
  { ext: 'html', label: 'HTML (.html)', mime: 'text/html' },
  { ext: 'xml', label: 'XML (.xml)', mime: 'application/xml' },
  { ext: 'json', label: 'JSON (.json)', mime: 'application/json' },
]
