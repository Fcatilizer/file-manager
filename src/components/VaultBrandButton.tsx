import type { MouseEvent, ReactNode } from 'react'
import { useVaultDiamondAnimation } from '../lib/useVaultDiamondAnimation'
import '../styles/vault-diamond.css'


export interface VaultDiamondProps {
  /** Pixel size of the diamond icon. Default is 14. */
  size?: number
  /** Whether the spin animation is currently active. */
  isAnimating?: boolean
  /** Key to force-restart the CSS animation. */
  animKey?: number
  /** Additional CSS class names. */
  className?: string
}

/**
 * Diamond icon SVG with optional animation classes.
 */
export function VaultDiamond({
  size = 14,
  isAnimating = false,
  animKey = 0,
  className = '',
}: VaultDiamondProps) {
  return (
    <span
      key={animKey}
      className={`vault-diamond ${isAnimating ? 'vault-diamond--animating' : ''} ${className}`.trim()}
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill="currentColor"
        className="vault-diamond-icon"
      >
        <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" transform="rotate(45 8 8)" />
      </svg>
    </span>
  )
}

export interface VaultBrandButtonProps {
  /** Optional callback to trigger on click, e.g. reloading files, refreshing buckets or view. */
  onRefresh?: () => void | Promise<void>
  /** Tooltip title for the button. Defaults to 'Refresh Vault'. */
  title?: string
  /** Accessible aria-label for the button. Defaults to 'Refresh Vault'. */
  ariaLabel?: string
  /** Text label displayed next to the diamond. Set to false/null to omit. Defaults to 'Vault'. */
  label?: ReactNode
  /** Additional CSS class names for the button. */
  className?: string
  /** Pixel size of the diamond icon. Defaults to 14. */
  diamondSize?: number
}

/**
 * Interactive Vault Brand button with the diamond spin animation and refresh callback.
 */
export default function VaultBrandButton({
  onRefresh,
  title = 'Refresh Vault',
  ariaLabel = 'Refresh Vault',
  label = 'Vault',
  className = '',
  diamondSize = 14,
}: VaultBrandButtonProps) {
  const { isAnimating, animKey, triggerAnimation } = useVaultDiamondAnimation()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    triggerAnimation()
    onRefresh?.()
  }

  return (
    <button
      type="button"
      className={`vault-brand-btn ${className}`.trim()}
      onClick={handleClick}
      title={title}
      aria-label={ariaLabel}
    >
      <VaultDiamond size={diamondSize} isAnimating={isAnimating} animKey={animKey} />
      {label && <span className="vault-brand-text">{label}</span>}
    </button>
  )
}
