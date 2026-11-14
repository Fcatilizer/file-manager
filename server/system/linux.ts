import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { BatteryMetric, CpuCounter, MemoryMetric, TemperatureMetric } from '../../src/lib/systemMetrics.ts'

export async function readText(path: string): Promise<string | null> {
  try { return (await readFile(path, 'utf8')).trim() } catch { return null }
}
export async function names(path: string): Promise<string[]> {
  try { return (await readdir(path)).sort().slice(0, 256) } catch { return [] }
}
export function numeric(value: string | null): number | null {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
export async function readNumber(path: string) { return numeric(await readText(path)) }
export const percent = (value: number) => Math.min(100, Math.max(0, value))
export function memoryMetric(total: number | null, available: number | null): MemoryMetric | null {
  if (total === null || available === null || total < 0) return null
  const free = Math.min(total, Math.max(0, available))
  return { total, available: free, used: total - free }
}
export function parseMemory(text: string) {
  const values = new Map(Array.from(text.matchAll(/^(\w+):\s+(\d+) kB$/gm), m => [m[1], Number(m[2]) * 1024]))
  const get = (key: string) => values.get(key) ?? null
  // MemAvailable accounts for reclaimable cache; MemFree alone overstates usage.
  return { memory: memoryMetric(get('MemTotal'), get('MemAvailable')), swap: memoryMetric(get('SwapTotal'), get('SwapFree')) }
}
export function parseCpu(text: string): CpuCounter[] {
  return text.split('\n').filter(line => /^cpu(?:\d+)?\s/.test(line)).flatMap(line => {
    const [id, ...parts] = line.trim().split(/\s+/)
    const fields = parts.slice(0, 8).map(Number) // guest times are already included in user/nice
    if (fields.length < 4 || fields.some(v => !Number.isFinite(v) || v < 0)) return []
    return [{ id, total: fields.reduce((a, b) => a + b, 0), idle: fields[3] + (fields[4] || 0) }]
  })
}
export function cpuUsage(before: CpuCounter[], after: CpuCounter[]) {
  const previous = new Map(before.map(cpu => [cpu.id, cpu]))
  return after.map(cpu => {
    const old = previous.get(cpu.id)
    const elapsed = old ? cpu.total - old.total : 0
    const idle = old ? cpu.idle - old.idle : 0
    return { id: cpu.id, usage: elapsed > 0 && idle >= 0 ? percent(100 * (1 - idle / elapsed)) : null }
  })
}
export async function temperatures(sysRoot: string): Promise<TemperatureMetric[]> {
  const result: TemperatureMetric[] = []
  const root = join(sysRoot, 'class/hwmon')
  for (const chip of await names(root)) {
    const base = join(root, chip)
    const chipName = await readText(join(base, 'name')) || chip
    for (const input of (await names(base)).filter(name => /^temp\d+_input$/.test(name))) {
      const value = await readNumber(join(base, input))
      if (value === null || value < -50000 || value > 200000) continue
      const label = await readText(join(base, input.replace('_input', '_label'))) || input.replace('_input', '')
      result.push({ id: `${chip}/${input}`, label: `${chipName} · ${label}`, celsius: value / 1000 })
    }
  }
  if (result.length) return result
  const thermal = join(sysRoot, 'class/thermal')
  for (const zone of (await names(thermal)).filter(name => /^thermal_zone\d+$/.test(name))) {
    const value = await readNumber(join(thermal, zone, 'temp'))
    if (value !== null && value >= -50000 && value <= 200000) result.push({ id: zone, label: await readText(join(thermal, zone, 'type')) || zone, celsius: value / 1000 })
  }
  return result
}
export async function batteries(sysRoot: string): Promise<BatteryMetric[]> {
  const root = join(sysRoot, 'class/power_supply')
  const result: BatteryMetric[] = []
  for (const id of await names(root)) {
    const base = join(root, id)
    if (await readText(join(base, 'type')) !== 'Battery' || await readText(join(base, 'present')) === '0') continue
    const [capacity, status, model, power, current, voltage, energyFull, energyDesign, chargeFull, chargeDesign] = await Promise.all([
      readNumber(join(base, 'capacity')), readText(join(base, 'status')), readText(join(base, 'model_name')),
      readNumber(join(base, 'power_now')), readNumber(join(base, 'current_now')), readNumber(join(base, 'voltage_now')),
      readNumber(join(base, 'energy_full')), readNumber(join(base, 'energy_full_design')),
      readNumber(join(base, 'charge_full')), readNumber(join(base, 'charge_full_design')),
    ])
    const full = energyFull ?? chargeFull, design = energyFull !== null ? energyDesign : chargeDesign
    result.push({ id, name: model || id, percent: capacity === null ? null : percent(capacity), status: status || 'Unknown',
      watts: power !== null ? Math.abs(power) / 1e6 : current !== null && voltage !== null ? Math.abs(current * voltage) / 1e12 : null,
      healthPercent: full !== null && design !== null && design > 0 ? percent(full / design * 100) : null })
  }
  return result
}
