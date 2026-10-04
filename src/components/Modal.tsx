import { useEffect, type ReactNode } from 'react'

type Props = {
  onClose: () => void
  children: ReactNode
  /** Extra classes applied to the card (e.g. size/variant). */
  className?: string
  /** Extra classes applied to the overlay (e.g. fullscreen on mobile). */
  overlayClassName?: string
  /** Content rendered inside the overlay but outside the card (e.g. nav arrows). */
  overlayChildren?: ReactNode
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  /** Called for every keydown; Escape close is handled automatically. */
  onKeyDown?: (e: KeyboardEvent) => void
}

/**
 * Generic modal shell: overlay + card, Escape/backdrop dismissal and
 * body scroll lock. Used by every dialog/preview in the app.
 */
export default function Modal({
  onClose,
  children,
  className = '',
  overlayClassName = '',
  overlayChildren,
  closeOnBackdrop = true,
  closeOnEscape = true,
  onKeyDown,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose()
      onKeyDown?.(e)
    }
    window.addEventListener('keydown', handler)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, closeOnEscape, onKeyDown])

  return (
    <div
      className={`modal-overlay ${overlayClassName}`.trim()}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className={`modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {overlayChildren}
    </div>
  )
}
