/** Rolling transfer rate includes retransmitted bytes, but never paused time. */
export class UploadMetrics {
  private transferred = 0
  private samples: { time: number; bytes: number }[]

  constructor(now = performance.now()) {
    this.samples = [{ time: now, bytes: 0 }]
  }

  addBytes(bytes: number) { this.transferred += Math.max(0, bytes) }

  reset(now = performance.now()) {
    this.samples = [{ time: now, bytes: this.transferred }]
  }

  measure(remaining: number, now = performance.now()) {
    this.samples.push({ time: now, bytes: this.transferred })
    while (this.samples.length > 2 && this.samples[1].time <= now - 5000) this.samples.shift()
    const oldest = this.samples[0]
    const elapsed = (now - oldest.time) / 1000
    const bytesPerSecond = elapsed >= 0.25 ? (this.transferred - oldest.bytes) / elapsed : 0
    return { bytesPerSecond, etaSeconds: bytesPerSecond > 0 ? Math.max(0, remaining) / bytesPerSecond : null }
  }
}
