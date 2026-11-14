export type MemoryMetric = { total: number; used: number; available: number }
export type CpuCounter = { id: string; total: number; idle: number }
export type TemperatureMetric = { id: string; label: string; celsius: number }
export type GpuMetric = {
  id: string; name: string; kind: 'integrated' | 'discrete' | 'unknown'; driver: string | null
  utilization: number | null; memory: MemoryMetric | null; temperature: number | null
}
export type BatteryMetric = {
  id: string; name: string; percent: number | null; status: string
  watts: number | null; healthPercent: number | null
}
export type StorageMetric = {
  path: string; label: string; sampledAt: string; error: string | null
  usage: { total: number; used: number; available: number; reserved: number } | null
}
export type OperatingSystem = { id: string; name: string }
export type SystemInformation = {
  os: OperatingSystem; osScope: 'host' | 'container'; containerOs: OperatingSystem | null
  hostOsAvailable: boolean; kernel: string; architecture: string; hardware: string | null
  hostname: string; firmware: string | null; locale: string; shell: string | null
  runtime: string; packages: { count: number; manager: string } | null
  networks: { name: string; address: string; family: string }[]
  displays: { name: string; mode: string | null }[]
}
export type SystemMetrics = {
  sampledAt: string; timeZone: string; platform: string; machine: string
  environment: 'host' | 'container' | 'serverless'; uptimeSeconds: number | null
  cpu: { model: string; usage: number | null; cores: { id: string; usage: number | null }[] }
  memory: MemoryMetric | null; swap: MemoryMetric | null
  containerMemory: MemoryMetric | null
  temperatures: TemperatureMetric[]; gpus: GpuMetric[]; batteries: BatteryMetric[]
  storage: StorageMetric[]
  information: SystemInformation | null
  notes: string[]
}
