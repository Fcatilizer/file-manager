import { useEffect, useState, type ReactNode } from 'react'
import { ApiError, fetchSystemMetrics } from '../lib/api'
import type { MemoryMetric, SystemMetrics } from '../lib/systemMetrics'
import Modal, { ModalHeader } from './Modal'
import { Icon } from './Icon'
import SystemInformation from './SystemInformation'
import { gpuUsageExplanation } from '../lib/gpuInformation'
import '../styles/system-dashboard.css'

const ratio = (metric: MemoryMetric) => metric.total > 0 ? metric.used / metric.total * 100 : 0
const percentage = (value: number | null) => value === null ? 'Unavailable' : `${value.toFixed(1)}%`
function bytes(value: number) {
  const index = value > 0 ? Math.min(4, Math.floor(Math.log(value) / Math.log(1024))) : 0
  return `${(value / 1024 ** index).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${['B', 'KiB', 'MiB', 'GiB', 'TiB'][index]}`
}
function uptime(value: number | null) {
  if (value === null) return 'Unavailable'
  const minutes = Math.floor(value / 60)
  return `${Math.floor(minutes / 1440)}d ${Math.floor(minutes / 60) % 24}h ${minutes % 60}m`
}
function MetricCard({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return <section className={`system-card${wide ? ' system-card--wide' : ''}`} aria-label={title}><h3>{title}</h3>{children}</section>
}
function Meter({ label, value }: { label: string; value: number | null }) {
  return <div className="system-meter"><div><span>{label}</span><strong>{percentage(value)}</strong></div>{value !== null && <progress aria-label={label} max={100} value={Math.max(0, Math.min(100, value))} />}</div>
}
function MemoryCard({ title, metric }: { title: string; metric: MemoryMetric | null }) {
  return <MetricCard title={title}>{metric ? <>
    <strong className="system-card__value">{bytes(metric.used)} <small>/ {bytes(metric.total)}</small></strong>
    <Meter label={`${title} used`} value={ratio(metric)} />
    <p>{metric.total === 0 ? 'Not configured' : `${bytes(metric.available)} available`}</p>
  </> : <p>Not available in this environment.</p>}</MetricCard>
}

export default function SystemDashboard({ onClose }: { onClose: () => void }) {
  const [snapshot, setSnapshot] = useState<{ data: SystemMetrics; receivedAt: number } | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    async function poll() {
      if (disposed || document.hidden) return
      const current = new AbortController()
      controller = current
      let retry = true
      const timeout = setTimeout(() => current.abort(new DOMException('Metrics request timed out', 'TimeoutError')), 10000)
      try {
        const data = await fetchSystemMetrics(current.signal)
        if (disposed || current.signal.aborted) return
        const receivedAt = performance.now()
        setSnapshot({ data, receivedAt }); setTick(receivedAt); setError('')
      } catch (err) {
        if (disposed || document.hidden || (current.signal.aborted && current.signal.reason?.name !== 'TimeoutError')) return
        setError(err instanceof Error ? err.message : 'Could not load server metrics.')
        if (err instanceof ApiError && [401, 403].includes(err.status)) retry = false
      } finally {
        clearTimeout(timeout)
        if (controller === current) {
          controller = undefined
          if (!disposed && !document.hidden && retry) timer = setTimeout(() => void poll(), 5000)
        }
      }
    }
    const visibility = () => {
      clearTimeout(timer)
      controller?.abort()
      controller = undefined
      if (!document.hidden) void poll()
    }
    void poll()
    document.addEventListener('visibilitychange', visibility)
    return () => { disposed = true; clearTimeout(timer); controller?.abort(); document.removeEventListener('visibilitychange', visibility) }
  }, [attempt])
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) setTick(performance.now()) }, 1000)
    return () => clearInterval(timer)
  }, [])
  const data = snapshot?.data
  const serverNow = snapshot ? new Date(Date.parse(snapshot.data.sampledAt) + Math.max(0, tick - snapshot.receivedAt)) : null
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const formatTime = (zone: string) => serverNow?.toLocaleString(undefined, { timeZone: zone, dateStyle: 'medium', timeStyle: 'medium' })
  const stale = !!error || !!snapshot && tick - snapshot.receivedAt > 15000
  return <Modal onClose={onClose} ariaLabel="Server dashboard" className="system-dashboard">
    <ModalHeader onClose={onClose}><div><h2><Icon name="dashboard" size={20} /> Server dashboard</h2><p>{data ? `${data.machine} · ${data.platform} · ${data.environment}` : 'Live system health · Admin only'}</p></div></ModalHeader>
    <div className="system-dashboard__body">
      <div className="system-dashboard__status"><span className={stale ? 'system-dashboard__stale' : ''}>{!data ? 'Connecting…' : stale ? 'Readings may be out of date' : 'Updates every 5 seconds'}</span><button type="button" className="btn btn--ghost btn--sm" onClick={() => setAttempt(n => n + 1)}>Refresh</button></div>
      {error && <p className="system-dashboard__error" role="alert">{error}</p>}
      {!data && !error && <div className="system-dashboard__loading" role="status"><div className="spinner" /> Reading server metrics…</div>}
      {data && <>
        <div className="system-dashboard__summary"><span>{data.platform} · {data.environment}</span><span>Uptime {uptime(data.uptimeSeconds)}</span><span>Sampled {new Date(data.sampledAt).toLocaleTimeString()}</span></div>
        {data.notes.map(note => <p className="system-dashboard__note" key={note}>{note}</p>)}
        <div className="system-dashboard__grid">
          <MetricCard title="Date & time" wide><div className="system-clocks"><div><span>Server · {data.timeZone}</span><time>{formatTime(data.timeZone)}</time></div><div><span>Your time · {localZone}</span><time>{formatTime(localZone)}</time></div><div><span>UTC</span><time>{formatTime('UTC')}</time></div></div></MetricCard>
          <MetricCard title="Disk storage" wide>
            <p>Total filesystem usage, including RustFS data, Dokploy deployments, databases, images and other files stored on that filesystem. Remote RustFS storage is not included.</p>
            {data.environment === 'container' && <p>Default readings describe the filesystem backing this container. Mount a directory from each host disk you want to monitor.</p>}
            <div className="system-storage">{data.storage.map(disk => <section key={disk.path} aria-label={disk.label}>
              <h4>{disk.label} <small>{disk.path}</small></h4>
              {disk.usage ? <>
                <strong className="system-card__value">{bytes(disk.usage.used)} <small>/ {bytes(disk.usage.total)} used</small></strong>
                <Meter label={`${disk.label} used`} value={disk.usage.used / disk.usage.total * 100} />
                <div className="system-storage__free"><strong>{bytes(disk.usage.available)} free to use</strong>{disk.usage.reserved > 0 && <span>{bytes(disk.usage.reserved)} reserved by filesystem</span>}</div>
              </> : <p>{disk.error || 'Storage capacity unavailable.'}</p>}
              <p>Checked {new Date(disk.sampledAt).toLocaleTimeString()}</p>
            </section>)}</div>
            {!data.storage.length && <p>No filesystem readings available.</p>}
            <p>Refreshes every 30 seconds. Shared filesystem capacity is not summed across mount points; this is combined usage, not a per-app breakdown.</p>
          </MetricCard>
          <MemoryCard title="Memory (RAM)" metric={data.memory} />
          <MemoryCard title="Swap memory" metric={data.swap} />
          {data.containerMemory && <MemoryCard title="Container memory limit" metric={data.containerMemory} />}
          <MetricCard title="CPU" wide><p>{data.cpu.model || 'CPU information unavailable'}</p><Meter label="Total CPU utilization" value={data.cpu.usage} />
            <div className="system-cores">{data.cpu.cores.map(core => <Meter key={core.id} label={`Core ${core.id.replace('cpu', '')}`} value={core.usage} />)}</div>
            {!!data.cpu.cores.length && <p>{data.cpu.cores.length} logical cores · Load measured between samples</p>}
          </MetricCard>
          <MetricCard title="Temperatures" wide>{data.temperatures.length ? <div className="system-sensors">{data.temperatures.map(sensor => <div key={sensor.id}><span>{sensor.label}</span><strong>{sensor.celsius.toFixed(1)} °C</strong></div>)}</div> : <p>{data.platform === 'darwin' ? 'CPU temperatures are not available through this Mac collector.' : 'No temperature sensors are exposed to Vault.'}</p>}</MetricCard>
          {data.gpus.length ? data.gpus.map(gpu => <MetricCard key={gpu.id} title={`${gpu.kind === 'integrated' ? 'iGPU' : gpu.kind === 'discrete' ? 'dGPU' : 'GPU'} · ${gpu.name}`}>
            <p>{gpu.id}{gpu.driver ? ` · ${gpu.driver}` : ''}{gpu.kind === 'unknown' ? ' · Type unreported' : ''}</p>
            <Meter label="GPU utilization" value={gpu.utilization} />
            {gpu.utilization === null && <p>{gpuUsageExplanation(gpu)}</p>}
            {gpu.memory && <><Meter label="GPU memory used" value={ratio(gpu.memory)} /><p>{bytes(gpu.memory.used)} / {bytes(gpu.memory.total)}</p></>}
            {gpu.temperature !== null && <p>Temperature <strong>{gpu.temperature.toFixed(1)} °C</strong></p>}
          </MetricCard>) : <MetricCard title="Graphics"><p>No GPU metrics are exposed to Vault.</p></MetricCard>}
          {data.batteries.length ? data.batteries.map(battery => <MetricCard key={battery.id} title={`Battery · ${battery.name}`}>
            <strong className="system-card__value">{percentage(battery.percent)}</strong><Meter label="Battery charge" value={battery.percent} />
            <p>{battery.status}{battery.watts !== null ? ` · ${battery.watts.toFixed(1)} W` : ''}</p>
            {battery.healthPercent !== null && <p>Battery health {percentage(battery.healthPercent)} of design capacity</p>}
          </MetricCard>) : <MetricCard title="Battery"><p>No battery detected or accessible.</p></MetricCard>}
        </div>
        <SystemInformation data={data} />
      </>}
    </div>
  </Modal>
}
