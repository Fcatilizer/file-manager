import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { BatteryMetric, GpuMetric } from '../../src/lib/systemMetrics.ts'
import { memoryMetric, percent } from './linux.ts'
const exec = promisify(execFile)
async function command(file: string, args: string[]) {
  try { return (await exec(file, args, { timeout: 1800, maxBuffer: 1024 * 1024, env: { ...process.env, LC_ALL: 'C', LANG: 'C' } })).stdout }
  catch { return '' }
}

export function parseMacMemory(text: string, total: number) {
  const pageSize = Number(/page size of (\d+) bytes/.exec(text)?.[1])
  const counts = new Map(Array.from(text.matchAll(/^([^:\n]+):\s+(\d+)\./gm), m => [m[1].trim(), Number(m[2])]))
  const free = counts.get('Pages free'), cached = counts.get('File-backed pages'), purgeable = counts.get('Pages purgeable')
  if (!pageSize || free === undefined || cached === undefined || purgeable === undefined) return null
  // File-backed includes speculative pages. Inactive anonymous pages are NOT free.
  // This is reclaimable memory, not Activity Monitor's memory pressure measurement.
  return memoryMetric(total, (free + cached + purgeable) * pageSize)
}
export function parseMacSwap(text: string) {
  const amount = (key: string) => {
    const match = new RegExp(`${key}\\s*=\\s*([\\d.]+)([KMGT]?)`, 'i').exec(text)
    if (!match) return null
    const value = Number(match[1]) * 1024 ** ({ '': 0, K: 1, M: 2, G: 3, T: 4 }[match[2].toUpperCase()] ?? 0)
    return Number.isFinite(value) ? value : null
  }
  const total = amount('total'), used = amount('used')
  return total !== null && used !== null ? memoryMetric(total, total - used) : null
}
export function parseMacBattery(text: string): BatteryMetric[] {
  return text.split('\n').flatMap(line => {
    const match = /-([^\t]+?)\s+\(id=[^)]+\)\s+(\d+)%;\s*([^;]+)/.exec(line)
    if (!match || /present:\s*false/i.test(line)) return []
    return [{ id: match[1], name: match[1].replace(/-\d+$/, ''), percent: percent(Number(match[2])), status: match[3].trim(), watts: null, healthPercent: null }]
  })
}
export function parseAppleGpu(text: string): GpuMetric[] {
  // AGXAccelerator's live counters are optional and vary by macOS/driver version.
  return text.split(/(?=\+-o )/).flatMap(block => {
    const model = /"model"\s*=\s*"([^"]+)"/.exec(block)?.[1]
    if (!model || !/^Apple\s/.test(model)) return []
    const load = /"Device Utilization %"\s*=\s*(\d+(?:\.\d+)?)/.exec(block)
    const id = /\+-o\s+(\S+)/.exec(block)?.[1] || model
    return [{ id, name: model, kind: 'integrated', driver: 'Apple AGX', utilization: load ? percent(Number(load[1])) : null, memory: null, temperature: null }]
  })
}
export async function macMetrics(totalMemory: number) {
  const [vm, swap, battery, gpu] = await Promise.all([
    command('/usr/bin/vm_stat', []), command('/usr/sbin/sysctl', ['vm.swapusage']),
    command('/usr/bin/pmset', ['-g', 'batt']), command('/usr/sbin/ioreg', ['-r', '-c', 'AGXAccelerator', '-d', '1', '-l']),
  ])
  return { memory: parseMacMemory(vm, totalMemory), swap: parseMacSwap(swap), batteries: parseMacBattery(battery), gpus: parseAppleGpu(gpu) }
}
