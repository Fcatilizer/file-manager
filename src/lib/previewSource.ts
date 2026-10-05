/** Preview renderers are storage-agnostic; only their data source changes. */
export interface PreviewSource {
  rawUrl: (key: string) => string
  text: (key: string) => Promise<string>
  buffer: (key: string) => Promise<ArrayBuffer>
}
