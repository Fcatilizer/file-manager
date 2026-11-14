import type { GpuMetric } from '../../src/lib/systemMetrics.ts'

// Exact PCI vendor/device pairs from https://github.com/pciutils/pciids.
// A shared device ID can cover several retail models; preserve the family name.
const models: Record<string, { name: string; kind: GpuMetric['kind'] }> = {
  '8086:0166': { name: 'Intel HD Graphics 4000', kind: 'integrated' },
  '1002:6841': { name: 'AMD Radeon HD 7550M/7570M/7650M', kind: 'discrete' },
}

export function gpuModel(vendor: string | null, device: string | null) {
  const normalize = (id: string | null) => (id || '').trim().toLowerCase().replace(/^0x/, '')
  return models[`${normalize(vendor)}:${normalize(device)}`] || null
}
