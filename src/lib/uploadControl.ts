/** One controller can pause the current file and the rest of an upload queue. */
export class UploadControl {
  private stopped = false
  private transfer = new AbortController()
  private listeners = new Set<() => void>()

  get paused() { return this.stopped }
  get transferSignal() { return this.transfer.signal }

  pause() {
    if (this.stopped) return
    this.stopped = true
    this.transfer.abort()
    this.listeners.forEach(listener => listener())
  }

  resume() {
    if (!this.stopped) return
    this.transfer = new AbortController()
    this.stopped = false
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  async waitUntilResumed(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    if (!this.stopped) return
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => { unsubscribe(); signal.removeEventListener('abort', abort) }
      const abort = () => { cleanup(); reject(signal.reason) }
      const unsubscribe = this.subscribe(() => {
        if (!this.stopped) { cleanup(); resolve() }
      })
      signal.addEventListener('abort', abort, { once: true })
    })
  }
}
