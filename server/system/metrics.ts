import os from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import type { CpuCounter, SystemMetrics } from '../../src/lib/systemMetrics.ts'
import { batteries, cpuUsage, memoryMetric, parseCpu, parseMemory, readNumber, readText, temperatures } from './linux.ts'
import { gpuLabels, graphics } from './gpu.ts'
import { macMetrics } from './macos.ts'
import { createStorageCollector, storagePaths } from './storage.ts'
import { createInformationCollector } from './information.ts'

export function createSystemCollector(options: { procRoot?: string; sysRoot?: string; platform?: string; serverless?: boolean; labels?: string; sampleDelay?: number; storage?: string } = {}) {
  const procRoot = options.procRoot || process.env.VAULT_PROC_ROOT || '/proc'
  const sysRoot = options.sysRoot || process.env.VAULT_SYS_ROOT || '/sys'
  const platform = options.platform || os.platform()
  const serverless = options.serverless ?? !!process.env.VERCEL
  const labels = gpuLabels(options.labels ?? process.env.VAULT_GPU_LABELS)
  const paths = storagePaths(options.storage ?? process.env.VAULT_STORAGE_PATHS)
  const collectStorage = createStorageCollector(paths)
  let previous: CpuCounter[] = []
  let lastCpuSample = 0
  let cached: SystemMetrics | null = null
  let cachedAt = 0
  let pending: Promise<SystemMetrics> | null = null
  let collectInformation: ReturnType<typeof createInformationCollector> | null = null
  async function cpuCounters(): Promise<CpuCounter[]> {
    if (platform === 'linux') return parseCpu(await readText(join(procRoot, 'stat')) || '')
    const cores = os.cpus().map((cpu, i) => ({ id: `cpu${i}`, total: Object.values(cpu.times).reduce((a, b) => a + b, 0), idle: cpu.times.idle }))
    return [{ id: 'cpu', total: cores.reduce((sum, cpu) => sum + cpu.total, 0), idle: cores.reduce((sum, cpu) => sum + cpu.idle, 0) }, ...cores]
  }
  async function collect(): Promise<SystemMetrics> {
    const result: SystemMetrics = {
      sampledAt: new Date().toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, platform,
      machine: serverless ? 'Serverless runtime' : process.env.VAULT_MACHINE_LABEL || os.hostname(),
      environment: serverless ? 'serverless' : 'host', uptimeSeconds: null,
      cpu: { model: '', usage: null, cores: [] }, memory: null, swap: null, containerMemory: null,
      temperatures: [], gpus: [], batteries: [], storage: [], information: null, notes: [],
    }
    if (serverless) {
      result.notes.push('This deployment runs on Vercel. Home-server hardware metrics are not available from a serverless function.')
      return result
    }
    if (platform === 'linux') {
      const container = await readText('/.dockerenv') !== null || /docker|containerd|kubepods|libpod/.test(await readText(join(procRoot, '1/cgroup')) || '')
      result.environment = container ? 'container' : 'host'
      const [mem, uptime, cpuinfo, sensors, gpus, battery, limit, used] = await Promise.all([
        readText(join(procRoot, 'meminfo')), readText(join(procRoot, 'uptime')), readText(join(procRoot, 'cpuinfo')),
        temperatures(sysRoot), graphics(sysRoot, labels), batteries(sysRoot),
        readNumber('/sys/fs/cgroup/memory.max'), readNumber('/sys/fs/cgroup/memory.current'),
      ])
      Object.assign(result, parseMemory(mem || ''))
      result.uptimeSeconds = uptime ? Number(uptime.split(' ')[0]) : null
      result.cpu.model = /^model name\s*:\s*(.+)$/m.exec(cpuinfo || '')?.[1] || os.cpus()[0]?.model || 'CPU'
      result.temperatures = sensors; result.gpus = gpus; result.batteries = battery
      if (container && limit !== null && used !== null) result.containerMemory = memoryMetric(limit, limit - used)
      if (container) result.notes.push('CPU, RAM and swap are kernel counters visible to Vault, normally host-wide in Docker. They are not this app’s usage. Sensors depend on host driver and container access.')
      if (!result.memory) result.notes.push('Memory counters are unavailable. Check access to the configured proc filesystem.')
    } else if (platform === 'darwin') {
      Object.assign(result, await macMetrics(os.totalmem()))
      result.uptimeSeconds = os.uptime()
      result.cpu.model = os.cpus()[0]?.model || 'CPU'
      result.notes.push('Monitoring this Mac running the Vault backend, not your remote Fedora server or RustFS endpoint. Open Vault on your home-server domain to see that server.')
      result.notes.push('Mac RAM availability includes reclaimable file cache (an estimate, not a memory-pressure reading). CPU temperatures are not exposed by this unprivileged collector. Apple GPU load is shown when the driver reports it.')
    } else {
      result.memory = memoryMetric(os.totalmem(), os.freemem())
      result.uptimeSeconds = os.uptime()
      result.cpu.model = os.cpus()[0]?.model || 'CPU'
      result.notes.push('Basic OS CPU and memory counters are shown. Swap and hardware sensors are supported on Linux hosts; memory on this platform includes cached pages.')
    }
    collectInformation ??= createInformationCollector({ platform, sysRoot, container: result.environment === 'container' })
    ;[result.storage, result.information] = await Promise.all([collectStorage(), collectInformation()])
    if (!paths.length) result.notes.push('Storage configuration is invalid. VAULT_STORAGE_PATHS must contain 1–12 labelled absolute paths.')
    // Sample on demand, never run a permanent background polling loop.
    if (!previous.length || performance.now() - lastCpuSample > 15000) { previous = await cpuCounters(); await delay(options.sampleDelay ?? 250) }
    const next = await cpuCounters()
    const usage = cpuUsage(previous, next)
    previous = next
    lastCpuSample = performance.now()
    result.cpu.usage = usage.find(cpu => cpu.id === 'cpu')?.usage ?? null
    result.cpu.cores = usage.filter(cpu => cpu.id !== 'cpu')
    result.sampledAt = new Date().toISOString()
    return result
  }
  return async (): Promise<SystemMetrics> => {
    if (cached && performance.now() - cachedAt < 2500) return cached
    if (pending) return pending
    pending = collect().then(value => { cached = value; cachedAt = performance.now(); return value }).finally(() => { pending = null })
    return pending
  }
}
