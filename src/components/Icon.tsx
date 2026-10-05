import { ICON_PATHS } from '../lib/iconPaths'

export function Icon({
  name,
  size = 18,
  color,
  className,
}: {
  name: string
  size?: number
  color?: string
  className?: string
}) {
  const d = ICON_PATHS[name] || ICON_PATHS.file
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}
