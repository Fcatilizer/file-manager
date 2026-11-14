import { DISTRO_LOGOS } from '../lib/distroLogos'

export default function DistroLogo({ id }: { id: string }) {
  const aliases: Record<string, string> = { arch: 'archlinux', alpine: 'alpinelinux', macos: 'apple', darwin: 'apple', 'opensuse-leap': 'opensuse', 'opensuse-tumbleweed': 'opensuse' }
  const logo = DISTRO_LOGOS[aliases[id] || id] || DISTRO_LOGOS.linux
  return <svg className="system-info__logo" viewBox="0 0 24 24" width={88} height={88} fill={logo.color} role="img" aria-label={`${logo.name} logo`}>
    {logo.paths.map((path, index) => <path key={index} d={path} />)}
  </svg>
}
