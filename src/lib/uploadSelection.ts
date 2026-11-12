export type UploadEntry = { path: string; file: File | null }
export type UploadSelection = (signal: AbortSignal) => Promise<UploadEntry[]>

function checkPath(path: string): string {
  if (path.split('/').some(part => !part || part === '.' || part === '..') || /[\\\0]/.test(path)) {
    throw new Error(`Cannot upload an invalid file path: ${path}`)
  }
  return path
}

export function selectUploadFiles(files: ArrayLike<File>): UploadSelection {
  // Snapshot FileList before the input is reset or the drop event ends.
  const snapshot = Array.from(files)
  return async signal => {
    signal.throwIfAborted()
    return snapshot.map(file => ({ file, path: checkPath(file.webkitRelativePath || file.name) }))
  }
}

function readEntry<T>(signal: AbortSignal, read: (resolve: (value: T) => void, reject: (error: DOMException) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => reject(signal.reason)
    const cleanup = () => signal.removeEventListener('abort', abort)
    signal.addEventListener('abort', abort, { once: true })
    try {
      read(value => { cleanup(); resolve(value) }, error => { cleanup(); reject(error) })
    } catch (error) { cleanup(); reject(error) }
  })
}

/** Capture entries synchronously: browsers protect the drag store after drop returns. */
export function selectDroppedFiles(data: Pick<DataTransfer, 'items' | 'files'>): UploadSelection {
  const items = Array.from(data.items).filter(item => item.kind === 'file')
  if (!items.length) return selectUploadFiles(data.files)
  const roots = items.map(item => {
    const entryItem = item as DataTransferItem & { getAsEntry?: () => FileSystemEntry | null }
    const entry = (entryItem.getAsEntry || entryItem.webkitGetAsEntry)?.call(item)
    return { entry, file: entry ? null : item.getAsFile() }
  })
  return async signal => {
    const selected: UploadEntry[] = []
    async function walk(entry: FileSystemEntry, parent: string): Promise<void> {
      signal.throwIfAborted()
      const path = checkPath(parent + entry.name)
      try {
        if (entry.isFile) {
          const file = await readEntry<File>(signal, (resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject))
          selected.push({ path, file })
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader()
          let empty = true
          // A reader may return only 100 children per call. Drain it fully.
          while (true) {
            signal.throwIfAborted()
            const children = await readEntry<FileSystemEntry[]>(signal, (resolve, reject) => reader.readEntries(resolve, reject))
            if (!children.length) break
            empty = false
            for (const child of children) await walk(child, path + '/')
          }
          // Non-empty parents are implicit in object keys; only empty folders need markers.
          if (empty) selected.push({ path, file: null })
        } else throw new Error('Unsupported entry type')
      } catch (error) {
        signal.throwIfAborted()
        throw new Error(`Cannot read ${path}: ${error instanceof Error ? error.message : 'Access denied'}`)
      }
    }
    for (const root of roots) {
      signal.throwIfAborted()
      if (root.entry) await walk(root.entry, '')
      else if (root.file) selected.push({ path: checkPath(root.file.name), file: root.file })
      else throw new Error('Your browser could not read this drop. Try dropping it again or selecting files with Upload.')
    }
    signal.throwIfAborted()
    return selected
  }
}
