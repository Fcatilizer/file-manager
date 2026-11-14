import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import type { GpuMetric } from '../../src/lib/systemMetrics.ts'
import { memoryMetric, names, numeric, percent, readNumber, readText } from './linux.ts'
const exec = promisify(execFile)
const pciId = (value: string) => value.toLowerCase().replace(/^00000000:/, '0000:')
type GpuLabel = { name?: string; kind?: GpuMetric['kind'] }
export function gpuLabels(value: string | undefined): Record<string, GpuLabel> {
  try {
    const parsed = JSON.parse(value || '{}')
    return Object.fromEntries(Object.entries(parsed).flatMap(([key, label]) => {
      if (!label || typeof label !== 'object') return []
      const data = label as GpuLabel
      return [[pciId(key), { name: typeof data.name === 'string' ? data.name.slice(0, 120) : undefined,
        kind: ['integrated', 'discrete', 'unknown'].includes(data.kind || '') ? data.kind : undefined }]]
    }))
  } catch { return {} }
}
export function parseNvidia(output: string): GpuMetric[] {
  return output.trim().split('\n').flatMap(line => {
    const [bus, name, load, total, used, temperature] = line.split(',').map(s => s.trim())
    if (!bus || !name || !/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+\.[0-9]+$/i.test(bus)) return []
    const capacity = numeric(total), occupied = numeric(used), utilization = numeric(load)
    return [{ id: pciId(bus), name, kind: /tegra|orin|jetson/i.test(name) ? 'integrated' : 'discrete', driver: 'nvidia',
      utilization: utilization === null ? null : percent(utilization), temperature: numeric(temperature),
      memory: capacity !== null && occupied !== null ? memoryMetric(capacity * 1024 ** 2, (capacity - occupied) * 1024 ** 2) : null }]
  })
}
export async function nvidiaMetrics(): Promise<GpuMetric[]> {
  try {
    // Optional NVIDIA runtime tooling. No shell, privilege escalation or user arguments.
    const { stdout } = await exec('nvidia-smi', ['--query-gpu=pci.bus_id,name,utilization.gpu,memory.total,memory.used,temperature.gpu', '--format=csv,noheader,nounits'], { timeout: 1200, maxBuffer: 32 * 1024 })
    return parseNvidia(stdout)
  } catch { return [] }
}
export async function graphics(sysRoot: string, labels: Record<string, GpuLabel>, nvidia: () => Promise<GpuMetric[]> = nvidiaMetrics): Promise<GpuMetric[]> {
  const root = join(sysRoot, 'class/drm')
  const result: GpuMetric[] = []
  for (const card of (await names(root)).filter(name => /^card\d+$/.test(name))) {
    const base = join(root, card, 'device')
    const uevent = await readText(join(base, 'uevent')) || ''
    const id = pciId(/^PCI_SLOT_NAME=(.+)$/m.exec(uevent)?.[1] || card)
    const driver = /^DRIVER=(.+)$/m.exec(uevent)?.[1] || null
    const [vendor, device, load, total, used] = await Promise.all([
      readText(join(base, 'vendor')), readText(join(base, 'device')), readNumber(join(base, 'gpu_busy_percent')),
      readNumber(join(base, 'mem_info_vram_total')), readNumber(join(base, 'mem_info_vram_used')),
    ])
    const brand = vendor === '0x8086' ? 'Intel' : vendor === '0x1002' ? 'AMD' : vendor === '0x10de' ? 'NVIDIA' : 'Graphics adapter'
    // Legacy Intel HD IDs are unambiguously integrated. Other adapters stay unknown
    // unless reported by tooling or configured explicitly; boot_vga does NOT imply iGPU.
    const integrated = vendor === '0x8086' && ['0x0102', '0x0112', '0x0122', '0x0106', '0x0116', '0x0126', '0x0152', '0x0162', '0x0156', '0x0166'].includes(device || '')
    let temperature: number | null = null
    for (const hwmon of await names(join(base, 'hwmon'))) {
      const value = await readNumber(join(base, 'hwmon', hwmon, 'temp1_input'))
      if (value !== null && value >= -50000 && value <= 200000) { temperature = value / 1000; break }
    }
    result.push({ id, name: `${brand}${device ? ` ${device}` : ''}`, kind: integrated ? 'integrated' : 'unknown', driver,
      utilization: load === null ? null : percent(load), memory: total !== null && used !== null ? memoryMetric(total, total - used) : null, temperature })
  }
  for (const gpu of await nvidia()) {
    const index = result.findIndex(item => item.id === gpu.id)
    if (index >= 0) result[index] = gpu
    else result.push(gpu)
  }
  return result.map(gpu => ({ ...gpu, name: labels[gpu.id]?.name || gpu.name, kind: labels[gpu.id]?.kind || gpu.kind }))
}
