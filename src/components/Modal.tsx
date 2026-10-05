import { Icon } from './Icon'
import '../styles/modal-controls.css'
import { useEffect, type ReactNode } from 'react'

type Props = {
  ariaLabel?: string
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
  ariaLabel,
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
      aria-label={ariaLabel}
    >
      <div className={`modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {overlayChildren}
    </div>
  )
}

/** Shared close control, placed last in modal headers including file previews. */
export function ModalCloseButton({ onClose, disabled = false, label = 'Close dialog' }: { onClose: () => void; disabled?: boolean; label?: string }) {
  return <button type="button" className="btn btn--icon modal-close" disabled={disabled} onClick={onClose} aria-label={label} title={`${label} (Esc)`}><Icon name="close" size={16} /></button>
}

export function ModalHeader({ children, onClose, disabled = false, label }: { children: ReactNode; onClose: () => void; disabled?: boolean; label?: string }) {
  return <header className="modal-heading">{children}<ModalCloseButton onClose={onClose} disabled={disabled} label={label} /></header>
}
