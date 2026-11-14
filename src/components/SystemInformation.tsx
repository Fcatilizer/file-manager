import type { ReactNode } from 'react'
import type { SystemMetrics } from '../lib/systemMetrics'
import DistroLogo from './DistroLogo'
import '../styles/system-information.css'

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children || 'Unavailable'}</dd></div>
}

export default function SystemInformation({ data }: { data: SystemMetrics }) {
  const info = data.information
  const container = data.environment === 'container'
  return <details className="system-info">
    <summary>More information<span>System, hardware & network</span></summary>
    {info ? <div className="system-info__content">
      <header className="system-info__identity">
        <DistroLogo id={info.os.id} />
        <div><span className="system-info__scope">{info.osScope === 'host' ? 'Host operating system' : 'Container operating system'}</span><h3>{info.os.name}</h3><p>{info.hardware || data.machine}</p></div>
      </header>
      {!info.hostOsAvailable && <p className="system-info__notice">Host distribution unavailable. Expose the host’s os-release file to identify it separately from this container.</p>}
      <dl className="system-info__details">
        <Detail label="Architecture">{info.architecture}</Detail>
        <Detail label="Kernel">{info.kernel}</Detail>
        <Detail label="Hardware">{info.hardware}</Detail>
        <Detail label="Firmware">{info.firmware}</Detail>
        <Detail label={container ? 'Container hostname' : 'Hostname'}>{info.hostname}</Detail>
        {info.containerOs && <Detail label="Container OS">{info.containerOs.name}</Detail>}
        <Detail label="CPU">{data.cpu.model}</Detail>
        <Detail label="Graphics">{data.gpus.length ? data.gpus.map(gpu => <span key={gpu.id}>{gpu.name} · {gpu.kind === 'integrated' ? 'Integrated' : gpu.kind === 'discrete' ? 'Discrete' : 'Type unreported'}</span>) : null}</Detail>
        <Detail label={container ? 'Container packages' : 'Packages'}>{info.packages ? `${info.packages.count.toLocaleString()} (${info.packages.manager})` : null}</Detail>
        <Detail label="App runtime">{info.runtime}</Detail>
        <Detail label="Service shell">{info.shell}</Detail>
        <Detail label="Service locale">{info.locale}</Detail>
        <Detail label="Service timezone">{data.timeZone}</Detail>
        <Detail label={container ? 'Container network' : 'Local network'}>{info.networks.length ? info.networks.map(network => <span key={`${network.name}-${network.address}`}>{network.name} · {network.address} · {network.family}</span>) : null}</Detail>
        <Detail label="Connected displays">{info.displays.length ? info.displays.map(display => <span key={display.name}>{display.name}{display.mode ? ` · ${display.mode} (advertised mode)` : ''}</span>) : null}</Detail>
      </dl>
      <p className="system-info__footnote">System details refresh every 5 minutes. Shell, locale and network describe the running service; an SSH session may differ.</p>
    </div> : <p className="system-info__notice">System information is unavailable in this environment.</p>}
  </details>
}
