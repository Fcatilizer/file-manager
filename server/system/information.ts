import os from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { OperatingSystem, SystemInformation } from '../../src/lib/systemMetrics.ts'
import { names, readText } from './linux.ts'
const exec = promisify(execFile)
export type InformationCommand = (file: string, args: string[]) => Promise<string | null>
const run: InformationCommand = async (file, args) => {
  try { return (await exec(file, args, { timeout: 2000, maxBuffer: 1024 * 1024, env: { ...process.env, LC_ALL: 'C' } })).stdout.trim() }
  catch { return null }
}

/** Parse os-release as data, never source it or expand shell substitutions. */
export function parseOsRelease(text: string | null): OperatingSystem | null {
  if (!text) return null
  const fields: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const match = /^(ID|PRETTY_NAME|NAME|VERSION_ID)=(.*)$/.exec(line.trim())
    if (!match) continue
    let value = match[2]
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      const quoted = value[0] === '"'
      value = value.slice(1, -1)
      if (quoted) value = value.replace(/\\(["\\$`])/g, '$1')
    }
    fields[match[1]] = value.slice(0, 256)
  }
  if (!fields.ID && !fields.NAME && !fields.PRETTY_NAME) return null
  return { id: /^[a-z0-9._-]+$/.test(fields.ID || '') ? fields.ID : 'linux', name: fields.PRETTY_NAME || [fields.NAME, fields.VERSION_ID].filter(Boolean).join(' ') || 'Linux' }
}
export async function packageCount(id: string, command: InformationCommand) {
  if (['fedora', 'rhel', 'centos', 'rocky', 'almalinux', 'opensuse', 'opensuse-leap', 'opensuse-tumbleweed'].includes(id)) {
    const output = await command('rpm', ['-qa', '--qf', '%{NAME}\n'])
    return output === null ? null : { count: output.split('\n').filter(Boolean).length, manager: 'rpm' }
  }
  if (['debian', 'ubuntu', 'linuxmint', 'pop', 'raspbian'].includes(id)) {
    const output = await command('dpkg-query', ['-W', '-f=${db:Status-Status}\n'])
    return output === null ? null : { count: output.split('\n').filter(line => line === 'installed').length, manager: 'dpkg' }
  }
  if (id === 'alpine') {
    const output = await command('apk', ['info'])
    return output === null ? null : { count: output.split('\n').filter(Boolean).length, manager: 'apk' }
  }
  if (['arch', 'manjaro', 'endeavouros'].includes(id)) {
    const output = await command('pacman', ['-Qq'])
    return output === null ? null : { count: output.split('\n').filter(Boolean).length, manager: 'pacman' }
  }
  return null
}
function meaningful(value: string | null) {
  return value && !/^(unknown|none|not specified|to be filled by o\.e\.m\.|default string)$/i.test(value) ? value : null
}
export function createInformationCollector(options: {
  platform: string; sysRoot: string; container: boolean; osReleasePaths?: string[]; hostOsReleasePaths?: string[]; command?: InformationCommand
}) {
  let cached: SystemInformation | null = null
  let cachedAt = 0
  let pending: Promise<SystemInformation> | null = null
  const command = options.command || run
  async function release(paths: string[]) {
    for (const path of paths) {
      const value = parseOsRelease(await readText(path))
      if (value) return value
    }
    return null
  }
  async function collect(): Promise<SystemInformation> {
    const result: SystemInformation = {
      os: { id: options.platform, name: os.type() }, osScope: options.container ? 'container' : 'host', containerOs: null,
      hostOsAvailable: !options.container, kernel: `${os.type()} ${os.release()}`, architecture: os.machine(),
      hardware: null, hostname: os.hostname(), firmware: null,
      locale: process.env.LC_ALL || process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale,
      shell: process.env.SHELL || null, runtime: `Node.js ${process.versions.node}`, packages: null,
      networks: Object.entries(os.networkInterfaces()).flatMap(([name, addresses]) => (addresses || [])
        .filter(address => !address.internal).map(address => ({ name, address: address.cidr || address.address, family: address.family }))).slice(0, 32),
      displays: [],
    }
    if (options.platform === 'linux') {
      const runtimeOs = await release(options.osReleasePaths || ['/etc/os-release', '/usr/lib/os-release']) || { id: 'linux', name: 'Linux' }
      const hostOs = options.container ? await release(options.hostOsReleasePaths || (process.env.VAULT_HOST_OS_RELEASE ? [process.env.VAULT_HOST_OS_RELEASE] : ['/run/host/os-release', '/host/os-release'])) : null
      result.os = hostOs || runtimeOs
      result.osScope = hostOs || !options.container ? 'host' : 'container'
      result.containerOs = options.container ? runtimeOs : null
      result.hostOsAvailable = !options.container || !!hostOs
      const dmi = join(options.sysRoot, 'class/dmi/id')
      const [vendor, product, version, biosVendor, biosVersion, model] = await Promise.all([
        readText(join(dmi, 'sys_vendor')), readText(join(dmi, 'product_name')), readText(join(dmi, 'product_version')),
        readText(join(dmi, 'bios_vendor')), readText(join(dmi, 'bios_version')), readText(join(options.sysRoot, 'firmware/devicetree/base/model')),
      ])
      result.hardware = [...new Set([vendor, product, version].map(meaningful).filter(Boolean))].join(' · ') || model?.replace(/\0/g, '') || null
      result.firmware = [biosVendor, biosVersion].map(meaningful).filter(Boolean).join(' · ') || null
      result.packages = await packageCount(runtimeOs.id, command)
      const drm = join(options.sysRoot, 'class/drm')
      for (const connector of (await names(drm)).filter(name => /^card\d+-/.test(name))) {
        if (await readText(join(drm, connector, 'status')) !== 'connected') continue
        const modes = await readText(join(drm, connector, 'modes'))
        result.displays.push({ name: connector, mode: modes?.split('\n')[0] || null })
      }
    } else if (options.platform === 'darwin') {
      const [version, model] = await Promise.all([command('/usr/bin/sw_vers', ['-productVersion']), command('/usr/sbin/sysctl', ['-n', 'hw.model'])])
      result.os = { id: 'macos', name: `macOS${version ? ` ${version}` : ''}` }
      result.hardware = model
    }
    return result
  }
  return async (): Promise<SystemInformation> => {
    if (cached && performance.now() - cachedAt < 300000) return cached
    if (pending) return pending
    pending = collect().then(value => { cached = value; cachedAt = performance.now(); return value }).finally(() => { pending = null })
    return pending
  }
}
