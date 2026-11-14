import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import express from 'express'
import type { AuthedRequest } from '../server/auth.ts'
import { batteries, cpuUsage, parseCpu, parseMemory, temperatures } from '../server/system/linux.ts'
import { gpuLabels, graphics, parseNvidia } from '../server/system/gpu.ts'
import { createSystemCollector } from '../server/system/metrics.ts'
import { createSystemRouter } from '../server/system/router.ts'

async function fixture(run: (root: string, put: (path: string, value: string) => Promise<void>) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'vault-metrics-'))
  const put = async (path: string, value: string) => {
    const target = join(root, path)
    await mkdir(join(target, '..'), { recursive: true }); await writeFile(target, value)
  }
  try { await run(root, put) } finally { await rm(root, { recursive: true, force: true }) }
}

test('RAM uses available memory including reclaimable cache; zero swap differs from missing data', () => {
  const result = parseMemory('MemTotal: 1000 kB\nMemFree: 100 kB\nMemAvailable: 600 kB\nSwapTotal: 0 kB\nSwapFree: 0 kB')
  assert.deepEqual(result.memory, { total: 1024000, used: 409600, available: 614400 })
  assert.deepEqual(result.swap, { total: 0, used: 0, available: 0 })
  assert.deepEqual(parseMemory(''), { memory: null, swap: null })
})

test('CPU deltas exclude guest double counting, track per-core load, and handle resets/hotplug', () => {
  const before = parseCpu('cpu 100 0 50 850 0 0 0 0 20 0\ncpu0 100 0 50 850 0 0 0 0')
  const after = parseCpu('cpu 150 0 50 900 0 0 0 0 40 0\ncpu0 150 0 50 900 0 0 0 0\ncpu1 1 0 0 9')
  assert.equal(before[0].total, 1000)
  assert.deepEqual(cpuUsage(before, after).map(cpu => cpu.usage), [50, 50, null])
  assert.equal(cpuUsage(after, before)[0].usage, null)
  assert.equal(cpuUsage(after, after)[0].usage, null)
})

test('Linux sensors and battery report unit-correct readings without conflating missing and zero', async () => fixture(async (root, put) => {
  await put('class/hwmon/hwmon0/name', 'coretemp')
  await put('class/hwmon/hwmon0/temp1_input', '47500')
  await put('class/hwmon/hwmon0/temp1_label', 'Package id 0')
  await put('class/hwmon/hwmon0/temp2_input', 'nonsense')
  await put('class/power_supply/BAT0/type', 'Battery')
  await put('class/power_supply/BAT0/capacity', '0')
  await put('class/power_supply/BAT0/status', 'Charging')
  await put('class/power_supply/BAT0/current_now', '2000000')
  await put('class/power_supply/BAT0/voltage_now', '12000000')
  await put('class/power_supply/BAT0/energy_full', '40000000')
  await put('class/power_supply/BAT0/energy_full_design', '50000000')
  await put('class/power_supply/AC/type', 'Mains')
  const temps = await temperatures(root)
  assert.equal(temps.length, 1); assert.equal(temps[0].celsius, 47.5)
  const battery = await batteries(root)
  assert.equal(battery.length, 1); assert.equal(battery[0].percent, 0)
  assert.equal(battery[0].watts, 24); assert.equal(battery[0].healthPercent, 80)
}))

test('separate GPUs retain unknown utilization; explicit adapter kinds and NVIDIA deduplication work', async () => fixture(async (root, put) => {
  await put('class/drm/card0/device/uevent', 'DRIVER=i915\nPCI_SLOT_NAME=0000:00:02.0')
  await put('class/drm/card0/device/vendor', '0x8086')
  await put('class/drm/card0/device/device', '0x0166')
  await put('class/drm/card1/device/uevent', 'DRIVER=nvidia\nPCI_SLOT_NAME=0000:01:00.0')
  await put('class/drm/card2/device/uevent', 'DRIVER=amdgpu\nPCI_SLOT_NAME=0000:02:00.0')
  await put('class/drm/card2/device/gpu_busy_percent', '0')
  const gpus = await graphics(root, gpuLabels('{"0000:02:00.0":{"name":"Radeon", "kind":"discrete"}}'), async () => parseNvidia('00000000:01:00.0, NVIDIA Test, 25, 4096, 1024, 55'))
  assert.equal(gpus.length, 3)
  assert.equal(gpus[0].kind, 'integrated'); assert.equal(gpus[0].utilization, null)
  assert.equal(gpus[1].utilization, 25); assert.equal(gpus[1].memory?.used, 1024 ** 3)
  assert.equal(gpus[2].kind, 'discrete'); assert.equal(gpus[2].utilization, 0)
  assert.deepEqual(gpuLabels('invalid'), {})
  assert.equal(parseNvidia('00000000:01:00.0, NVIDIA Test, [N/A], [N/A], [N/A], [N/A]')[0].utilization, null)
}))

test('collector handles missing sensors, coalesces concurrent requests and caches snapshots', async () => fixture(async (root, put) => {
  await put('meminfo', 'MemTotal: 1000 kB\nMemAvailable: 400 kB\nSwapTotal: 100 kB\nSwapFree: 25 kB')
  await put('stat', 'cpu 1 0 0 9\ncpu0 1 0 0 9')
  await put('uptime', '1234.50 99.00')
  await put('cpuinfo', 'model name : Fixture CPU')
  const collect = createSystemCollector({ procRoot: root, sysRoot: root, platform: 'linux', serverless: false, sampleDelay: 0 })
  const [one, two] = await Promise.all([collect(), collect()])
  assert.strictEqual(one, two); assert.strictEqual(await collect(), one)
  assert.equal(one.memory?.used, 600 * 1024); assert.equal(one.swap?.used, 75 * 1024)
  assert.equal(one.cpu.cores.length, 1); assert.equal(one.uptimeSeconds, 1234.5)
  assert.deepEqual(one.temperatures, []); assert.deepEqual(one.batteries, [])
}))

test('Vercel never presents runtime hardware as the home server', async () => {
  const data = await createSystemCollector({ serverless: true })()
  assert.equal(data.environment, 'serverless'); assert.equal(data.memory, null)
  assert.deepEqual(data.cpu.cores, []); assert.match(data.notes[0], /Vercel/)
})

test('metrics route denies anonymous/regular users, disables caching and masks collection errors', async () => {
  let calls = 0
  const sample = await createSystemCollector({ serverless: true })()
  const app = express()
  app.use('/api/system', createSystemRouter(async () => { calls++; if (calls > 1) throw Error('secret host detail'); return sample }, (req, res, next) => {
    const role = req.header('x-test-role')
    if (!role) { res.status(401).json({ error: 'Unauthorized' }); return }
    ;(req as AuthedRequest).user = { role } as AuthedRequest['user']
    next()
  }))
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening')
  const address = server.address() as { port: number }
  const url = `http://127.0.0.1:${address.port}/api/system/metrics`
  try {
    assert.equal((await fetch(url)).status, 401)
    assert.equal((await fetch(url, { headers: { 'x-test-role': 'user' } })).status, 403)
    assert.equal(calls, 0)
    const ok = await fetch(url, { headers: { 'x-test-role': 'admin' } })
    assert.equal(ok.status, 200); assert.equal(ok.headers.get('cache-control'), 'no-store')
    const failure = await fetch(url, { headers: { 'x-test-role': 'admin' } })
    assert.equal(failure.status, 503); assert.doesNotMatch(await failure.text(), /secret host detail/)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})

test('macOS RAM reclaims file cache without double-counting speculative pages', async () => {
  const { parseMacMemory, parseMacSwap } = await import('../server/system/macos.ts')
  const memory = parseMacMemory('Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free: 10.\nFile-backed pages: 100.\nPages purgeable: 5.\nPages speculative: 20.', 1000 * 16384)
  assert.equal(memory?.available, 115 * 16384)
  assert.equal(memory?.used, 885 * 16384)
  assert.equal(parseMacMemory('', 1000), null)
  const swap = parseMacSwap('vm.swapusage: total = 8192.00M  used = 6144.00M  free = 2048.00M  (encrypted)')
  assert.deepEqual(swap, { total: 8 * 1024 ** 3, used: 6 * 1024 ** 3, available: 2 * 1024 ** 3 })
  assert.equal(parseMacSwap('unavailable'), null)
  assert.deepEqual(parseMacSwap('total = 0.00M used = 0.00M free = 0.00M'), { total: 0, used: 0, available: 0 })
})

test('macOS battery and Apple GPU parse live counters but do not invent unsupported sensors', async () => {
  const { parseMacBattery, parseAppleGpu } = await import('../server/system/macos.ts')
  const battery = parseMacBattery("Now drawing from 'AC Power'\n -InternalBattery-0 (id=1234)\t52%; charging; 1:45 remaining present: true")
  assert.equal(battery[0].percent, 52); assert.equal(battery[0].status, 'charging')
  assert.equal(battery[0].healthPercent, null)
  assert.deepEqual(parseMacBattery('No batteries'), [])
  const gpu = parseAppleGpu('+-o AGXAcceleratorG17G <class AGXAcceleratorG17G>\n "PerformanceStatistics" = {"Device Utilization %"=53,"Renderer Utilization %"=60}\n "model" = "Apple M5"')
  assert.equal(gpu[0].utilization, 53); assert.equal(gpu[0].kind, 'integrated')
  assert.equal(gpu[0].temperature, null); assert.equal(gpu[0].memory, null)
  assert.equal(parseAppleGpu('+-o AGXAccelerator <class AGX>\n "model" = "Apple M5"')[0].utilization, null)
})

test('filesystem storage separates occupied bytes, usable free space and reserved space', async () => {
  const { storageNumbers, storagePaths } = await import('../server/system/storage.ts')
  assert.deepEqual(storageNumbers({ blocks: 1000, bsize: 4096, bfree: 400, bavail: 350 }), { total: 4096000, used: 2457600, available: 1433600, reserved: 204800 })
  assert.equal(storageNumbers({ blocks: 0, bsize: 4096, bfree: 0, bavail: 0 }), null)
  assert.equal(storageNumbers({ blocks: 10, bsize: 4096, bfree: 0, bavail: -1 })?.available, 0)
  assert.deepEqual(storagePaths(undefined), [{ path: '/', label: 'System filesystem' }])
  assert.deepEqual(storagePaths('[{"path":"relative", "label":"Disk"}]'), [])
  assert.deepEqual(storagePaths('invalid'), [])
})

test('storage collector returns real capacity, caches filesystem calls and reports missing mounts', async () => fixture(async (root) => {
  const { createStorageCollector } = await import('../server/system/storage.ts')
  const collect = createStorageCollector([{ path: root, label: 'Test disk' }, { path: join(root, 'missing'), label: 'Missing mount' }])
  const [a, b] = await Promise.all([collect(), collect()])
  assert.strictEqual(a, b); assert.strictEqual(await collect(), a)
  assert.ok(a[0].usage && a[0].usage.total > 0)
  assert.equal(a[0].usage!.total, a[0].usage!.used + a[0].usage!.available + a[0].usage!.reserved)
  assert.equal(a[1].usage, null); assert.match(a[1].error!, /not mounted/)
}))
