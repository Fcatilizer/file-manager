import type { GpuMetric } from './systemMetrics'

export function gpuUsageExplanation(gpu: Pick<GpuMetric, 'driver'>) {
  if (gpu.driver === 'i915' || gpu.driver === 'xe') return 'GPU detected. Intel engine usage requires host performance counters; this collector cannot read it through sysfs.'
  if (gpu.driver === 'radeon') return 'GPU detected. The legacy Radeon driver does not provide the sysfs usage counter used here. Live load requires a host monitor such as radeontop.'
  return 'GPU detected, but no utilization reading is accessible to this collector. Driver support and container permissions determine availability.'
}
